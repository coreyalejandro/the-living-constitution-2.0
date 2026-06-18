# C-RSP Build Contract — GOVERNANCE-HARNESS

**Contract ID:** CRSP-GOVERNANCE-HARNESS
**Module:** GOVERNANCE-HARNESS
**Surface:** private_lab
**Created:** 2026-06-18
**Status:** active

---

## Objective

Advance governance-harness from a working technical scaffold to an empirically
valid probe system that can detect TLC invariant violations in Qwen2.5-7B's
neural activations using real data and non-circular validation.

---

## Scope

Repair and validate the four items disclosed in VERIFICATION_AND_TRUTH.md.
Establish governance-harness as a reproducible empirical layer inside TLC 2.0.

---

## Not Claimed

- That current probe weights measure TLC invariant compliance (they do not — see V&T)
- That causal claims in production_run.log are valid (they are not — see V&T)
- Production deployment of any probe inference without re-validation on real data
- Generalizability beyond Qwen2.5-7B layer-activation geometry

---

## Dependencies

- Python >= 3.10
- torch == 2.2.1 (Apple Silicon MPS or CUDA)
- transformers == 4.38.2
- causal-learn == 0.1.3.8
- scikit-learn == 1.4.1.post1
- Qwen/Qwen2.5-7B in local HuggingFace cache
- TLC-2.0-RUNTIME (for registry and evidence indexing)

---

## Acceptance Criteria

### Phase 1 — Repair (required before truth_status can leave `partial`)

- [ ] AC-001: Replace synthetic dataset with real empirical prompts
      Evidence required: source, collection method, sample count, no circular generation
- [ ] AC-002: Fix Gate 2 — t2_violations logic must allow Gate 2 to fail
      Evidence required: test case where Gate 2 fails on deliberately bad input
- [ ] AC-003: Fix Gates 3 and 4 — remove hardcoded failsafe, handle SHD=0 explicitly
      Evidence required: test where gates return non-perfect scores on imperfect data
- [ ] AC-004: Validate probe label alignment
      Evidence required: correlation between Wonder scores and independent human ratings
      or an alternative validated grounding method

### Phase 2 — Validation (required before truth_status can reach `working`)

- [ ] AC-005: Re-train all 8 Wonder probes on real data (AC-001 must be done first)
      Evidence required: train_per_wonder.log from real-data run, per-wonder accuracy
- [ ] AC-006: Run full harness on real data, Gates 1-4 all capable of failing
      Evidence required: production run log, at least one gate failure on adversarial input
- [ ] AC-007: GES discovers at least one edge not hardcoded in GT_EDGES
      Evidence required: adjacency matrix, comparison to theory edges
- [ ] AC-008: run_live.py distinguishes Sovereign vs Defensive conditions
      Evidence required: LDA scores with real weights, gap > 0.1 on held-out prompts

### Phase 3 — Integration (required for /probe TUI command to be non-advisory)

- [ ] AC-009: /probe command in TLC TUI runs run_live.py and returns real scores
      Evidence required: TUI screenshot or terminal capture with real output
- [ ] AC-010: Probe results indexed in evidence/GOVERNANCE-HARNESS/
      Evidence required: evidence index entry with date, weights version, scores

---

## Halt Conditions

- HLT-001: Any claim that current probe weights measure governance compliance
- HLT-002: Use of synthetic dataset for any published or external result
- HLT-003: Gate 2 logic that cannot produce a failure on adversarial input
- HLT-004: Scope creep into models other than Qwen2.5-7B without new contract

---

## Truth Surface

- Evidence Required: Yes — all phase transitions require evidence files
- Reviewer Required: Yes for Phase 2 and Phase 3
- Public Claim Allowed: No until AC-001 through AC-006 complete
