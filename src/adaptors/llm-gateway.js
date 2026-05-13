import ContractManager from '../core/contract-manager.js';
import PolicyEngine from '../core/policy-engine.js';
import EvidenceObservatory from '../core/evidence-observatory.js';

export class LlmGateway {
  constructor(options = {}) {
    this.manager = options.manager || new ContractManager(options);
    this.evidence = options.evidence || new EvidenceObservatory(options);
  }

  evaluateAction(action) {
    const contract = this.manager.loadContract();
    const policy = new PolicyEngine(contract);
    const result = policy.evaluate({ role: 'AI_Assistant', ...action });
    this.evidence.append({
      event_type: 'LLM_ACTION',
      component: 'LLM Gateway',
      decision: result.decision,
      role: 'AI_Assistant',
      user: action.user || 'ai-assistant',
      halt_conditions_triggered: result.halts,
      payload: { action },
      message: result.message,
    });
    return result;
  }
}

export default LlmGateway;
