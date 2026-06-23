#!/usr/bin/env node
/**
 * tlc — TLC 2.0 unified CLI
 *
 * Usage:
 *   tlc                        launch the TUI (default)
 *   tlc agent [MODULE]         prep + print governed hermes command
 *   tlc agent [MODULE] [model] prep + print hermes command with specific model
 *   tlc work [MODULE]          start a work session
 *   tlc done [MODULE]          close a work session
 *   tlc health                 repo health check
 *   tlc new [NAME]             create a new module
 *   tlc test                   run all tests
 *   tlc web                    launch Web UI (Vite dev server on :5173)
 *   tlc help                   show this message
 *
 * MODULE defaults to CRSP-STC-RUNTIME-001 if omitted.
 */

import { spawnSync, execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');

const GREEN = '\x1b[32m';
const CYAN  = '\x1b[36m';
const DIM   = '\x1b[2m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

const args    = process.argv.slice(2);
const command = args[0] ?? '';

// ── helpers ────────────────────────────────────────────────────────────────

function run(script, extraArgs = []) {
  const result = spawnSync(
    'node',
    [join(ROOT, 'scripts', script), ...extraArgs],
    { stdio: 'inherit', cwd: ROOT, env: { ...process.env, FORCE_COLOR: '3' } }
  );
  process.exit(result.status ?? 0);
}

function launchTUI() {
  const result = spawnSync(
    'node',
    ['--import', 'tsx/esm', join(ROOT, 'src', 'tui', 'app.tsx')],
    { stdio: 'inherit', cwd: ROOT, env: { ...process.env, FORCE_COLOR: '3' } }
  );
  process.exit(result.status ?? 0);
}

function help() {
  console.log(`
${BOLD}tlc${RESET} — TLC 2.0 command line

  ${CYAN}tlc${RESET}                           launch the TUI
  ${CYAN}tlc agent${RESET}                     prep + launch governed Hermes (default module)
  ${CYAN}tlc agent CRSP-STC-RUNTIME-001${RESET} prep + launch governed Hermes for a module
  ${CYAN}tlc agent MODULE model${RESET}        same, but with a specific model
  ${CYAN}tlc work MODULE${RESET}               start a work session
  ${CYAN}tlc done MODULE${RESET}               close a work session
  ${CYAN}tlc health${RESET}                    repo health check
  ${CYAN}tlc new NAME${RESET}                  create a new module
  ${CYAN}tlc test${RESET}                      run all tests\n  ${CYAN}tlc web${RESET}                       export data + launch Web UI on :5173\n  ${CYAN}tlc help${RESET}                      show this message

${DIM}Default module: CRSP-STC-RUNTIME-001${RESET}
`);
  process.exit(0);
}

// ── dispatch ───────────────────────────────────────────────────────────────

switch (command.toLowerCase()) {

  case '':
  case 'tui':
    launchTUI();
    break;

  case 'agent': {
    const rawModule = args[1] ?? 'CRSP-STC-RUNTIME-001';
    const module    = rawModule.toUpperCase();
    const model     = args[2] ?? null;
    const extra     = ['--module', module];
    if (model) extra.push('--model', model);
    run('tlc-hermes.mjs', extra);
    break;
  }

  case 'work': {
    const module = (args[1] ?? 'CRSP-STC-RUNTIME-001').toUpperCase();
    run('tlc-work.mjs', ['--module', module]);
    break;
  }

  case 'done': {
    const module = (args[1] ?? 'CRSP-STC-RUNTIME-001').toUpperCase();
    run('tlc-done.mjs', ['--module', module]);
    break;
  }

  case 'health':
    run('tlc-health.mjs');
    break;

  case 'new': {
    const name = args.slice(1).join(' ');
    if (!name) { console.error('Usage: tlc new MODULE-NAME'); process.exit(1); }
    run('tlc-new.mjs', ['--name', name]);
    break;
  }

  case 'test': {
    const result = spawnSync('npm', ['test'], {
      stdio: 'inherit', cwd: ROOT, env: { ...process.env, FORCE_COLOR: '3' }
    });
    process.exit(result.status ?? 0);
    break;
  }

  case 'help':
  case '--help':
  case '-h':
    help();
    break;

  case 'web': {
    // Export governance data then launch Vite dev server
    const exportResult = spawnSync('node', [join(ROOT, 'scripts', 'export-web-data.mjs')], {
      stdio: 'inherit', cwd: ROOT,
    });
    if (exportResult.status !== 0) process.exit(exportResult.status ?? 1);
    // Launch vite from src/ui
    const viteResult = spawnSync('npx', ['vite'], {
      stdio: 'inherit', cwd: join(ROOT, 'src/ui'), env: { ...process.env, FORCE_COLOR: '3' },
    });
    process.exit(viteResult.status ?? 0);
    break;
  }

  default:
    console.error(`Unknown command: ${command}\nRun ${CYAN}tlc help${RESET} to see available commands.`);
    process.exit(1);
}
