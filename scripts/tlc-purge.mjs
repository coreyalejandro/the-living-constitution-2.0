#!/usr/bin/env node
/**
 * tlc-purge.mjs
 * TLC 2.0 Workspace — Operator-Controlled Evidence and Session Purge
 *
 * Implements Constitutional Invariant I15 (Article XII, Section 12.3):
 *   "The operator must be able to purge any session record, evidence file, or audit
 *    entry without requiring external approval or leaving residual data."
 *
 * Rules:
 *   - Purge events are themselves logged (bypass-log.jsonl is never purged by default)
 *   - Evidence files are deleted from disk and removed from evidence/index.md
 *   - Session records are deleted from .sessions/
 *   - The purge log can only be purged with --purge-log flag (explicit, irreversible)
 *   - Dry-run is the default — nothing is deleted unless --confirm is passed
 *
 * Usage:
 *   tlc-purge --module MODULE-ID --before 2026-01-01           # dry-run
 *   tlc-purge --module MODULE-ID --before 2026-01-01 --confirm # execute
 *   tlc-purge --all --before 2026-01-01 --confirm              # all modules
 *   tlc-purge --module MODULE-ID --list                        # show what would be purged
 *   tlc-purge --purge-log --before 2026-01-01 --confirm        # purge bypass-log too
 *
 * Article XII, Section 12.3 of SOCIOTECHNICAL_CONSTITUTION.md.
 */

import {
  readFileSync, writeFileSync, existsSync,
  unlinkSync, readdirSync, mkdirSync, appendFileSync,
} from 'fs';
import { join, dirname, basename } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = join(__dirname, '..');
const HOME = homedir();
const PROJECTS_DIR = process.env.TLC_PROJECTS_DIR || join(HOME, 'Projects');
const SESSIONS_DIR = join(TLC_ROOT, '.sessions');
const REGISTRY_PATH = join(TLC_ROOT, 'registry', 'modules.registry.json');
const BYPASS_LOG = join(TLC_ROOT, 'evidence', 'bypass-log.jsonl');
const PURGE_LOG = join(TLC_ROOT, 'evidence', 'purge-log.jsonl');

// ANSI
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const DIM    = '\x1b[2m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

function log(msg)  { console.log(msg); }
function ok(msg)   { log(`${GREEN}✓${RESET} ${msg}`); }
function warn(msg) { log(`${YELLOW}⚠${RESET} ${msg}`); }
function info(msg) { log(`\x1b[36m→${RESET} ${msg}`); }
function fail(msg) { log(`${RED}✗${RESET} ${msg}`); process.exit(1); }

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const moduleId   = getArg('--module');
const beforeDate = getArg('--before');
const confirmed  = args.includes('--confirm');
const listMode   = args.includes('--list');
const allModules = args.includes('--all');
const purgeLog   = args.includes('--purge-log');

if (!moduleId && !allModules && !purgeLog) {
  fail('Usage: tlc-purge --module MODULE-ID --before YYYY-MM-DD [--confirm] [--list]');
}
if (!beforeDate && !listMode) {
  fail('--before YYYY-MM-DD is required. Specify a cutoff date.');
}

const cutoff = beforeDate ? new Date(beforeDate) : null;
if (cutoff && isNaN(cutoff.getTime())) {
  fail(`Invalid date: ${beforeDate}. Use YYYY-MM-DD format.`);
}

// ── Registry ──────────────────────────────────────────────────────────────────

function loadRegistry() {
  if (!existsSync(REGISTRY_PATH)) return [];
  try {
    const raw = readFileSync(REGISTRY_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data.modules)) return data.modules;
    if (Array.isArray(data)) return data;
    return Object.values(data).filter(v => typeof v === 'object' && v.id);
  } catch { return []; }
}

// ── Session purge ─────────────────────────────────────────────────────────────

function purgeSessionRecords(targetModuleId) {
  if (!existsSync(SESSIONS_DIR)) return [];
  const purged = [];

  const files = readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    // Match by module ID prefix in filename
    if (targetModuleId && !file.startsWith(targetModuleId)) continue;

    const filePath = join(SESSIONS_DIR, file);
    try {
      const record = JSON.parse(readFileSync(filePath, 'utf8'));
      const sessionDate = new Date(record.started_at || record.created_at || 0);
      if (cutoff && sessionDate >= cutoff) continue;

      purged.push({ type: 'session', file: filePath, date: record.started_at });
      if (confirmed) {
        unlinkSync(filePath);
      }
    } catch {
      // Unparseable — include by file date heuristic
      purged.push({ type: 'session', file: filePath, date: 'unknown' });
      if (confirmed) {
        try { unlinkSync(filePath); } catch { /* ignore */ }
      }
    }
  }

  return purged;
}

// ── Evidence purge ────────────────────────────────────────────────────────────

function purgeEvidenceFiles(module) {
  const id = module ? (module.id || module.module_id) : null;
  const purged = [];

  // Determine evidence directory
  const evidenceDirs = [];
  if (module && module.path && existsSync(join(module.path, 'evidence'))) {
    evidenceDirs.push(join(module.path, 'evidence'));
  }
  evidenceDirs.push(join(TLC_ROOT, 'evidence'));

  for (const dir of evidenceDirs) {
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter(f =>
      !f.endsWith('.gitkeep') &&
      !f.endsWith('bypass-log.jsonl') &&
      !f.endsWith('purge-log.jsonl') &&
      !f.endsWith('index.md')
    );

    for (const file of files) {
      const filePath = join(dir, file);
      // Extract date from filename pattern YYYY-MM-DD or timestamp
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
      if (!dateMatch && cutoff) continue; // no date in filename — skip unless listing
      const fileDate = dateMatch ? new Date(dateMatch[1]) : null;
      if (cutoff && fileDate && fileDate >= cutoff) continue;

      purged.push({ type: 'evidence', file: filePath, date: dateMatch ? dateMatch[1] : 'unknown' });
      if (confirmed) {
        try { unlinkSync(filePath); } catch { /* ignore */ }
      }
    }
  }

  return purged;
}

// ── Index update ──────────────────────────────────────────────────────────────

function pruneEvidenceIndex(module, purgedFiles) {
  const evidenceIndexPaths = [
    module && module.path ? join(module.path, 'evidence', 'index.md') : null,
    join(TLC_ROOT, 'evidence', 'index.md'),
  ].filter(Boolean);

  for (const indexPath of evidenceIndexPaths) {
    if (!existsSync(indexPath)) continue;
    try {
      const content = readFileSync(indexPath, 'utf8');
      const purgedNames = new Set(purgedFiles.map(p => basename(p.file)));
      const lines = content.split('\n').filter(line => {
        return !Array.from(purgedNames).some(name => line.includes(name));
      });
      if (confirmed) {
        writeFileSync(indexPath, lines.join('\n'));
      }
    } catch { /* skip */ }
  }
}

// ── Purge log record ──────────────────────────────────────────────────────────

function recordPurge(purgedFiles) {
  const entry = {
    event: 'purge',
    timestamp: new Date().toISOString(),
    operator: process.env.USER || process.env.USERNAME || 'unknown',
    before_date: beforeDate,
    module_id: moduleId || (allModules ? 'ALL' : 'unknown'),
    files_purged: purgedFiles.map(p => p.file),
    count: purgedFiles.length,
    dry_run: !confirmed,
  };
  try {
    mkdirSync(join(TLC_ROOT, 'evidence'), { recursive: true });
    appendFileSync(PURGE_LOG, JSON.stringify(entry) + '\n');
  } catch { /* non-fatal */ }
}

// ── Bypass log purge (explicit, irreversible) ─────────────────────────────────

function handlePurgeLog() {
  if (!confirmed) {
    warn('--purge-log requires --confirm. This is irreversible.');
    log(`${DIM}Dry-run: would delete entries before ${beforeDate} from ${BYPASS_LOG}${RESET}`);
    return;
  }
  if (!existsSync(BYPASS_LOG)) {
    info('No bypass log found — nothing to purge.');
    return;
  }
  const lines = readFileSync(BYPASS_LOG, 'utf8').trim().split('\n').filter(Boolean);
  const kept = lines.filter(l => {
    try {
      const entry = JSON.parse(l);
      return new Date(entry.timestamp) >= cutoff;
    } catch { return true; }
  });
  const removed = lines.length - kept.length;
  writeFileSync(BYPASS_LOG, kept.join('\n') + (kept.length ? '\n' : ''));
  ok(`Bypass log: ${removed} entries purged, ${kept.length} retained.`);

  // Record this purge in the purge log
  appendFileSync(PURGE_LOG, JSON.stringify({
    event: 'purge_bypass_log',
    timestamp: new Date().toISOString(),
    operator: process.env.USER || 'unknown',
    before_date: beforeDate,
    entries_removed: removed,
  }) + '\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  log(`\n${BOLD}TLC Purge${RESET}  ${DIM}${confirmed ? '(executing)' : '(dry-run — pass --confirm to execute)'}${RESET}\n`);

  if (purgeLog) {
    handlePurgeLog();
    return;
  }

  const modules = loadRegistry();
  const targets = allModules
    ? modules
    : modules.filter(m => (m.id || m.module_id) === moduleId);

  if (!allModules && targets.length === 0) {
    fail(`Module ${moduleId} not found in registry.`);
  }

  const allPurged = [];

  for (const module of targets) {
    const id = module.id || module.module_id;
    log(`${BOLD}${id}${RESET}`);

    const sessions = purgeSessionRecords(id);
    const evidence = purgeEvidenceFiles(module);
    const combined = [...sessions, ...evidence];

    if (combined.length === 0) {
      log(`  ${DIM}Nothing to purge before ${beforeDate}${RESET}`);
    } else {
      for (const item of combined) {
        const label = confirmed ? `${RED}deleted${RESET}` : `${DIM}would delete${RESET}`;
        log(`  ${label}  ${DIM}[${item.type}]${RESET} ${basename(item.file)}  ${DIM}${item.date}${RESET}`);
      }
      log(`  ${DIM}${combined.length} item(s) ${confirmed ? 'purged' : 'identified'}${RESET}`);

      if (confirmed) {
        pruneEvidenceIndex(module, evidence);
      }
    }

    allPurged.push(...combined);
    log('');
  }

  // Log the purge event
  recordPurge(allPurged);

  log(`${BOLD}Summary${RESET}`);
  log(`  ${allPurged.length} item(s) ${confirmed ? GREEN + 'purged' + RESET : DIM + 'identified (dry-run)' + RESET}`);
  if (!confirmed && allPurged.length > 0) {
    log(`\n  To execute: ${'\x1b[36m'}tlc-purge ${args.filter(a => a !== '--confirm').join(' ')} --confirm${RESET}`);
  }
  log(`  Purge event recorded in evidence/purge-log.jsonl`);
  log('');
}

main();
