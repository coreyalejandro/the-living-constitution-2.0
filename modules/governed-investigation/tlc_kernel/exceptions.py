from typing import Dict

class HaltAuthorityException(Exception):
    """Raised when runtime invariants drop into an unresolvable state, freezing inference execution."""
    def __init__(self, message: str, missing_context_gap: str, active_registry: Dict[str, str]):
        super().__init__(message)
        self.missing_context_gap = missing_context_gap
        self.active_registry = active_registry
