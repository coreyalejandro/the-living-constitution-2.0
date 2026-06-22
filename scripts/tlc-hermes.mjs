#!/usr/bin/env node
/**
 * tlc-hermes.mjs
 * TLC 2.0 Workspace — Hermes Agent Session Launcher
 *
 * Launches a governed Hermes Agent session for a TLC module.
 * This is the backbone integration: it wires the TLC contract system
 * directly into Hermes so every AI session is contract-loaded from turn one.
 *
 * What it does:
 *   1. Validates the module (registered, not quarantined)
 *   2. Generates the active-session.md context file
 *   3. Ensures the Hermes skill exists for this module (runs tlc-sync-skills if needed)
 *   4. Creates a session record in .sessions/
 *   5. Launches: hermes -s crsp-<module-id> --title "<MODULE-ID> — YYYY-MM-DD"
 *
 * Usage:
 *   tlc-hermes --module MODULE-ID
 *   tlc-hermes --module MODULE-ID --model claude-sonnet-4
 *   tlc-hermes --module MODULE-ID --no-launch   # prep only, don't launch hermes
 *
 * Article XIII, Section 13.3 of SOCIOTECHNICAL_CONSTITUTION.md.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = join(__dirname, '..');
const HOME = homedir();
const REGISTRY_PATH = join(TLC_ROOT, 'registry', 'modules.registry.json');
const SESSIONS_DIR = join(TLC_ROOT, '.sessions');
const AI_CONTEXT_DIR = join(TLC_ROOT, '.ai-context');
const SKILLS_DIR = join(HOME, '.hermes', 'skills', 'tlc');

// ANSI
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

function log(msg)  { console.log(msg); }
function ok(msg)   { log(`${GREEN}✓${RESET} ${msg}`); }
function info(msg) { log(`${CYAN}→${RESET} ${msg}`); }
function warn(msg) { log(`${YELLOW}⚠${RESET} ${msg}`); }
function fail(msg) { log(`${RED}✗${RESET} ${msg}`); process.exit(1); }

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const moduleId = getArg('--module');
const modelOverride = getArg('--model');
const noLaunch = args.includes('--no-launch');

if (!moduleId) {
  fail('Usage: tlc-hermes --module MODULE-ID [--model claude-sonnet-4] [--no-launch]');
}

// ── Registry ──────────────────────────────────────────────────────────────────

function loadRegistry() {
  if (!existsSync(REGISTRY_PATH)) fail('Registry not found. Run tlc-new or tlc-register first.');
  try {
    const raw = readFileSync(REGISTRY_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data.modules)) return data.modules;
    if (Array.isArray(data)) return data;
    return Object.values(data).filter(v => typeof v === 'object' && v.id);
  } catch (e) { fail(`Registry parse error: ${e.message}`); }
}

function findModule(modules, id) {
  return modules.find(m => (m.id || m.module_id) === id);
}

// ── Skill check ───────────────────────────────────────────────────────────────

function ensureSkillExists(id) {
  const idClean = id.toLowerCase().replace(/_/g, '-').replace(/^crsp-/, '');
  const skillName = `crsp-${idClean}`;
  const skillPath = join(SKILLS_DIR, skillName, 'SKILL.md');

  if (existsSync(skillPath)) {
    ok(`Hermes skill loaded: ${skillName}`);
    return skillName;
  }

  warn(`Skill not found for ${id}. Running tlc-sync-skills...`);
  try {
    execSync(
      `node ${join(__dirname, 'tlc-sync-skills.mjs')} --module ${id}`,
      { stdio: 'inherit', cwd: TLC_ROOT }
    );
    if (existsSync(skillPath)) {
      ok(`Skill created: ${skillName}`);
    } else {
      warn(`Skill creation may have failed. Launching Hermes without pre-loaded skill.`);
      return null;
    }
  } catch (e) {
    warn(`tlc-sync-skills failed: ${e.message}. Continuing without skill.`);
    return null;
  }

  return skillName;
}

// ── Context injection ─────────────────────────────────────────────────────────

function injectContext(id) {
  const injectScript = join(__dirname, 'inject-ai-context.mjs');
  if (!existsSync(injectScript)) {
    warn('inject-ai-context.mjs not found. Skipping context generation.');
    return;
  }
  try {
    execSync(`node ${injectScript} --module ${id}`, { stdio: 'inherit', cwd: TLC_ROOT });
    ok('AI context injected → .ai-context/active-session.md');
  } catch (e) {
    warn(`Context injection failed: ${e.message}`);
  }
}

// ── Session record ────────────────────────────────────────────────────────────

function createSessionRecord(module) {
  mkdirSync(SESSIONS_DIR, { recursive: true });
  const id = module.id || module.module_id;
  const ts = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const sessionFile = join(SESSIONS_DIR, `${id}-${ts}.json`);

  const idClean = id.toLowerCase().replace(/_/g, '-').replace(/^crsp-/, '');
  const record = {
    session_id: `${id}-${ts}`,
    module_id: id,
    contract_id: module.contract_id || `CRSP-${id}`,
    truth_status_at_start: module.truth_status || 'unverified',
    started_at: new Date().toISOString(),
    ended_at: null,
    backbone: 'hermes-agent',
    skill: `crsp-${idClean}`,
    evidence_captured: [],
    acs_completed: [],
    notes: ''
  };

  writeFileSync(sessionFile, JSON.stringify(record, null, 2));
  ok(`Session record: .sessions/${id}-${ts}.json`);
  return record;
}

// ── Hermes check ──────────────────────────────────────────────────────────────

function hermesAvailable() {
  try {
    execSync('which hermes', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log(`\n${BOLD}TLC → Hermes Session: ${moduleId}${RESET}\n`);

  // 1. Load and validate module
  const modules = loadRegistry();
  const module = findModule(modules, moduleId);

  if (!module) {
    fail(`Module ${moduleId} not found in registry. Run: tlc-register --path <project-path>`);
  }

  const status = module.truth_status || module.status || 'unverified';

  if (status === 'quarantined') {
    fail(
      `Module ${moduleId} is QUARANTINED.\n` +
      `  Reason: ${module.notes || 'See registry for details.'}\n` +
      `  Resolution: Fix the governance violation, update registry truth_status, commit.`
    );
  }

  ok(`Module: ${moduleId}  ${DIM}[${status}]${RESET}`);

  // 2. Inject AI context
  injectContext(moduleId);

  // 3. Ensure Hermes skill exists
  const skillName = ensureSkillExists(moduleId);

  // 4. Create session record
  const session = createSessionRecord(module);

  // 5. Build Hermes command
  const today = new Date().toISOString().split('T')[0];
  const sessionTitle = `${moduleId} — ${today}`;

  // Core TLC research skills always loaded with every agent session
  const TLC_SKILLS = [
    skillName,                       // module-specific skill (e.g. crsp-stc-runtime-001)
    'deep-research',                 // 13-agent literature pipeline
    'academic-paper',                // 12-agent paper writing pipeline
    'arxiv',                         // arXiv search from inside the session
    'weights-and-biases',            // experiment tracking for probe runs
    'jupyter-live-kernel',           // live Python for LDA/LLM experiments
    'github-pr-workflow',            // full PR lifecycle without leaving the session
    'subagent-driven-development',   // parallel module builds with review gate
    'systematic-debugging',          // 4-phase root cause for broken tests/probes
    'writing-plans',                 // plan before build — keeps sessions on track
    'ai-safety-research-practice',   // AHI research workflow + whitewashing taxonomy
  ].filter(Boolean).join(',');

  const hermesArgs = [
    `-s ${TLC_SKILLS}`,
    modelOverride ? `-m ${modelOverride}` : '',
  ].filter(Boolean).join(' ');

  log('');
  log(`${BOLD}Session Ready${RESET}`);
  log(`  Module:   ${moduleId}`);
  log(`  Status:   ${status}`);
  log(`  Contract: ${session.contract_id}`);
  log(`  Skill:    ${skillName || DIM + 'none' + RESET}`);
  log(`  Session:  ${session.session_id}`);
  log('');

  if (!hermesAvailable()) {
    warn('Hermes CLI not found in PATH.');
    log('');
    log(`Install Hermes: curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`);
    log('');
    log(`Once installed, launch your session with:`);
    log(`  ${CYAN}hermes chat ${hermesArgs}${RESET}`);
    log('');
    log(`Or paste this context into any AI chat:`);
    log(`  ${DIM}cat ${join(AI_CONTEXT_DIR, 'active-session.md')}${RESET}`);
    log('');
    return;
  }

  if (noLaunch) {
    log(`${DIM}--no-launch: skipping Hermes launch.${RESET}`);
    log(`When ready, run:`);
    log(`  ${CYAN}hermes chat ${hermesArgs}${RESET}`);
    log('');
    return;
  }

  // 6. Print the launch command — Hermes is interactive and needs a real TTY.
  //    spawnSync cannot hand off TTY control cleanly; print and let the user run it.
  const launchCmd = `hermes chat ${hermesArgs}`.trim();

  log('');
  log(`${BOLD}${GREEN}┌─ Your agent is ready ──────────────────────────────────────────┐${RESET}`);
  log(`${BOLD}${GREEN}│${RESET}`);
  log(`${BOLD}${GREEN}│${RESET}  Run this command now:`);
  log(`${BOLD}${GREEN}│${RESET}`);
  log(`${BOLD}${GREEN}│${RESET}    ${CYAN}${BOLD}${launchCmd}${RESET}`);
  log(`${BOLD}${GREEN}│${RESET}`);
  log(`${BOLD}${GREEN}│${RESET}  The agent will load your contract + skill from message one.`);
  log(`${BOLD}${GREEN}│${RESET}`);
  log(`${BOLD}${GREEN}│${RESET}  When done, run:`);
  log(`${BOLD}${GREEN}│${RESET}    ${DIM}node scripts/tlc-done.mjs --module ${moduleId}${RESET}`);
  log(`${BOLD}${GREEN}│${RESET}`);
  log(`${BOLD}${GREEN}└────────────────────────────────────────────────────────────────┘${RESET}`);
  log('');
}

main().catch(e => {
  console.error(`\n${RED}Error:${RESET}`, e.message);
  process.exit(1);
});
