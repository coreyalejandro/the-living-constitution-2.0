# Handoff & Tier-1 Roadmap — TLC 2.1

Audience: the next engineering agent (IBM Bob IDE) and human maintainers.
Purpose: (1) an honest account of what v2.1 changed and the current state of the
repo relative to its stated intent and claims, and (2) a concrete roadmap to bring
the project to a Tier-1 (Stanford-AI-Engineering-equivalent) standard.

This document is bound by the repo's **complete-claim rule**: every "done/verified"
statement maps to a command that was actually run. Where something was *not* run or
*not* verified, this document says so explicitly. **Do not remove or soften the
honesty ledger (§5); do not re-introduce dropped claims.**

---

## 1. Current state in one paragraph

TLC is a *runtime constitutional governance* layer with three working, coupled
parts: a spec language (TLC-SL) whose invariants compile to both runtime
enforcement and a model-checkable TLA+ form; a tamper-evident, signed evidence
chain; and a probe-gate that rejects governance checks that cannot fail. v2.1 (now
on `main`, commit `dc6064d`) closed a real security vulnerability (A6 signature
forgery via file edit), added measured performance/scaling data, fixed an O(n²)
append bottleneck, and supplied the missing narrative. **What the project does NOT
yet do is the hardest part of its own headline:** it does not *measure
constitutional behavior inside a model*. The neural probes that would do that are
still synthetic/unvalidated (the repo says so itself). So the repo today is a
strong **engineering** artifact with an honest **scientific** gap.

---

## 2. What v2.1 changed (this session)

| Area | Change | Files |
|---|---|---|
| **Security (A6)** | Closed "signature forgery via file edit": each ledger entry binds its signer-key fingerprint; verification **fails closed** unless an out-of-band pin (signer fingerprint and/or chain head) is supplied, or in-process trust is explicit. Red-team gained A10 (trust-root key swap) + A11 (tail truncation) → 11/11. The `.mjs` CLI verifier now **refuses** to verify without a pinned fingerprint. | `src/evidence-chain/{crypto,ledger,engine,index,types}.ts`, `src/core/evidence-chain.mjs`, `validation/red-team-run.ts`, `evidence/TRUST_ANCHORS.md`, `docs/SECURITY-A6-DISCLOSURE.md` |
| **Performance** | Fixed an O(n²) append (whole-file read per write) → O(1) tail-hash cache (40× at 16k entries; 1M-entry chain builds ~115 s, verifies ~142 s). Documented complexities + the TLA+ state-space closed form `11^C·2^P`. | `src/evidence-chain/ledger.ts`, `validation/bench.ts`, `docs/PERFORMANCE.md` |
| **Narrative** | Stated the contribution + blockchain/DLT contrast + honest prior-art positioning; gave the audit package a README home. | `docs/NOVELTY.md`, `README.md`, `docs/REVIEW_RESPONSE.md` |
| **Audit fidelity** | Re-synced the traceability matrix (it cited wrong test sections and a `red-team-report.md` that never existed); fixed stale R1 status; added R11/R12. Added a CI `evidence-chain` job. | `src/evidence-chain/spec/traceability-matrix.yaml`, `.github/workflows/governance-ci.yml` |

---

## 3. Verification status — what Bob MUST re-run (this is important)

**The npm registry was down for the entire session that produced v2.1.** As a
result the TypeScript audit package was NOT verified with its real toolchain. The
workarounds used here ran the *real engine code* but not the real test tooling:

- **No `tsc` typecheck was run.** `--experimental-transform-types` *erases* types
  without checking them. There is currently **no typecheck gate** in the repo at
  all. → In Bob: `npx tsc -p tsconfig.evidence.json --noEmit` and add it to CI.
- **`fast-check` was a local shim.** The property-based tests executed against the
  real engine but under a minimal random-sampling stand-in, not the real
  `fast-check`. → In Bob: `npm ci` then run the real suite.
- **`c8` coverage was NOT run.** The "100% branch coverage" claim was supported by
  Node's built-in coverage plus the argument that every uncovered line sits in a
  `/* c8 ignore */` block — sound, but **not a c8 run**. The CI job I added enforces
  `c8 --check-coverage --branches 100`; if real c8 disagrees (e.g. a default-param
  branch), **that CI gate will fail**. → In Bob: run the R4 command in
  `traceability-matrix.yaml` and confirm 100% *before* trusting the badge.
- **CI has not been observed green.** The merge to `main` was verified
  (`origin/main == dc6064d`), but I did not watch GitHub Actions. → In Bob:
  `gh run list` / the Actions tab; confirm `verify`, `tlc-model-check`, and the new
  `evidence-chain` job are green. Treat any red as the first task.

What WAS genuinely verified locally (real code, real commands): 90/90 engine tests
(under the shim), 11/11 red-team vectors, 3/3 empirical claims, TLC `EvidenceChain.tla`
"No error" (real Java/TLC), both `.mjs` pinned-verify scripts, the full zero-dep
governance stack (tlc-sl 22/22, probe-gate, integration, platform), and no-drift.

---

## 4. Repo vs. its stated intent and claims (scorecard)

Stated intent (project goal): *"the first open-source runtime governance framework
that closes the verification gap between AI constitutional principles and measurable
model behavior — with reproducible evidence, formal invariant enforcement, and
independent audit trails."*

| Claim | Status | Notes |
|---|---|---|
| "**first** … framework" | ❌ **Drop it** | Prior art overlaps: CSL-Core/Chimera, AGENL, FORGE, OPA/Rego+GOPAL, QuadSentinel. Repo already corrected this; keep it corrected. |
| "runtime governance framework" | ✅ Real | PolicyEngine + TLC-SL, 22 invariants enforced; >1.7M decisions/s. |
| "closes the verification gap between principles and **measurable model behavior**" | ⚠️ **Not at the model-behavior layer** | Closed: principle ↔ *enforcement/evidence* drift. NOT closed: measuring behavior *inside the model* — the probes are synthetic/unvalidated (`evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md`). This is the project's central open problem. |
| "reproducible evidence" | ✅ Real, ⚠️ harden | Signed, A6-hardened evidence chain. But reproducibility of the *whole repo* (one-command, pinned deps, container) is not yet there (§6.B). |
| "formal invariant enforcement" | ✅ Real, bounded | TLA+ model-checked at bounded scope (`11^C·2^P`); no unbounded/inductive proof, no Lean 4. |
| "independent audit trails" | ✅ Real | Evidence chain + out-of-band trust anchors; third party can verify offline with a pinned key. |
| Security posture | ✅ tamper-**evident** (not tamper-proof) | A6 closed *given* an out-of-band pin. Residual risk documented. Never say "tamper-proof." |

---

## 5. Honesty ledger — what is NOT true yet (do not overclaim)

1. **Not "first."** Policy-as-code + formal-methods-for-governance prior art exists.
2. **The model-behavior verification gap is open.** No trained probes, no real
   activations, no experimental manipulation that toggles an invariant in a model,
   no held-out validation. Synthetic data only.
3. **Coverage/typecheck/CI not re-verified with real tooling this session** (§3).
4. **Formal proofs are bounded**, not unbounded; no Lean 4 / TLAPS.
5. **Tamper-evident, not tamper-proof.** Security reduces to an out-of-band pin and
   a single-writer append model.
6. **No head-to-head evaluation vs. the prior-art baselines** — so "better" cannot
   be claimed, only "different/integrated."
7. **The accessible/neurodivergent/plain-English TUI product does not exist yet** —
   there is a TUI (`scripts/tlc.mjs`, `src/tui/app.tsx`) and a React UI (`src/ui/`),
   but no accessibility audit, plain-language verification, or user studies.

---

## 6. Roadmap to Tier-1 (Stanford-AI-Engineering equivalent)

Ordered by what a top reviewer (the original review invoked Fei-Fei Li / Stanford)
would demand first. Each track lists concrete actions and the acceptance criterion
that makes it *paper-grade*.

### A. Close the empirical verification gap — the science (highest priority)
This is the difference between "high-assurance engineering" and "a research
contribution." Requires a real model + data + GPU.
- Train **linear/probing classifiers on real model activations** for each invariant;
  publish a **model card + datasheet**.
- Design an **experimental manipulation that actually toggles an invariant** in the
  model and show the probe/gate responds (construct validity, not just discrimination).
- Gates whose pass/fail is **not predetermined**; report **effect sizes, confidence
  intervals, and multiple-comparison correction**, with a **held-out** set.
- **Pre-register** the protocol; release the analysis code + seeds.
- Acceptance: an independent party can reproduce the probe results from raw model +
  released code and get the same numbers within stated CIs.

### B. Reproducibility & artifact engineering (unlocks Fortune 500 + hobbyists)
- **Pin the toolchain:** commit a working `package-lock.json`, add a
  **Dockerfile + devcontainer** (ideal for Bob IDE) for one-command setup.
- **One command to verify everything:** a `make verify` / `npm run verify:all` that
  runs tlc-sl, the evidence-chain suite + c8 100% gate, red-team, empirical, TLC,
  pinned evidence verify, and `tsc --noEmit`.
- **Add the missing typecheck gate** (`tsc -p tsconfig.evidence.json --noEmit`).
- Confirm the GitHub Actions runs are green and add **status badges**.
- Archive a release on **Zenodo for a DOI** (citability).
- Acceptance: `git clone && <one command>` reproduces every claim on a clean machine.

### C. Evaluation & related-work rigor (turns it into a paper)
- Build a **comparison table + head-to-head benchmark** vs. CSL-Core, AGENL, FORGE,
  OPA/Rego, QuadSentinel on: expressiveness, what each detects, runtime cost,
  formal coverage, auditability.
- **Ablations** (e.g. with/without probe-gate, with/without A6 pin) quantifying each
  component's contribution.
- Acceptance: a reviewer can see *what is new and what is better/worse*, with data.

### D. Formal-methods depth
- **Inductive invariant (TLAPS)** or a **Lean 4** target for **unbounded-N** proofs,
  not just bounded TLC. Add a **liveness** property under fairness.
- Extend A6 trust-anchoring to **full PKI / key rotation / sigstore**.
- Acceptance: a proof that holds for all N, machine-checked.

### E. The consumer product — accessible, neurodivergent, plain-English TUI
This is a distinct HCI research + product track. The repo already has relevant
assets to build on: the **Instructional-Integrity constitution** (CLT/Gagné/UDL/
Merrill), the **instruments** (`instruments/m-DTCI.md`, `m-NAP.md`), and a stated
**cognitive-accessibility** mandate (`.ai-context/user-profile.md`).
- Ground the design in **WCAG 2.2**, **Cognitive Load Theory**, **Universal Design
  for Learning**, and a **plain-language standard** (e.g. target a controlled
  reading level; measure it, don't assert it).
- Make the existing TUI/React UI **screen-reader-correct**, keyboard-first, low-
  cognitive-load; render governance decisions and evidence in **plain English**
  (the runtime already produces structured decisions — translate them).
- **User studies with neurodivergent participants** (IRB-style protocol, consent,
  datasheet); measure comprehension and task success, not just preference.
- Acceptance: measured accessibility conformance + a study showing
  neurodivergent users complete governance tasks with the plain-English TUI.

---

## 7. Who this serves, and what each needs next
- **Fortune 500 enterprises:** Track B (containerized, one-command, green CI, pinned
  deps) + Track D (PKI/key rotation) + an SBOM and a threat model doc.
- **Tier-1 academic/research:** Track A (empirical) + Track C (baselines/ablations)
  + Track D (unbounded proofs) + DOI + pre-registration.
- **Hobby developers:** Track B (devcontainer, `quickstart`, plain-English docs) +
  Track E (accessible TUI) so the on-ramp is gentle.

---

## 8. File map (where things live)
- Spec language: `tlc-sl/` (compiler, specs, generated TLA+/JS/models).
- Runtime: `src/core/policy-engine.js`, `src/core/contract-manager.js`.
- Evidence chains: `src/core/evidence-chain.mjs` (CLI, hardened) and the TS audit
  package `src/evidence-chain/` (engine, ledger, crypto, tests, validation/, spec/).
- Probe-gate: `probe-gate/`. Governance harness (synthetic probes): `evidence/GOVERNANCE-HARNESS/`.
- Constitutions/platform: `constitutions/` (registry + check-platform.mjs).
- TUI/UI: `scripts/tlc.mjs`, `src/tui/app.tsx`, `src/ui/` (React/Vite).
- CI: `.github/workflows/governance-ci.yml`. Trust anchors: `evidence/TRUST_ANCHORS.md`.
- Key docs: `docs/{VERIFICATION_STACK,PAPER_OUTLINE,NOVELTY,PERFORMANCE,SECURITY-A6-DISCLOSURE,REVIEW_RESPONSE}.md`.

## 9. Environment notes for Bob
- This sandbox had a flaky npm registry; the TS toolchain (`tsx`/`c8`/`fast-check`)
  could not be installed. Bob should `npm ci` on a normal network and **redo the TS
  verification properly** (§3) rather than trust the workaround runs.
- TLA+ needs Java + `tla2tools.jar` (CI downloads it; `EvidenceChain.cfg` sets the
  constants — vary them to reproduce the `11^C·2^P` scaling).
- The signing **private keys are not in the repo** (by design); you cannot re-sign
  committed evidence, only verify it (and append new entries with your own key).
