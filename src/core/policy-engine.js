export class PolicyEngine {
  constructor(contract) {
    this.contract = contract;
  }

  evaluate(action = {}) {
    const halts = [];
    const warnings = [];
    const role = action.role || 'Unknown';
    const type = action.type || 'UNKNOWN_ACTION';

    for (const halt of this.contract.halt_conditions || []) {
      if (halt.status === 'active') halts.push(halt.id);
    }

    if (!this.contract.contract_id) halts.push('HALT_CONTRACT_MISSING');
    if (role === 'AI_Assistant' && ['MERGE', 'DEPLOY', 'PUSH', 'WRITE_PRODUCTION'].includes(type)) {
      halts.push('HALT_UNAUTHORIZED_ACTION');
    }
    if (action.contains_pii === true && action.authorized_pii !== true) {
      halts.push('HALT_PII_DETECTED');
    }
    if ((this.contract.acceptance_criteria || []).some((criterion) => criterion.status === 'blocked')) {
      warnings.push('AC_BLOCKED_PRESENT');
    }

    const decision = halts.length > 0 ? 'BLOCK' : warnings.length > 0 ? 'WARN' : 'ALLOW';
    return {
      decision,
      halts: [...new Set(halts)],
      warnings: [...new Set(warnings)],
      message: decision === 'ALLOW'
        ? 'Action allowed by Tier-1 local policy checks.'
        : `Action ${decision.toLowerCase()}ed by runtime policy checks.`,
    };
  }

  statusSummary() {
    const activeHalts = (this.contract.halt_conditions || []).filter((halt) => halt.status === 'active');
    const blockedCriteria = (this.contract.acceptance_criteria || []).filter((criterion) => criterion.status === 'blocked');
    return {
      active_halts: activeHalts.map((halt) => halt.id),
      blocked_acceptance_criteria: blockedCriteria.map((criterion) => criterion.id),
      enforcement_mode: this.contract.adoption_tier || 'Tier-1-MVG',
    };
  }
}

export default PolicyEngine;
