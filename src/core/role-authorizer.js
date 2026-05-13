const ROLE_PERMISSIONS = {
  Developer: ['READ', 'WRITE_DRAFT', 'RUN_TEST', 'VALIDATE_CONTRACT'],
  SRE: ['READ', 'WRITE_DRAFT', 'RUN_TEST', 'VALIDATE_CONTRACT', 'DEPLOY_WITH_GATE'],
  PM: ['READ', 'COMMENT', 'REQUEST_CHANGE'],
  QA: ['READ', 'RUN_TEST', 'VALIDATE_CONTRACT'],
  AI_Assistant: ['READ', 'SUGGEST', 'WRITE_DRAFT', 'VALIDATE_CONTRACT'],
  Constitutional_Council: ['READ', 'APPROVE_OVERRIDE', 'AMEND_CONSTITUTION', 'FREEZE_CONTRACT'],
  System: ['READ', 'LOG', 'VALIDATE_CONTRACT'],
  Unknown: ['READ'],
};

export class RoleAuthorizer {
  constructor(rolePermissions = ROLE_PERMISSIONS) {
    this.rolePermissions = rolePermissions;
  }

  permissionsFor(role = 'Unknown') {
    return this.rolePermissions[role] || this.rolePermissions.Unknown;
  }

  can(role, permission) {
    return this.permissionsFor(role).includes(permission);
  }

  assert(role, permission) {
    if (!this.can(role, permission)) {
      const error = new Error(`Role ${role} is not authorized for ${permission}`);
      error.code = 'ROLE_AUTH_DENIED';
      throw error;
    }
    return true;
  }

  evaluate(role, permission) {
    const allowed = this.can(role, permission);
    return {
      allowed,
      role,
      permission,
      decision: allowed ? 'ALLOW' : 'BLOCK',
      message: allowed
        ? `Role ${role} is authorized for ${permission}.`
        : `Role ${role} is not authorized for ${permission}.`,
    };
  }
}

export default RoleAuthorizer;
