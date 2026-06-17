#!/usr/bin/env node
/**
 * tlc-work.mjs
 * TLC 2.0 Workspace — Start a Governed Session
 *
 * Validates the module, loads contract into AI context, creates session record.
 *
 * Usage:
 *   node scripts/tlc-work.mjs --module <MODULE_ID>
 *
 * Shell alias: tlc-work --module <MODULE_ID>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// --- Arg parsing ---
const args = process.argv.slice(2);
const moduleIndex = args.indexOf('--module');

if (moduleIndex === -1 || !args[moduleIndex + 1]) {
  console.error('Usage: tlc-work.mjs --module <MODULE_ID>');
  process.exit(1);
}

const MODULE_ID = args[moduleIndex + 1];
const now = new Date().toISOString();

// --- Load registry ---
const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const mod = registry.modules.find(m => m.id === MODULE_ID);

if (!mod) {
  console.error(`\nHALT: Module "${MODULE_ID}" not found in registry.`);
  console.error('\nRegistered modules:');
  registry.modules.forEach(m => {
    const icon = m.truth_status === 'quarantined' ? '🚫' :
                 m.truth_status === 'working' ? '✓' :
                 m.truth_status === 'partial' ? '~' : '?';
    console.error(`  ${icon} ${m.id} (${m.truth_status})`);
  });
  console.error('\nTo register a new module: tlc-new --name <name> --template <template> --surface <surface>');
  process.exit(1);
}

// --- Quarantine check (I6) ---
if (mod.truth_status === 'quarantined') {
  console.error(`\nHALT: I6 QUARANTINE_BLOCK — Module "${MODULE_ID}" is quarantined.`);
  console.error('Quarantined modules are read-only. No work can proceed.');
  console.error('To continue: resolve the quarantine condition, update the registry, and re-run.');
  process.exit(1);
}

// --- Contract check (I1) ---
if (!mod.contract_id) {
  console.warn(`\nWARN: I1 CONTRACT_REQUIRED — Module "${MODULE_ID}" has no contract_id.`);
  console.warn('A session without a contract is unverified by definition.');
  console.warn('Create a C_RSP_BUILD_CONTRACT.md in the project root to bind this session.\n');
}

// --- Resolve project path ---
const PROJECTS_DIR = '/Users/coreyalejandro/Projects';
// path field may be relative to PROJECTS_DIR or an absolute path
let projectPath = mod.path;
if (!projectPath.startsWith('/')) {
  // strip trailing slash, derive from project dir name
  const dirName = mod.path.replace(/\/$/, '').split('/').pop();
  projectPath = join(PROJECTS_DIR, dirName);
}
const projectExists = existsSync(projectPath);

// --- Display module status ---
console.log(`\n${'═'.repeat(60)}`);
console.log(`TLC 2.0 — Starting Session`);
console.log(`${'═'.repeat(60)}`);
console.log(`Module:       ${MODULE_ID}`);
console.log(`Label:        ${mod.label}`);
console.log(`Truth Status: ${mod.truth_status}`);
console.log(`Surface:      ${mod.surface}`);
console.log(`Contract:     ${mod.contract_id || '(none — WARN)'}`);
console.log(`Path:         ${projectPath} ${projectExists ? '(exists)' : '(NOT FOUND)'}`);
if (mod.verified_date) console.log(`Last Verified: ${mod.verified_date}`);
console.log(`${'─'.repeat(60)}`);

if (mod.unverified_scope && mod.unverified_scope.length > 0) {
  console.log('\nUnverified Scope (your work items):');
  mod.unverified_scope.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item}`);
  });
}
console.log();

// --- Inject AI context ---
const injectScript = join(REPO_ROOT, 'scripts', 'inject-ai-context.mjs');
if (existsSync(injectScript)) {
  const args_inject = ['--module', MODULE_ID];
  if (projectExists) {
    args_inject.push('--project-path', projectPath);
  }
  const result = spawnSync('node', [injectScript, ...args_inject], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.warn('\nWARN: inject-ai-context failed — session continues without context file.');
  }
}

// --- Create session record ---
const sessionsDir = join(REPO_ROOT, '.sessions');
mkdirSync(sessionsDir, { recursive: true });
const sessionId = `${MODULE_ID}-${now.replace(/[:.]/g, '-').slice(0, 19)}`;
const sessionFile = join(sessionsDir, `${sessionId}.json`);
const sessionRecord = {
  session_id: sessionId,
  module_id: MODULE_ID,
  contract_id: mod.contract_id || null,
  truth_status_at_start: mod.truth_status,
  started_at: now,
  ended_at: null,
  project_path: projectPath,
  evidence_captured: [],
  ac_completed: [],
  notes: '',
  status: 'active',
};
writeFileSync(sessionFile, JSON.stringify(sessionRecord, null, 2), 'utf8');

// --- Log to sessions index ---
const indexPath = join(sessionsDir, 'index.jsonl');
appendFileSync(indexPath, JSON.stringify({ event: 'session_start', session_id: sessionId, module_id: MODULE_ID, started_at: now }) + '\n', 'utf8');

console.log(`\nSession record: ${sessionFile}`);
console.log(`\n${'─'.repeat(60)}`);
console.log('NEXT: Paste into your AI chat:');
console.log(`  "Read .ai-context/active-session.md. Operating under module ${MODULE_ID}."`);
console.log(`\nWhen done: tlc-done --module ${MODULE_ID}`);
console.log(`${'═'.repeat(60)}\n`);
