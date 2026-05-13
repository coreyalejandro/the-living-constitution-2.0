import ContractManager from '../../src/core/contract-manager.js';

describe('ContractManager', () => {
  test('loads and validates the active contract', () => {
    const manager = new ContractManager();
    const contract = manager.loadContract();
    expect(contract.contract_id).toBe('CRSP-STC-RUNTIME-001');
    const result = manager.validateContract(contract);
    expect(result.valid).toBe(true);
  });

  test('summarizes truth-state without claiming production', () => {
    const summary = new ContractManager().summarize();
    expect(summary.functional_status).toBe('scaffold');
    expect(summary.not_claimed).toContain('Actual running code');
    expect(summary.acceptance_criteria_total).toBeGreaterThan(0);
  });
});
