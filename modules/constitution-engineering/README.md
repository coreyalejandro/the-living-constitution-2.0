# Constitution Engineering Methodology (CEM)

**Module ID:** CONSTITUTION-ENGINEERING
**Version:** 0.1 (Domain 0 Specification)
**Status:** DRAFT
**Layer:** 2 — Constitution Framework
**Depends on:** TLC Runtime Constitutional Interface v1.0

---

## What This Is

CEM is the missing layer. You can have a runtime. You can have domain
constitutions. Without a methodology for building constitutions, each
constitution appears ad hoc — a one-off cultural argument rather than an
instance of a rigorous engineering process.

CEM answers four questions the existing stack does not:

1. How are constitutions derived from domain theory?
2. How are invariants validated before deployment?
3. How are constitutions governed after deployment?
4. How do constitutions evolve without breaking the runtime?

---

## The Constitution Lifecycle

```
Phase 0: Domain Reconnaissance
    ↓
Phase 1: Invariant Elicitation
    ↓
Phase 2: Formalization
    ↓
Phase 3: Calibration
    ↓
Phase 4: Deployment
    ↓
Phase 5: Governed Evolution
```

---

## Phase 0: Domain Reconnaissance

Before writing a single invariant, establish:

- What domain behavior is being governed?
- Who are the rights-holders whose interpretive framework must be preserved?
- What failure mode does a runtime-free model exhibit in this domain?
- What is the AHI (or equivalent) impossibility claim for this domain?
- What is the canonical misclassification this constitution must prevent?

**Output:** Domain Reconnaissance Document (DRD)

**Required sections:**
- Rights-holder community definition
- Canonical misclassification case (equivalent to Frontin')
- Impossibility claim statement (following AHI Theorem structure)
- Upstream layer identification (the Narrative-equivalent)
- Preliminary invariant hypothesis list

**Gate:** No Phase 1 begins without a signed DRD.

---

## Phase 1: Invariant Elicitation

Invariants are not invented. They are elicited from the community whose
interpretive framework the constitution must preserve.

**Elicitation methods (required, all three):**

1. **Qualitative interviews** — semi-structured, minimum N=20 rights-holders,
   recorded, transcribed, coded for recurring relational themes
2. **Delphi consensus rounds** — minimum 2 rounds, minimum N=15 domain
   experts + N=10 rights-holders, Krippendorff's α ≥ 0.75 required
3. **Adversarial critique session** — minimum 1 external reviewer explicitly
   tasked with identifying essentialism, over-generalization, or missing
   invariants

**Output:** Invariant Candidate Set (ICS)

Each candidate invariant must specify:
- ID (tentative)
- Rights-holder question form (the "Will you do right by me?" format)
- Plain-language description
- Hypothesized upstream/downstream position
- Hypothesized proxy signal categories

**Gate:** ICS requires Delphi α ≥ 0.75 before proceeding.

---

## Phase 2: Formalization

Each invariant candidate is formalized as a `ConstitutionalInvariant`
implementation:

```typescript
class [InvariantID] implements ConstitutionalInvariant {
  id: string
  description: string
  evaluate(context: Context): InvariantState
  repair(context: Context): RepairAction
  isUpstream: boolean
  dependents: string[]
}
```

**Formalization requirements:**

- Detection function δₖ defined with explicit input proxies
- Three-way decision logic: SATISFIED / VIOLATED / AMBIGUOUS thresholds
- Adversarial critique operator αₖ specified
- Metadata tag for non-obvious SATISFIED states
- Halt Authority constraint documented if upstream

**Output:** Formalized Invariant Set (FIS)

**Gate:** Every FIS invariant must pass static analysis:
- evaluate() has no side effects (verified by linter rule)
- All threshold values are explicitly stated numerics (no magic numbers)
- repair() returns blocking: true for any VIOLATED state

---

## Phase 3: Calibration

**Step 1: Proxy pipeline construction**
Build the feature extractor and classifier pipeline for each δₖ proxy.

**Step 2: Gold-standard labeling**
- Minimum N=500 labeled examples per invariant
- Labels produced by elicitation panel (community + domain experts)
- 5-fold cross-validation on threshold optimization
- Target: F1 ≥ 0.80 on SATISFIED/VIOLATED boundary

**Step 3: Sensitivity analysis**
Verify results are stable within ±0.10 of all reported thresholds.

**Step 4: Adversarial injection testing**
20% of calibration examples must be adversarially crafted to push proxies
near thresholds. System must not flip classification.

**Output:** Calibration Report
**Required:** Krippendorff's α ≥ 0.75 on gold-standard labels
**Gate:** No deployment without Calibration Report signed by domain lead.

---

## Phase 4: Deployment

**Pre-deployment checklist:**

- [ ] Constitution implements `Constitution` interface (TypeScript compile clean)
- [ ] All invariant IDs stable and versioned
- [ ] Evidence chain active and hashed
- [ ] Governance board constituted (minimum 5 rights-holder representatives)
- [ ] Quarterly review schedule established
- [ ] VERIFICATION_AND_TRUTH.md committed alongside constitution
- [ ] Registered in registry/modules.registry.json

**Deployment artifact:**
```
modules/<constitution-id>/
  README.md
  CRSP_<MODULE_ID>.md
  paper/
    <Constitution>_v1.0.md
  src/
    <ConstitutionClass>.ts
  evidence/
    index.md
  tests/
    invariant.test.ts
```

---

## Phase 5: Governed Evolution

Constitutions are not static. They evolve under governance.

**Update triggers:**
- Community feedback via quarterly review board
- New evidence from validation studies
- Rights-holder community requesting threshold revision
- External critique accepted by governance board

**Update protocol:**
1. Proposed change documented in Governance Issue (GitHub)
2. Rights-holder review minimum 30 days
3. Delphi re-calibration if threshold changes
4. Version bump (minor for threshold, major for new invariant or removal)
5. Evidence chain entry logged for governance decision
6. VERIFICATION_AND_TRUTH.md updated

**Breaking change rule:**
Adding or removing invariants is a major version bump.
Renaming invariant IDs is a breaking change requiring migration guide.
Threshold changes within ±0.15 are minor version bumps.

---

## The Essentialization Guard

Every constitution must address essentialism in its DRD and Calibration Report.
The guard has three components:

1. **Invariant set is claimed to represent, not define.** The constitution
   describes interpretive patterns observed in the community. It does not
   define what community members must believe or do.
2. **Governance board can revise any invariant.** No invariant is immutable
   except through community governance decision.
3. **Parallel constitutions are non-contradictory.** Two constitutions for
   related communities may produce different invariant sets. That is correct.
   Difference is data. Contradiction is a governance problem.

---

## Constitution Comparison Framework

When two constitutions cover related domains, CEM provides a comparison
protocol:

- Structural overlap: which invariant IDs map across constitutions?
- Threshold divergence: where do similar invariants produce different thresholds?
- Upstream invariant: does each constitution identify a Narrative-equivalent?
- Missing coverage: which domains have no constitution yet?

This framework enables multi-constitution studies and cross-domain generalization claims.

---

## CEM Applied: Eight Wonders as Reference Implementation

The Eight Wonders Constitution is CEM Phase 4+ — it was developed before CEM
was formalized, so it is retroactively the reference implementation.

| CEM Phase | Eight Wonders Status |
|---|---|
| Domain Reconnaissance | Complete (AHI theory, Frontin' canonical case) |
| Invariant Elicitation | Complete (qualitative research, community panel) |
| Formalization | Complete (δₖ specified, interface-compatible) |
| Calibration | Complete (Krippendorff's α = 0.83, 5-fold CV) |
| Deployment | Draft v1.0 |
| Governed Evolution | Quarterly board chartered |

---

## CEM Applied: Instructional Integrity as First Forward Derivation

The Instructional Integrity Constitution is the first constitution derived
forward through CEM. Its DRD, elicitation, and formalization proceed in order.

See modules/instructional-integrity/ for current status.

---

## Publication

CEM is publishable as a standalone methodology paper:

**Title:** Constitution Engineering Methodology: A Framework for Building
and Governing Epistemic Constitutions

**Venue:** FAccT, NeurIPS Datasets & Benchmarks, or AI & Society

**Central contribution:** A repeatable, auditable methodology for deriving
evaluable constitutional invariants from community-grounded domain theory —
the missing layer between AI governance principles and runtime enforcement.

---

*V&T:*
*EXISTS (Verified Present): CEM specification, 5-phase lifecycle, all phase outputs and gates, essentialism guard, constitution comparison framework, Eight Wonders retroactive mapping, Instructional Integrity forward pointer.*
*VERIFIED AGAINST: Derived from ChatGPT characterization document and architectural plan provided by user; no empirical claims made.*
*NOT CLAIMED: CEM has been applied to any constitution other than Eight Wonders retroactively.*
*FUNCTIONAL STATUS: Draft v0.1 — methodology specification complete. Requires domain lead review before use.*
