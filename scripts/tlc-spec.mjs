#!/usr/bin/env node
/**
 * scripts/tlc-spec.mjs
 * Terminal entry point for TLC-SL: compile the constitutional invariants and run
 * the in-process exhaustive model checker. Invoked by the /spec terminal command.
 *
 * Usage: node scripts/tlc-spec.mjs
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { compilePath } from '../tlc-sl/src/compile.mjs';
import { check, necessity } from '../tlc-sl/src/checker.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC = resolve(__dirname, '..', 'tlc-sl', 'spec');

let models;
try {
  models = compilePath(SPEC).map((c) => c.model);
} catch (e) {
  console.error(`HALT_SPEC_PARSE_ERROR: ${e.message}`);
  process.exit(1);
}

console.log('TLC-SL — constitutional invariants (one source -> runtime + formal model)\n');
let fail = 0;
for (const m of models) {
  const s = check(m);
  const guards = necessity(m).filter((x) => x.guarded);
  const nec = guards.filter((x) => x.necessary).length;
  if (!s.ok) fail++;
  console.log(`  [${s.ok ? 'PASS' : 'FAIL'}] ${m.id}  ${m.title}`);
  console.log(
    `        Article ${m.article} · ${m.level} · ` +
    (s.ok ? `${s.statesExplored} reachable states` : 'SAFETY VIOLATED') +
    ` · ${nec}/${guards.length} guards proven necessary`
  );
}
console.log(`\n  ${models.length - fail}/${models.length} invariants verified by the in-process exhaustive checker.`);
console.log('  TLA+ modules: emitted (not TLC-run in this build). Lean 4: not in v0.1.');
console.log('  Conformance report: tlc-sl/conformance/report.md');
process.exit(fail ? 1 : 0);
