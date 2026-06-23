# Product Requirements Document — TLC 2.0

**Title:** The Living Constitution (TLC) 2.0 — Verified, Accessible Runtime Governance for AI
**Status:** Golden draft v1.0 · **Repo baseline:** `main` @ `dc6064d` (evidence-chain v2.1)
**Owner:** Corey Alejandro · **Last updated:** 2026-06-23
**Binding rule:** This PRD is held to the repo's **complete-claim rule**. Every
*current-state* statement maps to a verified fact (see §6 and the dated evidence in
`docs/REVIEW_RESPONSE.md`, `docs/PERFORMANCE.md`, `docs/SECURITY-A6-DISCLOSURE.md`).
Every *target* is labeled a target, never stated as a present fact. The honesty
ledger (§13) is normative: a change that violates it is a defect, not an enhancement.

> **What "golden" means here.** Not "the product is done" — it means *this document
> is factually exact, fully traceable (need → requirement → metric → milestone →
> acceptance test), prioritized, and free of overclaim.* The self-audit in §15 is the
> evidence for that claim.

---

## 1. Executive summary

TLC is a **runtime constitutional governance layer for AI**: you write a constitution
as machine-checkable invariants once, and TLC (a) enforces it at runtime, (b)
model-checks it formally, and (c) records every decision to a tamper-evident,
independently auditable evidence chain. TLC 2.0's product goal is to deliver this as a
**research-grade yet accessible** system — usable by Fortune 500 engineering orgs,
Tier-1 research labs, and individual hobbyist/neurodivergent developers — and to
expose it through a **plain-English, accessibility-first TUI**.

The strategic thesis is a flywheel: **reproducible research → citable papers →
a trustworthy product → more research**. The product is only as good as the honesty of
its claims, so radical transparency (the complete-claim rule) is a feature, not a
constraint.

---

## 2. Problem & opportunity

1. **The verification gap.** AI labs publish constitutions/principles as prose. Nothing
   mechanically guarantees the stated principle is the rule the system enforces, nor
   that an auditor can later prove what the system did. Documentation is not evidence;
   a check that cannot fail is not a constraint.
2. **The trust gap.** Audit logs that whoever holds the files can silently rewrite are
   not trustworthy. Governance needs tamper-evidence with an out-of-band trust anchor.
3. **The accessibility gap.** High-assurance governance tooling is built for experts.
   It excludes neurodivergent developers, non-specialists, and the resource-constrained
   — the very people most affected by ungoverned AI. There is an opportunity to make
   rigorous governance **legible in plain English** and **low in cognitive load**
   without diluting the rigor.

---

## 3. Vision & non-negotiable principles

**Vision:** *Make it as easy to run, prove, and audit an AI constitution as it is to
run a test suite — and make the result understandable by a non-expert.*

Non-negotiable principles (P0 throughout):
- **Honesty over polish.** No claim ships without a runnable proof. "What this does not
  claim" is always present.
- **Free and offline-capable.** The core must run on free tooling with no paid
  dependency and degrade gracefully offline (maintainer + hobbyist constraint).
- **Accessibility is a requirement, not a layer.** Plain English and low cognitive load
  are P0 for any user-facing surface.
- **Separation of concerns.** Runtime ≠ constitution ≠ domain theory ≠ empirical study;
  each is independently publishable and attackable.

---

## 4. Users & personas

| Persona | Goal | What they need | Primary tracks |
|---|---|---|---|
| **Enterprise platform engineer** (Fortune 500) | Govern production AI with audit-ready evidence | Containerized one-command setup, pinned deps, SBOM, PKI/key-rotation, green CI, threat model | B, D |
| **Tier-1 researcher** (academic/corporate lab) | Produce citable, reproducible governance research | Reproducible artifacts + DOI, baseline comparisons, pre-registration, unbounded proofs, model cards | A, C, D |
| **Hobbyist / neurodivergent developer** | Govern a personal project without an expert team | Gentle on-ramp, plain-English docs + TUI, free tools, offline | B, E |
| **End operator** (uses the TUI to run governance) | Understand and act on governance decisions | Plain-English decisions, screen-reader correctness, keyboard-first, minimal cognitive load | E |

---

## 5. Goals & non-goals

**Goals (this PRD's scope):**
- G1. A correct, secure, reproducible runtime + evidence + formal stack (engineering).
- G2. A credible empirical method for measuring constitutional behavior (science).
- G3. An accessible, plain-English TUI/product (UX).
- G4. Research outputs at peer-review/citation quality (papers + DOI).

**Non-goals (explicitly out of scope for 2.0):**
- N1. Decentralized / Byzantine-tolerant consensus (single accountable-operator model).
- N2. Being a general policy-DSL standard or "the first" of anything.
- N3. Closed-source or paid-only capabilities in the core.
- N4. Claims about model behavior that are not backed by validated measurement.

---

## 6. Current state (verified baseline — the honest anchor)

Status legend: ✅ verified & shipped · ⚠️ shipped but re-verification pending · 🔬 not built.

| Capability | Status | Evidence |
|---|---|---|
| Spec language → runtime + TLA+ (TLC-SL) | ✅ | `tlc:sl` 22 invariants pass; integration tests |
| Runtime enforcement (PolicyEngine) | ✅ | >1.7M decisions/s measured (`docs/PERFORMANCE.md`) |
| Tamper-evident signed evidence chain | ✅ | `evidence:verify` / `tlc:sl:verify-evidence` pinned, pass |
| A6 forgery-via-file-edit closed (tamper-**evident**, pinned) | ✅ | red-team 11/11; `docs/SECURITY-A6-DISCLOSURE.md` |
| Formal model-check (bounded) | ✅ | TLC "No error"; state space `11^C·2^P` to 644k states |
| Performance: append O(1), verify O(n), membership O(log n) | ✅ | 1M chain ~115s build / ~142s verify (`bench.ts`) |
| TS audit-package test suite + coverage gate | ⚠️ | 90 tests + red-team ran locally under a `fast-check` **shim** (npm was down); **real `c8`/`tsx`/`fast-check` + `tsc` typecheck + green CI run NOT yet confirmed** — see `docs/HANDOFF_TIER1_ROADMAP.md` §3 |
| Probe-gate (rejects checks that cannot fail) | ✅ | `probe-gate:test` |
| Empirical measurement of model behavior | 🔬 | governance-harness probes are **synthetic/unvalidated** (`evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md`) |
| Reproducibility (container, pinned lockfile, one-command) | 🔬 | not present |
| Unbounded formal proof (Lean 4 / TLAPS) | 🔬 | not present |
| Evaluation vs prior-art baselines | 🔬 | not present |
| Accessible / plain-English / neurodivergent TUI | 🔬 | a TUI + React UI exist; **no accessibility audit, plain-language metric, or user study** |

---

## 7. Success metrics (north-star + KPIs, each with honest baseline → target)

**North-star:** *Number of independent parties who reproduce a TLC claim end-to-end on
their own machine and agree with it.* (Baseline: 0 measured · Target: ≥3 by M4.)

| KPI | Baseline (verified) | Target | Verified by |
|---|---|---|---|
| One-command clean-machine reproduction | none | `git clone` → 1 command reproduces all gates | M1 |
| CI green incl. real c8 100% + tsc | not confirmed | all jobs green on `main` | M1 |
| External audit of the evidence chain | none | 1 independent pen-test, findings resolved | M2 |
| Empirical probe construct validity | synthetic only | held-out validity with effect sizes + CIs, pre-registered | M3 |
| Baseline comparison (vs CSL-Core/OPA/FORGE…) | none | published comparison + ablations | M3 |
| TUI accessibility | unmeasured | WCAG 2.2 AA conformance report | M3 |
| Plain-English legibility | unmeasured | governance decisions at a stated, measured reading level | M3 |
| Neurodivergent task success | unmeasured | study: task-completion ≥ pre-set threshold | M4 |
| Citable artifact | none | Zenodo DOI + peer-review-ready paper | M4 |

---

## 8. Requirements (prioritized; each has a verifiable acceptance criterion)

P0 = required for credibility/usability · P1 = required for Tier-1 · P2 = differentiator.

### 8.1 Governance runtime & spec language
- **R1 (P0):** One invariant definition compiles to runtime enforcement + TLA+ + JS.
  *Accept:* `tlc:sl` passes; no-drift check clean. *(Met today.)*
- **R2 (P1):** Pre-commit / CI checks generated from the same TLC-SL source (no
  hand-maintained duplicate). *Accept:* a generated check fails a seeded violation.

### 8.2 Formal verification
- **R3 (P0):** Bounded model-check in CI as a required gate. *Accept:* TLC "No error"
  job required. *(Met today.)*
- **R4 (P1):** Unbounded-N assurance via inductive invariant (TLAPS) or Lean 4; a
  liveness property under fairness. *Accept:* machine-checked proof artifact for all N.

### 8.3 Evidence & audit (security)
- **R5 (P0):** Tamper-evident chain; verification **fails closed** without an
  out-of-band pin. *Accept:* red-team 11/11; CLI refuses w/o pin. *(Met today.)*
- **R6 (P1):** Key lifecycle: PKI / rotation / sigstore; SBOM + documented threat model.
  *Accept:* rotate a key without breaking historical verification; published threat model.
- **R7 (P1):** Independent security review. *Accept:* external pen-test report + fixes.

### 8.4 Empirical measurement (the science — the headline gap)
- **R8 (P0 for the headline claim):** Replace synthetic probes with probes trained on
  **real model activations**, with construct validity (an experimental manipulation
  that toggles an invariant). *Accept:* held-out results with effect sizes + CIs +
  multiple-comparison correction; pre-registered; model card + datasheet released.
- **R9 (P1):** Gates whose pass/fail is not predetermined. *Accept:* probe-gate proves
  each gate can both pass and fail on real inputs.

### 8.5 Reproducibility & artifact engineering
- **R10 (P0):** Pinned lockfile + Dockerfile/devcontainer + one-command `verify:all`
  (incl. real `c8 --branches 100` and `tsc --noEmit`). *Accept:* clean-machine clone
  reproduces every gate green.
- **R11 (P1):** Versioned release with a Zenodo DOI. *Accept:* DOI resolves to the
  archived artifact.

### 8.6 Evaluation & research outputs
- **R12 (P1):** Head-to-head comparison + ablations vs the named prior art. *Accept:*
  comparison table backed by reproducible benchmarks; per-component ablation deltas.
- **R13 (P1):** Peer-review-ready paper(s) per the three-paper structure, each claim
  mapped to a command. *Accept:* internal review passes the complete-claim bar.

### 8.7 The accessible, plain-English TUI (the product UX)
- **R14 (P0):** All user-facing governance output rendered in **plain English** at a
  **stated, measured reading level**. *Accept:* automated readability check in CI meets
  the target; no unexplained jargon in decision output.
- **R15 (P0):** TUI is keyboard-first, screen-reader-correct, low-cognitive-load.
  *Accept:* WCAG 2.2 AA conformance report; screen-reader walkthrough recorded.
- **R16 (P0):** Free + offline-capable core. *Accept:* full core workflow runs with no
  network and no paid dependency.
- **R17 (P1):** Usability validated with **neurodivergent participants** (IRB-style
  protocol, consent, datasheet). *Accept:* study shows task-completion ≥ threshold.

### 8.8 Non-functional (cross-cutting)
- **R18 (P0):** Performance budgets honored: runtime decision < 1 ms typical; append
  O(1); membership audit O(log n). *Accept:* `bench.ts` within budget in CI.
- **R19 (P0):** Every shipped claim carries a `VERIFICATION_AND_TRUTH`-style statement.
  *Accept:* no claim in docs lacks an EXISTS/VERIFIED-AGAINST/NOT-CLAIMED block.

---

## 9. Release plan (milestones; traceable to §8)

- **M0 — Today (✅ done):** R1, R3, R5, R18 met; v2.1 merged.
- **M1 — Trustworthy & reproducible (P0):** R10, plus confirm the ⚠️ items (real c8/tsc/
  CI green), R2. *Exit:* clean-machine one-command repro, all CI green.
- **M2 — Hardened (P1):** R6, R7. *Exit:* PKI + external pen-test resolved.
- **M3 — Scientific & accessible (P1/P0):** R8, R9, R12, R14, R15, R16. *Exit:* validated
  empirical results + WCAG AA + plain-English gate.
- **M4 — Citable & validated (P1):** R4, R11, R13, R17. *Exit:* DOI + paper + ND user study.

---

## 10. Dependencies, assumptions, constraints
- **GPU + real model + data** are required for R8 (empirical); unavailable in the
  current build sandbox — assume a future environment provides them.
- **Free-tools-only / low-income maintainer** constraint (`.ai-context/user-profile.md`)
  → no paid dependency in the core; cloud/GPU steps must be optional and documented.
- **Single-writer, append-only** evidence model is assumed (R5's guarantee depends on it).
- **Out-of-band trust channel** (git history / signed release) is assumed for the A6 pin.

## 11. Risks & mitigations
| Risk | Severity | Mitigation |
|---|---|---|
| Overclaiming (esp. the model-behavior gap) | High | Honesty ledger (§13) is normative; complete-claim CI/doc gate (R19) |
| Empirical track blocked on GPU | High | Ship M1/M2 (engineering) independently; gate the headline claim on R8 |
| Accessibility treated as cosmetic | Med | R14–R17 are P0; user study is an exit gate (M4) |
| Prior-art collision ("first") | Med | Maintain prior-art section; never claim primacy |
| Coverage/CI regressions hidden by sandbox workarounds | Med | M1 re-verifies with real tooling before any badge |

## 12. Open questions
- Which model(s) and dataset(s) for R8, and what invariant is the first to get a
  validated probe?
- Target reading level for R14 (e.g., a specific grade band) — set with ND users, not assumed.
- Which baseline(s) in R12 are the fairest head-to-head, given differing scopes?

---

## 13. Honesty ledger (normative — do not violate)
1. Not "first." 2. Model-behavior verification gap is **open** (probes synthetic).
3. Tamper-**evident**, not tamper-proof. 4. Formal proofs are **bounded** today.
5. No baseline evaluation yet → no "better" claim. 6. The accessible product does not
exist yet. 7. The TS suite/coverage/CI were not re-verified with real tooling in the
v2.1 sandbox (npm down) — M1 must.

## 14. Glossary (plain English)
- **Constitution:** the rules an AI system must follow, written so a machine can check them.
- **Invariant:** a rule that must always hold (e.g., "never act without a contract").
- **Evidence chain:** a signed, append-only logbook of decisions you can't secretly edit.
- **Trust anchor / pin:** a small fingerprint, kept somewhere safe, that proves which key is genuine.
- **Model-check:** exhaustively trying all states of a small model to prove a rule can't break.
- **Probe:** a measurement of what a model is "doing" internally (today: not yet validated).

---

## 15. Golden self-audit (why I have factual confidence in this PRD)

Rubric (Tier-1 PRD) → result:
1. **Problem evidence-grounded, not hype** → §2 ties to documented gaps. ✅
2. **Current state honest & separated from targets** → §6 status legend + §13 ledger; no target stated as fact. ✅
3. **Every requirement testable** → each R has an *Accept:* criterion. ✅
4. **Metrics measurable w/ honest baselines** → §7 baseline→target→verified-by. ✅
5. **Personas concrete + mapped to tracks** → §4. ✅
6. **Scope & non-goals explicit** → §5. ✅
7. **Risks incl. ethical/overclaim** → §11 row 1. ✅
8. **Traceability need→req→metric→milestone→accept** → §4→§8→§7→§9. ✅
9. **Prioritized (P0/P1/P2)** → §8. ✅
10. **Self-contained & plain-language (dogfoods R14)** → §14 glossary; prose kept legible. ✅

**Confidence statement (honest):** I have 100% confidence that this document's
*current-state* claims match the repo verified this session (with the §6 ⚠️ caveat
stated, not hidden), that every *target* is labeled as such, and that the structure
meets the rubric above. I do **not** claim the targets are achieved or that the product
will succeed — that would violate §13. The "golden" status is a property of the
document's accuracy and completeness, which is verifiable here.
