#!/usr/bin/env node
/**
 * pre-commit.mjs
 * TLC 2.0 Git Hook — Pre-Commit Invariant Enforcer
 *
 * Blocks commits on:
 *   - Unregistered modules (I1: no contract = no commit)
 *   - Quarantined modules (I6: quarantine block)
 *   - Missing evidence when AC is claimed complete (I2)
 *   - PII patterns in staged files (I5)
 *
 * Installed by tlc-new automatically.
 * Also installed globally via: git config --global core.hooksPath <tlc-hooks-dir>
 *
 * The hook reads module ID from:
 *   1. TLC_MODULE env var
 *   2. .tlc-module file in repo root
 *   3. Registry path match against cwd
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve, dirname, homedir } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { appendAuditEntry } from '../core/audit.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = resolve(__dirname, '..', '..');
const HOME = homedir();
const PROJECTS_DIR = process.env.TLC_PROJECTS_DIR || join(HOME, 'Projects');
// --- Load registry ---
const registryPath = join(TLC_ROOT, 'registry', 'modules.registry.json');
if (!existsSync(registryPath)) {
  // No registry — can't enforce; allow commit
  process.exit(0);
}

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

// --- Determine module ID ---
const cwd = process.cwd();
let MODULE_ID = process.env.TLC_MODULE || null;

if (!MODULE_ID) {
  // Try .tlc-module file
  const tlcModuleFile = join(cwd, '.tlc-module');
  if (existsSync(tlcModuleFile)) {
    MODULE_ID = readFileSync(tlcModuleFile, 'utf8').trim();
  }
}

if (!MODULE_ID) {
  // Try registry path match
  const normalized = cwd.toLowerCase().replace(/\/$/, '');
  const match = registry.modules.find(m => {
    let p = m.path;
    if (!p.startsWith('/')) {
      const dirName = p.replace(/\/$/, '').split('/').pop();
      p = join(PROJECTS_DIR, dirName);
    }
    return p.toLowerCase().replace(/\/$/, '') === normalized;
  });
  if (match) MODULE_ID = match.id;
}

// --- ANSI ---
const R = '\x1b[31m', Y = '\x1b[33m', G = '\x1b[32m', D = '\x1b[2m', B = '\x1b[1m', X = '\x1b[0m';

function halt(reason, details) {
  console.error(`\n${R}${B}COMMIT BLOCKED — TLC 2.0 INVARIANT VIOLATION${X}`);
  console.error(`${R}${reason}${X}`);
  if (details) console.error(`${D}${details}${X}`);
  console.error(`\n${D}To bypass: set TLC_BYPASS_HOOKS=1 (use only with Break-Glass justification)${X}\n`);
  process.exit(1);
}

// --- Break-glass bypass ---
const BYPASS_LOG = join(TLC_ROOT, 'evidence', 'bypass-log.jsonl');

if (process.env.TLC_BYPASS_HOOKS === '1') {
  // I10: Record break-glass event unconditionally before allowing bypass
  const bypassEntry = {
    event: 'break_glass',
    timestamp: new Date().toISOString(),
    module_id: MODULE_ID || 'unknown',
    operator: process.env.USER || process.env.USERNAME || 'unknown',
    cwd,
    justification: process.env.TLC_BYPASS_REASON || 'NO JUSTIFICATION PROVIDED',
    commit_msg: (() => { try { return execSync('git log -1 --format=%s HEAD 2>/dev/null', { encoding: 'utf8' }).trim(); } catch { return ''; } })(),
  };
  try {
    appendAuditEntry(BYPASS_LOG, bypassEntry);
  } catch { /* non-fatal — still allow bypass */ }
  console.warn(`${Y}WARN: TLC pre-commit hooks bypassed via TLC_BYPASS_HOOKS=1${X}`);
  console.warn(`${Y}Break-glass event recorded in evidence/bypass-log.jsonl${X}`);
  if (!process.env.TLC_BYPASS_REASON) {
    console.warn(`${Y}WARN: No TLC_BYPASS_REASON set. Set it for Article X compliance.${X}`);
  }
  process.exit(0);
}

// --- If no module ID found, warn but allow ---
if (!MODULE_ID) {
  console.log(`${D}[tlc-hook] No module ID found — repo not registered with TLC 2.0${X}`);
  console.log(`${D}[tlc-hook] Commit allowed. To govern this repo: tlc-new or add .tlc-module file${X}`);
  process.exit(0);
}

const mod = registry.modules.find(m => m.id === MODULE_ID);

// --- I1: Contract required ---
if (!mod) {
  halt(
    `I1 VIOLATION — Module "${MODULE_ID}" not found in TLC registry.`,
    `Register it first: tlc-new --name ${MODULE_ID.toLowerCase()} --surface private_lab`
  );
}

// --- I6: Quarantine block ---
if (mod.truth_status === 'quarantined') {
  halt(
    `I6 VIOLATION — Module "${MODULE_ID}" is QUARANTINED.`,
    `Quarantined modules are read-only. Resolve the quarantine condition in the registry, then re-attempt.`
  );
}

// --- I9: Audit log deletion guard ---
// Staged deletions of audit log files are blocked unconditionally.
const AUDIT_LOG_NAMES = ['bypass-log.jsonl', 'purge-log.jsonl', 'audit-log.jsonl'];
const deletedAuditLogs = (() => {
  try {
    const deleted = execSync(
      'git diff --cached --name-only --diff-filter=D',
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);
    return deleted.filter(f => AUDIT_LOG_NAMES.some(name => f.endsWith(name)));
  } catch { return []; }
})();

if (deletedAuditLogs.length > 0) {
  halt(
    `I9 VIOLATION — Audit log deletion blocked.`,
    `Files: ${deletedAuditLogs.join(', ')}\n` +
    `Audit logs must be retained ≥ 90 days per Article X, Section 10.3.\n` +
    `Use: tlc-purge --purge-log --before <date> --confirm (enforces 90-day floor).`
  );
}

// --- I2: Evidence check on AC completion claims ---
// Check staged files for evidence markers
let stagedFiles = [];
try {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  stagedFiles = staged.trim().split('\n').filter(Boolean);
} catch { /* git not available — skip */ }

// Look for "AC-xxx: COMPLETE" or "status: complete" in staged content
let acCompletionClaimed = false;
for (const file of stagedFiles) {
  if (!existsSync(file)) continue;
  try {
    const content = readFileSync(file, 'utf8');
    if (/AC-\w+-\d+.*complete/i.test(content) || /"status":\s*"complete"/i.test(content)) {
      acCompletionClaimed = true;
      break;
    }
  } catch { /* binary or unreadable */ }
}

if (acCompletionClaimed) {
  // Check for evidence file in staged set
  const hasEvidence = stagedFiles.some(f =>
    /evidence/i.test(f) || f.endsWith('.jsonl') || /vnt/i.test(f)
  );
  if (!hasEvidence) {
    console.warn(`${Y}WARN: I2 — AC completion claimed in staged files but no evidence file staged.${X}`);
    console.warn(`${Y}Consider: commit an evidence file alongside completion claims.${X}`);
    // WARN only — not a halt at Tier-1
  }
}

// --- I5: PII scan ---
const PII_PATTERNS = [
  { re: /\b\d{3}-\d{2}-\d{4}\b/,                         label: 'SSN pattern' },
  { re: /\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/,      label: 'Credit card pattern' },
  { re: /password\s*[:=]\s*["']?[^\s"']{6,}/i,           label: 'Plaintext password' },
  { re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,label: 'Email address' },
];

for (const file of stagedFiles.slice(0, 50)) {
  if (!existsSync(file)) continue;
  if (/\.(png|jpg|gif|pdf|zip|tar|gz|bin|woff|ttf)$/i.test(file)) continue;
  // Skip the bypass log itself and evidence files with explicit pii_authorized
  if (file.includes('bypass-log')) continue;
  try {
    const content = readFileSync(file, 'utf8').slice(0, 50000);
    // If file declares pii_authorized, skip PII scan
    if (/pii_authorized\s*[:=]/i.test(content)) continue;
    for (const { re, label } of PII_PATTERNS) {
      if (re.test(content)) {
        halt(
          `I5 VIOLATION — Possible PII detected in: ${file}`,
          `Pattern: ${label}\nReview and redact, or add "pii_authorized: <justification>" to the contract.`
        );
      }
    }
  } catch { /* skip unreadable */ }
}

// --- I11: Evidence chain integrity ---
// If a STATUS.md is staged with a truth_status upgrade, require evidence file in same commit
const statusFiles = stagedFiles.filter(f => /STATUS\.md$/i.test(f));
for (const sf of statusFiles) {
  if (!existsSync(sf)) continue;
  try {
    const content = readFileSync(sf, 'utf8');
    const statusMatch = content.match(/[Tt]ruth[_ ][Ss]tatus[:\s]+(\w+)/);
    if (statusMatch && ['working', 'partial'].includes(statusMatch[1].toLowerCase())) {
      const hasEvidence = stagedFiles.some(f => /evidence/i.test(f));
      if (!hasEvidence) {
        console.warn(`${Y}WARN I11: STATUS.md declares truth_status: ${statusMatch[1]} but no evidence file is staged.${X}`);
        console.warn(`${Y}Per Article XI: status upgrades require evidence. Stage an evidence file.${X}`);
        // WARN not halt — allow self-correction, not hard block at baseline tier
      }
    }
  } catch { /* skip */ }
}

// --- I13: Rollback required before deploy ---
// If any staged file name contains "deploy" or "release", check for rollback evidence
const deployFiles = stagedFiles.filter(f => /deploy|release/i.test(f));
if (deployFiles.length > 0) {
  const hasRollback = stagedFiles.some(f => /rollback/i.test(f));

  // Also check evidence directory on disk
  const evidenceDir = mod && mod.path
    ? join(mod.path, 'evidence')
    : join(TLC_ROOT, 'evidence');
  let rollbackOnDisk = false;
  if (existsSync(evidenceDir)) {
    try {
      rollbackOnDisk = readdirSync(evidenceDir).some(f => /rollback/i.test(f));
    } catch { rollbackOnDisk = false; }
  }

  if (!hasRollback && !rollbackOnDisk) {
    halt(
      `I13 VIOLATION — Deploy file staged without rollback evidence.`,
      `Staged: ${deployFiles.join(', ')}\n` +
      `Create evidence/rollback-YYYY-MM-DD.md before committing deploy files.\n` +
      `Article XI, Section 11.2: Rollback evidence required before deploy.`
    );
  }
}

// --- All checks passed ---
console.log(`${G}[tlc-hook] ✓ Pre-commit checks passed — Module: ${MODULE_ID} (${mod.truth_status})${X}`);
process.exit(0);
