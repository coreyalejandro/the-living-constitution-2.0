import RoleAuthorizer from '../../src/core/role-authorizer.js';

describe('RoleAuthorizer', () => {
  test('allows AI assistant to suggest', () => {
    expect(new RoleAuthorizer().can('AI_Assistant', 'SUGGEST')).toBe(true);
  });

  test('denies AI assistant deploy permission', () => {
    const result = new RoleAuthorizer().evaluate('AI_Assistant', 'DEPLOY_WITH_GATE');
    expect(result.allowed).toBe(false);
    expect(result.decision).toBe('BLOCK');
  });
});
