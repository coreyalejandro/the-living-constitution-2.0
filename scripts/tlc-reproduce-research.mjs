#!/usr/bin/env node
// TLC research reproduction: clone each pinned research repository fresh, run its one-command reproduction,
// and record the outcome. Usage:
//   node scripts/tlc-reproduce-research.mjs            # all targets
//   node scripts/tlc-reproduce-research.mjs --only reb # one target
//   node scripts/tlc-reproduce-research.mjs --list     # print targets, run nothing
// Writes evidence/RESEARCH-REPRO/<id>.json (one record per target, with a SHA-256 of its canonical form) and
// exits non-zero if any target fails, its tag no longer points at the pinned commit, or its expected line is missing.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonical, sha256hex } from '../src/core/evidence-chain.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { targets } = JSON.parse(readFileSync(join(ROOT, 'research/REPRODUCTION_TARGETS.json'), 'utf8'));
const args = process.argv.slice(2);
if (args.includes('--list')) {
  for (const t of targets) console.log(`${t.id}\t${t.tag}\t${t.commit.slice(0, 7)}\t${t.repo}`);
  process.exit(0);
}
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const chosen = only ? targets.filter(t => t.id === only) : targets;
if (!chosen.length) { console.error(`No target '${only}'. Use --list.`); process.exit(2); }

const outDir = join(ROOT, 'evidence/RESEARCH-REPRO');
mkdirSync(outDir, { recursive: true });
let failed = 0;
for (const t of chosen) {
  // Work outside /tmp: on GitHub's newer runner images /tmp has a disk quota that a large install exceeds.
  const base = process.env.TLC_REPRO_WORKDIR || process.env.RUNNER_TEMP || tmpdir();
  const work = mkdtempSync(join(base, `tlc-repro-${t.id}-`));
  const childTmp = join(work, 'tmp');
  mkdirSync(childTmp, { recursive: true });
  const started = new Date();
  const rec = { id: t.id, name: t.name, repo: t.repo, tag: t.tag, pinned_commit: t.commit, command: t.command,
                started_utc: started.toISOString() };
  try {
    execFileSync('git', ['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--depth', '1', '--branch', t.tag, t.repo, 'src'],
                 { cwd: work, stdio: 'inherit' });
    rec.cloned_commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: join(work, 'src'), encoding: 'utf8' }).trim();
    if (rec.cloned_commit !== t.commit) {
      rec.status = 'FAIL'; rec.reason = `tag ${t.tag} now points at ${rec.cloned_commit}, not the pinned ${t.commit}`;
    } else {
      console.log(`\n=== ${t.id} @ ${t.tag} (${t.commit.slice(0, 7)}): ${t.command}`);
      const env = { ...process.env, TMPDIR: childTmp, PIP_NO_CACHE_DIR: '1', ...(t.env || {}) };
      const r = spawnSync('bash', ['-lc', t.command], { cwd: join(work, 'src'), encoding: 'utf8', maxBuffer: 1 << 28, env });
      const out = `${r.stdout || ''}${r.stderr || ''}`;
      process.stdout.write(out.split('\n').slice(-25).join('\n') + '\n');
      const passed = [...out.matchAll(/(\d+) passed/g)].map(m => Number(m[1]));
      rec.exit_code = r.status;
      rec.tests_passed_total = passed.length ? passed.reduce((a, b) => a + b, 0) : null;
      rec.tests_failed = [...out.matchAll(/(\d+) failed/g)].reduce((a, m) => a + Number(m[1]), 0);
      rec.expected_line_found = t.expect ? out.includes(t.expect) : null;
      rec.output_tail_sha256 = sha256hex(out.split('\n').slice(-200).join('\n'));
      rec.status = r.status === 0 && rec.tests_failed === 0 && rec.expected_line_found !== false ? 'PASS' : 'FAIL';
      if (rec.status === 'FAIL') rec.reason = r.status !== 0 ? `exit code ${r.status}` : rec.tests_failed ? 'tests failed' : `missing expected line: ${t.expect}`;
    }
  } catch (e) {
    rec.status = 'FAIL'; rec.reason = String(e.message || e).slice(0, 300);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  rec.seconds = Math.round((Date.now() - started.getTime()) / 1000);
  rec.runner = process.env.GITHUB_RUN_ID ? `github-actions run ${process.env.GITHUB_RUN_ID}` : 'local';
  rec.record_sha256 = sha256hex(canonical(rec));
  writeFileSync(join(outDir, `${t.id}.json`), JSON.stringify(rec, null, 2) + '\n');
  console.log(`${rec.status}  ${t.id}  tests passed: ${rec.tests_passed_total ?? 'n/a'}  ${rec.seconds}s${rec.reason ? '  — ' + rec.reason : ''}`);
  if (rec.status !== 'PASS') failed++;
}
process.exit(failed ? 1 : 0);
