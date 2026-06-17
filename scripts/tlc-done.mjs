#!/usr/bin/env node
/**
 * tlc-done.mjs
 * TLC 2.0 Workspace — End a Governed Session
 *
 * Captures evidence, updates STATUS.md, closes session record,
 * checks acceptance criteria completion, proposes truth_status upgrades.
 *
 * Usage:
 *   node scripts/tlc-done.mjs --module <MODULE_ID>
 *     [--evidence ./path/to/evidence.md]
 *     [--ac-completed "AC-001,AC-002"]
 *     [--notes "Short session notes"]
 *
 * Shell alias: tlc-done --module <MODULE_ID> [options]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, appendFileSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// --- Arg parsing ---
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
}

const MODULE_ID = getArg('--module');
const evidencePath = getArg('--evidence');
const acCompletedRaw = getArg('--ac-completed');
const notes = getArg('--notes') || '';

if (!MODULE_ID) {
  console.error('Usage: tlc-done.mjs --module <MODULE_ID> [--evidence <path>] [--ac-completed "AC-001,AC-002"] [--notes "..."]');
  process.exit(1);
}

const now = new Date().toISOString();
const acCompleted = acCompletedRaw ? acCompletedRaw.split(',').map(s => s.trim()) : [];

// --- Load registry ---
const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const modIndex = registry.modules.findIndex(m => m.id === MODULE_ID);

if (modIndex === -1) {
  console.error(`ERROR: Module "${MODULE_ID}" not found in registry.`);
  process.exit(1);
}

const mod = registry.modules[modIndex];

// --- Validate evidence (I2) ---
if (evidencePath) {
  if (!existsSync(evidencePath)) {
    console.error(`\nHALT: I2 EVIDENCE_REQUIRED — Evidence file not found: ${evidencePath}`);
    console.error('Provide a real evidence file or omit --evidence if none exists yet.');
    process.exit(1);
  }
  console.log(`[tlc-done] Evidence verified: ${evidencePath}`);
} else {
  console.warn('\nWARN: No --evidence provided. Session will close without evidence. Status cannot be upgraded.');
}

// --- Find active session ---
const sessionsDir = join(REPO_ROOT, '.sessions');
let sessionFile = null;
let sessionRecord = null;

if (existsSync(sessionsDir)) {
  const files = readdirSync(sessionsDir).filter(f => f.startsWith(MODULE_ID) && f.endsWith('.json'));
  // most recent active session
  const activeSessions = files
    .map(f => {
      try {
        const d = JSON.parse(readFileSync(join(sessionsDir, f), 'utf8'));
        return { file: f, data: d };
      } catch { return null; }
    })
    .filter(s => s && s.data.status === 'active')
    .sort((a, b) => b.data.started_at.localeCompare(a.data.started_at));

  if (activeSessions.length > 0) {
    sessionFile = join(sessionsDir, activeSessions[0].file);
    sessionRecord = activeSessions[0].data;
  }
}

// --- Check acceptance criteria completion ---
const moduleAC = (mod.acceptance_criteria || []);
const completedSet = new Set([...(mod.ac_completed || []), ...acCompleted]);
const totalAC = moduleAC.length;
const completedAC = moduleAC.filter(ac => completedSet.has(ac.id || ac)).length;

// --- Propose truth_status upgrade ---
let proposedStatus = mod.truth_status;
let upgradeReason = null;

if (mod.truth_status === 'unverified' && evidencePath && acCompleted.length > 0) {
  proposedStatus = 'partial';
  upgradeReason = 'Has evidence + partial AC completion → upgrade to partial';
} else if (mod.truth_status === 'partial' && evidencePath && totalAC > 0 && completedAC >= totalAC * 0.8) {
  proposedStatus = 'working';
  upgradeReason = `${completedAC}/${totalAC} ACs complete + evidence present → upgrade to working`;
} else if (mod.truth_status === 'draft' && evidencePath) {
  proposedStatus = 'partial';
  upgradeReason = 'Evidence captured on draft module → upgrade to partial';
}

// --- Update session record ---
if (sessionRecord && sessionFile) {
  sessionRecord.ended_at = now;
  sessionRecord.status = 'closed';
  sessionRecord.evidence_captured = evidencePath ? [evidencePath] : [];
  sessionRecord.ac_completed = acCompleted;
  sessionRecord.notes = notes;
  sessionRecord.proposed_status_upgrade = proposedStatus !== mod.truth_status ? proposedStatus : null;
  writeFileSync(sessionFile, JSON.stringify(sessionRecord, null, 2), 'utf8');
  console.log(`[tlc-done] Session closed: ${basename(sessionFile)}`);
}

// --- Write STATUS.md retrospective entry ---
const PROJECTS_DIR = '/Users/coreyalejandro/Projects';
let projectPath = mod.path;
if (!projectPath.startsWith('/')) {
  const dirName = mod.path.replace(/\/$/, '').split('/').pop();
  projectPath = join(PROJECTS_DIR, dirName);
}
const statusPath = join(projectPath, 'STATUS.md');

const retroEntry = `
## RETROSPECTIVE — ${now.slice(0, 10)}

**Session:** ${sessionRecord ? sessionRecord.session_id : MODULE_ID + '-manual'}
**Truth Status:** ${mod.truth_status}${proposedStatus !== mod.truth_status ? ` → PROPOSED: ${proposedStatus}` : ''}
**Evidence:** ${evidencePath || '(none)'}
**ACs Completed:** ${acCompleted.length > 0 ? acCompleted.join(', ') : '(none)'}
**Notes:** ${notes || '(none)'}
`;

if (existsSync(statusPath)) {
  appendFileSync(statusPath, retroEntry, 'utf8');
  console.log(`[tlc-done] STATUS.md updated: ${statusPath}`);
} else {
  console.warn(`[tlc-done] WARN: STATUS.md not found at ${statusPath} — skipping retrospective append.`);
}

// --- Apply status upgrade if warranted ---
if (proposedStatus !== mod.truth_status) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`STATUS UPGRADE PROPOSED`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Module:    ${MODULE_ID}`);
  console.log(`Current:   ${mod.truth_status}`);
  console.log(`Proposed:  ${proposedStatus}`);
  console.log(`Reason:    ${upgradeReason}`);
  console.log(`\nTo apply: manually update registry/modules.registry.json`);
  console.log(`  Set truth_status to "${proposedStatus}" and add verified_date: "${now.slice(0, 10)}"`);
  console.log(`  Then run: npm run verify:registry`);
  console.log(`${'═'.repeat(60)}`);
}

// --- Log to sessions index ---
const indexPath = join(sessionsDir, 'index.jsonl');
appendFileSync(indexPath, JSON.stringify({
  event: 'session_end',
  module_id: MODULE_ID,
  ended_at: now,
  evidence: evidencePath || null,
  ac_completed: acCompleted,
  proposed_status: proposedStatus !== mod.truth_status ? proposedStatus : null,
}) + '\n', 'utf8');

// --- Summary ---
console.log(`\n[tlc-done] Session closed.`);
console.log(`Module: ${MODULE_ID} | Status: ${mod.truth_status}`);
if (acCompleted.length > 0) {
  console.log(`ACs completed this session: ${acCompleted.join(', ')}`);
}
if (!evidencePath) {
  console.log('\nNOT CLAIMED: No evidence file provided. Status cannot be upgraded until evidence exists.');
}
console.log();
