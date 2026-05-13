import { execFileSync } from 'node:child_process';

describe('tlc-cli', () => {
  test('validate command exits successfully on current contract', () => {
    const output = execFileSync('node', ['src/cli/tlc-cli.js', 'validate'], { encoding: 'utf8' });
    expect(output).toContain('VALID');
  });

  test('status command reports scaffold functional status', () => {
    const output = execFileSync('node', ['src/cli/tlc-cli.js', 'status'], { encoding: 'utf8' });
    expect(output).toContain('Functional status: scaffold');
  });
});
