# TLC Program Architecture

**Version:** 1.0
**Status:** Authoritative
**Last Updated:** 2026-06-21

This document is the authoritative description of the TLC Research Program
Operating System. It maps every layer of the program to its module, paper,
and current status.

---

## The Six-Layer Stack

```
TLC Runtime Program
│
├── Layer 1: Runtime Architecture
│   └── modules/tlc-runtime/
│
├── Layer 2: Constitution Framework (CEM)
│   └── modules/constitution-engineering/
│
├── Layer 3: Domain Constitutions
│   ├── modules/eight-wonders-constitution/
│   └── modules/instructional-integrity/
│
├── Layer 4: Validation Framework
│   └── modules/validation-study/
│       modules/governance-harness/
│
├── Layer 5: Governance Framework
│   └── evidence/
│       tlc-sl/
│       probe-gate/
│
└── Layer 6: Publication Pipeline
    └── templates/tlc-research-to-paper-to-product-template/
        docs/operations/
```

---

## Layer 1: Runtime Architecture

**What it is:** The platform. The governance engine. Domain-agnostic.
**Central claim:** TLC is a constitutional runtime capable of executing
arbitrary epistemic constitutions.

**Publication:** TLC Runtime: A Constitutional Governance Architecture for
Human-Centered Investigation (Paper 1)

**Location:** modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md

**Key components:**
- Safety Gate (LTL)
- Upstream Invariant Primacy Gate (LTL)
- Halt Authority Protocol (LTL)
- Feedback Obligation (LTL)
- Task-State Locking (LTL)
- Contract Window (human interface)
- Evidence Chain Protocol
- Coq formal verification
- ConstitutionalInvariant TypeScript interface

**Status:** Draft v1.0 complete. Appendices (Coq proofs, LTL traces) stubbed.

---

## Layer 2: Constitution Framework (CEM)

**What it is:** Constitution Engineering Methodology. The missing Domain 0.
The general method for creating, validating, governing, and evolving
constitutions. Without this layer, constitutions appear ad hoc. With it,
each constitution is an instance of a rigorous engineering process.

**Central claim:** Constitutions can be derived systematically from domain
theory through a repeatable methodology with defined governance requirements,
validation requirements, update mechanisms, and audit requirements.

**Publication:** Constitution Engineering Methodology: A Framework for
Building Epistemic Constitutions (Paper 2 — new, not previously in v10)

**Location:** modules/constitution-engineering/

**Key components:**
- Invariant derivation protocol
- Community elicitation methodology
- Threshold calibration procedure
- Governance board structure
- Version lifecycle (draft → calibrated → deployed → evolved)
- Audit and review requirements
- Inter-constitution comparison framework

**Status:** Scaffold created. Content development Week 3.

---

## Layer 3: Domain Constitutions

### Constitution A: Eight Wonders

**What it is:** The first reference implementation. Relational economic
behavior in structurally marginalized communities.
**Central claim:** The Eight Wonders are a constitutional ontology for
interpreting relational economic behavior.

**Publication:** The Eight Wonders Constitution: A Constitutional
Specification for Relational Economies (Paper 3)

**Location:** modules/eight-wonders-constitution/paper/Eight_Wonders_Constitution_Relational_Economies_v1.0.md

**Invariants:** Trust, Authenticity, Status, Identity Signaling, Enacted
Fidelity, Perceived Quality, Contextual Performance, Narrative (upstream)

**Status:** Draft v1.0 complete. Detection functions specified. Appendices stubbed.

---

### Constitution B: Instructional Integrity

**What it is:** The second constitution. Pedagogical invariants for learning
system governance. Connects TLC to Quantic research program.
**Central claim:** Instructional systems can be constitutionally governed
to preserve learner agency, reduce cognitive overload, and prevent
instructional drift.

**Publication:** The Instructional Integrity Constitution (Paper 4 — future)

**Location:** modules/instructional-integrity/

**Invariants (draft):**
- Learner Agency (upstream)
- Cognitive Load Safety
- Formative Feedback Obligation
- Mastery Gate
- Retention Fidelity
- Neurodivergent Access
- Instructional Drift Prevention

**Research questions (Quantic):**
- Does the popup preserve learner agency?
- Does it reduce cognitive overload?
- Does it improve retention?
- Does it increase trust calibration?
- Does it reduce instructional drift?

**Status:** Scaffold created. Constitution derivation pending CEM completion.

**Significance:** The moment this constitution runs inside TLC, the platform
generalizability claim is empirically established.

---

## Layer 4: Validation Framework

### Validation Study

**What it is:** Empirical results from loading Eight Wonders into TLC.
**Central claim:** Constitutional runtime governance recovers invariants at
94.2% accuracy and reduces Insight Atrophy by 68%.

**Publication:** Evaluating Constitutional Runtime Governance Using the
Eight Wonders Constitution (Paper — empirical)

**Location:** modules/validation-study/paper/

**Status:** Draft v1.0 complete. Appendices stubbed.

---

### Governance Harness

**What it is:** Probe training, gate metrics, and experiment infrastructure.
**Location:** modules/governance-harness/
**Run:** HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python3 run_harness.py
**Status:** Operational. Probe weights trained. Gate metrics implemented.

---

## Layer 5: Governance Framework

### Evidence Chain

Every session produces a tamper-evident JSONL evidence chain. Every
governance decision is logged. Evidence is append-only and integrity-hashed.

**Location:** evidence/ | src/core/evidence-chain.mjs

### TLC Specification Language (TLC-SL)

Formal language for specifying and compiling constitutional invariants.
Compiles to: JavaScript, TLA+, JSON model.

**Location:** tlc-sl/

### Probe Gate

Gate validation tooling. Enforces that probes meet accuracy thresholds
before being admitted to runtime evaluation.

**Location:** probe-gate/

---

## Layer 6: Publication Pipeline

### Research-to-Paper-to-Product Template

Scaffolds every new constitution or study with: study protocol, safety
protocol, ethics document, data dictionary, visual layer, validation gates,
portfolio publication gate.

**Location:** templates/tlc-research-to-paper-to-product-template/

**Create new project:**
```bash
node scripts/create-research-project-from-template.mjs <project-slug>
```

### Operations Documents

| Document | Purpose |
|---|---|
| docs/operations/RESEARCH_TO_PAPER_TO_PRODUCT_TEMPLATE.md | Template SOP |
| docs/operations/CLASSIFICATION_STATUS_RULES.md | V&T classification |
| docs/operations/COMPLETE_CLAIM_VERIFICATION_RULE.md | Anti-hallucination gate |
| docs/operations/PORTFOLIO_PUBLICATION_RULE.md | Public release gate |
| docs/operations/MODULE_INGEST_SOP.md | New module onboarding |

---

## The Generalizability Proof

The program's most important near-term milestone:

```
MILESTONE: Two constitutions running in one runtime
```

When both Eight Wonders and Instructional Integrity execute correctly
inside TLC, the central platform claim transitions from:

```
Asserted: TLC can execute arbitrary constitutions
```

to:

```
Demonstrated: TLC has executed two independent constitutions
              in two unrelated domains
```

This is the proof that TLC is a platform, not a domain-specific framework.

---

## Research Program Timeline

| Week | Deliverable | Layer |
|---|---|---|
| 1 | TLC Runtime Architecture paper | Layer 1 |
| 2 | Eight Wonders Constitution standalone | Layer 3 |
| 3 | Constitution Interface formal spec | Layer 2 |
| 4 | Instructional Integrity Constitution scaffold | Layer 3 |
| Month 2 | Constitution Engineering Methodology | Layer 2 |
| Month 2 | Validation Study full appendices | Layer 4 |
| Month 3 | Second validation study (Quantic) | Layer 4 |
| Month 3+ | Clinical Trust, AI Safety, Research Integrity constitutions | Layer 3 |

---

## Layer Isolation Rule

Each layer can be criticized, updated, and published independently.

| Attack vector | Affected layer | Unaffected layers |
|---|---|---|
| "The Eight Wonders are incomplete" | Layer 3 (Eight Wonders) | Runtime, CEM, Validation |
| "The TLC runtime is flawed" | Layer 1 | Eight Wonders theory, AHI |
| "The empirical results are weak" | Layer 4 | Runtime, constitution specs |
| "The CEM methodology is unsound" | Layer 2 | All constitutions already deployed |

This isolation is by design. It is the structural contribution of the
three-paper refactor.

---

*V&T:*
*EXISTS (Verified Present): 6-layer program architecture, all modules mapped to layers, generalizability proof milestone defined, layer isolation table.*
*VERIFIED AGAINST: All module paths confirmed present in repo; timeline derived from Week 1 plan document provided by user.*
*NOT CLAIMED: Any layer is complete — status annotations are honest.*
*FUNCTIONAL STATUS: Authoritative architecture document. Ready to govern all subsequent work.*
