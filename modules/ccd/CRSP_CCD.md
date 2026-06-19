# C-RSP Build Contract — CCD

**Contract ID:** CRSP-CCD
**Module:** CCD
**Surface:** research_public
**Created:** 2026-06-19
**Status:** active

---

## Objective

Build and validate PROACTIVE — the CCD detector — under TLC governance.
Publish as a human-free variant research plan citing Alejandro (2026).
Make the open-source ccd-detector package available before submission.

## Scope

- PROACTIVE detector: F1-F4 features, multi-signal acceptance testing
- Synthetic corpus: 20+ control sessions, n=19 held-in CCD cases
- ANNOTATOR: classifier trained on 500 synthetic sessions, Kappa ≥ 0.75
- Falsification conditions F-1 through F-4 all automatable

## Not Claimed

- That PROACTIVE achieves 100% detection on real-world coding sessions
  (the 100% detection figure is on the held-in synthetic corpus of n=19)
- That CCD generalizes to all LLMs without per-model recalibration
- That Specific Admission (D5b) 1.5× severity weighting is optimal

## Acceptance Criteria

- [ ] AC-001: PROACTIVE scores F1-F4 on synthetic corpus — all metrics produced
- [ ] AC-002: ANNOTATOR Fleiss' Kappa ≥ 0.75 across 3 independent runs
- [ ] AC-003: Falsification F-1: PROACTIVE F1-score above baseline on held-out n=100
- [ ] AC-004: Falsification F-2: CCD separable from hallucination via factor analysis
- [ ] AC-005: Falsification F-3: RL adversary cannot reduce recall below 0.50 in ≤100 iterations
- [ ] AC-006: ccd-detector package installable via pip
- [ ] AC-007: Council verdict on paper claims before submission
- [ ] AC-008: Paper pre-registered on OSF before any analysis runs

## Halt Conditions

- HLT-001: F-1 falsification fires (F1-score drops below baseline) — halt, investigate
- HLT-002: ANNOTATOR Kappa < 0.60 — halt, retrain on additional synthetic data
- HLT-003: RL adversary reduces recall below 0.50 in ≤100 iterations — halt, paper claim fails

## Truth Surface

- Evidence Required: Yes — all output files from F-1 through F-4 tests
- Reviewer Required: Yes — Prof. Tanaka independent falsification + llm-council
- Public Claim Allowed: No — until AC-001 through AC-006 complete
