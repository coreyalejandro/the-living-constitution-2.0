# cognitive-governance-lab Inspection

**Inspected:** 2026-05-13
**Inspector:** Hermes (session 3)
**Branch:** classify/cognitive-governance-lab

---

## Local path

/Users/coreyalejandro/cognitive-governance-lab

NOTE: Located at home root (~), NOT under ~/Projects. Scanner missed it because
scan-projects.mjs targets /Users/coreyalejandro/Projects only.

---

## Files inspected

- README.md
- pyproject.toml
- RESEARCH_PLAN_GO_20260429.md (top 20 lines)
- governance-kernel/contract-window/ listing
- governance-kernel/invariant-checkers/ listing
- governance-kernel/bicameral-review/ listing
- tests/ listing
- paper/ listing
- proposal/ listing
- git log (5 commits)
- pytest run (full)

---

## Detected purpose

Runtime governance framework for human-AI collaborative investigative arcs.
Implements the Contract Window, Bicameral Review, and Invariant Checkers as
Python library modules. Backed by a formal research program with three
falsifiable hypotheses (H1 Intent Fidelity, H2 Bilateral Repair,
H3 Accessibility Threshold). Also contains COLM 2026 paper draft and Anthropic
Research Fellows proposals.

---

## Governance role

Source library for the core Contract Window mechanism that TLC 2.0 depends on.
This is where the implementation of the Contract Window, Bicameral Review, and
Invariant Checkers lives as testable Python code. TLC imports or adapts these
concepts. The governance-kernel here is the research-grade reference
implementation of TLC's runtime invariant machinery.

---

## Research lane

Cognitive governance / AI safety — hypothesis-driven research into Insight
Atrophy (systematic erosion of human investigative capacity from fluent-but-wrong
model outputs). Three formal hypotheses under study. Research plan has a Month 1
gate (synthetic calibration pass done; live pilot not yet run).

---

## Product lane

Governance library — contract-window, bicameral-review, invariant-checkers
modules usable as dependencies in TLC 2.0 integration products. Research paper
(COLM 2026 draft) and Anthropic Fellows proposal materials are co-located.

---

## Evidence found

- git log: 5 commits, most recent "Add FELLOWS_APP_FILLED_v2.md" (proposal work)
- pyproject.toml: structured Python package with pytest config
- pytest run: 62 tests collected, 62 PASSED in 0.22s
  - test_contract_window.py: 9 tests
  - test_invariant_checkers.py: 24 tests
  - test_session_recorder.py: 29 tests
- governance-kernel/: 4 Python modules (contract_window.py, bicameral_review.py,
  invariant_checkers.py, insight_atrophy_index.py)
- RESEARCH_PLAN_GO_20260429.md: Month 1 gate synthetic pass recorded;
  full gate (live pilot + human IRR) NOT YET DONE

---

## Routes found

None. No web app, no Next.js app, no server. Pure Python library + research docs.

---

## Tests found

3 test files, 62 tests, all passing locally as of this inspection.
- test_contract_window.py
- test_invariant_checkers.py
- test_session_recorder.py

---

## Recommended truth_status

working

Rationale: 62 tests pass locally. The governance-kernel Python library
(contract_window, bicameral_review, invariant_checkers) is implemented and
test-verified this session. The research program is active but pre-pilot —
that is the research status, not the library status.

---

## Recommended implementation_status

partial

Rationale: The governance-kernel library is working. The research program
(live pilot, IRR, H1-H3 evaluation) is not yet complete. The paper and proposal
are drafts. Marking partial because the research scaffold is incomplete even
though the implementation artifact (the library) is verified.

---

## Remaining unverified items

- No STATUS.json or STATUS.md found — formal project status not machine-readable
- Live pilot sessions: 0 of 10 required for Month 1 gate
- Human inter-rater reliability: not done
- Paper (COLM 2026 draft): not submitted, draft status only
- Anthropic Fellows proposals: submitted but outcome unknown
- insight_atrophy_index.py: listed but not confirmed to have tests
- No CRSP contract found — governance contract not bound
- Scan path /Users/coreyalejandro/Projects does not cover this repo —
  scanner needs a path extension to find it
