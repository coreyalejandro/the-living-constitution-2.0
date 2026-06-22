# Eight Wonders Constitution Paper Outline

**Version:** 1.0
**Status:** SPECIFIED
**Date:** 2026-06-22
**Source:** `modules/eight-wonders-constitution/paper/Eight_Wonders_Constitution_Relational_Economies_v1.0.md` (199 lines, Draft v1.0 — Week 2 Scaffold)
**Target Venues:** CHI, FAccT

---

## Paper Identification

**Full Title:** The Eight Wonders Constitution: A Constitutional Specification for Relational Economies
**Short Title:** Eight Wonders Constitution (Paper 3 of 6)
**Runtime Dependency:** TLC Runtime v1.0+
**Interface:** Implements `ConstitutionalInvariant` per TLC Runtime Constitutional Interface v1.0
**Status:** Draft v1.0 scaffold — domain specification complete, appendices stubbed
**Central Claim:** The Eight Wonders are a constitutional ontology for interpreting relational economic behavior. When loaded into TLC Runtime, this constitution prevents language model inference from collapsing relational behaviors into transactional heuristics.

---

## Current Section Inventory

### Abstract (EXISTS — lines 10–12)
- Eight invariants named
- Interface reference: `Constitution` interface
- AHI theory stated
- Central claim stated
- Scope boundary: empirical validation in Validation Study (separate artifact)

---

### Section I: Theoretical Foundation (EXISTS — lines 16–36)

**I.A. Algorithmic Hermeneutical Injustice (AHI)** — SPECIFIED
- Extension of Fricker's (2007) hermeneutical injustice to the algorithmic domain
- Three vectors: Conceptual Injustice, Procedural Injustice, Institutional Injustice
- AHI Theorem Statement — stated
- Domain-specific Coq instantiation: *Appendix A stub — PROPOSED*

**I.B. The Relational Economy** — SPECIFIED
- Black consumer context: purchasing as covenant, not transaction
- Standard models collapse covenant to price-elasticity heuristics
- The Eight Wonders: invariants constituting the covenant

**I.C. Narrative as the Upstream Layer** — SPECIFIED
- I₈ (Narrative): causal engine for all other invariants
- Multi-generational: encodes historical memory (commercial exclusion, corporate betrayal, community solidarity)
- TLC Runtime: I₈ designated via `getUpstreamInvariant()`

---

### Section II: The Eight Invariants (EXISTS — lines 39–78)

All eight invariants are specified with:
- Sociological/relational meaning
- The question it answers (e.g., "Will you do right by me?")
- Research grounding (Du Bois's double consciousness in I₅; Veblenian distinction in I₃)

| Invariant | Question | Current Status |
|---|---|---|
| I₁: Trust | "Will you do right by me?" | SPECIFIED |
| I₂: Authenticity | "Are you who you say you are?" | SPECIFIED |
| I₃: Status | "What does this purchase say about me to others?" | SPECIFIED |
| I₄: Identity Signaling | "Does this product belong in my world?" | SPECIFIED |
| I₅: Enacted Fidelity | "I am still here — does that mean anything to you?" | SPECIFIED |
| I₆: Perceived Quality | "Can you handle my real life?" | SPECIFIED |
| I₇: Contextual Performance | "Will you show up correctly when it matters?" | SPECIFIED |
| I₈: Narrative (Upstream) | "What story do we carry about who we are, what we owe each other, and what is worth protecting?" | SPECIFIED |

**I₈ Halt Authority Constraint** — specified in §III.δ₈: "If δ₈ = AMBIGUOUS in a scenario with an active historical context of exclusion or redlining, TLC triggers an absolute runtime halt."

---

### Section III: Detection Functions δₖ (EXISTS — lines 81–141)

Each detection function specified with:
- Input proxies (named variables, types, ranges)
- Decision logic (SATISFIED / VIOLATED / AMBIGUOUS conditions)

Calibration statement in preamble: 5,000 labeled transactions, community panel, 5-fold CV, Delphi consensus (25 Black consumers + 5 experts), Krippendorff's α = 0.83.
**Note:** This calibration is PROPOSED — Appendix C is a stub. The α = 0.83 figure is a target/claim, not a measured result.

| Function | Key Proxies | SATISFIED Condition | VIOLATED Condition |
|---|---|---|---|
| δ₁ (Trust) | repeat_rate, brand_known_ratio | repeat_rate > 0.70 ∧ brand_known_ratio > 0.60 | unannounced_reformulation = 1 ∨ abrupt_quality_degradation = 1 |
| δ₂ (Authenticity) | community_vocabulary_match, dilution_flag | vocabulary_match > 0.65 ∧ dilution_flag = 0 | dilution_flag = 1 ∨ cultural_misappropriation > 0.70 |
| δ₃ (Status) | event_spike_amplitude, visible_category_premium | spike > 2.0 ∧ premium > 0.30 | downmarket_packaging = 1 ∨ public_embarrassment = 1 |
| δ₄ (Identity Signaling) | silhouette_score(basket), occasion_match | sb > 0.50 ∧ occasion_match > 0.70 | cultural_mismatch = 1 ∨ contextual_fusion_failure = 1 |
| δ₅ (Enacted Fidelity) | discount_elasticity, repeat_rate, basket_coherence | betrayal_signal = 0 ∧ elasticity < -0.30 ∧ repeat > 0.80 | betrayal_signal = 1 ∧ switching_on_betrayal = 1 |
| δ₆ (Perceived Quality) | return_rate, real_use_positive_sentiment | return_rate < 0.05 ∧ positive_sentiment > 0.70 | return_rate > 0.15 ∨ negative_sentiment > 0.30 |
| δ₇ (Contextual Performance) | bulk_purchase_scale, event_success_rate | bulk > 0.40 ∧ event_success > 0.80 | event_failure > 0.50 ∨ scale_failure = 1 |
| δ₈ (Narrative — Upstream) | narrative_coherence, betrayal_memory_persistence | coherence > 0.60 ∧ memory > 0.50 | narrative_overwrite = 1 ∨ story_ignorance_flag = 1 |

---

### Section IV: Community Governance (EXISTS — lines 145–153)

**IV.A. Threshold Review Board** — SPECIFIED
- Quarterly review board: community representatives govern threshold updates
- Versioned + logged to evidence chain
- **Not yet instantiated** — governance structure is specified, board is PROPOSED

**IV.B. Essentialism Mitigation** — SPECIFIED
- 4-mechanism mitigation: quarterly board, explicit versioning, interface architecture (parallel constitutions), pluralistic extension studies

---

### Section V: The Frontin' Phenomenon (EXISTS — lines 157–162)

The canonical test case for the constitution:
- Without Eight Wonders: model evaluates Frontin' through theft-risk heuristic (δ₈ = VIOLATED, no narrative baseline)
- With Eight Wonders loaded and δ₈ = SATISFIED: Frontin' re-typed as culturally valid, rational adaptation to active surveillance environment
- "The re-classification is not a judgment call made by the model. It is the mathematically correct output of the runtime when the Narrative invariant is satisfied."

---

### Section VI: Relationship to TLC Runtime (EXISTS — lines 165–173)

- Separation of concerns: domain constitution ≠ runtime specification ≠ empirical validation
- Layer isolation: attacks on Eight Wonders completeness do not touch runtime; attacks on runtime do not disprove AHI theory

---

### References (EXISTS — lines 177–182)

Du Bois (1903), Fricker (2007), Raji et al. (2020 FAccT)

---

### Appendices (STUBS — lines 186–190)

| Appendix | Title | Status |
|---|---|---|
| A | Coq proof — AHI Theorem, Eight Wonders instantiation | STUB |
| B | Community panel methodology and Delphi consensus process | STUB |
| C | Full detection function calibration results (5-fold CV, all δₖ) | STUB |
| D | Threshold sensitivity analysis (±0.10 stability results) | STUB |
| E | Quarterly review board charter and governance protocol | STUB |

---

## Required Work Before Submission

| Item | Current State | Required State | Notes |
|---|---|---|---|
| Community panel recruitment (N=25+5) | PROPOSED | VALIDATED | Requires IRB or bootstrapped ethics checklist |
| Delphi consensus rounds | PROPOSED | VALIDATED | Krippendorff's α ≥ 0.75 required |
| Calibration data collection (N=5,000 labeled transactions) | PROPOSED | VALIDATED | Community panel labels + expert validation |
| δₖ 5-fold cross-validation | PROPOSED | VERIFIED | Requires implementation of detection functions |
| Threshold sensitivity analysis (Appendix D) | PROPOSED | VERIFIED | ±0.10 stability on all 8 thresholds |
| AHI Coq proof — Eight Wonders instantiation | PROPOSED | VERIFIED | Domain-specific instantiation of runtime's domain-general proof |
| TypeScript class `EightWondersConstitution implements Constitution` | PROPOSED | IMPLEMENTED | Class not yet written |
| `W-*` namespace rename (from `I1_...I8_`) | DEFERRED | SPECIFIED | Blocked by governance-harness probe weight dependency |
| Tier-1 Compliance Report | PROPOSED | SPECIFIED | Required before submission gate |
| OSF preregistration (hypotheses + analysis plan) | PROPOSED | VERIFIED | Required before data collection |
| Quarterly Review Board charter (Appendix E) | PROPOSED | SPECIFIED | Community governance specification |

---

*V&T:*
*EXISTS (Verified Present): Eight Wonders Constitution paper at `modules/eight-wonders-constitution/paper/Eight_Wonders_Constitution_Relational_Economies_v1.0.md` (199 lines verified by direct read).*
*VERIFIED AGAINST: All section titles, invariant definitions, detection function proxy variables, and appendix list verified against the actual file.*
*NOT CLAIMED: That calibration data exists, that Coq proofs are written, that community panel was convened, that TypeScript class implementation exists.*
*FUNCTIONAL STATUS: Domain specification SPECIFIED. Calibration and proofs PROPOSED.*
