# Constitutional Adaptive Learning Theory (CALT)

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Research Framework
**Layer:** 3 — Research Framework
**Date:** 2026-06-21

---

## Theory Statement

Constitutional Adaptive Learning Theory (CALT) proposes that:

> Instructional systems governed by explicit constitutional invariants produce
> measurably superior learning outcomes, trust calibration, and cognitive safety
> for neurodivergent learners — compared to systems without constitutional
> governance — when adaptation is driven by a Neurodivergent-First cognitive
> profile model and validated by a continuous human audit mechanism.

CALT is the theoretical unification of four previously siloed domains:

1. Constitutional AI (Bai et al. 2022; Hadfield-Menell et al. 2016)
2. Cognitive Load Theory (Sweller 1988; Paas et al. 2003)
3. Universal Design for Learning (CAST 2018)
4. Trust Calibration in Human-AI Interaction (Lee & See 2004; Hancock et al. 2011)

---

## Core Constructs

### Constitutional Compliance Index (CCI)
A continuously audited metric (0.0 – 1.0) measuring the degree to which
a system's runtime behavior conforms to its governing constitution.

- CCI = 1.0: all constitutional invariants satisfied in the current session
- CCI < 0.8: halt-eligible state; CHAE notified
- CCI = 0.0: constitutional collapse; session terminated

Operationalization: CCI is computed from the evidence chain. Every invariant
check produces a signed entry. CCI = (passing checks) / (total checks) per
session window.

### Neurodivergent Adaptation Profile (NAP)
A participant-owned cognitive profile that drives system adaptation.

Fields:
- cognitive_load_sensitivity: low | medium | high
- preferred_modality: text | voice | visual | multimodal
- pacing_preference: self_paced | timed | flexible
- sensory_profile: standard | low_stimulation | high_contrast
- communication_style: literal | narrative | structured
- executive_function_support: minimal | moderate | full

NAP is participant-editable at any time. Profile ownership is a
Neurodivergent Success Metric (see instruments/).

### Dynamic Trust Calibration Index (DTCI)
Measures alignment between a participant's expressed confidence and actual
performance, tracked over time.

DTCI = 1 - |expressed_confidence - actual_correctness|

A well-calibrated participant has DTCI → 1.0.
Over-trust: DTCI drops when confidence > correctness.
Under-trust: DTCI drops when confidence < correctness.

### Constitutional Adaptive Learning (CAL) Loop

```
Constitutional Invariant Check
        ↓
NAP-Driven Adaptation
        ↓
Instructional Delivery
        ↓
Learning Outcome Measurement
        ↓
DTCI Update
        ↓
CCI Update
        ↓
Evidence Chain Append
        ↓
CHAE Audit
        ↓ (feedback)
Constitutional Invariant Check
```

---

## Testable Hypotheses

**H1 (CCI → Outcomes):** Higher CCI scores predict better learning outcomes
(β > 0, p < .05, controlling for prior knowledge and cognitive profile).

**H2 (NAP → Cognitive Load):** Participants whose NAP is actively matched
by the system report lower cognitive load variance than those with static
system configurations.

**H3 (DTCI → Trust):** Constitutional governance improves DTCI convergence
rate compared to ungovernered adaptive systems.

**H4 (Neurodivergent-First → Autonomy):** Neurodivergent participants in
NAB-governed studies report higher Autonomy Index scores than those in
standard accessibility-accommodated conditions.

**H5 (Generalizability):** CALT effects replicate across ≥2 distinct domain
constitutions (Eight Wonders + Instructional Integrity) with no statistically
significant interaction between constitution and outcome.

**H8 (Bootstrapping Validity):** Effect sizes from the bootstrapped pilot
(N=10) fall within the 80% confidence interval of full-scale effect sizes,
confirming the pilot as a valid proof-of-concept.

---

## Domain Scope

CALT applies to any TLC-governed instructional or investigative system.
It is not specific to consumer behavior research or educational technology.
It generalizes to any domain where a TLC constitution governs agent behavior.

---

## Truth-State of Each Construct

| Construct | Truth-State | Evidence Needed to Advance |
|---|---|---|
| CCI definition | SPECIFIED | Implementation in evidence-chain.mjs + passing tests |
| NAP schema | SPECIFIED | Instrument validation (N≥10) |
| DTCI formula | SPECIFIED | Empirical validation (N≥10) |
| H1–H4 | PROPOSED | Bootstrapped pilot data |
| H5 (generalizability) | PROPOSED | Two-constitution study |
| H8 (bootstrapping validity) | PROPOSED | Bootstrapped pilot + full-scale replication |

---

## References

- Bai, Y. et al. (2022). Constitutional AI: Harmlessness from AI Feedback. Anthropic.
- CAST (2018). Universal Design for Learning Guidelines version 2.2.
- Hancock, P. A. et al. (2011). A meta-analysis of factors affecting trust in human-robot interaction. Human Factors, 53(5), 517-527.
- Lee, J. D., & See, K. A. (2004). Trust in automation. Human Factors, 46(1), 50-80.
- Paas, F. et al. (2003). Cognitive load theory and instructional design. Educational Psychologist, 38(1), 1-4.
- Sweller, J. (1988). Cognitive load during problem solving. Cognitive Science, 12(2), 257-285.
