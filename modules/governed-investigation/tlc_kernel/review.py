import re
from typing import Dict, Any
from .engine import ContractWindow, InvariantStatus, EpistemicTag

class BicameralReview:
    def __init__(self, contract_window: ContractWindow):
        self.contract = contract_window

    def execute_dual_pipeline(self, proposed_interpretation: str, telemetry_metrics: Dict[str, Any]) -> bool:
        self.contract.evaluate_telemetry_invariants(telemetry_metrics)
        
        unverified_claims = [claim for claim in self.contract.truth_ledger if claim.tag == EpistemicTag.CONSTRUCTED]
        if len(unverified_claims) > 3 and not telemetry_metrics.get("user_override_signature_valid", False):
            self.contract.repair_queue.append({
                "field": "Safety_Channel_Contestability",
                "remedy": "Awaiting human-in-the-loop epistemic verification signature to clear constructed claims overload."
            })
            self.contract.halt_authority_active = True
            return False

        if self._detect_sanitized_euphemisms(proposed_interpretation) and self.contract.invariant_registry["I_5_Enacted_Fidelity"] != InvariantStatus.VIOLATED:
            self.contract.invariant_registry["I_5_Enacted_Fidelity"] = InvariantStatus.VIOLATED
            self.contract.halt_authority_active = True
            from .engine import ContractWindowState
            self.contract.fsm_state = ContractWindowState.HALTED
            return False

        try:
            self.contract.compile_and_validate(proposed_interpretation)
            return True
        except Exception:
            return False

    def _detect_sanitized_euphemisms(self, text: str) -> bool:
        sanitized_patterns = [
            r"geographic\s+footprint\s+optimization",
            r"rationalizing\s+asset\s+distribution",
            r"reallocating\s+fixed\s+assets\s+away\s+from\s+low-index\s+sectors",
            r"optimizing\s+retail\s+footprints\s+for\s+supply-chain\s+synergy"
        ]
        return any(re.search(pattern, text.lower()) for pattern in sanitized_patterns)
