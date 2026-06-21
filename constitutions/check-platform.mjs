#!/usr/bin/env node
/**
 * constitutions/check-platform.mjs
 * The platform proof: load every constitution in registry.json through the ONE TLC-SL runtime
 * and model-check it. The runtime code is not changed to add a constitution — only data
 * (.tlcsl files) changes. A green run is evidence that TLC executes arbitrary constitutions.
 *
 * Usage: node constitutions/check-platform.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compilePath } from '../tlc-sl/src/compile.mjs';
import { check, necessity } from '../tlc-sl/src/checker.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(readFileSync(join(REPO_ROOT, 'constitutions', 'registry.json'), 'utf8'));

console.log('TLC platform check — one runtime, many constitutions\n');
console.log(`Interface: ${registry.interface.source}\n`);

let totalFail = 0;
const summary = [];
for (const c of registry.constitutions) {
  const models = compilePath(join(REPO_ROOT, c.spec)).map((x) => x.model);
  let fail = 0;
  for (const m of models) {
    const r = check(m);
    if (!r.ok) fail++;
  }
  totalFail += fail;
  const verified = models.length - fail;
  summary.push({ id: c.id, namespace: c.namespace, verified, total: models.length });
  console.log(`  [${fail === 0 ? 'PASS' : 'FAIL'}] ${c.id} (${c.namespace})  ${verified}/${models.length} invariants  — ${c.domain}`);
}

// Evidence of generality: the constitutions use disjoint id namespaces but the SAME runtime.
const idsByConstitution = registry.constitutions.map((c) =>
  new Set(compilePath(join(REPO_ROOT, c.spec)).map((x) => x.model.id)));
let overlap = 0;
for (let i = 0; i < idsByConstitution.length; i++) {
  for (let j = i + 1; j < idsByConstitution.length; j++) {
    for (const id of idsByConstitution[i]) if (idsByConstitution[j].has(id)) overlap++;
  }
}

console.log('');
console.log(`  ${summary.length} constitutions loaded through one runtime; namespace overlap: ${overlap}.`);
console.log(`  ${totalFail === 0 ? 'PLATFORM VERIFIED' : 'PLATFORM CHECK FAILED'}: ` +
  summary.map((s) => `${s.id} ${s.verified}/${s.total}`).join('; '));
process.exit(totalFail === 0 && overlap === 0 ? 0 : 1);
