# C-RSP Build Contract — GOVERNED-INVESTIGATION

**Contract ID:** CRSP-GOVERNED-INVESTIGATION
**Module:** GOVERNED-INVESTIGATION
**Surface:** research_public
**Created:** 2026-06-19
**Status:** active

---

## Objective

Submit paper_v5.1.md to NeurIPS Safety Track, ACM FAccT, or EAAMO.
Validate all quantitative claims via runnable simulation code.
Establish the Eight Wonders I1-I8 as the published theoretical basis
for TLC 2.0's governance invariants.

## Scope

- paper_v5.1.md is the submission artifact
- simulation/benchmark.py reproduces Table 3 (N=100,000)
- simulation/hitl_harness.py reproduces Table 5 (N=30 HITL)
- tests/ are the adversarial red-team suite
- tlc_kernel/ is the governance engine described in the paper

## Not Claimed

- That simulated results generalize to real-world deployment without replication
- That I9 (Lengua, Latinx cross-cultural) has been empirically validated
- That the TLA+ model checking extends beyond depth 20

## Acceptance Criteria

- [ ] AC-001: python -m pytest tests/ exits 0 — all 4 adversarial tests pass
- [ ] AC-002: simulation/benchmark.py runs to completion — Table 3 reproduced
- [ ] AC-003: simulation/hitl_harness.py runs to completion — Table 5 reproduced
- [ ] AC-004: paper_v5.1.md contains no placeholders — every section complete
- [ ] AC-005: council verdict on paper claims — llm-council reviews before submission
- [ ] AC-006: submission receipt from target venue obtained
- [ ] AC-007: paper uploaded to arXiv before submission (open access)
- [ ] AC-008: governed-investigation repo linked from TLC 2.0 README

## Halt Conditions

- HLT-001: Any adversarial test fails — halt, investigate before resubmission
- HLT-002: Table 3 or Table 5 results do not match paper claims — halt, reconcile
- HLT-003: Council verdict is REJECT — halt, revise paper before submission

## Truth Surface

- Evidence Required: Yes — simulation output files are the evidence
- Reviewer Required: Yes — llm-council, then external peer review
- Public Claim Allowed: Yes, after AC-001 through AC-004 pass
