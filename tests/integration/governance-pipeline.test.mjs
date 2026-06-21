/**
 * tests/integration/governance-pipeline.test.mjs
 * Cross-LAYER governance integration tests (node --test, zero dependencies).
 *
 * Unlike the per-component unit suites, these exercise the layers TOGETHER:
 *   registry (I1 binding)  ->  TLC-SL compile + enforce  ->  Policy Engine decision
 *   ->  Ed25519/Merkle signed evidence  ->  probe-gate
 * proving the governance pipeline holds end to end, not just in isolation.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import PolicyEngine from '../../src/core/policy-engine.js';
import { compilePath } from '../../tlc-sl/src/compile.mjs';
import { makeEvaluators, evaluateAll } from '../../tlc-sl/src/enforce.mjs';
import { generateKeypair, appendSignedEntry, verifyLog, merkleRootOfLog } from '../../src/core/evidence-chain.mjs';
import { analyzeGate } from '../../probe-gate/src/analyzer.mjs';

const root = (p) => fileURLToPath(new URL('../../' + p, import.meta.url));
const invariants = makeEvaluators(compilePath(root('tlc-sl/spec')).map((c) => c.model));

test('I1: every registered module is contract-bound (registry layer)', () => {
  const reg = JSON.parse(readFileSync(root('registry/modules.registry.json'), 'utf8'));
  const unbound = reg.modules.filter((m) => !m.contract_id);
  assert.deepEqual(unbound, [], `unbound modules: ${unbound.map((m) => m.id)}`);
});

test('full pipeline: a non-compliant promotion is blocked AND the decision is recorded as verifiable signed evidence', () => {
  const contract = { contract_id: 'CRSP-STC-RUNTIME-001', halt_conditions: [], acceptance_criteria: [] };
  const engine = new PolicyEngine(contract, { invariants });

  // A promotion to working with no contract, no verified scope, no visual layer.
  const decision = engine.evaluate({
    type: 'PROMOTE_WORKING', role: 'Developer',
    contract: 'none', status: 'unverified', verified_scope: 'no', visual: 'absent',
  });
  assert.equal(decision.decision, 'BLOCK');
  for (const inv of ['INV-001', 'INV-010', 'INV-050']) {
    assert.ok(decision.halts.includes(inv), `${inv} should fire`);
  }

  // Record the blocked decision to a signed evidence chain and verify it offline.
  const { publicKeyPem, privateKeyPem } = generateKeypair();
  const log = join(mkdtempSync(join(tmpdir(), 'tlc-int-')), 'gov.jsonl');
  appendSignedEntry(log, {
    event: 'POLICY_DECISION', action: 'PROMOTE_WORKING',
    decision: decision.decision, halts: decision.halts,
  }, privateKeyPem);
  const v = verifyLog(log, publicKeyPem);
  assert.equal(v.ok, true);
  assert.equal(merkleRootOfLog(log).length, 64);
});

test('full pipeline: a fully-compliant promotion is allowed', () => {
  const contract = { contract_id: 'CRSP-STC-RUNTIME-001', halt_conditions: [], acceptance_criteria: [] };
  const engine = new PolicyEngine(contract, { invariants });
  const decision = engine.evaluate({
    type: 'PROMOTE_WORKING', role: 'Developer',
    contract: 'active', status: 'partial', verified_scope: 'yes', visual: 'present',
  });
  assert.equal(decision.decision, 'ALLOW');
});

test('break-glass lifecycle: unjustified+un-quarantined PROCEED is blocked (INV-060); quarantined is allowed', () => {
  const blocked = evaluateAll(invariants, { type: 'PROCEED', break_glass: 'yes', justified: 'no', quarantine: 'inactive' });
  assert.equal(blocked.decision, 'BLOCK');
  assert.ok(blocked.halts.includes('INV-060'));

  const allowed = evaluateAll(invariants, { type: 'PROCEED', break_glass: 'yes', justified: 'no', quarantine: 'active' });
  assert.equal(allowed.decision, 'ALLOW');
});

test('probe-gate integrates: the confessed tautological gate fixture is rejected, the genuine one accepted', () => {
  const bad = JSON.parse(readFileSync(root('probe-gate/gates/gate2-tautological.json'), 'utf8'));
  const good = JSON.parse(readFileSync(root('probe-gate/gates/genuine-accuracy-gate.json'), 'utf8'));
  assert.equal(analyzeGate(bad).verdict, 'REJECT');
  assert.equal(analyzeGate(good).verdict, 'ACCEPT');
});
