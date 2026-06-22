# Validation Paper Outline

**Version:** 1.0
**Status:** PROPOSED
**Date:** 2026-06-22
**Source:** `modules/validation-study/paper/Evaluating_TLC_Runtime_Constitutional_Governance_v1.0.md`
**Target Venues:** CHI, IJAIED

---

## Paper Identification

**Full Title:** Evaluating TLC Runtime: Constitutional Governance Under Real Conditions (Validation Study)
**Short Title:** Validation Study (Paper 4 of 6)
**Status:** Draft v1.0 scaffold — Paper 4 of 6 in the TLC six-paper stream
**Current Truth-State:** PROPOSED (per PROGRAM_ARCHITECTURE.md §Layer 6 Six-Paper Stream)
**Central Claim:** This paper reports empirical results from running the Eight Wonders Constitution inside TLC Runtime with human participants. It does not define the runtime or the constitution.

---

## Scope Boundary

**This paper's scope:**
- Empirical evaluation of TLC Runtime + Eight Wonders Constitution executing together
- IAI reduction measurement: before/after hypothesis count
- AHI recovery rate: proportion of misclassified behaviors correctly re-typed
- Human participant study design, execution, and results

**Out of scope for this paper (belong in other papers):**
- Runtime architecture (Paper 1)
- Eight Wonders invariant definitions (Paper 3)
- m-DTCI and m-NAP instrument development (Paper 5)
- CALT Theory (Paper 6)

---

## Planned Section Structure

The following is the **planned outline** for the validation study paper. Sections marked EXISTS reflect the current stub draft. Sections marked PROPOSED do not yet have content.

### Abstract (EXISTS in draft)
- Study design summary: CAMM (Constitutional Adaptive Mixed Methods), N=10 pilot / N=1000 megaproject
- Key results stated in stub: 94.2% AHI recovery rate, 68% IAI reduction, p < 0.001
- **Truth-State of these results: PROPOSED** — they are draft placeholders, not measured outcomes

---

### Section I: Introduction (PLANNED)
- The validation gap: what it means for a constitutional runtime to "work"
- IAI as the primary metric (defined in Runtime paper §I.D; operationalized here)
- AHI recovery rate as secondary metric
- Preregistration statement (to be linked when OSF registration is complete)

---

### Section II: Method (PLANNED)

**II.A. CAMM Protocol** (Constitutional Adaptive Mixed Methods)
- Mixed-methods design with embedded constitutional governance
- Quantitative arm: MSEM + Bayesian sensitivity analysis
- Qualitative arm: member checking + focus groups
- Power analysis: N=10 pilot; N=1000 megaproject
- Source: `frameworks/research/CAMM_Protocol.md`

**II.B. Participants**
- Pilot: N=10 community members (bootstrapped, $0 recruitment)
- Megaproject: N=1000, 4 sites (future — requires IRB + funding)
- Eligibility criteria and consent process (to be written per ethics checklist)

**II.C. Procedure**
- Baseline hypothesis generation (H_pre measurement)
- TLC + Eight Wonders session (governed inference)
- Post-session hypothesis generation (H_post measurement)
- IAI calculation: `IAI = 1 - (H_post / H_pre)` per session

**II.D. Instruments**
- m-DTCI (Minimal Dynamic Trust Calibration Index) — `instruments/` directory
- m-NAP (Minimal Neurodivergent Adaptation Profile) — `instruments/` directory

**II.E. TLC Runtime Configuration**
- Constitution loaded: Eight Wonders v1.0
- Evidence path: `evidence/validation-study-sessions.jsonl`
- k_ambiguous_threshold: 3 (default)

---

### Section III: Results (PROPOSED — no data yet)

**III.A. Quantitative Results**
- IAI reduction: primary outcome
- AHI recovery rate: secondary outcome
- Per-invariant activation rates (δ₁–δ₈ state distributions)
- Halt authority trigger frequency

**III.B. Qualitative Results**
- Participant experience: Contract Window usability
- Neurodivergent participant outcomes: SCS, AI, CLV, TCM, PO, CI (from Neurodivergent Success Metrics framework)
- Member checking findings

**III.C. Bootstrapped Pilot Results (Phase 1)**
- N=10 results table
- Confidence intervals, effect sizes, power analysis for Phase 2

---

### Section IV: Discussion (PROPOSED)

**IV.A. Interpretation of IAI Results**
**IV.B. AHI Recovery: What Correct Re-typing Means**
**IV.C. Frontin' Phenomenon: Pilot Case**
**IV.D. Limitations**
- Small pilot sample (N=10)
- Self-selected community panel
- Single-site deployment
- Proxy variable validity (all δₖ proxies are stated, not calibrated — see Eight Wonders Appendix C)

---

### Section V: Conclusion (PLANNED)
- Platform generalizability claim: established or not by pilot data
- Megaproject design implications
- Open science: Zenodo + Docker reproducibility package

---

### References (PLANNED)
Will include all references from Runtime paper + Eight Wonders paper + CAMM-specific citations (Shadish, Cook & Campbell 2002; Nosek et al. 2018; OSF preregistration literature).

---

### Appendices (PLANNED)

| Appendix | Title | Status |
|---|---|---|
| A | Pre-registered hypotheses (OSF link) | PROPOSED |
| B | Full MSEM model specification | PROPOSED |
| C | Bayesian sensitivity analysis | PROPOSED |
| D | Per-invariant state distribution tables | PROPOSED |
| E | Qualitative coding scheme | PROPOSED |
| F | Evidence chain integrity verification | PROPOSED |
| G | Tier-1 Compliance Report | PROPOSED |

---

## Dependency Map

The Validation Study depends on all of the following being VERIFIED first:

| Dependency | Current State | Blocking? |
|---|---|---|
| TLC Runtime paper (Paper 1) | SPECIFIED | Yes — architecture must be stable |
| Eight Wonders Constitution paper (Paper 3) | SPECIFIED | Yes — invariants must be finalized |
| TypeScript `ConstitutionalInvariant` interface | SPECIFIED | Yes — implementation needed |
| `EightWondersConstitution implements Constitution` class | PROPOSED | Yes — runtime must execute the constitution |
| m-DTCI and m-NAP instruments | SPECIFIED | Yes — measurement instruments required |
| Ethics / IRB approval | PROPOSED | Yes — required before data collection |
| OSF preregistration | PROPOSED | Yes — required before data collection (Tier-1) |
| Evidence chain operational | VERIFIED (tlc-sl runtime) | Partial — TypeScript runtime not yet verified |

---

## Truth-State of Draft Claims

**These specific numbers in the current draft are PROPOSED, not measured:**

| Claim | Source in Draft | True State |
|---|---|---|
| 94.2% AHI recovery rate | Stub draft abstract | PROPOSED — placeholder |
| 68% IAI reduction | Stub draft abstract | PROPOSED — placeholder |
| p < 0.001 significance | Stub draft abstract | PROPOSED — placeholder |
| N=10 pilot results | Stub draft | PROPOSED — study not run |
| N=1000 megaproject | Stub draft | PROPOSED — funding not secured |

**These numbers must not be cited anywhere in the repo as if they are validated results.** They are placeholder targets used to structure the paper draft. They advance to VALIDATED only when the actual study is executed with real participants and the evidence chain is verified.

---

## Research Program Context

Per `PROGRAM_ARCHITECTURE.md` §Research Program Timeline:
- Week 5–8: Bootstrapped Pilot Phase 1 (Build) — setting up measurement infrastructure
- Week 9–16: Bootstrapped Pilot Phase 2 (N=10) — actual data collection
- Tier-1 Compliance Report v1 published after pilot
- OSF preregistration locked before megaproject
- Megaproject (N=1000, 4 sites): Month 36 / $6.5M–$8M budget

---

*V&T:*
*EXISTS (Verified Present): Validation study paper stub at `modules/validation-study/paper/Evaluating_TLC_Runtime_Constitutional_Governance_v1.0.md`. CAMM Protocol at `frameworks/research/CAMM_Protocol.md`. Instruments directory with m-DTCI, m-NAP.*
*VERIFIED AGAINST: PROGRAM_ARCHITECTURE.md §Layer 6 truth-state table (Paper 4: PROPOSED). HANDOFF.md confirms "Validation Study v1.0: Draft complete" but notes appendices are stubs.*
*NOT CLAIMED: Any empirical results. The 94.2% and 68% figures are draft placeholders, explicitly labeled PROPOSED.*
*FUNCTIONAL STATUS: PROPOSED. No study has been run. This outline is the scaffolded plan.*
