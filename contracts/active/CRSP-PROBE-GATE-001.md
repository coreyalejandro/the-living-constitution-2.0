---
document_type: "C-RSP_CONTRACT"
id: "CRSP-PROBE-GATE-001"
version: "0.1.0"
status: "Active"
binds_module: "PROBE-GATE"
parent_contract: "CRSP-STC-RUNTIME-001"
adoption_tier: "Tier-1-MVG"
author: "agent-produced (requires human acceptance gate before any truth_status upgrade)"
created: "2026-06-21"
---

# C-RSP Build Contract — Probe-Gate (INV-PROBE-001)

Binds the `PROBE-GATE` module (`probe-gate/`). Satisfies Invariant I1 for code added to `main`
without its own governance binding.

## 1. Objective
Operationalize `evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md` ("a gate that cannot fail
is not a test") as an enforceable check: reject any gate that cannot fail, cannot pass, or is
insensitive to its inputs over its declared finite domain.

## 2. Not Claimed
- **Necessary, not sufficient:** proves a gate *can* discriminate, NOT that it measures the right
  construct. Does NOT validate the governance-harness probes against real data.
- No visual understanding layer yet → not eligible for `working` under I8/INV-050.

## 3. Scope
In: the analyzer (finite-domain enumeration, canFail/canPass/sensitivity, structural tautology
lint), a small arithmetic evaluator, the CLI, and three fixtures (two confessed-bad gates + one
genuine). Out: construct-validity assessment, real probe validation.

## 4. Acceptance Criteria (with V&T)
- **AC-1** `npm run probe-gate:test` → 7/7 pass. V&T: VERIFIED.
- **AC-2** The two confessed-bad fixtures are REJECTED; the genuine gate is ACCEPTED. V&T: VERIFIED.

## 5. Halt Conditions
`HALT_GATE_CANNOT_FAIL`, `HALT_GATE_INSENSITIVE` — the analyzer returns the reasons.

## 6. V&T Statement — CRSP-PROBE-GATE-001
| Field | Value |
|---|---|
| **What** | The probe-gate analyzer + CLI + fixtures. |
| **True** | 7/7 tests pass; rejects the two bad gates, accepts the genuine one; CI runs it. |
| **Unverified** | Construct validity of real probes; the harness's synthetic-data problem is untouched. |
| **Not Claimed** | See §2 — necessary, not sufficient. |
| **Functional Status** | PARTIAL — verified core; no visual layer (INV-050 bars `working`). |
| **Evidence Ref** | `probe-gate/tests/analyzer.test.mjs`, `probe-gate/gates/` |
