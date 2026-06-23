import {
  buildEntireArgs,
  formatMissingBinaryMessage,
  parseCliArgs,
} from '../../scripts/enable-entire.mjs';

describe('enable-entire helper', () => {
  test('defaults to enable and passes flags through', () => {
    expect(parseCliArgs(['--agent', 'codex', '--local'])).toEqual({
      action: 'enable',
      passthrough: ['--agent', 'codex', '--local'],
    });
  });

  test('supports the status action', () => {
    expect(buildEntireArgs(parseCliArgs(['status']))).toEqual(['status']);
  });

  test('supports explicit enable action', () => {
    expect(buildEntireArgs(parseCliArgs(['enable', '--agent', 'claude-code']))).toEqual([
      'enable',
      '--agent',
      'claude-code',
    ]);
  });

  test('prints clear install guidance when Entire is missing', () => {
    const message = formatMissingBinaryMessage();
    expect(message).toContain('Entire CLI is not installed.');
    expect(message).toContain('Install Entire separately');
    expect(message).toContain('brew install --cask entire');
  });
});
