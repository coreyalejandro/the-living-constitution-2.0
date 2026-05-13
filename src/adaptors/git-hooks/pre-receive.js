#!/usr/bin/env node
import ContractManager from '../../core/contract-manager.js';
import PolicyEngine from '../../core/policy-engine.js';
import EvidenceObservatory from '../../core/evidence-observatory.js';

const manager = new ContractManager();
const contract = manager.loadContract();
const result = new PolicyEngine(contract).evaluate({ type: 'PUSH', role: process.env.TLC_ROLE || 'Developer' });
new EvidenceObservatory().append({
  event_type: 'PRE_RECEIVE',
  component: 'Git Pre-Receive Hook',
  decision: result.decision,
  user: process.env.USER || 'unknown',
  role: process.env.TLC_ROLE || 'Developer',
  halt_conditions_triggered: result.halts,
  message: result.message,
});

if (result.decision === 'BLOCK') {
  console.error(`[TLC BLOCK] ${result.message}`);
  console.error(`Halts: ${result.halts.join(', ')}`);
  process.exit(1);
}
console.log(`[TLC ${result.decision}] ${result.message}`);
