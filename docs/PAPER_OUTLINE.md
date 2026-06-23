# Paper outline — *Constitution as Code: Verified Runtime Governance for AI Systems*

**Status:** outline / working draft. Every claim below maps to a file in this repository and to a
command that reproduces it. This document deliberately scopes its novelty claims (see §2) and
states limitations plainly (see §8); it is written to be falsifiable, not promotional.

---

## Abstract (draft)

Every major AI lab publishes governance *principles*; few have *infrastructure* that enforces them
and produces independently checkable evidence that the enforcement is correct. We present the TLC
verification stack, an open, dependency-free implementation in which a single definition of each
constitutional invariant compiles to (1) runtime enforcement, (2) an exhaustive in-process model
check, and (3) a TLA+ model checked by TLC in continuous integration. We close the gap between a
written constitution and its hand-coded enforcement — a drift the system's own verification
statement had flagged as unverified — by making the invariants a single source of truth across all
three. We add an Ed25519- and Merkle-based evidence chain so the governance record is verifiable
offline by any third party holding only a public key, and a "probe-gate" that operationalizes the
project's own confession that a measurement "gate that cannot fail is not a test." We do **not**
claim to be the first formal language for AI governance (we survey prior art), nor to have solved
the empirical problem of validating activation-space probes; we are precise about what is verified
(21/21 invariants, 35 tests, TLC green in CI, a signed evidence chain) and what remains open.

---

## 1. Introduction — the verification gap

- Principles vs. governance: a principle is a statement; governance is structure that enforces,
  detects violation, records evidence, and deliberates. (cf. `docs/WHY-TLC.md`.)
- The concrete, in-repo instance of the gap: each invariant lived in three places — prose
  (`constitution/THE_LIVING_CONSTITUTION.md`), hand-coded JS (`src/core/policy-engine.js`,
  `src/git-hooks/pre-commit.mjs`), and JSON schemas — which can silently diverge. The
  constitution's own V&T statement flags this as *uncertain/unverified*.
- Contribution preview: one source of truth + offline-verifiable evidence + a guard against
  non-tests + governance-as-CI.

## 2. Related work and honest positioning

TLC-SL is **not** the first formal/policy language for AI governance. Survey and contrast:

| Prior work | Approach | Relationship to TLC-SL |
|---|---|---|
| CSL-Core (Chimera) | `.csl` DSL, Z3 + TLA+, runtime enforcement, BLOCK/WARN/LOG | Closest sibling; TLC-SL differs by integrating into an existing *constitutional runtime* and a truth-status discipline |
| AGENL (Emergence AI) | DSL + Lean 4 proofs + runtime | We use bounded model checking + TLA+, not Lean (yet) |
| FORGE | Datalog runtime guarantee enforcement | Declarative policy vs. our transition-system + safety framing |
| OPA/Rego, GOPAL | policy-as-code; Rego for EU AI Act / NIST RMF | General policy engines; we target one governance system's invariants end-to-end |
| QuadSentinel, Lean4Agent | policy→sequent checks; dependent-type agent verification | Related verification stances |

**Scoped novelty claim:** to our knowledge, the distinctive contribution is not the DSL concept but
the *integration* — a single invariant definition that simultaneously (a) enforces at runtime
inside a live governance engine, (b) is exhaustively model-checked with a guard-necessity
(mutation) check, (c) is TLC-checked in CI, and (d) writes into an independently-verifiable signed
evidence chain — together with an explicit honesty discipline (truth_status, complete-claim rule).

## 3. TLC-SL: one definition, three targets

- Language (`tlc-sl/grammar.md`): finite-domain state, per-action inputs, guarded transitions, a
  safety predicate. Two shapes: stateful invariants and access-control invariants.
- Compilation (`tlc-sl/src/`): shared interpreter (`interp.mjs`) guarantees runtime and checker use
  identical semantics (no drift); JS target wired into the Policy Engine (backward compatible);
  TLA+ emitter.
- Verification: exhaustive BFS over the reachable state space proves the safety property; the
  **guard-necessity** check removes each guard and confirms a violation becomes reachable, proving
  the guard is load-bearing (and honestly reporting guards that are not).
- Result: the full Article VIII set + INV-060 (22 invariants) compiles and verifies;
  `conformance/report.md` is the generated spec→enforcement→proof map.
- **Platform generality (earned, not asserted):** the runtime is constitution-agnostic. A second,
  domain-disjoint constitution — the **Instructional Integrity** constitution (`II-*`: mastery
  learning, Gagné, Cognitive Load Theory, scaffolding, UDL, Merrill) — loads and model-checks
  through the identical runtime with no code change (`constitutions/`, `npm run constitutions:check`
  → governance 22/22, instructional 6/6, namespace overlap 0). This separates the *runtime* from any
  *constitution* from any *domain*, so a critique of one layer does not invalidate the others.

## 4. Independently-verifiable evidence (Evidence Chain v2)

- `src/core/evidence-chain.mjs`: per-entry Ed25519 signatures over canonicalized payloads, a
  SHA-256 `prev_hash` chain, and a Merkle commitment with O(log n) inclusion proofs.
- Property: a third party with only the public key can verify authenticity + integrity + linkage
  offline; content, signature, or reorder tampering all fail. The TLC-SL evidence is signed this
  way (`evidence/TLC-SL/verification.signed.jsonl`).
- **High-assurance audit package (`src/evidence-chain/`).** A typed engine with a full requirements
  traceability matrix (R1–R12), TLA+ model (state space `11^C·2^P`), 87 tests at 100% branch
  coverage, an 11-vector red-team, and empirical pipeline. **A6 hardening (v2.1):** each entry binds
  its signer-key fingerprint and `verify()` accepts an out-of-band pinned signer + chain head,
  closing "signature forgery via file edit" (re-sign under a substituted key) and tail truncation —
  i.e. it binds *whose* key, not merely *a* key (`docs/SECURITY-A6-DISCLOSURE.md`).

## 5. Probe-gate: refusing non-tests

- Motivation: `evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md` confesses gates that cannot
  fail (constant outputs, hardcoded failsafes). 
- `probe-gate/`: an analyzer that rejects any gate that cannot fail, cannot pass, or is insensitive
  to its inputs, with a structural lint for the exact tautology bug. Necessary, not sufficient
  (see §8).

## 6. Governance as CI

- `.github/workflows/governance-ci.yml`: re-runs the in-process checker, all test suites, signed-
  evidence verification, a **no-drift** check (generated artifacts must match the specs), and
  **TLC model-checking as a required gate**.
- Dogfooding: the addition of TLC-SL was itself governed — a C-RSP contract written before code
  (I1), evidence recorded to the hash chain (I2), a visual understanding layer (I8).

## 7. Results (reproducible)

| Claim | Command | Result |
|---|---|---|
| All 21 Article VIII invariants hold | `npm run tlc:sl` | 21/21 |
| Test suites pass | `npm run tlc:sl:test && npm run evidence:test && npm run probe-gate:test` | 35/35 |
| TLA+ is model-checked | governance CI "TLA+ model-check with TLC" job | "No error" (required gate) |
| Evidence is independently verifiable | `npm run tlc:sl:verify-evidence` | signatures + chain OK |
| Generated artifacts are not stale | CI no-drift step | clean |
| Audit-package engine tests + 100% branch coverage | `c8 … node --import tsx/esm --test src/evidence-chain/engine.test.ts` | 87/87, 100% |
| Red-team (incl. A6 trust-root swap + truncation) | `node --import tsx/esm src/evidence-chain/validation/red-team-run.ts` | 11/11 BLOCKED |
| Scales to 1M entries; append O(1), verify O(n), membership O(log n) | `node --import tsx/esm src/evidence-chain/validation/bench.ts` | build ~115 s, verify ~142 s @ 1M |
| TLA+ state space is the closed form `11^C·2^P` | TLC sweep (`docs/PERFORMANCE.md`) | exact to 644,204 states, no error |

## 8. Limitations and threats to validity

- **Probe construct validity (the big one):** probe-gate checks a gate *can* discriminate; it does
  not prove a probe measures the intended construct. The activation-space probes remain
  synthetic/unvalidated per the project's own statement. This is the central open problem (§9).
- **No Lean 4 target:** properties are model-checked, not proof-carrying.
- **Finite-domain checker:** exhaustive only over the small declared models; not a general
  unbounded model checker (TLA+/TLC mitigates but shares the modeled abstraction).
- **Identity binding:** *closed in the audit-package chain* (`src/evidence-chain/`, v2.1) — entries
  bind the signer-key fingerprint and `verify()` pins it out-of-band (`docs/SECURITY-A6-DISCLOSURE.md`).
  The `src/core/evidence-chain.mjs` CLI verifier still trusts a co-located key file (next to harden);
  full PKI/key-rotation/sigstore remains future work.
- **Single-operator council:** constitutional council authority currently rests with the author
  (acknowledged in the constitution itself).

## 9. Future work

- Replace synthetic governance-harness probes with trained, validated probes; an experimental
  manipulation that actually toggles the invariant; gates whose pass/fail is not predetermined;
  held-out validation. (Requires real model + data + GPU.)
- Lean 4 target; extend the audit-package A6 trust-anchoring (signer-fingerprint pin + head pin) to
  the `src/core/evidence-chain.mjs` CLI verifier and to full PKI/key-rotation/sigstore; generate the
  pre-commit checks from the same TLC-SL models; an inductive invariant (TLAPS) for unbounded-N
  assurance beyond the bounded TLC model.

## 10. Reproducibility appendix

Clone, then (zero dependencies, Node ≥ 18):
```bash
npm run tlc:sl && npm run tlc:sl:test
npm run evidence:test && npm run probe-gate:test
npm run tlc:sl:verify-evidence
cat tlc-sl/conformance/report.md
```
CI mirrors these on every push/PR and additionally model-checks the TLA+ with TLC.

---

## Contribution statement (honest)

We contribute an integrated, reproducible, and independently-verifiable implementation of runtime
constitutional governance — not a claim of priority over the policy-as-code or formal-methods-for-AI
literature. The value is in the wiring and the discipline: one source of truth across enforcement
and proof, evidence anyone can check, a guard against measurements that cannot fail, and CI that
keeps all of it honest.
