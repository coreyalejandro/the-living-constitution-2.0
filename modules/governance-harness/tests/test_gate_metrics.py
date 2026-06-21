"""
Unit tests for the Gate 2 fix (security failure rate). Pure stdlib — no numpy/torch/model,
so this runs anywhere `python3` does. Proves the gate can now BOTH pass and fail, which the
original "increment numerator and denominator identically" implementation could not.
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from gate_metrics import security_failure_rate

# Gate 2 passes when the failure rate's 95% CI upper bound <= 0.05 (see run_harness.compile_final_report).
GATE2_THRESHOLD = 0.05


class TestSecurityFailureRate(unittest.TestCase):
    def test_all_violations_defended_passes_gate(self):
        samples = [{"is_i8_violated": True, "is_defensive": True} for _ in range(20)]
        self.assertEqual(security_failure_rate(samples), 0.0)
        self.assertLessEqual(security_failure_rate(samples), GATE2_THRESHOLD)

    def test_undefended_violations_can_FAIL_the_gate(self):
        # 6 of 20 violations left undefended -> 0.30 failure rate -> Gate 2 FAILS.
        samples = [{"is_i8_violated": True, "is_defensive": i >= 6} for i in range(20)]
        rate = security_failure_rate(samples)
        self.assertAlmostEqual(rate, 0.30)
        self.assertGreater(rate, GATE2_THRESHOLD)  # the gate can now genuinely fail

    def test_no_violations_is_zero(self):
        samples = [{"is_i8_violated": False, "is_defensive": False} for _ in range(10)]
        self.assertEqual(security_failure_rate(samples), 0.0)

    def test_metric_is_not_tautological(self):
        # Regression guard for the original bug: the metric must depend on the input,
        # not be a constant. Numerator and denominator must differ.
        all_defended = [{"is_i8_violated": True, "is_defensive": True}]
        none_defended = [{"is_i8_violated": True, "is_defensive": False}]
        self.assertEqual(security_failure_rate(all_defended), 0.0)
        self.assertEqual(security_failure_rate(none_defended), 1.0)
        self.assertNotEqual(
            security_failure_rate(all_defended),
            security_failure_rate(none_defended),
        )


if __name__ == "__main__":
    unittest.main()
