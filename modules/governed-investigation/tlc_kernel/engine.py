import re
from enum import Enum
from typing import Dict, List, Optional, Any
from .exceptions import HaltAuthorityException


class InvariantStatus(Enum):
    SATISFIED = "SATISFIED"
    VIOLATED = "VIOLATED"
    AMBIGUOUS = "AMBIGUOUS"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class ContractWindowState(Enum):
    INITIALIZING = "INITIALIZING"
    ACTIVE = "ACTIVE"
    AMBIGUOUS = "AMBIGUOUS"
    HALTED = "HALTED"
    REPAIR = "REPAIR"
    RESOLVED = "RESOLVED"
    TERMINATED = "TERMINATED"


class EpistemicTag(Enum):
    VERIFIED = "VERIFIED"
    CONSTRUCTED = "CONSTRUCTED"
    PENDING = "PENDING"


class ClaimEntry:
    def __init__(self, claim_text: str, tag: EpistemicTag, empirical_source_id: Optional[str] = None):
        self.claim_text = claim_text
        self.tag = tag
        self.empirical_source_id = empirical_source_id

    def to_ledger_format(self) -> Dict[str, str]:
        return {
            "text": self.claim_text,
            "epistemic_status": self.tag.value,
            "source_verification_id": self.empirical_source_id if self.empirical_source_id else "UNVERIFIED_INFERENCE"
        }


class ContractWindow:
    def __init__(self, task_state: str):
        self.task_state: str = task_state
        self.fsm_state: ContractWindowState = ContractWindowState.INITIALIZING
        self.invariant_registry: Dict[str, InvariantStatus] = {
            "I_1_Trust": InvariantStatus.AMBIGUOUS,
            "I_2_Authenticity": InvariantStatus.AMBIGUOUS,
            "I_3_Status": InvariantStatus.AMBIGUOUS,
            "I_4_Identity_Signaling": InvariantStatus.AMBIGUOUS,
            "I_5_Enacted_Fidelity": InvariantStatus.AMBIGUOUS,
            "I_6_Perceived_Quality": InvariantStatus.AMBIGUOUS,
            "I_7_Contextual_Performance": InvariantStatus.AMBIGUOUS,
            "I_8_Narrative": InvariantStatus.AMBIGUOUS
        }
        self.repair_queue: List[Dict[str, str]] = []
        self.truth_ledger: List[ClaimEntry] = []
        self.halt_authority_active: bool = False
        self.turn_history_count: int = 0

    def evaluate_telemetry_invariants(self, telemetry: Dict[str, Any]) -> None:
        self.turn_history_count = telemetry.get("session_turn_count", self.turn_history_count + 1)

        # Memory horizon: beyond 40 turns without reanchoring, Narrative degrades
        if self.turn_history_count > 40 and not telemetry.get("state_reanchored_flag", False):
            self.invariant_registry["I_8_Narrative"] = InvariantStatus.AMBIGUOUS
            self.fsm_state = ContractWindowState.AMBIGUOUS
            return

        # I_8: Narrative (upstream gate — evaluated first)
        narrative_coherence = telemetry.get("narrative_coherence", 0.0)
        memory_persistence = telemetry.get("memory_persistence", 0.0)

        if narrative_coherence > 0.6 and memory_persistence > 0.5:
            self.invariant_registry["I_8_Narrative"] = InvariantStatus.SATISFIED
        elif telemetry.get("overwrite_detected", False) or telemetry.get("story_ignored_flag", False):
            self.invariant_registry["I_8_Narrative"] = InvariantStatus.VIOLATED
            self.halt_authority_active = True
            self.fsm_state = ContractWindowState.HALTED
            return
        else:
            self.invariant_registry["I_8_Narrative"] = InvariantStatus.AMBIGUOUS

        # I_1: Trust
        if telemetry.get("repeat_rate", 0.0) > 0.9 and telemetry.get("reformulation_without_notice", False):
            self.invariant_registry["I_1_Trust"] = InvariantStatus.VIOLATED
            self.invariant_registry["I_5_Enacted_Fidelity"] = InvariantStatus.VIOLATED
        elif self.invariant_registry["I_8_Narrative"] == InvariantStatus.SATISFIED:
            repeat_rate = telemetry.get("repeat_rate", 0.0)
            brand_known_ratio = telemetry.get("brand_known_ratio", 0.0)
            private_label_shift = telemetry.get("private_label_shift", 1.0)

            if repeat_rate > 0.7 and brand_known_ratio > 0.6 and private_label_shift < 0.1:
                self.invariant_registry["I_1_Trust"] = InvariantStatus.SATISFIED
            elif telemetry.get("reformulation_without_notice", False) or telemetry.get("quality_decline_detected", False):
                self.invariant_registry["I_1_Trust"] = InvariantStatus.VIOLATED
            else:
                self.invariant_registry["I_1_Trust"] = InvariantStatus.AMBIGUOUS
        else:
            self.invariant_registry["I_1_Trust"] = InvariantStatus.AMBIGUOUS

        # I_2: Authenticity
        vocab_match = telemetry.get("community_vocabulary_match", 0.0)
        dilution_flag = telemetry.get("dilution_flag", False)
        misappropriation_score = telemetry.get("cultural_misappropriation_score", 0.0)

        if vocab_match > 0.65 and not dilution_flag and misappropriation_score < 0.3:
            self.invariant_registry["I_2_Authenticity"] = InvariantStatus.SATISFIED
        elif dilution_flag or misappropriation_score > 0.7:
            self.invariant_registry["I_2_Authenticity"] = InvariantStatus.VIOLATED
        else:
            self.invariant_registry["I_2_Authenticity"] = InvariantStatus.AMBIGUOUS

        # I_3: Status
        event_spike = telemetry.get("event_spike_amplitude", 0.0)
        visible_category_ratio = telemetry.get("visible_category_ratio", 0.0)

        if event_spike > 2.0 and visible_category_ratio > 0.4:
            self.invariant_registry["I_3_Status"] = InvariantStatus.SATISFIED
        elif telemetry.get("downmarket_packaging_detected", False) or telemetry.get("public_disrespect_event", False):
            self.invariant_registry["I_3_Status"] = InvariantStatus.VIOLATED
        else:
            self.invariant_registry["I_3_Status"] = InvariantStatus.NOT_APPLICABLE

        # I_4: Identity Signaling
        silhouette = telemetry.get("silhouette_score", 0.0)
        occasion_match = telemetry.get("occasion_match", 0.0)

        if silhouette > 0.5 and occasion_match > 0.6:
            self.invariant_registry["I_4_Identity_Signaling"] = InvariantStatus.SATISFIED
        elif telemetry.get("cultural_mismatch_detected", False) or telemetry.get("contextual_failure_rate", 0.0) > 0.3:
            self.invariant_registry["I_4_Identity_Signaling"] = InvariantStatus.VIOLATED
        else:
            self.invariant_registry["I_4_Identity_Signaling"] = InvariantStatus.AMBIGUOUS

        # I_5: Enacted Fidelity (only set here if not already VIOLATED above)
        if self.invariant_registry["I_5_Enacted_Fidelity"] != InvariantStatus.VIOLATED:
            elasticity = telemetry.get("discount_elasticity", 0.0)
            purchase_r = telemetry.get("repeat_purchase_rate", 0.0)
            switching_discount = telemetry.get("switching_on_discount", 1.0)

            if elasticity < -0.3 and purchase_r > 0.8 and switching_discount < 0.15:
                self.invariant_registry["I_5_Enacted_Fidelity"] = InvariantStatus.SATISFIED
            elif telemetry.get("betrayal_signal_detected", False) and telemetry.get("switching_on_betrayal", 0.0) > 0.6:
                self.invariant_registry["I_5_Enacted_Fidelity"] = InvariantStatus.VIOLATED
            else:
                self.invariant_registry["I_5_Enacted_Fidelity"] = InvariantStatus.AMBIGUOUS

        # I_6: Perceived Quality
        return_rate = telemetry.get("return_rate", 0.0)
        real_use_sentiment = telemetry.get("real_use_positive_sentiment", 0.0)

        if return_rate < 0.05 and real_use_sentiment > 0.7:
            self.invariant_registry["I_6_Perceived_Quality"] = InvariantStatus.SATISFIED
        elif return_rate > 0.15 or telemetry.get("real_use_negative_sentiment", 0.0) > 0.4:
            self.invariant_registry["I_6_Perceived_Quality"] = InvariantStatus.VIOLATED
        else:
            self.invariant_registry["I_6_Perceived_Quality"] = InvariantStatus.AMBIGUOUS

        # I_7: Contextual Performance
        bulk_scale = telemetry.get("bulk_purchase_scale", 0.0)
        event_success = telemetry.get("event_success_rate", 0.0)

        if bulk_scale > 0.4 and event_success > 0.75:
            self.invariant_registry["I_7_Contextual_Performance"] = InvariantStatus.SATISFIED
        elif telemetry.get("event_failure_rate", 0.0) > 0.5 or telemetry.get("scale_failure_detected", False):
            self.invariant_registry["I_7_Contextual_Performance"] = InvariantStatus.VIOLATED
        else:
            self.invariant_registry["I_7_Contextual_Performance"] = InvariantStatus.NOT_APPLICABLE

        # FSM state resolution
        violated = any(v == InvariantStatus.VIOLATED for v in self.invariant_registry.values())
        ambiguous = any(v == InvariantStatus.AMBIGUOUS for v in self.invariant_registry.values())

        if violated:
            self.halt_authority_active = True
            self.fsm_state = ContractWindowState.HALTED
        elif ambiguous:
            self.fsm_state = ContractWindowState.AMBIGUOUS
        else:
            self.fsm_state = ContractWindowState.ACTIVE

    def compile_and_validate(self, proposed_output_text: str) -> str:
        current_registry_states = {k: v.value for k, v in self.invariant_registry.items()}

        # Block on VIOLATED
        for invariant_id, status in self.invariant_registry.items():
            if status == InvariantStatus.VIOLATED:
                self.halt_authority_active = True
                raise HaltAuthorityException(
                    message=f"Compilation Failure: Active execution aborted due to explicit violation of state gate: {invariant_id}.",
                    missing_context_gap=f"Rectification required: Model output features invalid transactional reductionism mapping to {invariant_id}.",
                    active_registry=current_registry_states
                )

        # Block on AMBIGUOUS (v5.1 upgrade: ambiguous is also a halt condition)
        ambiguous = [k for k, v in self.invariant_registry.items() if v == InvariantStatus.AMBIGUOUS]
        if ambiguous:
            gap_message = f"Ambiguous invariants require human clarification before output can be emitted: {ambiguous}"
            self.repair_queue.append({"field": str(ambiguous), "remedy": gap_message})
            self.halt_authority_active = True
            raise HaltAuthorityException(
                message="Compilation Failure: Upstream invariants resolved as AMBIGUOUS. Output blocked pending human repair.",
                missing_context_gap=gap_message,
                active_registry=current_registry_states
            )

        return proposed_output_text
