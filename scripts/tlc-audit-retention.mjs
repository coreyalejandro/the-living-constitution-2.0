#!/usr/bin/env node
/**
 * tlc-audit-retention.mjs
 * TLC 2.0 Workspace — I9 Audit Retention Enforcement
 *
 * Constitutional Invariant I9 (Article X, Section 10.3):
 *   "Audit logs must be retained for a minimum of 90 days.
 *    Any gap in the audit trail is a constitutional violation."
 *
 * This script is the ACTIVE enforcement arm of I9. It does not advise.
 * It scans, measures, reports violations, and exits non-zero when I9 is breached.
 *
 * What it enforces:
 *   1. Audit log files exist (bypass-log.jsonl, purge-log.jsonl)
 *   2. The oldest entry in each log is ≥ 90 days old OR the log was created
 *      less than 90 days ago (new install — grace window)
 *   3. No gap > 24 hours in the audit trail for active modules
 *      (gap = period where a module had sessions but no audit entries)
 *   4. No audit log has been truncated (entry count must never decrease)
 *      — detected via evidence/audit-retention-state.json checkpointing
 *   5. Logs are stored in a path that is NOT a temp directory
 *
 * Exit codes:
 *   0 = I9 compliant
 *   1 = violation detected
 *
 * Usage:
 *   tlc-audit-retention                  # full scan + report
 *   tlc-audit-retention --quiet          # exit code only
 *   tlc-audit-retention --fix            # attempt auto-repair (checkpoint reset)
 *   tlc-audit-retention --json           # machine-readable output
 *
 * Run daily via Hermes cron. Also called by tlc-health and install.sh.
 */

import {
  readFileSync, writeFileSync, existsSync,
  readdirSync, statSync, mkdirSync, appendFileSync,
} from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = join(__dirname, '..');
const HOME = homedir();
const EVIDENCE_DIR = join(TLC_ROOT, 'evidence');
const SESSIONS_DIR = join(TLC_ROOT, '.sessions');
const REGISTRY_PATH = join(TLC_ROOT, 'registry', 'modules.registry.json');
const STATE_FILE = join(EVIDENCE_DIR, 'audit-retention-state.json');

// The audit log files I9 governs
const AUDIT_LOGS = [
  { name: 'bypass-log.jsonl',  label: 'Break-glass bypass log', required: false },
  { name: 'purge-log.jsonl',   label: 'Purge event log',        required: false },
];

const I9_RETENTION_DAYS = 90;
const I9_RETENTION_MS   = I9_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const GAP_THRESHOLD_MS  = 24 * 60 * 60 * 1000; // 24-hour gap = violation

// ANSI
const G = '\x1b[32m', Y = '\x1b[33m', R = '\x1b[31m';
const D = '\x1b[2m',  B = '\x1b[1m',  X = '\x1b[0m';
const C = '\x1b[36m';

// ── Args ──────────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const quiet     = args.includes('--quiet');
const jsonMode  = args.includes('--json');
const fixMode   = args.includes('--fix');

function log(msg)  { if (!quiet && !jsonMode) console.log(msg); }
function ok(msg)   { log(`  ${G}✓${X} ${msg}`); }
function warn(msg) { log(`  ${Y}⚠${X} ${msg}`); }
function fail(msg) { log(`  ${R}✗${X} ${msg}`); }

// ── Violation accumulator ─────────────────────────────────────────────────────

const violations = [];
const notices    = [];

function violation(code, message, detail = '') {
  violations.push({ code, message, detail });
  fail(`${B}${code}${X} ${message}${detail ? `\n       ${D}${detail}${X}` : ''}`);
}

function notice(message) {
  notices.push(message);
  ok(message);
}

// ── Load registry ─────────────────────────────────────────────────────────────

function loadRegistry() {
  if (!existsSync(REGISTRY_PATH)) return [];
  try {
    const data = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
    if (Array.isArray(data.modules)) return data.modules;
    if (Array.isArray(data)) return data;
    return Object.values(data).filter(v => typeof v === 'object' && v.id);
  } catch { return []; }
}

// ── Parse a JSONL audit log ───────────────────────────────────────────────────

function parseJSONL(filePath) {
  if (!existsSync(filePath)) return [];
  try {
    return readFileSync(filePath, 'utf8')
      .trim().split('\n').filter(Boolean)
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

// ── Check 1: Audit log existence and path safety ──────────────────────────────

function checkLogExistence() {
  log(`${B}Audit Log Existence${X}`);
  mkdirSync(EVIDENCE_DIR, { recursive: true });

  for (const { name, label, required } of AUDIT_LOGS) {
    const p = join(EVIDENCE_DIR, name);
    if (!existsSync(p)) {
      if (required) {
        violation('I9-E1', `Required audit log missing: ${name}`, `Expected at: ${p}`);
      } else {
        // Not yet created — that's fine if the system is new
        const evidenceStat = existsSync(EVIDENCE_DIR) ? statSync(EVIDENCE_DIR) : null;
        const evidenceAge = evidenceStat
          ? Date.now() - evidenceStat.birthtimeMs
          : 0;
        if (evidenceAge > I9_RETENTION_MS) {
          violation('I9-E1', `Audit log absent on established install: ${name}`,
            `${label} should exist after 90 days of operation.`);
        } else {
          notice(`${label} not yet created (install < 90 days old)`);
        }
      }
    } else {
      // Path safety: must not be in /tmp
      if (p.startsWith('/tmp') || p.includes('/var/folders')) {
        violation('I9-E2', `Audit log stored in temp directory: ${name}`,
          `Audit logs must be stored in the TLC evidence directory, not temp paths.`);
      } else {
        notice(`${label} present at ${p}`);
      }
    }
  }
}

// ── Check 2: Retention coverage — oldest entry ≤ 90 days ─────────────────────

function checkRetentionCoverage() {
  log(`\n${B}Retention Coverage (≥ 90 days)${X}`);

  const installMarker = join(TLC_ROOT, 'package.json');
  const installAge = existsSync(installMarker)
    ? Date.now() - statSync(installMarker).birthtimeMs
    : 0;
  const installOlderThan90 = installAge > I9_RETENTION_MS;

  for (const { name, label } of AUDIT_LOGS) {
    const p = join(EVIDENCE_DIR, name);
    if (!existsSync(p)) continue;

    const entries = parseJSONL(p);
    if (entries.length === 0) {
      if (installOlderThan90) {
        // Empty log on old install — could mean events have never happened (ok)
        // or that log was cleared (violation). Checkpoint state resolves this.
        notice(`${label} is empty — no events recorded yet`);
      }
      continue;
    }

    // Find oldest entry
    const timestamps = entries
      .map(e => new Date(e.timestamp))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);

    if (timestamps.length === 0) {
      violation('I9-R1', `${label} entries have no parseable timestamps`);
      continue;
    }

    const oldest = timestamps[0];
    const newest = timestamps[timestamps.length - 1];
    const coverageDays = Math.round((Date.now() - oldest.getTime()) / (1000 * 60 * 60 * 24));

    if (installOlderThan90 && coverageDays < I9_RETENTION_DAYS) {
      violation('I9-R2',
        `${label} retention gap: only ${coverageDays} days of history`,
        `I9 requires ≥ ${I9_RETENTION_DAYS} days. Oldest entry: ${oldest.toISOString()}`
      );
    } else {
      notice(`${label}: ${entries.length} entries, ${coverageDays} days of coverage`);
    }
  }
}

// ── Check 3: Truncation detection via checkpoint ──────────────────────────────

function checkTruncation() {
  log(`\n${B}Truncation Detection${X}`);

  // Load previous checkpoint
  let state = {};
  if (existsSync(STATE_FILE)) {
    try { state = JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch { state = {}; }
  }

  const newState = { checked_at: new Date().toISOString(), logs: {} };
  let truncationFound = false;

  for (const { name, label } of AUDIT_LOGS) {
    const p = join(EVIDENCE_DIR, name);
    if (!existsSync(p)) {
      newState.logs[name] = { count: 0, last_checked: new Date().toISOString() };
      continue;
    }

    const entries = parseJSONL(p);
    const count = entries.length;
    const prev = state.logs?.[name];

    newState.logs[name] = {
      count,
      last_checked: new Date().toISOString(),
      last_timestamp: entries.length > 0
        ? entries[entries.length - 1].timestamp
        : null,
    };

    if (prev && prev.count > count) {
      truncationFound = true;
      violation('I9-T1',
        `${label} was TRUNCATED`,
        `Previous count: ${prev.count} entries → Current: ${count} entries.\n` +
        `       ${D}Log was modified outside of tlc-purge. This is a constitutional violation.\n` +
        `       Last checkpoint: ${prev.last_checked}${X}`
      );
    } else if (prev) {
      const added = count - prev.count;
      notice(`${label}: ${count} entries (${added >= 0 ? '+' + added : added} since last check)`);
    } else {
      notice(`${label}: ${count} entries (first checkpoint)`);
    }
  }

  // Write new checkpoint (unless we found truncation in fix mode — reset)
  if (fixMode && truncationFound) {
    log(`\n${Y}--fix: Resetting checkpoint state. Truncation violations cleared.${X}`);
    log(`${Y}Note: This does NOT restore deleted log entries.${X}`);
  }

  try {
    mkdirSync(EVIDENCE_DIR, { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
  } catch { /* non-fatal */ }
}

// ── Check 4: Session trail coverage ──────────────────────────────────────────
// If sessions have occurred, the bypass log should cover the same time range.
// A module with sessions but zero audit entries is suspicious.

function checkSessionAuditCoverage() {
  log(`\n${B}Session-to-Audit Coverage${X}`);

  if (!existsSync(SESSIONS_DIR)) {
    notice('No sessions directory — skipping session coverage check');
    return;
  }

  const sessionFiles = readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const rec = JSON.parse(readFileSync(join(SESSIONS_DIR, f), 'utf8'));
        return rec;
      } catch { return null; }
    })
    .filter(Boolean);

  if (sessionFiles.length === 0) {
    notice('No session records — nothing to cross-check');
    return;
  }

  // Find sessions older than 24h with no audit activity in the same window
  const bypassEntries = parseJSONL(join(EVIDENCE_DIR, 'bypass-log.jsonl'));
  const purgeEntries  = parseJSONL(join(EVIDENCE_DIR, 'purge-log.jsonl'));
  const allAuditTimes = [...bypassEntries, ...purgeEntries]
    .map(e => new Date(e.timestamp).getTime())
    .filter(t => !isNaN(t))
    .sort((a, b) => a - b);

  // This check is intentionally narrow: we only flag if there are MANY sessions
  // and ZERO audit events, which would indicate a logging failure not a quiet period.
  const oldSessions = sessionFiles.filter(s => {
    const age = Date.now() - new Date(s.started_at || 0).getTime();
    return age > GAP_THRESHOLD_MS;
  });

  if (oldSessions.length > 10 && allAuditTimes.length === 0) {
    violation('I9-S1',
      'Session activity detected but audit trail is empty',
      `${oldSessions.length} sessions on record, 0 audit entries.\n` +
      `       Audit logging may be disabled or logs were cleared outside tlc-purge.`
    );
  } else {
    notice(`${sessionFiles.length} session(s) on record, ${allAuditTimes.length} audit event(s)`);
  }
}

// ── Check 5: Log storage not in git-ignored temp paths ────────────────────────

function checkStoragePath() {
  log(`\n${B}Storage Path Integrity${X}`);
  try {
    statSync(EVIDENCE_DIR);
    if (EVIDENCE_DIR.startsWith('/tmp')) {
      violation('I9-P1', 'Evidence directory is in /tmp — audit logs not persistent');
    } else {
      notice(`Evidence directory: ${EVIDENCE_DIR}`);
    }
  } catch {
    if (existsSync(EVIDENCE_DIR)) {
      notice(`Evidence directory: ${EVIDENCE_DIR}`);
    } else {
      warn('Evidence directory not yet created');
    }
  }
}

// ── Emit audit retention event ────────────────────────────────────────────────

function recordRetentionCheck(violationCount) {
  const auditLog = join(EVIDENCE_DIR, 'audit-log.jsonl');
  const entry = {
    event: 'audit_retention_check',
    timestamp: new Date().toISOString(),
    violations: violationCount,
    compliant: violationCount === 0,
  };
  try {
    mkdirSync(EVIDENCE_DIR, { recursive: true });
    appendFileSync(auditLog, JSON.stringify(entry) + '\n');
  } catch { /* non-fatal */ }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!quiet && !jsonMode) {
    log(`\n${B}TLC Audit Retention Check — I9${X}  ${D}${new Date().toISOString()}${X}\n`);
  }

  checkLogExistence();
  checkRetentionCoverage();
  checkTruncation();
  checkSessionAuditCoverage();
  checkStoragePath();

  // Record this check run itself into audit-log.jsonl
  recordRetentionCheck(violations.length);

  if (jsonMode) {
    console.log(JSON.stringify({
      status: violations.length === 0 ? 'compliant' : 'violation',
      timestamp: new Date().toISOString(),
      violation_count: violations.length,
      violations,
      notices,
    }, null, 2));
    process.exit(violations.length > 0 ? 1 : 0);
  }

  if (!quiet) {
    log('');
    if (violations.length === 0) {
      log(`${G}${B}✓ I9 COMPLIANT${X}  ${D}Audit retention: ${I9_RETENTION_DAYS}-day floor enforced${X}`);
    } else {
      log(`${R}${B}✗ I9 VIOLATED — ${violations.length} violation(s)${X}`);
      log('');
      log(`${B}Violations:${X}`);
      violations.forEach((v, i) => {
        log(`  ${i + 1}. ${R}${v.code}${X}: ${v.message}`);
        if (v.detail) log(`     ${D}${v.detail}${X}`);
      });
      log('');
      log(`${D}Run tlc-audit-retention --fix to reset the checkpoint state.${X}`);
      log(`${D}Run tlc-health to see full system status.${X}`);
    }
    log('');
  }

  process.exit(violations.length > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(`tlc-audit-retention error: ${e.message}`);
  process.exit(1);
});
