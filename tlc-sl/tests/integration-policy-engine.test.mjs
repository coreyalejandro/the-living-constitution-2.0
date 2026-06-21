import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import PolicyEngine from '../../src/core/policy-engine.js';
import { compilePath } from '../src/compile.mjs';
import { makeEvaluators } from '../src/enforce.mjs';

const specDir = fileURLToPath(new URL('../spec', import.meta.url));
const invariants = makeEvaluators(compilePath(specDir).map((c) => c.model));

// Minimal active contract so the base engine adds no halts of its own.
const contract = { contract_id: 'CRSP-TEST', halt_conditions: [], acceptance_criteria: [] };

// The action a hand-coded engine misses: a promotion to working with no bound
// contract and no verified scope. It is not a MERGE/DEPLOY, so the legacy checks
// have nothing to say about it.
const sneakyPromotion = {
  type: 'PROMOTE_WORKING',
  role: 'Developer',
  contract: 'none',
  status: 'unverified',
  verified_scope: 'no',
};

test('backward compatible: no invariants behaves exactly as before', () => {
  const engine = new PolicyEngine(contract);
  assert.equal(engine.evaluate({ type: 'DEPLOY', role: 'AI_Assistant' }).decision, 'BLOCK');
  assert.equal(engine.evaluate({ type: 'READ', role: 'Developer' }).decision, 'ALLOW');
  // the legacy engine has no concept of truth_status promotion — it allows the sneaky action
  assert.equal(engine.evaluate(sneakyPromotion).decision, 'ALLOW');
});

test('with TLC-SL invariants, the sneaky promotion is blocked', () => {
  const engine = new PolicyEngine(contract, { invariants });
  const r = engine.evaluate(sneakyPromotion);
  assert.equal(r.decision, 'BLOCK');
  assert.ok(r.halts.includes('INV-001'), 'INV-001 should fire');
  assert.ok(r.halts.includes('INV-010'), 'INV-010 should fire');
  assert.ok(r.reasons.length >= 2);
});

test('with TLC-SL invariants, a compliant promotion is allowed', () => {
  const engine = new PolicyEngine(contract, { invariants });
  const r = engine.evaluate({
    type: 'PROMOTE_WORKING', role: 'Developer',
    contract: 'active', status: 'partial', verified_scope: 'yes',
  });
  assert.equal(r.decision, 'ALLOW');
});

test('legacy AI-agent deploy block still fires with invariants loaded', () => {
  const engine = new PolicyEngine(contract, { invariants });
  const r = engine.evaluate({ type: 'DEPLOY', role: 'AI_Assistant' });
  assert.equal(r.decision, 'BLOCK');
  assert.ok(r.halts.includes('HALT_UNAUTHORIZED_ACTION'));
});
