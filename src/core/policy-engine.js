export class PolicyEngine {
  /**
   * @param contract            the active C-RSP contract
   * @param options.invariants  optional array of TLC-SL invariant evaluators
   *   (see tlc-sl/src/enforce.mjs#makeEvaluators). Each item is
   *   { id, level:'BLOCK'|'WARN'|'LOG', evaluate(action) -> { applies, allowed, reason } }.
   *   When omitted, the engine behaves exactly as before (fully backward compatible).
   */
  constructor(contract, options = {}) {
    this.contract = contract;
    this.invariants = options.invariants || [];
  }

  evaluate(action = {}) {
    const halts = [];
    const warnings = [];
    const reasons = [];
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

    // TLC-SL constitutional invariants (compiled from the same source the model
    // checker verifies). Each invariant decides whether this action is permitted.
    for (const inv of this.invariants) {
      let result;
      try { result = inv.evaluate(action); } catch { result = null; }
      if (result && result.applies && result.allowed === false) {
        if (result.reason) reasons.push(result.reason);
        if (inv.level === 'WARN') warnings.push(inv.id);
        else if (inv.level === 'LOG') { /* observed only */ }
        else halts.push(inv.id);
      }
    }

    const decision = halts.length > 0 ? 'BLOCK' : warnings.length > 0 ? 'WARN' : 'ALLOW';
    return {
      decision,
      halts: [...new Set(halts)],
      warnings: [...new Set(warnings)],
      reasons,
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
