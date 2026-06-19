import pytest
from tlc_kernel.engine import ContractWindow, InvariantStatus, ContractWindowState
from tlc_kernel.review import BicameralReview

def test_edge_case_signal_contradiction_deadlock():
    contract = ContractWindow(task_state="Analyzing high persistence clusters")
    bicameral = BicameralReview(contract)

    contradictory_telemetry = {
        "narrative_coherence": 0.9,
        "memory_persistence": 0.8,
        "repeat_rate": 0.95,
        "reformulation_without_notice": True,
        "session_turn_count": 5
    }

    is_cleared = bicameral.execute_dual_pipeline("Fluent inference assertion statement.", contradictory_telemetry)
    assert is_cleared is False
    assert contract.invariant_registry["I_1_Trust"] == InvariantStatus.VIOLATED
    assert contract.invariant_registry["I_5_Enacted_Fidelity"] == InvariantStatus.VIOLATED
    assert contract.fsm_state == ContractWindowState.HALTED
