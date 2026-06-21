---
document_type: "C-RSP_CONTRACT"
id: "CRSP-TLC-SL-001"
version: "0.1.0"
status: "Active"
binds_module: "TLC-SL"
parent_contract: "CRSP-STC-RUNTIME-001"
governing_constitution: "constitution/THE_LIVING_CONSTITUTION.md"
adoption_tier: "Tier-1-MVG"
author: "agent-produced (requires human acceptance gate before any truth_status upgrade)"
created: "2026-06-20"
---

# C-RSP Build Contract — TLC-SL ("Constitution as Code")

This contract governs the build of the TLC-SL module. It exists because Invariant
I1 requires a bound contract before work begins. It is written before any code in
this module was authored.

---

## 1. Objective

Build a small, formally-grounded specification language — TLC-SL — in which a single
definition of a constitutional invariant compiles to:

1. **Executable runtime enforcement** that plugs into the existing `src/core/policy-engine.js`.
2. **A bounded, exhaustive model check** run by an in-process checker (no external toolchain),
   which proves the invariant's safety property holds over every reachable state, and reports
   whether each guard is load-bearing (a guard-necessity / mutation check).
3. **A TLA+ module** exported for industrial model-checking with the TLC model checker.

The purpose is to close the drift between the THREE places each invariant currently lives:
the prose constitution (I1–I8), the hand-coded JavaScript in the Policy Engine and pre-commit
hook, and the JSON-schema constraints. One source of truth, three compiled targets.

## 2. Not Claimed (explicit boundary)

This contract and module do **not** claim:

- That TLC-SL is the first or only formal language for AI governance. It is not. Prior art
  includes CSL-Core (Chimera), AGENL (Lean 4), FORGE (Datalog), OPA/Rego + GOPAL, and others.
  See `tlc-sl/README.md` §"Prior art and honest positioning."
- That the exported TLA+ modules have been checked by the TLC model checker in this build.
  They have not — TLC requires a Java runtime and `tla2tools.jar` not present in the build
  environment. The TLA+ target is an emitter; its output is committed and labeled `unverified`.
- That a Lean 4 target exists. It does not in v0.1.
- That the in-process checker is a substitute for industrial model checking on large state
  spaces. It is exhaustive only over the small finite-domain models the invariants declare.
- That wiring TLC-SL into the Policy Engine changes any Article III.2 hard limit on AI agents.

## 3. Scope

In scope (v0.1):
- A lexer + parser for the TLC-SL grammar (`tlc-sl/grammar.md`).
- Six invariants authored in TLC-SL: INV-001, INV-010, INV-011, INV-020, INV-023, INV-040.
- A JavaScript enforcement target and a non-breaking integration hook in the Policy Engine.
- An in-process bounded exhaustive model checker with safety + guard-necessity checking.
- A TLA+ emitter.
- A test suite on the Node.js built-in test runner (`node --test`), zero external dependencies.
- A generated conformance report mapping constitution invariant → spec → enforced check → model-check result.
- A visual understanding layer (Article VI / I8).

Out of scope (v0.1, recorded as roadmap in the README):
- Lean 4 target; running TLC; numeric/unbounded domains; the Ed25519/Merkle evidence-chain
  upgrade; the probe-validation gate; the RSP/EU-AI-Act compliance adapter.

## 4. Dependencies

- Node.js >= 18 (uses `node:test`, `node:crypto`, ES modules). No third-party packages.
- Existing files: `src/core/policy-engine.js`, `src/core/audit.mjs`, `registry/modules.registry.json`,
  `scripts/validate-instructions.mjs`.

## 5. Ordered Build Sequence (each step ends at a human approval gate)

| Step | Description | Gate |
|---|---|---|
| 1 | Author this contract (I1) | Human review of scope + not-claimed boundary |
| 2 | Grammar + lexer + parser | Parser tests pass |
| 3 | Six invariant spec files | Parse + typecheck clean |
| 4 | Model + in-process checker (safety + necessity) | Checker tests pass; necessity proven |
| 5 | JS target + Policy Engine integration | Integration tests pass; existing tests still green |
| 6 | TLA+ emitter | Emits; labeled unverified (TLC not run) |
| 7 | Conformance report generator | Report generated from real runs |
| 8 | Evidence logging + visual layer + registry entry + V&T | Validator clean; registry valid JSON |
| 9 | Branch, commits, PR handoff bundle | Human acceptance of the PR |

No step is marked complete by the agent alone. Truth-status upgrades require the human
acceptance gate at step 9.

## 6. Acceptance Criteria (with V&T status)

- **AC-1** — `node tlc-sl/src/compile.mjs <spec> --target js` produces a runtime module that,
  wired into the Policy Engine, BLOCKS a `PROMOTE_WORKING` action when no active contract /
  no verified scope exists. V&T: pending until step 5 test run.
- **AC-2** — `--target check` exhaustively verifies each invariant's safety property and emits
  a counterexample when a guard is removed (necessity). V&T: pending until step 4 test run.
- **AC-3** — `--target tla` emits a syntactically well-formed TLA+ module + `.cfg`. V&T:
  emit verified; TLC model-check NOT run (out of environment).
- **AC-4** — Existing `tests/unit/policy-engine.test.js` semantics are preserved
  (no-invariants construction behaves exactly as before). V&T: pending integration.
- **AC-5** — Conformance report is generated from actual checker runs, not hand-written.
  V&T: pending step 7.

## 7. Halt Conditions

- `HALT_SPEC_PARSE_ERROR` — a `.tlcsl` file fails to parse → block compile; surface line/column.
- `HALT_SAFETY_VIOLATED` — the checker finds a reachable safety violation under the declared
  guards → block; emit counterexample trace; do not generate a JS target that claims safety.
- `HALT_EXISTING_TESTS_REGRESSED` — any change makes prior runtime behavior diverge → revert.

## 8. Rollback / Recovery

All work is isolated on branch `feat/tlc-sl` under `tlc-sl/`, plus one additive, backward-
compatible change to `src/core/policy-engine.js`. Rollback = revert the policy-engine edit
and delete `tlc-sl/`. No existing evidence log is modified (append-only honored).

## 9. V&T Statement — CRSP-TLC-SL-001

| Field | Value |
|---|---|
| **What** | The build contract for the TLC-SL module, authored before module code. |
| **True** | Scope, not-claimed boundary, and acceptance criteria are defined; prior-art check completed and cited. |
| **Unverified** | All acceptance criteria at authoring time (verified incrementally as steps complete and recorded in `evidence/TLC-SL/verification.jsonl`). |
| **Not Claimed** | See §2. Notably: not the first governance DSL; TLA+ output not model-checked here; no Lean target. |
| **Functional Status** | ACTIVE — governs the build. |
| **Governance State** | Active. |
| **Evidence Ref** | `evidence/TLC-SL/verification.jsonl` (hash-chained via src/core/audit.mjs) |
| **Evaluator** | agent-produced — requires human acceptance gate before any truth_status upgrade. |
