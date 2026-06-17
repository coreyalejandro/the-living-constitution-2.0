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

import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = resolve(__dirname, '..', '..');

// --- Load registry ---
const registryPath = join(TLC_ROOT, 'registry', 'modules.registry.json');
if (!existsSync(registryPath)) {
  // No registry — can't enforce; allow commit
  process.exit(0);
}

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const PROJECTS_DIR = '/Users/coreyalejandro/Projects';

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
if (process.env.TLC_BYPASS_HOOKS === '1') {
  console.warn(`${Y}WARN: TLC pre-commit hooks bypassed via TLC_BYPASS_HOOKS=1${X}`);
  console.warn(`${Y}This action will be logged if evidence observatory is active.${X}`);
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
  /\b\d{3}-\d{2}-\d{4}\b/,           // SSN
  /\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/, // Credit card
  /password\s*[:=]\s*["']?[^\s"']{6,}/i, // plaintext passwords
];

for (const file of stagedFiles.slice(0, 50)) { // limit scan to first 50 files
  if (!existsSync(file)) continue;
  // Skip binary-ish extensions
  if (/\.(png|jpg|gif|pdf|zip|tar|gz|bin|woff|ttf)$/i.test(file)) continue;
  try {
    const content = readFileSync(file, 'utf8').slice(0, 50000); // first 50KB
    for (const pattern of PII_PATTERNS) {
      if (pattern.test(content)) {
        halt(
          `I5 VIOLATION — Possible PII detected in: ${file}`,
          `Pattern matched: ${pattern}\nReview and redact before committing.`
        );
      }
    }
  } catch { /* skip unreadable */ }
}

// --- All checks passed ---
console.log(`${G}[tlc-hook] ✓ Pre-commit checks passed — Module: ${MODULE_ID} (${mod.truth_status})${X}`);
process.exit(0);
