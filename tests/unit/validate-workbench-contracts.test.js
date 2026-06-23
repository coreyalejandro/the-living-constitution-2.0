import { execFileSync } from 'node:child_process';

describe('validate-workbench-contracts', () => {
  test('schema-only validation succeeds for the Workbench bundle', () => {
    const output = execFileSync('node', ['scripts/validate-workbench-contracts.mjs', '--schema-only'], { encoding: 'utf8' });
    expect(output).toContain('Workbench contract schemas validated successfully.');
  });

  test('full validation succeeds for the Workbench bundle', () => {
    const output = execFileSync('node', ['scripts/validate-workbench-contracts.mjs'], { encoding: 'utf8' });
    expect(output).toContain('Workbench contract bundle validation passed.');
  });
});
