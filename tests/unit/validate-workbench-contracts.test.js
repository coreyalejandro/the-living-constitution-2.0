import { execFileSync } from 'node:child_process';
import { findDuplicateIdErrors } from '../../scripts/validate-workbench-contracts.mjs';

describe('validate-workbench-contracts', () => {
  test('schema-only validation succeeds for the Workbench bundle', () => {
    const output = execFileSync('node', ['scripts/validate-workbench-contracts.mjs', '--schema-only'], { encoding: 'utf8' });
    expect(output).toContain('Workbench contract schemas validated successfully.');
  });

  test('full validation succeeds for the Workbench bundle', () => {
    const output = execFileSync('node', ['scripts/validate-workbench-contracts.mjs'], { encoding: 'utf8' });
    expect(output).toContain('Workbench contract bundle validation passed.');
  });

  test('duplicate acceptance IDs are reported explicitly', () => {
    const duplicateErrors = findDuplicateIdErrors([
      {
        contractRef: { path: 'contracts/active/json/tlc-workbench.parent.contract.json' },
        contract: {
          contract_id: 'CRSP-TLC-WORKBENCH-001',
          acceptance_criteria: [{ id: 'AC-WB-DUPLICATE-01' }],
          halt_conditions: []
        }
      },
      {
        contractRef: { path: 'contracts/active/json/tlc-workbench.surfaces.contract.json' },
        contract: {
          contract_id: 'CRSP-TLC-WORKBENCH-SURFACES-001',
          acceptance_criteria: [{ id: 'AC-WB-DUPLICATE-01' }],
          halt_conditions: []
        }
      }
    ]);

    expect(duplicateErrors).toEqual([
      expect.stringContaining('Duplicate ID detected for AC-WB-DUPLICATE-01')
    ]);
  });
});
