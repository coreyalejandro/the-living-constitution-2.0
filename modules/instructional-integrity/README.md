# Instructional Integrity Constitution

**Module ID:** INSTRUCTIONAL-INTEGRITY
**Version:** 0.1 (Domain Reconnaissance + Invariant Hypothesis)
**Status:** CEM Phase 0-1 — Pre-calibration
**Layer:** 3 — Domain Constitutions
**Depends on:** TLC Runtime v1.0, Constitution Engineering Methodology v0.1

---

## What This Is

The Instructional Integrity Constitution is the second TLC constitution.
It governs learning system behavior to preserve learner agency, enforce
cognitive load safety, and prevent instructional drift.

This constitution connects TLC to Quantic research. It is not a new project.
It is the same runtime, loaded with a different domain theory.

When this constitution runs inside TLC alongside Eight Wonders, the platform
generalizability claim is empirically established.

---

## Domain Reconnaissance (Phase 0)

**Domain:** Instructional systems — LLM-powered learning platforms, popup
interventions, formative feedback loops, mastery-gated progression.

**Rights-holders:** Learners. Specifically neurodivergent learners, low-income
learners, and learners whose cognitive profiles are underrepresented in
standard instructional design assumptions.

**Canonical misclassification:** A learner who disengages from an adaptive
popup intervention is classified as low-engagement or low-motivation. The
system does not have access to the interpretive frame: the learner may be
cognitively saturated, may distrust the intervention timing, may have already
mastered the concept, or may be experiencing sensory overload. The model
collapses these distinct states into a single attrition signal.

**Impossibility claim (AHI-equivalent):**
Given (a) a learning model trained on engagement-rate proxies without
representing learner cognitive load states, (b) a task involving a learner
whose attentional profile differs from the training distribution, and (c)
absence of runtime enforcement of instructional invariants, the model will
inevitably produce interventions that embody instructional hermeneutical
injustice — misclassifying learner disengagement as deficit rather than
system failure.

**Upstream layer:** Learner Agency. The interpretive frame that governs all
downstream instructional signals. Without knowing whether the learner has
volitional control over their engagement, no downstream signal is interpretable.

---

## Invariant Hypothesis Set (Phase 1 — Pre-elicitation)

These are hypotheses pending community elicitation and Delphi validation.
They are not finalized invariants. They are the starting point for CEM Phase 1.

### IIA-1: Learner Agency — "Do I have genuine control over this?"
The learner's sense of volitional control over pace, path, and intervention
acceptance. The upstream invariant. Without it, all downstream evaluations
are ambiguous.

**Upstream designation:** Yes. Equivalent to Narrative in Eight Wonders.

### IIA-2: Cognitive Load Safety — "Is this within what I can actually hold?"
Real-time cognitive saturation detection. The system must not push new
information when working memory is saturated. Failure mode: the popup fires
at maximum cognitive load, producing learned helplessness rather than mastery.

### IIA-3: Formative Feedback Obligation — "Does the feedback tell me something I can act on?"
Feedback must be actionable and timely. The runtime enforces that feedback
is not withheld pending performance gates, and that feedback content maps to
the learner's current state rather than aggregate population norms.

### IIA-4: Mastery Gate — "Am I ready for the next thing, or is the system moving me anyway?"
Progression must not occur without evidence of mastery. The runtime enforces
that a mastery signal exists before advancing. Failure mode: the system
moves the learner to prevent disengagement metrics from degrading, not because
the learner is ready.

### IIA-5: Retention Fidelity — "Will this still be there when I need it?"
The learning event must produce durable retention, not point-in-time performance.
Interventions optimized for session completion rates at the cost of retention
violate this invariant.

### IIA-6: Neurodivergent Access — "Is the interface actually usable by me?"
The instructional interface must not produce cognitive or sensory exclusion
for neurodivergent learners. This maps directly to the Contract Window's
neurodivergent-first design requirements in the TLC Runtime.

### IIA-7: Instructional Drift Prevention — "Is this still about what I came to learn?"
The session must not drift from the learner's stated goal without explicit
consent. Failure mode: adaptive personalization redirects the learner toward
platform engagement metrics rather than the learner's learning objective.

---

## Research Questions (Quantic Research Program)

These are the empirical questions this constitution answers when loaded into TLC
and run against Quantic popup intervention data:

1. Does the popup preserve learner agency (IIA-1)?
2. Does popup timing respect cognitive load state (IIA-2)?
3. Does the popup deliver actionable feedback (IIA-3)?
4. Does progression gate on mastery evidence (IIA-4)?
5. Does the intervention produce durable retention (IIA-5)?
6. Is the interface accessible to neurodivergent learners (IIA-6)?
7. Does adaptive personalization stay aligned with learner goals (IIA-7)?

---

## Constitutional Interface Stub

```typescript
import {
  ConstitutionalInvariant,
  Constitution,
  Context,
  InvariantState,
  RepairAction,
} from '../../src/interfaces/constitutional-invariant';

// Stub — to be completed after CEM Phase 1 elicitation
export class InstructionalIntegrityConstitution implements Constitution {
  id = 'instructional-integrity';
  version = '0.1.0';

  invariants: ConstitutionalInvariant[] = [
    // IIA-1 through IIA-7 — pending calibration
  ];

  getUpstreamInvariant(): ConstitutionalInvariant | null {
    return this.invariants.find(i => i.id === 'IIA-1_LearnerAgency') ?? null;
  }
}
```

Full implementation follows CEM Phase 2 (Formalization) and Phase 3 (Calibration).

---

## Connection to Quantic Research

This constitution is not a new research program. It is a second validation
of the TLC platform.

The Quantic research program already studies:
- popup interventions
- cognitive load
- formative feedback
- mastery learning
- learning retention
- learner agency
- neurodivergent accessibility

Every one of those maps directly to an IIA invariant. The research questions
are already formed. The methodology (TLC Runtime + CEM) is already built.
The only remaining step is invariant calibration from Quantic data.

---

## CEM Status

| Phase | Status |
|---|---|
| Phase 0: Domain Reconnaissance | Complete (this document) |
| Phase 1: Invariant Elicitation | Pending — requires community interviews + Delphi |
| Phase 2: Formalization | Pending Phase 1 |
| Phase 3: Calibration | Pending Phase 2 |
| Phase 4: Deployment | Future |
| Phase 5: Governed Evolution | Future |

---

## Next Steps

1. Complete CEM Phase 1: conduct minimum N=20 learner interviews,
   N=15 instructional design expert Delphi (target α ≥ 0.75)
2. Finalize invariant set from elicitation output
3. Implement `InstructionalIntegrityConstitution` class
4. Calibrate δₖ detection functions against Quantic data
5. Run first validation study: TLC + Instructional Integrity Constitution

---

*V&T:*
*EXISTS (Verified Present): Module scaffold, Domain Reconnaissance (Phase 0), seven invariant hypotheses, constitutional interface stub, research questions, CEM phase status table.*
*VERIFIED AGAINST: Invariants derived from ChatGPT characterization document (Quantic research questions listed verbatim); interface stub compiles against constitutional-invariant.ts.*
*NOT CLAIMED: Invariants are finalized — they are hypotheses pending Phase 1 elicitation.*
*FUNCTIONAL STATUS: CEM Phase 0 complete. Phase 1 (elicitation) is the immediate next step.*
