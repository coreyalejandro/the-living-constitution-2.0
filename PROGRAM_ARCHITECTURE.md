# TLC Program Architecture

**Version:** 2.0
**Status:** Authoritative
**Last Updated:** 2026-06-21
**Integrated:** TALSP Template v4.2 (Research Program OS)

This document is the authoritative description of the TLC Research Program
Operating System. It maps every layer to its module, framework, paper,
instruments, and current Truth-State.

TLC is not a paper. TLC is not a framework specific to consumer behavior.
TLC is a Constitutional Investigation Runtime — a domain-agnostic platform
capable of governing any epistemic investigation under constitutional invariants.

---

## What Changed in Version 2.0

Version 1.0 described the architecture.
Version 2.0 implements the research program OS.

The TALSP Template v4.2 integration adds:

- frameworks/research/   — CAMM, CALT, Neurodivergent Success Metrics, Bootstrapped Pilot
- frameworks/validation/ — Tier-1 Validation Loop, Compliance Report template
- frameworks/governance/ — CHAE, NAB, CGB, OSSC, Audit Trail
- frameworks/publication/ — Publication Pipeline, venue targeting, budget
- instruments/           — m-DTCI, m-NAP, Chaos Tabletop Checklist
- governance/ethics/     — Minimal Ethics Checklist
- governance/nist/       — Bootstrapped NIST AI RMF 1.0 Mapping
- src/interfaces/talsp.ts — TypeScript contracts for all 4.2 constructs
- pre-commit Truth-State Gate — blocks VERIFIED/VALIDATED claims without evidence

Without these layers, TLC governed sessions.
With these layers, TLC governs a research program.

---

## The Six-Layer Stack (v2.0)

```
TLC Runtime Program
│
├── Layer 1: Runtime Architecture
│   ├── modules/tlc-runtime/
│   └── src/interfaces/constitutional-invariant.ts
│
├── Layer 2: Constitution Framework (CEM)
│   ├── modules/constitution-engineering/
│   └── src/interfaces/core-constitution.ts
│
├── Layer 3: Research Framework  [NEW — TALSP v4.2]
│   ├── frameworks/research/CAMM_Protocol.md
│   ├── frameworks/research/CALT_Theory.md
│   ├── frameworks/research/Neurodivergent_Success_Metrics.md
│   ├── frameworks/research/Bootstrapped_Pilot_Protocol.md
│   └── instruments/  (m-DTCI, m-NAP, chaos-tabletop-checklist)
│
├── Layer 4: Validation Framework  [NEW — TALSP v4.2]
│   ├── frameworks/validation/Tier1_Validation_Framework.md
│   ├── frameworks/validation/Tier1_Compliance_Report_Template.md
│   ├── modules/validation-study/
│   └── modules/governance-harness/
│
├── Layer 5: Governance Framework  [NEW — TALSP v4.2]
│   ├── frameworks/governance/Governance_Framework.md
│   ├── governance/ethics/Minimal_Ethics_Checklist.md
│   ├── governance/nist/Bootstrapped_NIST_Mapping.md
│   ├── evidence/  (CHAE, NAB, CGB, OSSC, bypass, truth-state-advances)
│   ├── tlc-sl/
│   └── probe-gate/
│
└── Layer 6: Publication Pipeline  [NEW — TALSP v4.2]
    ├── frameworks/publication/Publication_Pipeline.md
    ├── templates/tlc-research-to-paper-to-product-template/
    └── docs/operations/
```

---

## Research Program Flow

```
Constitution Engineering
        ↓
TLC Runtime
        ↓
Constitution Interface
        ↓
Domain Constitutions
        ↓
CAMM Protocol (mixed-methods design)
        ↓
Bootstrapped Pilot (N=10, $0 infra)
        ↓
Tier-1 Compliance Report v1
        ↓
OSF Preregistration (locked)
        ↓
Megaproject (N=1000, 4 sites)
        ↓
Tier-1 Compliance Report v2
        ↓
Reproducibility Package (Docker + Zenodo)
        ↓
Publication
        ↓
Governance (CHAE + NAB continuous)
        ↓
Constitution Evolution
```

---

## Layer 1: Runtime Architecture

**What it is:** The platform. The governance engine. Domain-agnostic.
**Central claim:** TLC is a constitutional runtime capable of executing
arbitrary epistemic constitutions.
**Truth-State:** SPECIFIED (Coq proof + LTL traces = PROPOSED)

**Publication:** TLC Runtime: A Constitutional Governance Architecture for
Human-Centered Investigation (Paper 1)
**Target venues:** AAAI, NeurIPS, IEEE TSE

**Location:** modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md

**Key components:**
- Safety Gate (LTL)
- Upstream Invariant Primacy Gate (LTL)
- Halt Authority Protocol (LTL)
- Feedback Obligation (LTL)
- Task-State Locking (LTL)
- Contract Window (human interface)
- Evidence Chain Protocol (Ed25519 + Merkle, VERIFIED — 9/9 tests)
- Coq formal verification (PROPOSED)
- ConstitutionalInvariant TypeScript interface (SPECIFIED)

---

## Layer 2: Constitution Framework (CEM)

**What it is:** Constitution Engineering Methodology. The missing Domain 0.
**Central claim:** Constitutions are instances of a rigorous engineering process,
not ad hoc specifications.
**Truth-State:** SPECIFIED

**Publication:** Constitution Engineering Methodology (Paper 2)
**Target venues:** CHI, AAAI, IEEE TSE

**Location:** modules/constitution-engineering/

**Key components:**
- Invariant derivation protocol
- Community elicitation methodology
- Governance board structure
- Version lifecycle (draft → calibrated → deployed → evolved)

---

## Layer 3: Research Framework

**What it is:** The execution methodology for every TLC-governed study.
Introduced by TALSP Template v4.2. Makes TLC research-program-capable.
**Truth-State:** SPECIFIED (all components)

### CAMM Protocol
**File:** frameworks/research/CAMM_Protocol.md
Mixed-methods design with embedded constitutional governance. Quantitative
arm: MSEM + Bayesian sensitivity. Qualitative arm: member checking +
focus groups. Power analysis for N=10 pilot and N=1000 megaproject.

### CALT Theory
**File:** frameworks/research/CALT_Theory.md
Constitutional Adaptive Learning Theory. Unifies Constitutional AI, Cognitive
Load Theory, UDL, and Trust Calibration. Defines five testable hypotheses
(H1-H5) plus bootstrapping validity hypothesis H8.
Key constructs: CCI, NAP, DTCI, CAL Loop.

### Neurodivergent Success Metrics
**File:** frameworks/research/Neurodivergent_Success_Metrics.md
Six first-class outcome metrics: SCS, AI, CLV, TCM, PO, CI.
Full instruments + bootstrapped proxies. Dashboard integration specified.

### Bootstrapped Pilot Protocol
**File:** frameworks/research/Bootstrapped_Pilot_Protocol.md
Zero-budget entry path. N=10, < $1,000, 28-week timeline.
Produces: validated prototype, Tier-1 Compliance Report v1, OSF preregistration,
published minimal instruments, power analysis for megaproject.

### Instruments
**Directory:** instruments/
- m-DTCI: Minimal Dynamic Trust Calibration Index
- m-NAP: Minimal Neurodivergent Adaptation Profile
- chaos-tabletop-checklist.md: 10-category red-teaming exercise

---

## Layer 4: Validation Framework

**What it is:** The continuous self-assessment mechanism that keeps TLC
aligned with Tier-1 institutional standards at every phase.
**Truth-State:** SPECIFIED

### Tier-1 Validation Framework
**File:** frameworks/validation/Tier1_Validation_Framework.md
Tier-1 Readiness Matrix (10 criteria). The Tier-1 Validation Loop
(runs at every phase boundary). Formal verification requirements.
Open science requirements. NIST AI RMF 1.0 mapping summary.

### Tier-1 Compliance Report Template
**File:** frameworks/validation/Tier1_Compliance_Report_Template.md
Published before every phase advance and before every submission.
Immutable once published. Superseded by newer version for same phase.

### Governance Harness
**Location:** modules/governance-harness/
**Run:** HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python3 run_harness.py
**Status:** Operational. Probe weights trained.

---

## Layer 5: Governance Framework

**What it is:** Live, binding governance bodies and public audit infrastructure.
Exceeds standard IRB because it is continuous, not periodic.
**Truth-State:** SPECIFIED (full governance) / BOOTSTRAPPED-EQUIVALENT (pilot governance)

### CHAE — Continuous Human Audit Engine
Real-time IRB with binding authority. Bootstrapped: weekly audit buddy + public
GitHub Issues log. Full scale: 24/7 rotating panel of 5-7.
**File:** frameworks/governance/Governance_Framework.md

### NAB — Neurodivergent Advisory Board
Co-equal decision-making authority. Not advisory. Bootstrapped: 2-3 volunteer peers.
Community Influence metric: ≥50% of protocol decisions must originate from NAB.

### CGB — Community Governance Board
Quarterly strategic review. ≥30% neurodivergent representation.

### OSSC — Open-Source Stewardship Committee
Permanent maintainers of constitutional scripts, instruments, NAP schema.
Bootstrapped: researcher as sole maintainer, community proposals via GitHub Issues.

### Ethics
**File:** governance/ethics/Minimal_Ethics_Checklist.md
Belmont-aligned. Bootstrapped: completes without formal IRB.
Full scale: formal IRB required before Phase 2.

### NIST AI RMF 1.0 Mapping
**File:** governance/nist/Bootstrapped_NIST_Mapping.md
Full GOVERN / MAP / MEASURE / MANAGE mapping including NIST AI 600-1 (GenAI).

### Evidence Chain
Tamper-evident JSONL, Ed25519-signed, Merkle-linked.
**Locations:** evidence/ | src/core/evidence-chain.mjs

### Truth-State Gate (pre-commit)
**File:** src/git-hooks/pre-commit.mjs (installed: .git/hooks/pre-commit)
Blocks commits where any staged file claims Truth-State: VERIFIED or VALIDATED
without a corresponding evidence artifact. Bypass requires [TRUTH-STATE-ADVANCE]
in commit message + logged entry in evidence/truth-state-advances.jsonl.

---

## Layer 6: Publication Pipeline

**What it is:** The ordered path from research results to published artifacts.
**Truth-State:** SPECIFIED

**File:** frameworks/publication/Publication_Pipeline.md

### Six-Paper Stream

| Paper | Title | Target | Truth-State |
|---|---|---|---|
| 1 | TLC Runtime: Constitutional Governance Architecture | AAAI / NeurIPS | SPECIFIED |
| 2 | Constitution Engineering Methodology | CHI / AAAI | SPECIFIED |
| 3 | Eight Wonders Constitution | CHI / FAccT | SPECIFIED |
| 4 | Validation Study (CAMM, N=1000) | CHI / IJAIED | PROPOSED |
| 5 | m-DTCI and m-NAP Minimal Instruments | FOSS/ICSE | SPECIFIED |
| 6 | CALT Theory | IJAIED / Nature HB | SPECIFIED |

### Pre-Submission Gate (All Papers)
- Truth-State = VERIFIED minimum
- Tier-1 Compliance Report published + CHAE approved
- OSF preregistration linked
- NAB co-authorship offer extended (papers using participant data)
- WHITEWASHING check complete
- V&T statement in appendix
- Evidence chain verified

---

## Domain Constitutions

### Constitution A: Eight Wonders

**What it is:** Reference Constitution #1. Relational economic behavior in
structurally marginalized communities. Governs AHI detection.
**Truth-State:** SPECIFIED
**Location:** modules/eight-wonders-constitution/paper/

### Constitution B: Instructional Integrity

**What it is:** Reference Constitution #2. Pedagogical invariants for
learning system governance. Connects TLC to Quantic research.
**Truth-State:** SPECIFIED (scaffold)
**Location:** modules/instructional-integrity/

### Constitution Family Tree (Roadmap)

```
TLC Runtime
│
├── Eight Wonders Constitution
├── Instructional Integrity Constitution
├── Research Integrity Constitution
├── Clinical Trust Constitution
├── AI Safety Constitution
├── Neurodivergent Accessibility Constitution
└── Constitutional Learning Constitution
```

Each is a domain instance of CEM. Each is a separate paper.
Two running constitutions = first generalizability proof.

---

## The Generalizability Proof

```
MILESTONE: Two constitutions running in one runtime
```

When both Eight Wonders and Instructional Integrity execute inside TLC:

```
Asserted: TLC can execute arbitrary constitutions
                    ↓
Demonstrated: TLC has executed two independent constitutions
              in two unrelated domains
```

This is the proof that TLC is a platform, not a domain-specific framework.

---

## Research Program Timeline

| Week | Deliverable | Layer |
|---|---|---|
| 1 | TLC Runtime Architecture paper | Layer 1 |
| 2 | Eight Wonders Constitution standalone | Constitutions |
| 3 | Constitution Interface formal spec | Layer 2 |
| 4 | Instructional Integrity Constitution scaffold | Constitutions |
| 5-8 | Bootstrapped Pilot Phase 1 (Build) | Layer 3 |
| 9-16 | Bootstrapped Pilot Phase 2 (N=10) | Layers 3-5 |
| 17-28 | Open Source Release + Instruments paper | Layer 6 |
| Month 2 | CEM paper | Layer 2 |
| Month 2 | Validation Study full appendices | Layer 4 |
| Month 3 | Second validation study (Quantic) | Layers 3-4 |
| Month 3+ | Clinical Trust, AI Safety, Research Integrity constitutions | Constitutions |
| 36 months | Megaproject ($6.5M-$8M, N=1000) | All layers |

---

## Layer Isolation Rule

Each layer can be criticized, updated, and published independently.

| Attack vector | Affected layer | Unaffected layers |
|---|---|---|
| "The Eight Wonders are incomplete" | Constitutions | Runtime, CEM, Validation |
| "The TLC runtime is flawed" | Layer 1 | Eight Wonders theory, AHI |
| "The empirical results are weak" | Layer 4 | Runtime, constitution specs |
| "The CEM methodology is unsound" | Layer 2 | All constitutions already deployed |
| "The CAMM protocol is insufficient" | Layer 3 | Runtime, constitutions |

---

*V&T:*
*EXISTS (Verified Present): 6-layer program architecture v2.0, all TALSP v4.2 frameworks committed to repo, pre-commit Truth-State gate installed and syntax-verified, TypeScript interfaces written, instruments defined, governance bodies specified.*
*VERIFIED AGAINST: All file paths confirmed present via write_file confirmations. Hook installed at .git/hooks/pre-commit, `node --check` returned SYNTAX OK. Evidence chain 9/9 tests previously verified.*
*NOT CLAIMED: Any PROPOSED item is implemented. Coq proof, LTL traces, N=10 pilot data, formal IRB approval — all remain PROPOSED until executed.*
*FUNCTIONAL STATUS: Research Program OS is SPECIFIED. Bootstrapped Pilot Protocol ready to execute. All 4.2 gaps named in the V&T of the ChatGPT statement are now addressed at SPECIFIED truth-state minimum.*
