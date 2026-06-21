#!/usr/bin/env node
/**
 * probe-gate/src/cli.mjs
 * Analyze one or more gate descriptors and print a verdict. Exits non-zero if
 * any gate is REJECTED, so it can serve as a CI gate ("a gate that cannot fail
 * is not a test" — VERIFICATION_AND_TRUTH.md).
 *
 * Usage: node probe-gate/src/cli.mjs <gate.json | dir> [more...]
 *        (defaults to probe-gate/gates)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeGate } from './analyzer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = resolve(__dirname, '..', 'gates');

function gateFiles(p) {
  const abs = resolve(p);
  if (statSync(abs).isDirectory()) {
    return readdirSync(abs).filter((f) => f.endsWith('.json')).map((f) => join(abs, f)).sort();
  }
  return [abs];
}

const args = process.argv.slice(2);
const targets = args.length ? args : [DEFAULT_DIR];
let files = [];
for (const t of targets) {
  if (!existsSync(t)) { console.error(`not found: ${t}`); process.exit(2); }
  files = files.concat(gateFiles(t));
}

let rejected = 0;
console.log('Probe-Gate (INV-PROBE-001): a gate that cannot fail / cannot pass / is insensitive is rejected.\n');
for (const f of files) {
  const gate = JSON.parse(readFileSync(f, 'utf8'));
  const r = analyzeGate(gate);
  if (r.verdict === 'REJECT') rejected++;
  console.log(`  [${r.verdict}] ${r.id}  (canPass=${r.canPass}, canFail=${r.canFail}, sensitive=${r.sensitive}, scores=${JSON.stringify(r.distinctScores)})`);
  for (const reason of r.reasons) console.log(`           - ${reason}`);
}
console.log(`\n  ${files.length - rejected}/${files.length} gates ACCEPTED; ${rejected} REJECTED.`);
process.exit(rejected > 0 ? 1 : 0);
