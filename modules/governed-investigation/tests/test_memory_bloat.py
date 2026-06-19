import pytest
from tlc_kernel.engine import ContractWindow, InvariantStatus, ContractWindowState
from tlc_kernel.review import BicameralReview

def test_memory_horizon_bloat():
    contract = ContractWindow(task_state="Evaluating brand attachment metrics")
    bicameral = BicameralReview(contract)

    bloated_telemetry = {
        "narrative_coherence": 0.8,
        "memory_persistence": 0.7,
        "session_turn_count": 45,
        "state_reanchored_flag": False
    }

    is_cleared = bicameral.execute_dual_pipeline("Nominal brand tracking generation statement.", bloated_telemetry)
    assert is_cleared is False
    assert contract.invariant_registry["I_8_Narrative"] == InvariantStatus.AMBIGUOUS
    assert contract.fsm_state == ContractWindowState.AMBIGUOUS
