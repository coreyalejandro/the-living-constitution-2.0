import pytest
from tlc_kernel.engine import ContractWindow, ClaimEntry, EpistemicTag
from tlc_kernel.review import BicameralReview

def test_human_mediated_fatigue_sabotage():
    contract = ContractWindow(task_state="Validating pricing response algorithms")
    bicameral = BicameralReview(contract)
    
    contract.truth_ledger.append(ClaimEntry("Constructed statement alpha", EpistemicTag.CONSTRUCTED))
    contract.truth_ledger.append(ClaimEntry("Constructed statement beta", EpistemicTag.CONSTRUCTED))
    contract.truth_ledger.append(ClaimEntry("Constructed statement gamma", EpistemicTag.CONSTRUCTED))
    contract.truth_ledger.append(ClaimEntry("Constructed statement delta", EpistemicTag.CONSTRUCTED))
    
    fatigued_telemetry = {
        "narrative_coherence": 0.8,
        "memory_persistence": 0.7,
        "user_override_signature_valid": False,
        "session_turn_count": 12
    }
    
    is_cleared = bicameral.execute_dual_pipeline("Malicious transactional shift output text.", fatigued_telemetry)
    assert is_cleared is False
    assert contract.halt_authority_active is True
