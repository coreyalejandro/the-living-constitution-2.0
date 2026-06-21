import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { compilePath } from '../src/compile.mjs';
import { makeEvaluators, evaluateAll } from '../src/enforce.mjs';

const specDir = fileURLToPath(new URL('../spec', import.meta.url));
const evaluators = makeEvaluators(compilePath(specDir).map((c) => c.model));
const byId = Object.fromEntries(evaluators.map((e) => [e.id, e]));

test('INV-040 blocks an AI agent merge but allows a human merge', () => {
  assert.equal(byId['INV-040'].evaluate({ type: 'MERGE', role: 'ai_agent' }).allowed, false);
  assert.equal(byId['INV-040'].evaluate({ type: 'MERGE', role: 'human' }).allowed, true);
  // an op this invariant does not define simply does not apply
  assert.equal(byId['INV-040'].evaluate({ type: 'READ', role: 'ai_agent' }).applies, false);
});

test('INV-001 blocks promotion with no bound contract', () => {
  assert.equal(byId['INV-001'].evaluate({ type: 'PROMOTE_WORKING', contract: 'none' }).allowed, false);
  assert.equal(byId['INV-001'].evaluate({ type: 'PROMOTE_WORKING', contract: 'active' }).allowed, true);
  assert.equal(byId['INV-001'].evaluate({ type: 'PROMOTE_WORKING', contract: 'frozen' }).allowed, true);
});

test('INV-023 blocks unauthorized PII emission only', () => {
  assert.equal(byId['INV-023'].evaluate({ type: 'EMIT', contains_pii: 'yes', authorized: 'no' }).allowed, false);
  assert.equal(byId['INV-023'].evaluate({ type: 'EMIT', contains_pii: 'yes', authorized: 'yes' }).allowed, true);
  assert.equal(byId['INV-023'].evaluate({ type: 'EMIT', contains_pii: 'no', authorized: 'no' }).allowed, true);
});

test('evaluateAll aggregates a BLOCK across invariants', () => {
  const action = { type: 'PROMOTE_WORKING', contract: 'none', status: 'unverified', verified_scope: 'no' };
  const r = evaluateAll(evaluators, action);
  assert.equal(r.decision, 'BLOCK');
  assert.ok(r.halts.includes('INV-001'));
  assert.ok(r.halts.includes('INV-010'));
  assert.ok(r.reasons.length >= 2);
});

test('evaluateAll allows a fully-compliant action', () => {
  // A promotion is compliant only when it satisfies every invariant that gates
  // PROMOTE_WORKING: INV-001 (bound contract), INV-010 (verified scope), INV-050 (visual layer).
  const action = { type: 'PROMOTE_WORKING', contract: 'active', status: 'partial', verified_scope: 'yes', visual: 'present' };
  const r = evaluateAll(evaluators, action);
  assert.equal(r.decision, 'ALLOW');
  assert.deepEqual(r.halts, []);
});
