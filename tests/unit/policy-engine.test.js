import ContractManager from '../../src/core/contract-manager.js';
import PolicyEngine from '../../src/core/policy-engine.js';

describe('PolicyEngine', () => {
  test('blocks AI assistant deploy actions', () => {
    const contract = new ContractManager().loadContract();
    const result = new PolicyEngine(contract).evaluate({ type: 'DEPLOY', role: 'AI_Assistant' });
    expect(result.decision).toBe('BLOCK');
    expect(result.halts).toContain('HALT_UNAUTHORIZED_ACTION');
  });

  test('allows low-risk developer read action', () => {
    const contract = new ContractManager().loadContract();
    const result = new PolicyEngine(contract).evaluate({ type: 'READ', role: 'Developer' });
    expect(result.decision).toBe('ALLOW');
  });
});
