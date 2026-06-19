#!/usr/bin/env node
// tlc-setup.mjs — TLC 2.0 first-time setup wizard
// Run: node scripts/tlc-setup.mjs
// Also available inside the TLC terminal as /setup

import { createInterface } from 'readline';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── colors (same palette as tlc.mjs) ────────────────────────────────────────
const ESC = '\x1b[';
const C = {
  gold:   s => `\x1b[38;2;255;215;0m${s}\x1b[0m`,
  accent: s => `\x1b[38;2;255;191;0m${s}\x1b[0m`,
  bronze: s => `\x1b[38;2;205;127;50m${s}\x1b[0m`,
  cream:  s => `\x1b[38;2;255;248;220m${s}\x1b[0m`,
  muted:  s => `\x1b[38;2;204;155;31m${s}\x1b[0m`,
  green:  s => `\x1b[38;2;0;200;100m${s}\x1b[0m`,
  red:    s => `\x1b[38;2;220;50;50m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
};

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(res => rl.question(q, res));

const say  = (color, text) => console.log(color(text));
const line = () => console.log(C.bronze('─'.repeat(60)));
const gap  = () => console.log('');

// ── helpers ──────────────────────────────────────────────────────────────────
function check(label, condition, passMsg, failMsg) {
  if (condition) {
    console.log(`  ${C.green('✓')} ${C.cream(label)}  ${C.muted(passMsg)}`);
  } else {
    console.log(`  ${C.red('✗')} ${C.cream(label)}  ${C.muted(failMsg)}`);
  }
  return condition;
}

function tryCmd(cmd) {
  try { execSync(cmd, { stdio: 'pipe' }); return true; } catch { return false; }
}

function cmdOut(cmd) {
  try { return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim(); }
  catch { return null; }
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  process.stdout.write('\x1bc');

  // Banner
  gap();
  say(C.gold, '  ████████╗██╗      ██████╗     ██████╗     ██████╗ ');
  say(C.gold, '     ██╔══╝██║     ██╔════╝    ╚════██╗   ██╔═████╗');
  say(C.gold, '     ██║   ██║     ██║          █████╔╝   ██║██╔██║');
  say(C.gold, '     ██║   ██║     ██║         ██╔═══╝    ████╔╝██║');
  say(C.gold, '     ██║   ███████╗╚██████╗    ███████╗   ╚██████╔╝');
  say(C.gold, '     ╚═╝   ╚══════╝ ╚═════╝    ╚══════╝    ╚═════╝ ');
  gap();
  say(C.accent, '  The Living Constitution 2.0 — Setup Wizard');
  say(C.muted,  '  This takes about 2 minutes. You can stop at any time.');
  gap();
  line();
  gap();

  // ── STEP 1: Environment check ─────────────────────────────────────────────
  say(C.gold, '  STEP 1 OF 5 — Checking your environment');
  gap();

  const nodeVer = cmdOut('node --version');
  const nodeMajor = nodeVer ? parseInt(nodeVer.replace('v','').split('.')[0]) : 0;
  const gitOk    = tryCmd('git --version');
  const pythonOk = tryCmd('python3 --version');
  const uvOk     = tryCmd('uv --version');
  const hasEnv   = existsSync(join(ROOT, '.env'));
  const hookInstalled = existsSync(join(ROOT, '.git', 'hooks', 'pre-commit'));

  check('Node.js',    nodeMajor >= 18, nodeVer, 'Need v18+. Install from nodejs.org');
  check('git',        gitOk,           'found',  'Not found. Install git first.');
  check('python3',    pythonOk,        'found',  'Not found. Needed for governance-harness.');
  check('uv',         uvOk,            'found',  'Optional. Needed for llm-council + autoresearch. Install: curl -LsSf https://astral.sh/uv/install.sh | sh');
  check('.env file',  hasEnv,          'found',  'Not found. Council features need OpenRouter key. (Optional — skip if not using council)');
  check('pre-commit', hookInstalled,   'installed', 'Not installed. Run: node scripts/install-hooks.mjs');

  gap();

  if (nodeMajor < 18) {
    say(C.red, '  Node.js 18+ is required. Install it from nodejs.org then run this again.');
    rl.close(); process.exit(1);
  }

  const ans1 = await ask(C.gold('  Everything look right? Press Enter to continue, or type a question: '));
  if (ans1.trim().toLowerCase().startsWith('q')) { rl.close(); process.exit(0); }

  gap();
  line();
  gap();

  // ── STEP 2: OpenRouter key ────────────────────────────────────────────────
  say(C.gold, '  STEP 2 OF 5 — Council setup (optional)');
  gap();
  say(C.cream, '  The council feature lets multiple AI models deliberate on governance');
  say(C.cream, '  questions. It requires an OpenRouter API key (openrouter.ai).');
  say(C.cream, '  It is optional. The rest of TLC works without it.');
  gap();

  if (hasEnv) {
    say(C.green, '  You already have a .env file. Council is ready.');
    gap();
  } else {
    say(C.muted, '  No .env file found.');
    const ans2 = await ask(C.gold('  Do you have an OpenRouter API key? (y/n): '));
    if (ans2.trim().toLowerCase() === 'y') {
      const key = await ask(C.gold('  Paste your key (starts with sk-or-): '));
      if (key.trim().startsWith('sk-or-')) {
        writeFileSync(join(ROOT, '.env'), `OPENROUTER_API_KEY=${key.trim()}\n`);
        say(C.green, '  .env file created. Council is ready.');
      } else {
        say(C.red, '  That does not look like an OpenRouter key. Skipping for now.');
        say(C.muted, '  You can add it later: echo "OPENROUTER_API_KEY=sk-or-..." > .env');
      }
    } else {
      say(C.muted, '  Skipping. You can add it later when you want to use /council.');
    }
    gap();
  }

  line();
  gap();

  // ── STEP 3: GPU check ─────────────────────────────────────────────────────
  say(C.gold, '  STEP 3 OF 5 — GPU features');
  gap();
  say(C.cream, '  Three modules need a GPU to run:');
  gap();
  say(C.cream, '    NANOCHAT      — train a GPT model from scratch');
  say(C.cream, '    AUTORESEARCH  — autonomous experiment loop');
  say(C.cream, '    GOVERNANCE-HARNESS — neural probes on model checkpoints');
  gap();
  say(C.cream, '  On a Mac (no CUDA GPU), these run in Google Colab.');
  say(C.cream, '  Open modules/nanochat/INSTALL.ipynb in Colab, press Run All.');
  gap();

  const hasNvidia = tryCmd('nvidia-smi');
  if (hasNvidia) {
    say(C.green, '  NVIDIA GPU detected. You can run GPU modules locally.');
  } else {
    say(C.muted, '  No NVIDIA GPU detected (this is normal on Mac).');
    say(C.muted, '  Use Google Colab for GPU modules.');
    say(C.muted, '  Everything else runs locally right now.');
  }
  gap();

  await ask(C.gold('  Press Enter to continue: '));
  gap();
  line();
  gap();

  // ── STEP 4: Show what runs today ──────────────────────────────────────────
  say(C.gold, '  STEP 4 OF 5 — What you can do right now');
  gap();

  const envNow = existsSync(join(ROOT, '.env'));

  say(C.green,  '  READY NOW (no extra setup)');
  say(C.cream,  '    node scripts/tlc.mjs          — open the TLC terminal');
  say(C.cream,  '    /modules                       — list all 24 governed modules');
  say(C.cream,  '    /validate path/to/file         — check a file for violations');
  say(C.cream,  '    /work MODULE-ID                — start a governed session');
  say(C.cream,  '    /done MODULE-ID                — close session, record evidence');
  say(C.cream,  '    /health                        — full system health report');
  gap();

  if (envNow) {
    say(C.green, '  READY (OpenRouter key found)');
    say(C.cream, '    /council YOUR QUESTION         — multi-model governance deliberation');
    gap();
  } else {
    say(C.muted, '  NEEDS .env (add OPENROUTER_API_KEY)');
    say(C.muted, '    /council                       — not yet active');
    gap();
  }

  say(C.muted, '  NEEDS GPU (run in Google Colab)');
  say(C.muted, '    /probe                         — neural probe scores');
  say(C.muted, '    /autoresearch                  — experiment results');
  say(C.muted, '    Training nanochat              — modules/nanochat/INSTALL.ipynb');
  gap();

  await ask(C.gold('  Press Enter for the last step: '));
  gap();
  line();
  gap();

  // ── STEP 5: What to do next ───────────────────────────────────────────────
  say(C.gold, '  STEP 5 OF 5 — Your next action');
  gap();
  say(C.cream, '  Here is the single most useful thing you can do right now:');
  gap();
  say(C.accent, '    node scripts/tlc.mjs');
  gap();
  say(C.cream, '  That opens the TLC terminal. Type /help for the full command list.');
  say(C.cream, '  Type /modules to see all 24 governed modules and their status.');
  say(C.cream, '  Type /work CRSP-STC-RUNTIME-001 to start a governed session.');
  gap();
  say(C.cream, '  When you are ready to use the council, put your OpenRouter key in .env');
  say(C.cream, '  and type /council from inside the terminal.');
  gap();
  say(C.cream, '  When you are ready to train nanochat, open Colab, upload');
  say(C.cream, '  modules/nanochat/INSTALL.ipynb, and press Runtime → Run All.');
  gap();
  line();
  gap();
  say(C.gold,   '  Setup complete.');
  say(C.muted,  '  Full instructions: docs/HOW-TO-USE.md');
  say(C.muted,  '  Why this matters: docs/WHY-TLC.md');
  gap();

  rl.close();
}

main().catch(e => { console.error(e); process.exit(1); });
