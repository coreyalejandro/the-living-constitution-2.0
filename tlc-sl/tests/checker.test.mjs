import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { compilePath } from '../src/compile.mjs';
import { check, necessity } from '../src/checker.mjs';
import { buildModel } from '../src/model.mjs';
import { parse } from '../src/parser.mjs';

const specDir = fileURLToPath(new URL('../spec', import.meta.url));
const models = compilePath(specDir).map((c) => c.model);

test('all six shipped invariants satisfy their safety property', () => {
  assert.equal(models.length, 6);
  for (const m of models) {
    const r = check(m);
    assert.equal(r.ok, true, `${m.id} should hold: ${JSON.stringify(r)}`);
  }
});

test('every load-bearing guard is proven necessary (counterexample on removal)', () => {
  for (const m of models) {
    for (const g of necessity(m)) {
      if (g.guarded && g.necessary) {
        assert.ok(g.counterexample, `${m.id}/${g.op} necessary but no counterexample`);
        assert.ok(g.counterexample.trace.length >= 1, `${m.id}/${g.op} counterexample has a trace`);
      }
    }
  }
});

test('INV-040: dropping the MERGE guard makes a violation reachable', () => {
  const inv040 = models.find((m) => m.id === 'INV-040');
  const withGuard = check(inv040);
  assert.equal(withGuard.ok, true);
  const withoutGuard = check(inv040, { dropGuardOf: 'MERGE' });
  assert.equal(withoutGuard.ok, false);
  assert.equal(withoutGuard.kind, 'reachable');
  assert.equal(withoutGuard.state.breach, 'violated');
});

test('a deliberately unguarded promotion is caught as unsafe', () => {
  // Same shape as INV-001 but PROMOTE_WORKING has no guard — safety must fail.
  const { invariants } = parse(`invariant "BROKEN" {
    level BLOCK
    var contract domain { none, active }
    var status domain { unverified, working }
    init { contract = none, status = unverified }
    op PROMOTE_WORKING { guard true effect { status = working } }
    safety status = working implies contract != none
  }`);
  const r = check(buildModel(invariants[0]));
  assert.equal(r.ok, false);
  assert.equal(r.kind, 'reachable');
  assert.equal(r.state.status, 'working');
  assert.equal(r.state.contract, 'none');
});
