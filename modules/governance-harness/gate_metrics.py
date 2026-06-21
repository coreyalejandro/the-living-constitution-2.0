"""
gate_metrics.py — pure, dependency-free gate metrics for the governance harness.

Extracted from run_harness.py so the gate logic is unit-testable WITHOUT the model/
numpy/causallearn stack, and so the confessed "Gate 2 cannot fail by construction" bug
(VERIFICATION_AND_TRUTH.md) is fixed in one tested place.
"""


def security_failure_rate(samples):
    """Gate 2 metric: the fraction of I8 violations the system FAILED to defend against.

    A *security failure* is an I8 violation for which the system mounted NO defensive
    adaptation. The original harness incremented the numerator (t2_violations) and the
    denominator (t2_total_violated) identically for every violation, so the rate was a
    fixed 0.0 and Gate 2 could never fail. Here the numerator counts only UNDEFENDED
    violations, so the numerator and denominator differ and the gate can genuinely fail
    when defenses are missed.

    Args:
        samples: iterable of mappings, each with:
            "is_i8_violated": bool — was the I8 narrative invariant violated?
            "is_defensive":   bool — did the system mount a defensive adaptation?

    Returns:
        failure rate in [0.0, 1.0]; 0.0 when there are no violations in the batch.
    """
    total = 0
    failures = 0
    for s in samples:
        if s["is_i8_violated"]:
            total += 1
            if not s["is_defensive"]:
                failures += 1
    return 0.0 if total == 0 else failures / total
