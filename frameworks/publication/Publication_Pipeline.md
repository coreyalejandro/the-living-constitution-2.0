# Publication Pipeline

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Publication Pipeline
**Layer:** 6 — Publication Pipeline
**Date:** 2026-06-21

---

## Architecture

```
Research Program
      ↓
Bootstrapped Pilot (N=10)
      ↓
Tier-1 Compliance Report v1
      ↓
OSF Preregistration (locked)
      ↓
Full Study (N=1000, 4 sites)
      ↓
Tier-1 Compliance Report v2
      ↓
Reproducibility Package (Docker + Zenodo)
      ↓
Peer Review Submission
      ↓
ACM Artifacts Badge (Available + Functional)
      ↓
Publication
```

No step may be skipped. Truth-State must be VERIFIED before submission.

---

## Paper Stream

### Paper 1 — TLC Runtime
**Title:** TLC Runtime: A Constitutional Governance Architecture for Human-Centered Investigation
**Target venues:** AAAI, NeurIPS, IEEE TSE
**Status:** Draft v1.0 (SPECIFIED)
**Location:** modules/tlc-runtime/paper/
**Truth-State required for submission:** VERIFIED (Coq proof + LTL traces + latency benchmarks)
**Current blockers:** Coq proof PROPOSED, LTL traces PROPOSED, latency PROPOSED

### Paper 2 — Constitution Engineering Methodology
**Title:** Constitution Engineering: A Systematic Methodology for Designing Constitutional Governance Systems
**Target venues:** CHI, AAAI, IEEE TSE
**Status:** CEM scaffold exists (SPECIFIED)
**Location:** modules/constitution-engineering/
**Truth-State required for submission:** VERIFIED (two constitutions validated under CEM)

### Paper 3 — Eight Wonders Constitution
**Title:** The Eight Wonders Constitution: Governing Algorithmic Hermeneutical Injustice in Consumer Behavior Research
**Target venues:** CHI, FAccT, Nature Human Behaviour
**Status:** Draft v1.0 (SPECIFIED)
**Location:** modules/eight-wonders-constitution/paper/
**Truth-State required for submission:** VERIFIED (empirical study + CCI measurement)

### Paper 4 — Validation Study
**Title:** Evaluating Constitutional Runtime Governance: A Tier-1 Mixed-Methods Study
**Target venues:** CHI, IJAIED, NeurIPS
**Status:** Stub (PROPOSED)
**Location:** modules/validation-study/paper/
**Truth-State required for submission:** VALIDATED (full CAMM protocol, N=1000)

### Paper 5 — Minimal Instruments
**Title:** m-DTCI and m-NAP: Open-Source Minimal Instruments for Bootstrapped Constitutional AI Research
**Target venues:** FOSS/ICSE, open-source instrument track
**Status:** Instruments SPECIFIED
**Location:** instruments/
**Truth-State required for submission:** VERIFIED (N=10 pilot validation)

### Paper 6 — CALT Theory
**Title:** Constitutional Adaptive Learning Theory: Unifying Constitutional AI, Neurodivergent-First Design, and Trust Calibration
**Target venues:** IJAIED, Nature Human Behaviour, "Neurodivergent-First AI at Scale" special issue
**Status:** Theory SPECIFIED
**Location:** frameworks/research/CALT_Theory.md
**Truth-State required for submission:** VERIFIED (H1-H5 tested, H8 from bootstrapped pilot)

---

## Pre-Submission Requirements (All Papers)

- [ ] Truth-State = VERIFIED minimum (VALIDATED for empirical claims)
- [ ] Tier-1 Compliance Report published and CHAE-approved
- [ ] OSF preregistration filed and linked
- [ ] Reproducibility package available (Docker or equivalent)
- [ ] NAB co-authorship offer extended for papers using participant data
- [ ] WHITEWASHING check: all race, power, structural harm language reviewed
  (see ai-safety-research-practice/references/whitewashing-documentation.md)
- [ ] V&T statement in paper appendix
- [ ] Evidence chain verified (node src/core/evidence-chain.mjs verify)

---

## OSF Preregistration Template

See: frameworks/publication/OSF_Preregistration_Template.md

Required fields:
1. Title and authors
2. Research questions (from CAMM)
3. Hypotheses (H1-H8 from CALT)
4. Study design (CAMM protocol reference)
5. Analysis plan (locked — no post-hoc changes without amendment)
6. Sample size and power analysis
7. Exclusion criteria
8. Materials (NAP, m-DTCI, SCS instruments)
9. Known limitations

Lock the analysis plan before first participant. Amendment requires CHAE approval.

---

## Zenodo Deposition Requirements

Every published dataset must be deposited on Zenodo before submission.

Required:
- De-identified dataset (no participant identifiers)
- Analysis script (R or Python, fully commented)
- README with exact reproduction steps
- License: CC BY 4.0 (data) + MIT (code)
- DOI reserved before submission (use Zenodo sandbox first)

---

## Reproducibility Package

Required contents:
- Docker image (one-command build + run)
- All analysis scripts
- Synthetic demo dataset (for testing without real participant data)
- "Reproduce Our Pilot" guide (step-by-step, HCIP-compliant)
- Expected output checksums

ACM Artifacts badge pathway:
1. Submit to ACM Artifacts Available program
2. Submit to ACM Artifacts Functional program
3. Target Artifacts Reusable badge for instrument papers

---

## Budget

### Bootstrapped Phase (Weeks 1-28)
| Item | Cost |
|---|---|
| Participant stipends (10 x $50) | $500 |
| Domain + hosting | $15 |
| Infrastructure | $0 (free tiers) |
| OSF preregistration | $0 |
| Zenodo deposition | $0 |
| Total | < $1,000 |

### Megaproject Phase ($6.5M-$8.0M over 36 months)
Requested only after Bootstrapped Phase produces:
- Public validated prototype
- Tier-1 Compliance Report demonstrating feasibility
- OSF preregistration with pilot effect sizes

Megaproject budget released upon megaproject proposal submission.

---

## Target Venues by Paper

| Paper | Primary | Secondary | Special |
|---|---|---|---|
| Runtime | AAAI | NeurIPS, IEEE TSE | — |
| CEM | CHI | AAAI | — |
| Eight Wonders | CHI | FAccT | Nature Human Behaviour |
| Validation | CHI | IJAIED | NeurIPS |
| Instruments | FOSS/ICSE | — | Open-source instrument track |
| CALT | IJAIED | Nature Human Behaviour | Neurodivergent-First AI special issue |
