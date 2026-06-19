#!/usr/bin/env node
// tlc.mjs — The Living Constitution 2.0 terminal UI
// Looks and behaves like Hermes Agent: same logo art, same gold theme,
// same status bar, same ❯ prompt, same command system.

import { createInterface } from 'readline';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { execSync, exec } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');

// ── chalk with forced color ───────────────────────────────────────────────────
process.env.FORCE_COLOR = '3';
const { default: chalk } = await import('chalk');

// ── Theme — exact Hermes DARK_THEME values ────────────────────────────────────
const C = {
  primary:  chalk.hex('#FFD700'),
  accent:   chalk.hex('#FFBF00'),
  border:   chalk.hex('#CD7F32'),
  text:     chalk.hex('#FFF8DC'),
  muted:    chalk.hex('#CC9B1F'),
  label:    chalk.hex('#DAA520'),
  ok:       chalk.hex('#4caf50'),
  error:    chalk.hex('#ef5350'),
  warn:     chalk.hex('#ffa726'),
  prompt:   chalk.hex('#FFF8DC'),
  statusBg: chalk.bgHex('#1a1a2e'),
  statusFg: chalk.hex('#C0C0C0'),
  good:     chalk.hex('#8FBC8F'),
  bad:      chalk.hex('#FF8C00'),
  critical: chalk.hex('#FF6B6B'),
  shell:    chalk.hex('#4dabf7'),
};

// ── TLC logo — styled like Hermes (gradient: primary→accent→border) ────────────
const LOGO = [
  [C.primary, '████████╗██╗      ██████╗'],
  [C.primary, '╚══██╔══╝██║     ██╔════╝'],
  [C.accent,  '   ██║   ██║     ██║     '],
  [C.accent,  '   ██║   ██║     ██║     '],
  [C.border,  '   ██║   ███████╗╚██████╗'],
  [C.border,  '   ╚═╝   ╚══════╝ ╚═════╝'],
];

const CADUCEUS = [
  [C.primary, '⠀⠀⠀⠀⢀⣀⡀⠀⣀⣀⠀'],
  [C.primary, '⠀⢀⣴⣾⣿⣿⣇⣸⣿⣿⣷'],
  [C.accent,  '⠀⠙⣿⣿⠻⣿⣿⣿⠟⣿⣿'],
  [C.accent,  '⠀⠀⠁⠶⠟⠋⠙⠻⠶⠈⠁'],
  [C.border,  '⠀⠀⠀⣴⣿⡿⢿⣿⣦⠀⠀'],
  [C.border,  '⠀⠀⠀⠿⣿⣦⣴⣿⠿⠀⠀'],
  [C.muted,   '⠀⠀⠀⠀⠉⠻⣿⣦⡉⠀⠀'],
  [C.muted,   '⠀⠀⠀⠀⠘⢷⣈⠛⠃⠀⠀'],
  [C.muted,   '⠀⠀⠀⢠⣴⠦⠙⠿⣦⡄⠀'],
  [C.muted,   '⠀⠀⠀⠸⣿⣤⣤⣿⠇⠀⠀'],
  [C.muted,   '⠀⠀⠀⠀⠀⠉⠛⠷⠄⠀⠀'],
  [C.muted,   '⠀⠀⠀⠀⢀⑊⢶⣄⡀⠀⠀'],
  [C.muted,   '⠀⠀⠀⠀⣿⠁⠈⡿⠀⠀⠀'],
  [C.muted,   '⠀⠀⠀⠀⠈⠳⠞⠁⠀⠀⠀'],
  [C.muted,   '⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀'],
];

// ── helpers ───────────────────────────────────────────────────────────────────
const W = process.stdout.columns || 100;

function hr(char = '─') {
  return C.border('─'.repeat(W));
}

function padRight(str, len) {
  // strip ANSI for length calc
  const raw = str.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, len - raw.length);
  return str + ' '.repeat(pad);
}

function bannerRow(logo, cadu, i) {
  const lLine = logo[i]  ? logo[i][0](logo[i][1])   : '';
  const cLine = cadu[i]  ? cadu[i][0](cadu[i][1])   : '';
  const lRaw  = logo[i]  ? logo[i][1]  : '';
  const cRaw  = cadu[i]  ? cadu[i][1]  : '';
  const lPad  = 26 - lRaw.length;
  const sep   = '   ';
  return lLine + ' '.repeat(lPad) + sep + cLine;
}

function loadRegistry() {
  const p = join(ROOT, 'registry', 'modules.registry.json');
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return []; }
}

function loadSession() {
  const p = join(ROOT, '.ai-context', 'active-session.md');
  if (!existsSync(p)) return null;
  try {
    const text = readFileSync(p, 'utf8');
    const m = text.match(/^##\s*Module[:\s]+(.+)$/im);
    return m ? m[1].trim() : null;
  } catch { return null; }
}

function healthSummary() {
  try {
    const out = execSync(`node ${join(ROOT, 'scripts', 'tlc-health.mjs')} 2>&1`, {
      encoding: 'utf8', timeout: 5000
    });
    if (out.includes('HEALTHY')) return { status: 'HEALTHY', color: C.good };
    if (out.includes('DEGRADED')) return { status: 'DEGRADED', color: C.bad };
    return { status: 'CRITICAL', color: C.critical };
  } catch {
    return { status: 'UNKNOWN', color: C.muted };
  }
}

// ── STATUS BAR ────────────────────────────────────────────────────────────────
function drawStatusBar(health, session) {
  const icon    = C.primary('⚕');
  const name    = C.primary(' TLC 2.0');
  const ver     = C.muted(' v2.0');
  const sep     = C.border(' │ ');
  const hLabel  = health.color(`● ${health.status}`);
  const sMod    = session
    ? sep + C.label('session: ') + C.accent(session)
    : sep + C.muted('no active session');
  const left    = icon + name + ver + sep + hLabel + sMod;
  const right   = C.muted('type /help for commands  ') + C.primary('⚕');
  const leftRaw = left.replace(/\x1b\[[0-9;]*m/g, '');
  const rightRaw = right.replace(/\x1b\[[0-9;]*m/g, '');
  const gap     = Math.max(1, W - leftRaw.length - rightRaw.length);
  process.stdout.write(C.statusBg(left + ' '.repeat(gap) + right) + '\n');
}

// ── BANNER ────────────────────────────────────────────────────────────────────
function drawBanner(health) {
  console.log('');
  const rows = Math.max(LOGO.length, CADUCEUS.length);
  for (let i = 0; i < rows; i++) {
    console.log('  ' + bannerRow(LOGO, CADUCEUS, i));
  }
  console.log('');
  // subtitle line
  const sub  = C.muted('The Living Constitution 2.0  ') + C.border('│') + C.muted('  Governance Runtime');
  const sub2 = C.muted('  Mothership · Evidence · Registry · Contracts');
  console.log('  ' + sub);
  console.log('  ' + sub2);
  console.log('');
  drawStatusBar(health, loadSession());
  console.log('');
  console.log('  ' + C.muted('Type your message or ') + C.label('/help') + C.muted(' for commands.'));
  console.log('');
}

// ── MODULE LIST ───────────────────────────────────────────────────────────────
function drawModuleList() {
  const mods = loadRegistry();
  if (!mods.length) {
    console.log(C.warn('  No modules found in registry.'));
    return;
  }
  console.log('');
  console.log(C.label('  Modules'));
  console.log('  ' + C.border('─'.repeat(60)));
  for (const m of mods) {
    const id     = padRight(C.accent(m.id || m.name || '?'), 42);
    const status = m.truth_status || m.status || 'unverified';
    const badge  =
      status === 'working'    ? C.good(`● ${status}`)    :
      status === 'partial'    ? C.warn(`◐ ${status}`)    :
      status === 'quarantined'? C.critical(`✖ ${status}`) :
                                C.muted(`○ ${status}`);
    console.log(`  ${id} ${badge}`);
  }
  console.log('');
}

// ── HELP ──────────────────────────────────────────────────────────────────────
function drawHelp() {
  const cmds = [
    ['/setup',           'First-time setup wizard — start here if you are new'],
    ['/modules',         'List all registered modules and their status'],
    ['/health',          'Run tlc-health check and show result'],
    ['/work <MODULE>',   'Start a governed session on a module'],
    ['/done <MODULE>',   'End the current session and record what happened'],
    ['/new <NAME>',      'Create a new module (guided)'],
    ['/dashboard',       'Show the full module dashboard'],
    ['/validate <FILE>', 'Run Article XVI validator on a markdown file'],
    ['/probe',           'Run live invariant probe (Qwen2.5-7B — synthetic weights)'],
    ['/council <QUESTION>', 'Convene llm-council deliberation on a governance question'],
    ['/autoresearch',    'Show autoresearch results.tsv — val_bpb + I1-I8 per experiment'],
    ['/harness',         'Run full governance harness, all 4 gates'],
    ['/context',         'Show the active session contract'],
    ['/git status',      'Run git status in the TLC repo'],
    ['/git push',        'Run git push for the TLC repo'],
    ['/clear',           'Clear the screen'],
    ['/quit  /exit',     'Exit TLC'],
    ['/help',            'Show this command list'],
  ];
  console.log('');
  console.log(C.primary.bold('  (^_^)?  Commands'));
  console.log('  ' + C.border('─'.repeat(60)));
  for (const [cmd, desc] of cmds) {
    console.log('  ' + padRight(C.label(cmd), 34) + C.muted(desc));
  }
  console.log('');
}

// ── RUN A SCRIPT ──────────────────────────────────────────────────────────────
function runScript(script, args = '') {
  const cmd = `node ${join(ROOT, 'scripts', script)} ${args}`;
  return new Promise((resolve) => {
    exec(cmd, { cwd: ROOT, env: { ...process.env, FORCE_COLOR: '3' } }, (err, stdout, stderr) => {
      const out = (stdout + stderr).trim();
      resolve({ ok: !err, out });
    });
  });
}

function runGit(args) {
  return new Promise((resolve) => {
    exec(`git -C ${ROOT} ${args}`, { env: { ...process.env } }, (err, stdout, stderr) => {
      const out = (stdout + stderr).trim();
      resolve({ ok: !err, out });
    });
  });
}

// ── COMMAND DISPATCH ──────────────────────────────────────────────────────────
async function dispatch(line) {
  const raw   = line.trim();
  if (!raw) return;

  // echo user input styled
  process.stdout.write('\n');

  if (raw.startsWith('/')) {
    const [cmd, ...rest] = raw.slice(1).split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd.toLowerCase()) {

      case 'help':
        drawHelp();
        break;

      case 'modules':
        drawModuleList();
        break;

      case 'health': {
        console.log(C.muted('  Running health check...'));
        const { ok, out } = await runScript('tlc-health.mjs');
        const lines = out.split('\n');
        for (const l of lines) {
          const colored =
            l.includes('HEALTHY')  ? C.good(l)  :
            l.includes('DEGRADED') ? C.bad(l)   :
            l.includes('CRITICAL') ? C.critical(l) :
            l.includes('✓')        ? C.ok(l) :
            l.includes('✗')        ? C.error(l) :
                                     C.muted(l);
          console.log('  ' + colored);
        }
        console.log('');
        break;
      }

      case 'work': {
        if (!arg) { console.log(C.error('  Usage: /work MODULE-ID')); break; }
        console.log(C.muted(`  Starting session: ${arg}...`));
        const { ok, out } = await runScript('tlc-work.mjs', `--module ${arg}`);
        const color = ok ? C.text : C.error;
        out.split('\n').forEach(l => console.log('  ' + color(l)));
        console.log('');
        break;
      }

      case 'done': {
        if (!arg) { console.log(C.error('  Usage: /done MODULE-ID')); break; }
        console.log(C.muted(`  Ending session: ${arg}...`));
        const { ok, out } = await runScript('tlc-done.mjs', `--module ${arg}`);
        const color = ok ? C.text : C.error;
        out.split('\n').forEach(l => console.log('  ' + color(l)));
        console.log('');
        break;
      }

      case 'new': {
        if (!arg) { console.log(C.error('  Usage: /new MODULE-NAME')); break; }
        console.log(C.muted(`  Creating module: ${arg}...`));
        const { ok, out } = await runScript('tlc-new.mjs', `--name ${arg}`);
        const color = ok ? C.text : C.error;
        out.split('\n').forEach(l => console.log('  ' + color(l)));
        console.log('');
        break;
      }

      case 'dashboard': {
        console.log(C.muted('  Loading dashboard...'));
        const { ok, out } = await runScript('tlc-dashboard.mjs');
        out.split('\n').forEach(l => console.log('  ' + C.text(l)));
        console.log('');
        break;
      }

      case 'validate': {
        if (!arg) { console.log(C.error('  Usage: /validate path/to/file.md')); break; }
        console.log(C.muted(`  Validating: ${arg}...`));
        const { ok, out } = await runScript('validate-instructions.mjs', arg);
        const lines = out.split('\n');
        for (const l of lines) {
          const colored =
            l.includes('PASS')     ? C.good(l)    :
            l.includes('FAIL')     ? C.critical(l) :
            l.includes('[R')       ? C.warn(l)    :
            l.includes('Fix:')     ? C.muted(l)   :
                                     C.text(l);
          console.log('  ' + colored);
        }
        console.log('');
        break;
      }

      case 'context': {
        const p = join(ROOT, '.ai-context', 'active-session.md');
        if (!existsSync(p)) {
          console.log(C.muted('  No active session. Run /work MODULE-ID first.'));
        } else {
          const content = readFileSync(p, 'utf8');
          content.split('\n').forEach(l => {
            const colored =
              l.startsWith('#')  ? C.primary.bold(l) :
              l.startsWith('##') ? C.accent(l)       :
              l.includes(':')    ? C.label(l)        :
                                   C.text(l);
            console.log('  ' + colored);
          });
        }
        console.log('');
        break;
      }

      case 'git': {
        const gargs = rest.join(' ');
        if (!gargs) { console.log(C.error('  Usage: /git <status|push|log|diff>')); break; }
        console.log(C.muted(`  git ${gargs}`));
        const { ok, out } = await runGit(gargs);
        const color = ok ? C.shell : C.error;
        out.split('\n').forEach(l => console.log('  ' + color(l)));
        console.log('');
        break;
      }

      case 'probe': {
        const probePath = join(ROOT, 'modules', 'governance-harness', 'probes', 'run_live.py');
        const weightsPath = join(ROOT, 'modules', 'governance-harness', 'probes', 'weights');
        if (!existsSync(probePath)) {
          console.log(C.error('  governance-harness probe not found.'));
          console.log(C.muted('  Expected: modules/governance-harness/probes/run_live.py'));
          break;
        }
        console.log(C.muted('  Running live invariant probe (Qwen2.5-7B required)...'));
        console.log(C.warn('  NOTE: Current weights trained on synthetic data. Results are not empirically valid.'));
        console.log(C.muted('  See evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md for full disclosure.'));
        console.log('');
        const { ok, out } = await new Promise((resolve) => {
          exec(
            `cd ${join(ROOT, 'modules', 'governance-harness', 'probes')} && HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python run_live.py`,
            { cwd: ROOT, env: { ...process.env }, timeout: 120000 },
            (err, stdout, stderr) => resolve({ ok: !err, out: (stdout + stderr).trim() })
          );
        });
        const color = ok ? C.text : C.error;
        out.split('\n').forEach(l => {
          const colored =
            l.includes('sovereign') ? C.good(l) :
            l.includes('defensive') ? C.warn(l) :
            l.includes('LDA score') ? C.accent(l) :
            l.includes('ERROR') || l.includes('Error') ? C.error(l) :
            color(l);
          console.log('  ' + colored);
        });
        console.log('');
        break;
      }

      case 'harness': {
        console.log(C.muted('  Running governance harness (all 4 gates, Qwen2.5-7B required)...'));
        console.log(C.warn('  NOTE: Synthetic dataset — gate results not empirically valid.'));
        console.log('');
        const { ok, out } = await new Promise((resolve) => {
          exec(
            `cd ${join(ROOT, 'modules', 'governance-harness')} && HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python run_harness.py`,
            { cwd: ROOT, env: { ...process.env }, timeout: 300000 },
            (err, stdout, stderr) => resolve({ ok: !err, out: (stdout + stderr).trim() })
          );
        });
        out.split('\n').forEach(l => {
          const colored =
            l.includes('PASS') || l.includes('✓') ? C.good(l) :
            l.includes('FAIL') || l.includes('FATAL') ? C.critical(l) :
            l.includes('GATE') ? C.accent(l) :
            l.includes('WARNING') ? C.warn(l) :
            C.text(l);
          console.log('  ' + colored);
        });
        console.log('');
        break;
      }


      case 'setup': {
        const setupPath = join(ROOT, 'scripts', 'tlc-setup.mjs');
        print(COLORS.muted, 'Launching setup wizard...');
        rl.close();
        const { spawnSync } = await import('child_process');
        spawnSync('node', [setupPath], { stdio: 'inherit' });
        process.exit(0);
        break;
      }

      case 'council': {
        const question = args.slice(1).join(' ').trim();
        if (!question) {
          print(COLORS.warn, 'Usage: /council <your governance question>');
          print(COLORS.muted, 'Example: /council Should NANOCHAT advance to working status?');
          break;
        }
        const councilPath = join(ROOT, 'modules', 'llm-council');
        const envPath = join(ROOT, '.env');
        const hasEnv = existsSync(envPath);
        print(COLORS.accent, 'LLM-COUNCIL');
        print(COLORS.text, `Question: ${question}`);
        if (!hasEnv) {
          print(COLORS.warn, 'No .env found at repo root.');
          print(COLORS.muted, 'Create .env with: OPENROUTER_API_KEY=sk-or-...');
          print(COLORS.muted, `Council path: ${councilPath}`);
          print(COLORS.muted, 'Run manually: cd modules/llm-council && uv run python -m backend.main');
        } else {
          print(COLORS.muted, 'Starting council backend — open http://localhost:8001 in browser');
          print(COLORS.muted, `Or run: cd ${councilPath} && ./start.sh`);
        }
        break;
      }

      case 'autoresearch': {
        const resultsPath = join(ROOT, 'modules', 'autoresearch', 'results.tsv');
        print(COLORS.accent, 'AUTORESEARCH — Experiment Results');
        if (existsSync(resultsPath)) {
          try {
            const rows = readFileSync(resultsPath, 'utf8').trim().split('\n');
            print(COLORS.muted, `${rows.length - 1} experiments recorded`);
            print(COLORS.border, '─'.repeat(80));
            rows.forEach(r => print(COLORS.text, r));
          } catch {
            print(COLORS.warn, 'results.tsv exists but could not be read');
          }
        } else {
          print(COLORS.muted, 'No results.tsv yet — no experiments have run.');
          print(COLORS.muted, 'Requires NVIDIA GPU (CUDA). Run on Colab or cloud instance:');
          print(COLORS.muted, `  cd ${join(ROOT, 'modules', 'autoresearch')}`);
          print(COLORS.muted, '  uv run prepare.py');
          print(COLORS.muted, '  uv run train.py');
        }
        break;
      }

      case 'clear':
        process.stdout.write('\x1bc');
        drawBanner(healthSummary());
        break;

      case 'quit':
      case 'exit':
        console.log('\n  ' + C.primary('Goodbye! ⚕') + '\n');
        process.exit(0);
        break;

      default:
        console.log(C.error(`  Unknown command: /${cmd}`));
        console.log(C.muted('  Type /help to see all commands.'));
        console.log('');
    }
  } else {
    // plain text — show a helpful prompt nudge
    console.log(C.muted('  TLC commands start with /   Try /help'));
    console.log('');
  }
}

// ── PROMPT LOOP ───────────────────────────────────────────────────────────────
function startPromptLoop() {
  const rl = createInterface({
    input:  process.stdin,
    output: process.stdout,
    terminal: true,
  });

  function ask() {
    const session = loadSession();
    const sessionLabel = session
      ? C.muted('(') + C.accent(session) + C.muted(') ')
      : '';
    const promptStr = sessionLabel + C.primary('❯ ');
    // strip ANSI for rl.question length
    rl.question(promptStr, async (line) => {
      await dispatch(line);
      ask();
    });
  }

  rl.on('close', () => {
    console.log('\n  ' + C.primary('Goodbye! ⚕') + '\n');
    process.exit(0);
  });

  ask();
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
process.stdout.write('\x1bc'); // clear screen
const health = healthSummary();
drawBanner(health);
startPromptLoop();
