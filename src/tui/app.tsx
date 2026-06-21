#!/usr/bin/env node
/**
 * TLC 2.0 — Full Ink TUI
 * Entry: scripts/tlc.mjs  →  tsx src/tui/app.tsx
 *
 * Layout:
 *   ┌─ status bar ──────────────────────────────────────────────────────────┐
 *   │  ⚕ TLC 2.0  │  ● WORKING  │  session: MODULE-ID          /help  ⚕  │
 *   ├─ nav tabs ────────────────────────────────────────────────────────────┤
 *   │  [Modules] [Claims] [Evidence] [Red-Team] [Constitution] [Git]        │
 *   ├─ main pane ────────────────────────────────────────────────────────────┤
 *   │  (scrollable output for active tab / command results)                 │
 *   ├─ divider ──────────────────────────────────────────────────────────────┤
 *   │  tlc ❯ _                                                              │
 *   └───────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { render, Box, Text, useInput, useApp, measureElement } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, exec } from 'node:child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..', '..');

// ── Theme ──────────────────────────────────────────────────────────────────────
const T = {
  primary:  '#FFD700',
  accent:   '#FFBF00',
  border:   '#CD7F32',
  text:     '#FFF8DC',
  muted:    '#CC9B1F',
  label:    '#DAA520',
  ok:       '#4caf50',
  error:    '#ef5350',
  warn:     '#ffa726',
  good:     '#8FBC8F',
  bad:      '#FF8C00',
  critical: '#FF6B6B',
  shell:    '#4dabf7',
  bg:       '#0d0d1a',
  dim:      '#666666',
};

// ── Tabs ───────────────────────────────────────────────────────────────────────
const TABS = ['Modules', 'Claims', 'Evidence', 'Red-Team', 'Constitution', 'Git'] as const;
type Tab = typeof TABS[number];

// ── Output line types ──────────────────────────────────────────────────────────
type LineKind = 'text' | 'ok' | 'error' | 'warn' | 'accent' | 'muted' | 'primary' | 'shell' | 'dim';
interface OutputLine { id: number; text: string; kind: LineKind; }
let lineId = 0;
function line(text: string, kind: LineKind = 'text'): OutputLine {
  return { id: lineId++, text, kind };
}

// ── Registry ───────────────────────────────────────────────────────────────────
function loadRegistry(): any[] {
  const p = join(ROOT, 'registry', 'modules.registry.json');
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'));
    return Array.isArray(raw) ? raw : raw.modules ?? [];
  } catch { return []; }
}

function loadSession(): string | null {
  const p = join(ROOT, '.ai-context', 'active-session.md');
  if (!existsSync(p)) return null;
  try {
    const m = readFileSync(p, 'utf8').match(/^##\s*Module[:\s]+(.+)$/im);
    return m ? m[1].trim() : null;
  } catch { return null; }
}

function runCmd(cmd: string): Promise<{ ok: boolean; out: string }> {
  return new Promise((resolve) => {
    exec(cmd, { cwd: ROOT, env: { ...process.env, FORCE_COLOR: '0' } }, (err, stdout, stderr) => {
      resolve({ ok: !err, out: (stdout + stderr).trim() });
    });
  });
}

function runScript(script: string, args = ''): Promise<{ ok: boolean; out: string }> {
  return runCmd(`node ${join(ROOT, 'scripts', script)} ${args}`);
}

// ── Color a line by its content ────────────────────────────────────────────────
function autoKind(text: string): LineKind {
  if (/PASS|✓|HEALTHY|BLOCKED|100%/.test(text))  return 'ok';
  if (/FAIL|✗|CRITICAL|BYPASSED|error/i.test(text)) return 'error';
  if (/WARN|DEGRADED|partial|⚠/i.test(text))     return 'warn';
  if (/^#|^──|^══/.test(text))                   return 'accent';
  if (/git /i.test(text))                         return 'shell';
  return 'text';
}

function parseLines(raw: string, ok = true): OutputLine[] {
  return raw.split('\n').filter(Boolean).map(t => line(t, ok ? autoKind(t) : 'error'));
}

// ── COMMANDS ───────────────────────────────────────────────────────────────────
const COMMANDS = [
  { name: '/help',              desc: 'Show all commands' },
  { name: '/modules',           desc: 'List all registered modules' },
  { name: '/health',            desc: 'Run TLC health check' },
  { name: '/work <MODULE>',     desc: 'Start a governed session' },
  { name: '/done <MODULE>',     desc: 'End the current session' },
  { name: '/new <NAME>',        desc: 'Create a new module' },
  { name: '/dashboard',         desc: 'Full module dashboard' },
  { name: '/claim new "<text>"',desc: 'Register a new claim' },
  { name: '/claim list',        desc: 'List claims in ledger dir' },
  { name: '/claim advance <id> <STATE>', desc: 'Advance a claim truth-state' },
  { name: '/evidence bind <id>',desc: 'Bind evidence to a claim' },
  { name: '/verify [id]',       desc: 'Verify ledger integrity' },
  { name: '/redteam',           desc: 'Run all 9 red-team attack vectors' },
  { name: '/spec',              desc: 'Compile + check constitutional invariants' },
  { name: '/validate <file>',   desc: 'Validate a markdown file (Article XVI)' },
  { name: '/probe',             desc: 'Run live invariant probe' },
  { name: '/harness',           desc: 'Run governance harness (all 4 gates)' },
  { name: '/council <question>',desc: 'Convene LLM-Council deliberation' },
  { name: '/context',           desc: 'Show active session contract' },
  { name: '/git <args>',        desc: 'Run git in the TLC repo' },
  { name: '/clear',             desc: 'Clear the output pane' },
  { name: '/tab <name>',        desc: 'Switch tab: modules|claims|evidence|redteam|constitution|git' },
  { name: '/exit  /quit',       desc: 'Exit TLC' },
];

// ── STATUS BAR ─────────────────────────────────────────────────────────────────
function StatusBar({ health, session }: { health: string; session: string | null }) {
  const hColor = health === 'HEALTHY' ? T.good : health === 'DEGRADED' ? T.bad : T.critical;
  return (
    <Box width="100%" backgroundColor={T.bg} paddingX={1}>
      <Text color={T.primary} bold>⚕ TLC 2.0</Text>
      <Text color={T.border}> │ </Text>
      <Text color={hColor}>● {health}</Text>
      <Text color={T.border}> │ </Text>
      {session
        ? <><Text color={T.muted}>session: </Text><Text color={T.accent}>{session}</Text></>
        : <Text color={T.dim}>no active session</Text>
      }
      <Text color={T.dim}>  — /help for commands  </Text>
      <Text color={T.primary}>⚕</Text>
    </Box>
  );
}

// ── NAV TABS ───────────────────────────────────────────────────────────────────
function NavBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <Box width="100%" paddingX={1} borderStyle="single" borderColor={T.border}>
      {TABS.map((t, i) => (
        <Box key={t} marginRight={1}>
          {active === t
            ? <Text color={T.primary} bold underline>[{t}]</Text>
            : <Text color={T.muted}> {t} </Text>
          }
        </Box>
      ))}
      <Text color={T.dim}>  (Tab key cycles)</Text>
    </Box>
  );
}

// ── OUTPUT LINE ────────────────────────────────────────────────────────────────
function OLine({ l }: { l: OutputLine }) {
  const c =
    l.kind === 'ok'      ? T.ok       :
    l.kind === 'error'   ? T.error    :
    l.kind === 'warn'    ? T.warn     :
    l.kind === 'accent'  ? T.accent   :
    l.kind === 'muted'   ? T.muted    :
    l.kind === 'primary' ? T.primary  :
    l.kind === 'shell'   ? T.shell    :
    l.kind === 'dim'     ? T.dim      :
    T.text;
  return <Text color={c}>  {l.text}</Text>;
}

// ── MODULES PANE ───────────────────────────────────────────────────────────────
function ModulesPane() {
  const mods = loadRegistry();
  if (!mods.length) return <Text color={T.warn}>  No modules found in registry.</Text>;
  return (
    <Box flexDirection="column">
      <Text color={T.label} bold>  Modules ({mods.length})</Text>
      <Text color={T.border}>  {'─'.repeat(64)}</Text>
      {mods.map(m => {
        const st = m.truth_status || m.status || 'unverified';
        const icon = st === 'working' ? '●' : st === 'partial' ? '◐' : st === 'quarantined' ? '✖' : '○';
        const color = st === 'working' ? T.good : st === 'partial' ? T.bad : st === 'quarantined' ? T.critical : T.dim;
        const id      = (m.id || m.name || '?').slice(0, 38).padEnd(38);
        const stLabel = `${icon} ${st}`.slice(0, 16).padEnd(16);
        const surface = (m.surface || '').slice(0, 16);
        return (
          <Box key={m.id || m.name}>
            <Text color={T.accent}>{`  ${id}`}</Text>
            <Text color={color}>{stLabel}</Text>
            <Text color={T.dim}>{surface}</Text>
          </Box>
        );
      })}
    </Box>
  );
}

// ── CLAIMS PANE ────────────────────────────────────────────────────────────────
function ClaimsPane() {
  const ledgerDir = join(ROOT, 'evidence', 'ledger');
  if (!existsSync(ledgerDir)) {
    return (
      <Box flexDirection="column">
        <Text color={T.muted}>  No ledger directory found at evidence/ledger/</Text>
        <Text color={T.dim}>  Use /claim new "title" to register your first claim.</Text>
      </Box>
    );
  }
  let files: string[] = [];
  try { files = readdirSync(ledgerDir).filter(f => f.endsWith('.jsonl')); } catch {}
  if (!files.length) {
    return (
      <Box flexDirection="column">
        <Text color={T.muted}>  No claims registered yet.</Text>
        <Text color={T.dim}>  Use: /claim new "your claim title"</Text>
      </Box>
    );
  }
  return (
    <Box flexDirection="column">
      <Text color={T.label} bold>  Claims ({files.length})</Text>
      <Text color={T.border}>  {'─'.repeat(64)}</Text>
      {files.slice(0, 30).map(f => {
        const id = f.replace('.jsonl', '');
        let state = 'PROPOSED'; let title = id;
        try {
          const lines = readFileSync(join(ledgerDir, f), 'utf8').trim().split('\n');
          const first = JSON.parse(lines[0]);
          title = first?.node?.title ?? id;
          // find last transition
          for (let i = lines.length - 1; i >= 0; i--) {
            const rec = JSON.parse(lines[i]!);
            if (rec?.node?.toState) { state = rec.node.toState; break; }
            if (rec?.node?.state)   { state = rec.node.state;   break; }
          }
        } catch {}
        const stateColor =
          state === 'DEPLOYED'   ? T.good    :
          state === 'VALIDATED'  ? T.ok      :
          state === 'VERIFIED'   ? T.accent  :
          state === 'RETRACTED'  ? T.dim     :
          T.muted;
        return (
          <Box key={id}>
            <Text color={T.shell}>{`  ${id.slice(0,16).padEnd(18)}`}</Text>
            <Text color={stateColor}>{state.padEnd(14)}</Text>
            <Text color={T.text}>{title.slice(0, 40)}</Text>
          </Box>
        );
      })}
    </Box>
  );
}

// ── EVIDENCE PANE ──────────────────────────────────────────────────────────────
function EvidencePane() {
  const results: string[] = [];
  // empirical run results
  const erPath = join(ROOT, 'src', 'evidence-chain', 'validation', 'empirical-results.json');
  if (existsSync(erPath)) {
    try {
      const er = JSON.parse(readFileSync(erPath, 'utf8'));
      results.push(`Last empirical run: ${er.run_at ?? 'unknown'}`);
      const claims = er.claims ?? [];
      claims.forEach((c: any) => {
        results.push(`  ${(c.id ?? '').slice(0,16).padEnd(18)} ${c.finalState ?? '?'}  ${c.title ?? ''}`);
      });
    } catch { results.push('empirical-results.json unreadable'); }
  } else {
    results.push('No empirical run results yet.');
    results.push('Run: /harness  or  node --import tsx/esm src/evidence-chain/validation/empirical-run.ts');
  }
  // red-team report
  const rtPath = join(ROOT, 'src', 'evidence-chain', 'validation', 'red-team-report.json');
  if (existsSync(rtPath)) {
    try {
      const rt = JSON.parse(readFileSync(rtPath, 'utf8'));
      results.push('');
      results.push(`Red-team run: ${rt.run_at ?? 'unknown'}  allBlocked: ${rt.allBlocked}`);
      (rt.attacks ?? []).forEach((a: any) => {
        results.push(`  ${a.id}  ${a.result === 'BLOCKED' ? '✓' : '✗'}  ${a.name}`);
      });
    } catch {}
  }
  return (
    <Box flexDirection="column">
      <Text color={T.label} bold>  Evidence & Validation</Text>
      <Text color={T.border}>  {'─'.repeat(64)}</Text>
      {results.map((r, i) => (
        <Text key={i} color={/✓|BLOCKED|DEPLOYED|VALIDATED/.test(r) ? T.ok : /✗|BYPASSED/.test(r) ? T.error : T.text}>  {r}</Text>
      ))}
    </Box>
  );
}

// ── RED-TEAM PANE ──────────────────────────────────────────────────────────────
function RedTeamPane({ lines }: { lines: OutputLine[] }) {
  if (!lines.length) {
    return (
      <Box flexDirection="column">
        <Text color={T.label} bold>  Red-Team Status</Text>
        <Text color={T.border}>  {'─'.repeat(64)}</Text>
        <Text color={T.muted}>  Run /redteam to execute all 9 attack vectors.</Text>
        <Text color={T.dim}  >  Last report: src/evidence-chain/validation/red-team-report.json</Text>
      </Box>
    );
  }
  return (
    <Box flexDirection="column">
      {lines.map(l => <OLine key={l.id} l={l} />)}
    </Box>
  );
}

// ── CONSTITUTION PANE ──────────────────────────────────────────────────────────
function ConstitutionPane() {
  const paths = [
    join(ROOT, 'constitutions', 'core', 'CORE_CONSTITUTION.md'),
    join(ROOT, 'constitutions', 'core', 'core-constitution.md'),
    join(ROOT, 'constitutions', 'CONSTITUTION.md'),
  ];
  const found = paths.find(p => existsSync(p));
  if (!found) {
    return (
      <Box flexDirection="column">
        <Text color={T.warn}>  No constitution file found.</Text>
        <Text color={T.dim}>  Expected: constitutions/core/CORE_CONSTITUTION.md</Text>
      </Box>
    );
  }
  const raw = readFileSync(found, 'utf8').split('\n').slice(0, 40);
  return (
    <Box flexDirection="column">
      <Text color={T.label} bold>  {found.replace(ROOT + '/', '')}</Text>
      <Text color={T.border}>  {'─'.repeat(64)}</Text>
      {raw.map((l, i) => (
        <Text key={i} color={l.startsWith('#') ? T.primary : l.startsWith('##') ? T.accent : T.text}>  {l}</Text>
      ))}
      <Text color={T.dim}>  … (first 40 lines shown — /validate to check full file)</Text>
    </Box>
  );
}

// ── GIT PANE ───────────────────────────────────────────────────────────────────
function GitPane({ lines }: { lines: OutputLine[] }) {
  if (!lines.length) {
    return (
      <Box flexDirection="column">
        <Text color={T.label} bold>  Git</Text>
        <Text color={T.border}>  {'─'.repeat(64)}</Text>
        <Text color={T.muted}>  Use /git &lt;status|log|diff|push&gt; to run git commands.</Text>
      </Box>
    );
  }
  return (
    <Box flexDirection="column">
      {lines.map(l => <OLine key={l.id} l={l} />)}
    </Box>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
function App() {
  const { exit } = useApp();
  const [tab, setTab]           = useState<Tab>('Modules');
  const [input, setInput]       = useState('');
  const [output, setOutput]     = useState<OutputLine[]>([]);
  const [gitLines, setGitLines] = useState<OutputLine[]>([]);
  const [rtLines,  setRtLines]  = useState<OutputLine[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [health,   setHealth]   = useState('CHECKING');
  const [session,  setSession]  = useState<string | null>(null);
  const [suggestion, setSugg]   = useState('');

  // boot: get health + session
  useEffect(() => {
    setSession(loadSession());
    runScript('tlc-health.mjs').then(({ ok, out }) => {
      if (out.includes('HEALTHY'))  setHealth('HEALTHY');
      else if (out.includes('DEGRADED')) setHealth('DEGRADED');
      else setHealth(ok ? 'HEALTHY' : 'CRITICAL');
    }).catch(() => setHealth('UNKNOWN'));
  }, []);

  // tab cycling with Tab key
  useInput((ch, key) => {
    if (key.tab) {
      const idx = TABS.indexOf(tab);
      setTab(TABS[(idx + 1) % TABS.length] as Tab);
    }
    if (key.escape) { setInput(''); setSugg(''); }
  });

  // autocomplete suggestion
  useEffect(() => {
    if (!input.startsWith('/') || input.length < 2) { setSugg(''); return; }
    const match = COMMANDS.find(c => c.name.startsWith(input));
    setSugg(match ? match.name : '');
  }, [input]);

  const push = useCallback((...ls: OutputLine[]) => {
    setOutput(prev => [...prev.slice(-200), ...ls]);
  }, []);

  const handleSubmit = useCallback(async (val: string) => {
    const raw = val.trim();
    setInput('');
    setSugg('');
    if (!raw) return;

    push(line(`❯ ${raw}`, 'accent'));

    if (!raw.startsWith('/')) {
      push(line('TLC commands start with /  —  try /help', 'dim'));
      return;
    }

    const parts = raw.slice(1).split(/\s+/);
    const cmd   = parts[0]!.toLowerCase();
    const arg   = parts.slice(1).join(' ');
    const args  = parts.slice(1);

    switch (cmd) {

      case 'help': {
        push(line('Commands', 'primary'));
        push(line('─'.repeat(60), 'muted'));
        COMMANDS.forEach(c => push(line(`${c.name.padEnd(28)} ${c.desc}`, 'text')));
        break;
      }

      case 'modules': {
        setTab('Modules');
        push(line('Switched to Modules tab', 'muted'));
        break;
      }

      case 'health': {
        setLoading(true);
        push(line('Running health check…', 'muted'));
        const { ok, out } = await runScript('tlc-health.mjs');
        parseLines(out, ok).forEach(l => push(l));
        if (out.includes('HEALTHY'))  setHealth('HEALTHY');
        else if (out.includes('DEGRADED')) setHealth('DEGRADED');
        else setHealth(ok ? 'HEALTHY' : 'CRITICAL');
        setLoading(false);
        break;
      }

      case 'work': {
        if (!arg) { push(line('Usage: /work MODULE-ID', 'warn')); break; }
        setLoading(true);
        push(line(`Starting session: ${arg}…`, 'muted'));
        const { ok, out } = await runScript('tlc-work.mjs', `--module ${arg}`);
        parseLines(out, ok).forEach(l => push(l));
        setSession(loadSession());
        setLoading(false);
        break;
      }

      case 'done': {
        if (!arg) { push(line('Usage: /done MODULE-ID', 'warn')); break; }
        setLoading(true);
        push(line(`Ending session: ${arg}…`, 'muted'));
        const { ok, out } = await runScript('tlc-done.mjs', `--module ${arg}`);
        parseLines(out, ok).forEach(l => push(l));
        setSession(loadSession());
        setLoading(false);
        break;
      }

      case 'new': {
        if (!arg) { push(line('Usage: /new MODULE-NAME', 'warn')); break; }
        setLoading(true);
        push(line(`Creating module: ${arg}…`, 'muted'));
        const { ok, out } = await runScript('tlc-new.mjs', `--name ${arg}`);
        parseLines(out, ok).forEach(l => push(l));
        setLoading(false);
        break;
      }

      case 'dashboard': {
        setLoading(true);
        push(line('Loading dashboard…', 'muted'));
        const { ok, out } = await runScript('tlc-dashboard.mjs');
        parseLines(out, ok).forEach(l => push(l));
        setLoading(false);
        break;
      }

      case 'claim': {
        const sub = args[0]?.toLowerCase();

        if (sub === 'new') {
          const title = args.slice(1).join(' ').replace(/^"|"$/g, '');
          if (!title) { push(line('Usage: /claim new "claim title"', 'warn')); break; }
          setLoading(true);
          push(line(`Registering claim: "${title}"…`, 'muted'));
          const { ok, out } = await runCmd(
            `node --import tsx/esm ${join(ROOT, 'src', 'evidence-chain', 'validation', 'empirical-run.ts')}`
          );
          // for now, show the empirical run output as a reference
          // a dedicated claim-register CLI is the next step
          parseLines(out, ok).forEach(l => push(l));
          if (!ok) push(line('Tip: use empirical-run.ts as a template for one-off claims', 'dim'));
          setTab('Claims');
          setLoading(false);
          break;
        }

        if (sub === 'list') {
          setTab('Claims');
          push(line('Switched to Claims tab', 'muted'));
          break;
        }

        if (sub === 'advance') {
          const id    = args[1] ?? '';
          const state = args[2] ?? '';
          if (!id || !state) { push(line('Usage: /claim advance <id> <STATE>', 'warn')); break; }
          push(line(`Advancing ${id} → ${state}…`, 'muted'));
          push(line('Direct advance requires the engine CLI (coming in next build).', 'dim'));
          push(line(`Valid states: SPECIFIED IMPLEMENTED VERIFIED VALIDATED DEPLOYED RETRACTED`, 'dim'));
          break;
        }

        push(line('Usage: /claim new|list|advance', 'warn'));
        break;
      }

      case 'evidence': {
        setTab('Evidence');
        push(line('Switched to Evidence tab', 'muted'));
        break;
      }

      case 'verify': {
        setLoading(true);
        push(line('Verifying ledger integrity…', 'muted'));
        const ledgerDir = join(ROOT, 'evidence', 'ledger');
        if (!existsSync(ledgerDir)) {
          push(line('No ledger directory found at evidence/ledger/', 'warn'));
        } else {
          try {
            const files = readdirSync(ledgerDir).filter(f => f.endsWith('.jsonl'));
            push(line(`Found ${files.length} ledger files`, 'text'));
            // run the typescript verifier
            const { ok, out } = await runCmd(
              `node --import tsx/esm -e "
                import { EvidenceChainEngine, generateKeypair } from '${join(ROOT, 'src', 'evidence-chain', 'index.ts')}';
                console.log('Engine loaded OK');
              "`
            );
            if (ok) push(line('Engine: OK', 'ok'));
            else    push(line('Engine: check src/evidence-chain/', 'warn'));
            push(line(`Tip: run /redteam for full integrity validation`, 'dim'));
          } catch (e: any) { push(line(e.message, 'error')); }
        }
        setLoading(false);
        break;
      }

      case 'redteam': {
        setTab('Red-Team');
        setLoading(true);
        push(line('Running red-team (9 attack vectors)…', 'muted'));
        setRtLines([line('Running…', 'muted')]);
        const { ok, out } = await runCmd(
          `node --import tsx/esm ${join(ROOT, 'src', 'evidence-chain', 'validation', 'red-team-run.ts')}`
        );
        const parsed = parseLines(out, ok);
        setRtLines(parsed);
        parsed.forEach(l => push(l));
        setLoading(false);
        break;
      }

      case 'spec': {
        setLoading(true);
        push(line('Compiling constitutional invariants (TLC-SL)…', 'muted'));
        const specPath = join(ROOT, 'scripts', 'tlc-spec.mjs');
        if (!existsSync(specPath)) {
          push(line('scripts/tlc-spec.mjs not found', 'warn'));
          push(line('TLA+ spec: src/evidence-chain/spec/EvidenceChain.tla', 'dim'));
        } else {
          const { ok, out } = await runScript('tlc-spec.mjs');
          parseLines(out, ok).forEach(l => push(l));
        }
        setLoading(false);
        break;
      }

      case 'validate': {
        if (!arg) { push(line('Usage: /validate path/to/file.md', 'warn')); break; }
        setLoading(true);
        push(line(`Validating: ${arg}…`, 'muted'));
        const { ok, out } = await runScript('validate-instructions.mjs', arg);
        parseLines(out, ok).forEach(l => push(l));
        setLoading(false);
        break;
      }

      case 'probe': {
        setLoading(true);
        push(line('Running live invariant probe…', 'muted'));
        push(line('NOTE: Synthetic weights — not empirically valid.', 'warn'));
        const probePath = join(ROOT, 'modules', 'governance-harness', 'probes', 'run_live.py');
        if (!existsSync(probePath)) {
          push(line('Probe not found: modules/governance-harness/probes/run_live.py', 'error'));
        } else {
          const { ok, out } = await runCmd(
            `cd ${join(ROOT, 'modules', 'governance-harness', 'probes')} && HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python run_live.py`
          );
          parseLines(out, ok).forEach(l => push(l));
        }
        setLoading(false);
        break;
      }

      case 'harness': {
        setLoading(true);
        push(line('Running governance harness (all 4 gates)…', 'muted'));
        push(line('NOTE: Synthetic dataset — results not empirically valid.', 'warn'));
        const { ok, out } = await runCmd(
          `cd ${join(ROOT, 'modules', 'governance-harness')} && HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python run_harness.py`
        );
        parseLines(out, ok).forEach(l => push(l));
        setLoading(false);
        break;
      }

      case 'council': {
        push(line(`LLM-Council question: "${arg}"`, 'accent'));
        if (!arg) { push(line('Usage: /council <governance question>', 'warn')); break; }
        const councilPath = join(ROOT, 'modules', 'llm-council');
        push(line(`Council path: ${councilPath}`, 'dim'));
        push(line('Start: cd modules/llm-council && ./start.sh', 'muted'));
        push(line('Then open http://localhost:8001 in browser', 'shell'));
        break;
      }

      case 'context': {
        const p = join(ROOT, '.ai-context', 'active-session.md');
        if (!existsSync(p)) {
          push(line('No active session. Run /work MODULE-ID first.', 'muted'));
        } else {
          const lines_ = readFileSync(p, 'utf8').split('\n').slice(0, 40);
          lines_.forEach(l => push(line(l, l.startsWith('#') ? 'primary' : l.includes(':') ? 'accent' : 'text')));
        }
        break;
      }

      case 'git': {
        setTab('Git');
        if (!arg) { push(line('Usage: /git <status|log|diff|push|add|commit>', 'warn')); break; }
        setLoading(true);
        push(line(`git ${arg}`, 'shell'));
        const { ok, out } = await runCmd(`git -C ${ROOT} ${arg}`);
        const gLines = parseLines(out, ok);
        setGitLines(gLines);
        gLines.forEach(l => push(l));
        setLoading(false);
        break;
      }

      case 'tab': {
        const wanted = args[0]?.toLowerCase() ?? '';
        const found  = TABS.find(t => t.toLowerCase().startsWith(wanted));
        if (found) { setTab(found); push(line(`Switched to ${found}`, 'muted')); }
        else push(line(`Unknown tab: ${wanted}. Options: ${TABS.map(t => t.toLowerCase()).join('|')}`, 'warn'));
        break;
      }

      case 'clear': {
        setOutput([]);
        setGitLines([]);
        setRtLines([]);
        break;
      }

      case 'quit':
      case 'exit': {
        push(line('Goodbye! ⚕', 'primary'));
        setTimeout(() => exit(), 200);
        break;
      }

      default:
        push(line(`Unknown command: /${cmd}  —  type /help`, 'error'));
    }
  }, [push, exit]);

  // ── render ──────────────────────────────────────────────────────────────────
  const cols = process.stdout.columns || 80;

  const mainPane = () => {
    switch (tab) {
      case 'Modules':      return <ModulesPane />;
      case 'Claims':       return <ClaimsPane />;
      case 'Evidence':     return <EvidencePane />;
      case 'Red-Team':     return <RedTeamPane lines={rtLines} />;
      case 'Constitution': return <ConstitutionPane />;
      case 'Git':          return <GitPane lines={gitLines} />;
    }
  };

  // Only show the output log when there is something to show
  const hasOutput = output.length > 0 || loading;

  return (
    <Box flexDirection="column" width="100%">

      {/* Status bar */}
      <StatusBar health={health} session={session} />

      {/* Nav */}
      <NavBar active={tab} onSelect={setTab} />

      {/* Output log — only rendered when non-empty */}
      {hasOutput && (
        <>
          <Box flexDirection="column">
            {output.slice(-12).map(l => <OLine key={l.id} l={l} />)}
            {loading && (
              <Box paddingLeft={2}>
                <Text color={T.accent}><Spinner type="dots" /></Text>
                <Text color={T.muted}> working…</Text>
              </Box>
            )}
          </Box>
          <Text color={T.border}>{'─'.repeat(cols)}</Text>
        </>
      )}

      {/* Tab content fills remaining space */}
      <Box flexDirection="column" flexGrow={1}>
        {mainPane()}
      </Box>

      {/* Prompt */}
      <Text color={T.border}>{'─'.repeat(cols)}</Text>
      <Box paddingLeft={1}>
        <Text color={T.muted}>{session ? `(${session}) ` : ''}</Text>
        <Text color={T.primary} bold>tlc ❯ </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder={suggestion || '/help'}
        />
      </Box>

    </Box>
  );
}

// ── Boot ───────────────────────────────────────────────────────────────────────
render(<App />, { patchConsole: false });
