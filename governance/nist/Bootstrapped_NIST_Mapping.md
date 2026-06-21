# Bootstrapped NIST AI RMF 1.0 Mapping

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Governance Framework
**Layer:** 5 — Governance Framework
**Date:** 2026-06-21

---

## Purpose

This document maps the TLC Bootstrapped Pilot to the four core functions of
the NIST AI Risk Management Framework (AI RMF 1.0) and NIST AI 600-1.
It demonstrates that even the $0 prototype addresses institutional
AI governance requirements.

This document is a public governance artifact. Publish to repository before
any funding request or publication submission.

---

## GOVERN

The Govern function establishes policies, processes, and accountability.

| NIST Requirement | TLC Implementation | Location |
|---|---|---|
| AI risk management policies | Core Constitution + Sociotechnical Constitution | constitutions/core/ |
| Roles and responsibilities | CHAE, NAB, CGB, OSSC, NCL | frameworks/governance/Governance_Framework.md |
| Risk tolerance defined | Halt Authority (LTL), CCI threshold < 0.8 | modules/tlc-runtime/paper/ |
| Accountability mechanisms | Signed audit trail (Ed25519) | src/core/evidence-chain.mjs |
| Neurodivergent leadership | NAB with co-equal authority | frameworks/governance/Governance_Framework.md |
| Break-glass policy | TLC_BYPASS_REASON required | src/git-hooks/pre-commit.mjs |

---

## MAP

The Map function identifies and categorizes AI risks.

| NIST Requirement | TLC Implementation | Location |
|---|---|---|
| Context and use case scoping | Domain constitution scoping (CEM) | modules/constitution-engineering/ |
| Stakeholder identification | NAP profiles, neurodivergent participant matrix | frameworks/research/CAMM_Protocol.md |
| AI risk categories | Constitutional invariants (I1-I16) | SOCIOTECHNICAL_CONSTITUTION.md |
| Bias and fairness risks | Eight Wonders I1-I8 (AHI invariants) | modules/eight-wonders-constitution/ |
| Cognitive safety risks | HCIP, CLV metric, Article VII Core Constitution | constitutions/core/TLC_Core_Constitution_v1.0.md |
| Alignment risk | DTCI, trust calibration, alignment faking safeguards | frameworks/research/CALT_Theory.md |

---

## MEASURE

The Measure function analyzes and assesses AI risks.

| NIST Requirement | TLC Implementation | Location |
|---|---|---|
| Performance metrics | CCI, DTCI, SCS, AI, CLV, TCM, PO, CI | frameworks/research/Neurodivergent_Success_Metrics.md |
| Continuous monitoring | CHAE 24/7 audit / weekly audit buddy | frameworks/governance/Governance_Framework.md |
| Red-teaming | Adversarial chaos injection, 10 published prompts | instruments/chaos-tabletop-checklist.md |
| Bias evaluation | Probe-gate + AHI probe analysis | probe-gate/ |
| Explainability | Narrative-First (Article VIII), upstream invariant primacy | constitutions/core/ |
| Reproducibility | Pre-registered analysis plan, open-source code | frameworks/publication/ |

---

## MANAGE

The Manage function prioritizes and addresses AI risks.

| NIST Requirement | TLC Implementation | Location |
|---|---|---|
| Incident response | Halt Authority, repair actions (Article I) | modules/tlc-runtime/paper/ |
| Risk treatment | Constitutional invariant enforcement | tlc-sl/src/enforce.mjs |
| Rollback capability | Rollback evidence required before deploy (I13) | src/git-hooks/pre-commit.mjs |
| Residual risk documentation | EVIDENCE_GAP state (v1.1 roadmap) | frameworks/validation/ |
| Communication to stakeholders | Public audit trail, Tier-1 Compliance Reports | evidence/, frameworks/validation/ |
| Continuous improvement | Tier-1 Validation Loop, OSSC governance | frameworks/validation/Tier1_Validation_Framework.md |

---

## NIST AI 600-1 (Generative AI)

| NIST AI 600-1 Concern | TLC Implementation |
|---|---|
| Confabulation / hallucination | Truth-State enforcement: PROPOSED ≠ VERIFIED |
| Harmful bias | AHI impossibility invariant, Eight Wonders I1-I8 |
| Data privacy | Article X Core Constitution, no raw data outside browser |
| Human oversight | CHAE binding authority, Halt Authority |
| Transparency | Narrative-First, evidence chain public |
| Dual use | Scope Lock (Article X Core Constitution) |

---

## Overall Assessment

The TLC Bootstrapped Pilot addresses all four NIST AI RMF core functions.
The evidence chain, constitutional invariant enforcement, and CHAE governance
mechanism collectively provide a governance architecture that exceeds the
minimum requirements for NIST compliance at the bootstrapped scale.

Full NIST compliance at production scale requires:
- Formal IRB approval
- CHAE at full 24/7 capacity
- Formal red-teaming program
- Published Tier-1 Compliance Reports for each phase
