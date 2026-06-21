#!/usr/bin/env node
/**
 * tlc-sl/src/compile.mjs
 * The TLC-SL compiler CLI and programmatic API. Zero dependencies.
 *
 * Usage:
 *   node tlc-sl/src/compile.mjs [path] --target <check|js|tla|all> [--out DIR] [--quiet]
 *
 *   path        a .tlcsl file or a directory of them (default: tlc-sl/spec)
 *   --target    check : run the in-process exhaustive model checker (safety + necessity)
 *               js    : emit generated/models/<ID>.json + generated/js/<ID>.mjs
 *               tla   : emit generated/tla/<NAME>.tla + <NAME>.cfg (NOT run through TLC)
 *               all   : js + tla + check
 *   --out       output root (default: tlc-sl/)
 *
 * Exit code is non-zero if any safety property fails to hold under its guards.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from './parser.mjs';
import { buildModel } from './model.mjs';
import { check, necessity } from './checker.mjs';
import { emitJS } from './targets/js.mjs';
import { emitTLA, emitCfg } from './targets/tla.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const TLC_SL_ROOT = resolve(__dirname, '..');

export function specFilesIn(p) {
  const abs = resolve(p);
  if (statSync(abs).isDirectory()) {
    return readdirSync(abs).filter((f) => f.endsWith('.tlcsl')).map((f) => join(abs, f)).sort();
  }
  return [abs];
}

/** Parse + build models from a file or directory. Returns [{model, warnings, file}]. */
export function compilePath(p) {
  const out = [];
  for (const file of specFilesIn(p)) {
    const { invariants, warnings } = parse(readFileSync(file, 'utf8'));
    for (const inv of invariants) out.push({ model: buildModel(inv), warnings, file });
  }
  return out;
}

/** Run the checker over an array of models. Returns a summary array. */
export function runCheck(models) {
  return models.map((model) => {
    const safety = check(model);
    const guards = necessity(model);
    return { id: model.id, level: model.level, safety, necessity: guards };
  });
}

function ensureDir(d) { mkdirSync(d, { recursive: true }); }

function emitTargets(model, outRoot, target) {
  const written = [];
  if (target === 'js' || target === 'all') {
    const modelsDir = join(outRoot, 'generated', 'models');
    const jsDir = join(outRoot, 'generated', 'js');
    ensureDir(modelsDir); ensureDir(jsDir);
    const modelPath = join(modelsDir, `${model.id}.json`);
    const jsPath = join(jsDir, `${model.id}.mjs`);
    writeFileSync(modelPath, JSON.stringify(model, null, 2) + '\n');
    writeFileSync(jsPath, emitJS(model));
    written.push(modelPath, jsPath);
  }
  if (target === 'tla' || target === 'all') {
    const tlaDir = join(outRoot, 'generated', 'tla');
    ensureDir(tlaDir);
    const name = model.id.replace(/[^A-Za-z0-9_]/g, '_');
    const tlaPath = join(tlaDir, `${name}.tla`);
    const cfgPath = join(tlaDir, `${name}.cfg`);
    writeFileSync(tlaPath, emitTLA(model));
    writeFileSync(cfgPath, emitCfg(model));
    written.push(tlaPath, cfgPath);
  }
  return written;
}

function main(argv) {
  const args = argv.slice(2);
  const opts = { target: 'check', out: TLC_SL_ROOT, quiet: false };
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--target') opts.target = args[++i];
    else if (a === '--out') opts.out = resolve(args[++i]);
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
    else positional.push(a);
  }
  if (!['check', 'js', 'tla', 'all'].includes(opts.target)) {
    console.error(`Unknown --target '${opts.target}'. Use check | js | tla | all.`);
    process.exit(2);
  }
  if (positional.length === 0) positional.push(join(TLC_SL_ROOT, 'spec'));

  let compiled = [];
  try {
    for (const p of positional) compiled = compiled.concat(compilePath(p));
  } catch (e) {
    console.error(`HALT_SPEC_PARSE_ERROR: ${e.message}`);
    process.exit(1);
  }

  const allWarnings = [...new Set(compiled.flatMap((c) => c.warnings))];
  if (allWarnings.length && !opts.quiet) {
    for (const w of allWarnings) console.warn(`warning: ${w}`);
  }

  const models = compiled.map((c) => c.model);
  let failures = 0;

  if (opts.target === 'js' || opts.target === 'tla' || opts.target === 'all') {
    for (const model of models) {
      const written = emitTargets(model, opts.out, opts.target);
      if (!opts.quiet) for (const f of written) console.log(`emit  ${f.replace(opts.out + '/', '')}`);
    }
  }

  if (opts.target === 'check' || opts.target === 'all') {
    const results = runCheck(models);
    for (const r of results) {
      const guardsChecked = r.necessity.filter((g) => g.guarded);
      const necessaryCount = guardsChecked.filter((g) => g.necessary).length;
      if (r.safety.ok) {
        if (!opts.quiet) {
          console.log(
            `PASS  ${r.id}  safety holds over ${r.safety.statesExplored} reachable states; ` +
            `${necessaryCount}/${guardsChecked.length} guards proven necessary`
          );
        }
      } else {
        failures++;
        console.error(`FAIL  ${r.id}  ${describeFailure(r.safety)}`);
      }
    }
    if (!opts.quiet) console.log(`\n${models.length - failures}/${models.length} invariants verified.`);
  }

  process.exit(failures > 0 ? 1 : 0);
}

function describeFailure(safety) {
  if (safety.kind === 'init') return 'safety violated in the initial state';
  if (safety.kind === 'bound_exceeded') return `state-space bound exceeded (${safety.statesExplored})`;
  if (safety.kind === 'reachable') {
    const steps = safety.trace.map((s) => s.op).join(' -> ');
    return `safety violated; counterexample: ${steps || '(initial)'} -> ${JSON.stringify(safety.state)}`;
  }
  return 'safety violated';
}

function printHelp() {
  console.log(`TLC-SL compiler
Usage: node tlc-sl/src/compile.mjs [path] --target <check|js|tla|all> [--out DIR] [--quiet]
  path      .tlcsl file or directory (default: tlc-sl/spec)
  --target  check (default) | js | tla | all`);
}

// Run as CLI when invoked directly.
if (resolve(process.argv[1] || '') === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv);
}
