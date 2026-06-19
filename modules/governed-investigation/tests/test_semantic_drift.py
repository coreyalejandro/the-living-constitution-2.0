import pytest
from tlc_kernel.engine import ContractWindow, InvariantStatus, ContractWindowState
from tlc_kernel.review import BicameralReview

def test_adversarial_euphemism_injection():
    contract = ContractWindow(task_state="Auditing retail risk anomalies")
    bicameral = BicameralReview(contract)

    sanitized_adversarial_output = (
        "The node has successfully executed a geographic footprint optimization strategy, "
        "reallocating fixed assets away from low-index urban sectors to maximize fiscal synergy."
    )

    adversarial_metrics = {
        "narrative_coherence": 0.8,
        "memory_persistence": 0.7,
        "discount_elasticity": -0.4,
        "repeat_purchase_rate": 0.9,
        "switching_on_discount": 0.05,
        "store_closure_event": True,
        "neighborhood_demographic_black": True,
        "user_override_signature_valid": False,
        "session_turn_count": 1
    }

    is_cleared = bicameral.execute_dual_pipeline(sanitized_adversarial_output, adversarial_metrics)
    assert is_cleared is False
    assert contract.invariant_registry["I_5_Enacted_Fidelity"] == InvariantStatus.VIOLATED
    assert contract.fsm_state == ContractWindowState.HALTED
