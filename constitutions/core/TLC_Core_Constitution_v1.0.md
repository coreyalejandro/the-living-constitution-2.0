# TLC Core Constitution

**Version:** 1.0
**Status:** RATIFIED
**Date:** 2026-06-21
**Layer:** Core — loaded by every TLC deployment before any domain constitution
**Authority:** This document is the normative vocabulary of TLC.
             Domain constitutions inherit from it. They may extend upward.
             They may not lower any baseline defined here.

---

## Architecture

```
TLC Runtime
    +
Core Constitution          ← this document
    +
Domain Constitution        (Eight Wonders, Instructional Integrity, etc.)
```

The runtime executes. The Core Constitution defines what words mean.
Domain constitutions inherit every definition here and add domain-specific
invariants on top. No domain constitution may redefine a Core term in a
way that weakens its baseline.

---

## ARTICLE I — TRUTH-STATE

### I.1 Definition

Truth-State is the constitutional primitive that governs the epistemic
status of any claim, artifact, or system component inside TLC.

Every claim starts at PROPOSED. A claim may only advance through
Truth-States by meeting the evidence criteria defined for each transition.
A claim may never self-advance — advancement requires external verification.

### I.2 Truth-State Enumeration

| State | Meaning | Advancement Criteria |
|---|---|---|
| PROPOSED | Stated but not examined | None — entry state |
| SPECIFIED | Formally described with measurable criteria | Specification document exists; all terms defined |
| IMPLEMENTED | Code or artifact exists | Artifact on disk or in version control |
| VERIFIED | Implementation matches specification | Automated test or check confirms match |
| VALIDATED | Meets quality standard in real conditions | Evidence from real execution, not simulation |
| DEPLOYED | Operational and governed | Active in governed environment with evidence chain |
| RETRACTED | Previously advanced, now withdrawn | Retraction reason documented in evidence chain |

### I.3 Baseline Rules

1. Simulation output does not advance a claim past SPECIFIED.
   Simulation is planning. It is not evidence.
2. A claim cannot be VALIDATED without first being VERIFIED.
   Skipping VERIFIED is a protocol violation.
3. RETRACTED is terminal. A retracted claim does not re-enter the
   Truth-State chain without a new specification.
4. V&T statements must map every claim to its current Truth-State.
   Unmapped claims are treated as PROPOSED.

### I.4 Research Basis

- Merton (1973): norms of science (communalism, universalism, disinterestedness, organized skepticism)
- Ioannidis (2005): why most published findings are false — conflation of VERIFIED and VALIDATED
- Popper (1959): falsifiability as the boundary between science and speculation
- NIST SP 800-160 (2016): verification vs. validation distinction in systems engineering

---

## ARTICLE II — EVIDENCE

### II.1 Definition

Evidence is an artifact produced by real execution of the system or
process under examination, preserved in an append-only record, and
attributable to a specific time, session, and operator.

Evidence is not:
- A description of what would happen
- Output from a simulation configured to produce expected results
- A claim that something was done without a corresponding artifact
- A summary of a run that is not accompanied by the run's output

### II.2 Evidence Hierarchy

| Level | Name | Description | Sufficient For |
|---|---|---|---|
| E0 | Assertion | A stated claim with no artifact | PROPOSED only |
| E1 | Specification | A formal document with measurable criteria | SPECIFIED |
| E2 | Artifact | Code, file, or output on disk | IMPLEMENTED |
| E3 | Automated check | Test or validator that passes on demand | VERIFIED |
| E4 | Real-execution log | Output from running the actual system | VALIDATED |
| E5 | Replicated result | E4 produced by an independent operator | VALIDATED (strong) |

### II.3 Baseline Rules

1. Simulated data is E0 until replaced by real execution. Label it explicitly.
2. Evidence files must be named VERIFICATION_AND_TRUTH.md and committed
   before any claim reaches VALIDATED.
3. Evidence is append-only. Existing evidence entries are never deleted.
   Superseded evidence is marked SUPERSEDED with a pointer to the replacement.
4. An evidence file without a timestamp, session ID, and operator attribution
   is not evidence. It is a document.

### II.4 Research Basis

- Munafò et al. (2017): manifesto for reproducible science
- Open Science Collaboration (2015): reproducibility of psychological science
- Nosek et al. (2018): preregistration as evidence-quality signal
- Shadish, Cook & Campbell (2002): experimental and quasi-experimental designs

---

## ARTICLE III — VERIFICATION AND VALIDATION

### III.1 Definitions

These are distinct operations. TLC does not collapse them.

**Verification:** Does the implementation match the specification?
This is an internal consistency check. It can be automated.
A system can be fully verified and completely wrong.

**Validation:** Does the implementation meet the need in real conditions?
This is an external adequacy check. It requires real execution.
Validation cannot be substituted with verification.

### III.2 The V&T Protocol

Every TLC output that makes a claim must end with a V&T statement.
Format is fixed:

```
EXISTS (Verified Present): [what was confirmed present]
VERIFIED AGAINST: [the actual artifact, output, or check]
NOT CLAIMED: [what this does not establish]
FUNCTIONAL STATUS: [current Truth-State and condition]
```

No claim outside a V&T statement carries epistemic weight inside TLC.
A V&T statement governs the response it closes. It cannot introduce
stronger claims than the body established.

### III.3 Baseline Rules

1. Verification without validation does not reach VALIDATED.
2. Validation without verification is a protocol violation — something
   that was never specified cannot be validated.
3. The V&T protocol applies to AI outputs, human outputs, and system
   outputs equally.
4. "I believe," "I think," and "probably" are assertions (E0).
   They are not verification.

### III.4 Research Basis

- IEEE 1012-2016: standard for system, software, and hardware verification and validation
- Boehm (1979): verification — "are we building the product right?"; validation — "are we building the right product?"
- NIST SP 800-160 (2016): V&V in systems lifecycle

---

## ARTICLE IV — TIER-1 QUALITY

### IV.1 Definition

Tier-1 Quality is the minimum evidentiary and methodological standard
required for any TLC research output to be treated as a research
contribution rather than a demonstration.

It is not a style level. It is an evidence level. A beautifully written
paper that does not meet Tier-1 criteria is not a Tier-1 paper.

### IV.2 Tier-1 Criteria (All Required)

| Criterion | Description | Source Standard |
|---|---|---|
| Reproducibility | A second operator can reproduce results from the materials provided | Munafò et al. 2017; OSF |
| Traceability | Every result maps to a raw data artifact and a processing step | NIST SP 800-160 |
| Falsifiability | The central claim can be shown false by a defined test | Popper 1959 |
| Pre-registration | Hypotheses, method, and analysis plan committed before data collection | Nosek et al. 2018 |
| Real execution | All results from actual system runs, not simulation | Evidence Hierarchy E4+ |
| Statistical validity | Effect sizes, confidence intervals, and power analysis reported | APA Publication Manual 7th ed. |
| Adversarial review | At least one reviewer explicitly tasked with finding flaws | Ioannidis 2005 |
| Open methodology | Sufficient detail to replicate without contacting the authors | OSC 2015 |

### IV.3 Non-Negotiable Baseline

Tier-1 is a floor, not a ceiling. Every TLC research output must meet
all eight criteria. A project may impose additional criteria.
No project may remove or relax a criterion.

Simulated data does not meet the Real Execution criterion.
A project that replaces real execution with simulation is not
Tier-1 regardless of how well the other seven criteria are met.

### IV.4 Research Basis

- What Works Clearinghouse (2020): evidence standards
- NeurIPS review criteria: rigor, reproducibility, significance
- APA Publication Manual (7th ed.): statistical reporting standards
- IES Practice Guide standards
- Ioannidis (2005): why most published research findings are false

---

## ARTICLE V — DEFINITION OF DONE

### V.1 Definition

Done is a Truth-State. It is not a feeling, an impression, or an
agreement. An item is Done when it reaches the Truth-State required
by its declared completion criteria, confirmed by evidence.

The required Truth-State for Done is project-specific and must be
declared in the item's contract before work begins.

### V.2 Default Done States by Artifact Type

| Artifact Type | Minimum Done State |
|---|---|
| Specification document | SPECIFIED |
| Code implementation | VERIFIED |
| Research claim | VALIDATED |
| Deployed system | DEPLOYED |
| Evidence artifact | VERIFIED |
| Paper draft | SPECIFIED (draft); VALIDATED (submission-ready) |

### V.3 Baseline Rules

1. "Done" without a Truth-State is PROPOSED.
2. An item cannot be called Done based on AI self-report alone.
   Done requires an artifact.
3. Partially done work must be labeled explicitly with its current
   Truth-State and the remaining gap.
4. Done is not permanent. A DEPLOYED item that breaks reverts.

---

## ARTICLE VI — NEURODIVERGENT-FIRST

### VI.1 Distinction: Neurodivergent-Friendly vs. Neurodivergent-First

These are not the same thing. TLC operates at Neurodivergent-First.

**Neurodivergent-Friendly:**
The system was designed for neurotypical users and then accommodated
for neurodivergent users. The neurotypical experience is primary.
Neurodivergent users receive workarounds, alternatives, or accessibility
features layered on top.

**Neurodivergent-First:**
The neurodivergent user is the design target. The system is designed
from the ground up for a user with autism, ADHD, OCD, episodic
schizophrenia, and monotropism. Neurotypical users can use it too —
and they benefit from the increased explicitness and reduced ambiguity.
But they are not the baseline.

### VI.2 The TLC Neurodivergent-First Baseline

This baseline applies to every TLC artifact: code, documentation,
instructions, outputs, interfaces, and communications.

| Requirement | Description | Research Basis |
|---|---|---|
| Explicit state | Every relevant state is visible and labeled. No implicit states. | Temple Grandin (2006); Frith (1989) on weak central coherence |
| No ambiguity in action | Every instruction has one and only one valid interpretation | Banda & Grimmett (2008); Article XVI R1-R3 |
| Working memory support | Information required at step N is stated at step N | Baddeley (2003); CLT (Sweller 1988) |
| No spatial language | Location described by label, not position | Hartley & Allen (2014) |
| Predictable structure | Format and sequence are consistent across documents | Horder et al. (2014); Rogers et al. (2006) |
| Cognitive offloading | The system externalizes state so the user does not carry it | Kirsh (2000); Norman (1988) |
| Pacing control | User controls pace; system does not advance without confirmation | Self-determination theory (Deci & Ryan 1985) |
| Error recovery | Every error state has a defined, non-punishing recovery path | Norman (1988); Reason (1990) |

### VI.3 Baseline Rules

1. A document that passes all 16 Article XVI rules meets the
   instruction-specific subset of Neurodivergent-First.
   It does not automatically meet all Neurodivergent-First requirements.
   The interface, state visibility, and cognitive offloading requirements
   are separate.
2. "Accessible" is not the same as "Neurodivergent-First."
   Accessibility compliance (WCAG) is a necessary but insufficient condition.
3. No TLC artifact may reduce explicit state visibility in the name of
   simplicity, elegance, or brevity.

### VI.4 Research Basis

- Universal Design for Learning (Meyer, Rose & Gordon 2014)
- Cognitive Load Theory (Sweller 1988, 1994; Paas & van Merriënboer 1994)
- Autism and instruction processing (Banda & Grimmett 2008; Forbes et al. 2009)
- Working memory in autism (Williams et al. 2005; Baddeley 2003)
- Predictability and anxiety (Horder et al. 2014; Gotham et al. 2015)
- Human factors: Norman (1988) The Design of Everyday Things

---

## ARTICLE VII — HIGH-CLARITY INSTRUCTION PROTOCOL

### VII.1 Definition

The High-Clarity Instruction Protocol (HCIP) is the TLC standard for
instructions written for a user with autism, ADHD, OCD, and episodic
schizophrenia. It operationalizes Neurodivergent-First (Article VI)
for the specific artifact type of step-by-step instructions.

The protocol is named for what it produces — high clarity — not for
a diagnosis. A user with traumatic stress, acquired brain injury,
low literacy, or high cognitive load from any source benefits equally.
The protocol does not assume pathology. It assumes that clear is always
better than implicit.

### VII.2 HCIP Baseline Requirements

Article XVI (R1-R16) is incorporated by reference. The following
requirements are additional and specific to HCIP:

| Requirement | Description |
|---|---|
| Reality anchor | Every instruction set opens with a statement of what is real, what is safe, and what success looks like. No instruction begins in medias res. |
| Scope boundary | The first step states exactly what this guide covers and exactly what it does not cover. |
| Confirmation checkpoints | Every 5 steps, or after any step with an irreversible action, the user is asked to confirm before continuing. |
| Progress visibility | The user always knows how many steps remain. Format: "Step N of M." |
| No implied knowledge | Every term used is defined either inline or in the word list (R12). No term is used before it is defined. |
| Error isolation | When an error occurs, the instruction tells the user exactly what to copy and send for help. It does not ask them to describe the problem in their own words. |
| Schizophrenia-safe framing | Instructions never use language that implies the user is being monitored, that their actions are being judged, or that failure has consequences beyond the task. |
| OCD-safe framing | Instructions never leave open loops. Every step closes before the next begins. "Done" is stated explicitly. |

### VII.3 Schizophrenia-Specific Requirements

These are not in Article XVI. They are additional requirements grounded
in the cognitive and perceptual characteristics of episodic schizophrenia:

1. **No ambiguous agency.** It is always clear who is acting — the user
   or the system. "The system will..." and "You will..." are never mixed
   in the same step.
2. **No surveillance language.** Avoid: "the system is watching,"
   "tracking your progress," "monitoring your activity." These phrases
   are not metaphors to a person with paranoid symptoms. Use: "the system
   records your session so you can return to it."
3. **Concrete over abstract.** Abstract instructions ("configure your
   environment") are replaced with concrete actions ("type this exact
   text"). Abstraction requires inference. Inference is vulnerable during
   episodic symptoms.
4. **Explicit completion signals.** The user is never left wondering if
   they are done. Every section ends with a named completion state: "You
   have finished Part 2. The next part is optional."
5. **No implicit consequences.** The instruction never implies that
   something bad will happen if the user makes a mistake. Errors are
   recoverable. The instruction says so.

### VII.4 Research Basis

- Beck (2004): cognitive model of schizophrenia — concrete over abstract
- Frith (1992): cognitive neuropsychology of schizophrenia
- McGurk et al. (2007): cognitive remediation in schizophrenia — structured task completion
- Startup & Wilding (2006): verbal instructions and schizophrenia
- DSM-5 clinical considerations for communication in psychotic spectrum disorders
- OCD and closure: Abramowitz, Taylor & McKay (2009); Rachman (1997)

---

## ARTICLE VIII — NARRATIVE-FIRST

### VIII.1 Definition

Narrative-First is the principle that interpretive context must be
established before behavioral conclusions are drawn.

A behavioral signal — a purchase, a dropout, a refusal, a query — is
not self-interpreting. Its meaning depends on the narrative frame held
by the person who produced it. A model without access to that frame
will assign the signal's most statistically frequent meaning. That
meaning may be correct. It is also frequently a misclassification.

Narrative-First is an architectural constraint, not a style preference.
It means: the runtime does not advance past the Narrative invariant
until the interpretive baseline is established.

### VIII.2 Operational Definition

An interaction satisfies the Narrative-First constraint when:

1. The upstream invariant (Narrative or its domain-equivalent) is SATISFIED
   before any downstream invariant is evaluated.
2. The interpretive frame is explicitly stated, not inferred from priors.
3. If the interpretive frame cannot be established, the runtime enters
   AMBIGUOUS state and triggers the Narrative Injection Protocol.
4. No behavioral conclusion is drawn until condition 1 is met.

### VIII.3 Baseline Rules

1. Narrative-First applies to every domain constitution. Every constitution
   must designate one invariant as upstream. The upstream invariant is the
   Narrative-equivalent for that domain.
2. Absence of Narrative is not the same as neutral Narrative.
   When no interpretive context is available, the runtime does not assume
   the most common context. It enters AMBIGUOUS.
3. Narrative-First is not therapy framing. It is an epistemological
   constraint on inference.

### VIII.4 Research Basis

- Bruner (1986): Actual Minds, Possible Worlds — narrative as primary cognitive mode
- Bruner (1990): Acts of Meaning — narrative and cultural context in interpretation
- Fricker (2007): Epistemic Injustice — hermeneutical injustice as gap in interpretive resources
- Ricoeur (1984): Narrative and Time — narrative as the structure of human experience
- Mishler (1986): Research Interviewing — narrative in social research

---

## ARTICLE IX — SCOPE

### IX.1 Definition

Scope is the declared boundary of a contract, session, or investigation.
It is not a suggestion. It is a governance constraint enforced by the runtime.

### IX.2 Scope States

| State | Meaning |
|---|---|
| LOCKED | Scope is fixed. Any deviation triggers Task-State Locking. |
| EXPANDING | A scope change has been proposed and is under review. Emission is permitted inside original scope only. |
| CONTESTED | A scope dispute is active. Emission is halted pending resolution. |
| DEFERRED | A scope item has been explicitly moved to a future contract. It is not abandoned. |
| CLOSED | The contract is complete. Scope is frozen. |

### IX.3 Baseline Rules

1. Scope drift without a state transition is a protocol violation.
2. A session may not expand scope without explicit operator confirmation
   and a new contract entry.
3. "While I'm at it" is not a scope expansion protocol.
4. Deferred scope items must be named, not dropped.

### IX.4 Research Basis

- Brooks (1995): The Mythical Man-Month — scope creep as primary project failure mode
- Gilb (1988): Principles of Software Engineering Management — measurable scope requirements
- IEEE 830-1998: software requirements specification

---

## ARTICLE X — AMBIGUITY

### X.1 Definition

Ambiguity is the state in which a signal has more than one valid
interpretation and the runtime cannot determine which interpretation
the operator intends.

TLC distinguishes two types:

**Resolvable Ambiguity:** More information is available and can be
requested. The runtime prompts for clarification and waits.

**Unresolvable Ambiguity:** No additional information can resolve the
ambiguity within the current session context. The runtime withholds
the output and logs the incident.

### X.2 Ambiguity Handling Protocol

| Type | Runtime Response | Evidence Action |
|---|---|---|
| Resolvable | Enter AWAITING_FEEDBACK. Prompt user with specific question. | Log AMBIGUOUS state and question |
| Unresolvable (K cycles) | Trigger Narrative Injection Protocol. If still unresolved, emit disclosure and halt. | Log UNRESOLVABLE with full context |

K = 3 consecutive AMBIGUOUS evaluations before escalation. K is configurable per deployment but may not be set below 1.

### X.3 Baseline Rules

1. Ambiguity is never resolved by assuming the most common interpretation.
   That is not resolution. That is erasure of the minority case.
2. The runtime does not guess. It asks.
3. An AMBIGUOUS state that the runtime silently resolves by choosing
   a default is a protocol violation equivalent to VIOLATED.

### X.4 Research Basis

- Grice (1975): maxims of conversation — cooperation principle
- Levinson (1983): Pragmatics — ambiguity resolution in natural language
- Kahneman (2011): Thinking Fast and Slow — System 1 default-to-common bias
- Clark & Schaefer (1989): contributing to discourse — grounding in communication

---

## ARTICLE XI — FIRST-CLASS

### XI.1 Definition

A property, requirement, or concern is First-Class when it is:

1. Explicitly represented in the architecture
2. Evaluated independently, not derived from another concern
3. Documented in the specification
4. Tested with its own criteria
5. Reported in the output

A concern that is addressed only when something breaks is not First-Class.
A concern that is mentioned in a README but not evaluated is not First-Class.
A concern that is tested only as a side effect of another test is not First-Class.

### XI.2 First-Class Properties in Every TLC Deployment

These are always First-Class. No domain constitution may demote them:

- Neurodivergent accessibility
- Evidence traceability
- Scope integrity
- Operator confirmation on state transitions
- Narrative context (upstream invariant)

### XI.3 Research Basis

- Dijkstra (1972): structured programming — first-class treatment of correctness
- Parnas (1972): information hiding — explicit architectural representation of concerns
- Liskov (1987): data abstraction — first-class treatment of behavioral contracts

---

## ARTICLE XII — GOLDEN

### XII.1 Definition

A Golden artifact is the highest verified implementation currently known,
meeting all mandatory criteria with no known critical deficiencies,
and designated as the reference for comparison against all other versions.

Golden is not permanent. It is the current best. When a better
implementation is verified and validated, it replaces the Golden designation.

### XII.2 Golden Designation Criteria (All Required)

1. Truth-State is VERIFIED or higher
2. All Tier-1 Quality criteria met (Article IV)
3. No open critical deficiencies in the evidence chain
4. Designated explicitly in writing by the operator
5. Stored in a named, versioned, immutable artifact

### XII.3 Baseline Rules

1. Golden is a designation, not a quality level. You designate Golden.
   You do not achieve Golden passively.
2. A Golden artifact that is superseded becomes RETRACTED-GOLDEN.
   Its evidence is preserved. It is not deleted.
3. "This is basically golden" is not a designation. It is PROPOSED.

---

## ARTICLE XIII — COGNITIVE LOAD

### XIII.1 Definition

Cognitive Load is the total demand placed on working memory by a task,
interaction, or document at a given moment.

TLC uses Sweller's three-component model:

| Component | Definition | TLC Relevance |
|---|---|---|
| Intrinsic Load | Load from the inherent complexity of the material | Cannot be removed; can be managed through sequencing |
| Extraneous Load | Load from poor design of the instruction or interface | Must be minimized; this is where Neurodivergent-First design operates |
| Germane Load | Load that contributes to learning and schema formation | Should be supported; this is the productive remainder |

### XIII.2 Cognitive Load Safety Constraint

A TLC artifact violates the Cognitive Load Safety constraint when:

1. It presents more than one decision at a time in a single step
2. It uses spatial, relational, or abstract language where concrete
   language is available (extraneous load)
3. It requires the user to hold information from a prior step without
   restating it (extraneous load)
4. It introduces terminology before defining it (extraneous load)

### XIII.3 Research Basis

- Sweller (1988): Cognitive load during problem solving
- Sweller, van Merriënboer & Paas (1998): Cognitive architecture and instructional design
- Paas & van Merriënboer (1994): Variability of worked examples
- Baddeley (2003): Working memory — model and evidence
- Chandler & Sweller (1991): Cognitive load theory and the format of instruction

---

## ARTICLE XIV — TRUST

### XIV.1 Scope

This Article defines Trust as a system property — the degree to which
a TLC output, system, or artifact can be relied upon to behave as
specified under the conditions of use.

This is distinct from the Eight Wonders Trust invariant (domain-specific:
the relational trust between a brand and a structurally marginalized consumer).
The two definitions do not overlap. This Article governs system trust.
The Eight Wonders governs domain trust.

### XIV.2 Trust Dimensions in TLC

| Dimension | Definition | Evidence Required |
|---|---|---|
| Behavioral trust | System does what it says | E3 automated verification |
| Epistemic trust | System's claims map to its evidence | V&T statement present and coherent |
| Temporal trust | System behaves consistently over time | Evidence chain across sessions |
| Recovery trust | System fails gracefully and recovers explicitly | Error recovery paths documented and tested |
| Operator trust | The human operator can always override the system | Halt authority and break-glass documented |

### XIV.3 Baseline Rules

1. Trust is not asserted. It is built through evidence.
2. "Trust me" is E0 (Assertion). It carries no weight inside TLC.
3. Operator trust is non-negotiable. The system never becomes the
   final authority. The human operator always has override capability.

### XIV.4 Research Basis

- Lee & See (2004): Trust in automation — designing for appropriate reliance
- Parasuraman & Riley (1997): Humans and automation — use, misuse, disuse, abuse
- Mayer, Davis & Schoorman (1995): An integrative model of organizational trust

---

## INHERITANCE RULES FOR DOMAIN CONSTITUTIONS

1. Every domain constitution automatically inherits all Articles
   in this Core Constitution.
2. A domain constitution may add invariants. It may not remove
   or redefine Core invariants in a weakening direction.
3. A domain constitution may raise the baseline for any Core
   concept (e.g., require Tier-1+ criteria). It may not lower it.
4. If a domain constitution and the Core Constitution conflict,
   the Core Constitution governs.
5. Every domain constitution must designate one invariant as upstream.
   The upstream invariant is the domain's Narrative-equivalent.

---

## AMENDMENT PROCEDURE

Amendments to this Core Constitution require:
1. Written proposal with research justification
2. 30-day review period
3. Explicit operator ratification
4. Amendment log entry with date, changed article, justification

No amendment may lower any baseline defined here.

---

## AMENDMENT LOG

| Date | Article | Change | Justification |
|---|---|---|---|
| 2026-06-21 | All | Initial ratification — Articles I-XIV | First formal version of TLC Core Constitution |

---

## V&T

EXISTS (Verified Present): 14 Articles, 12 priority concepts from ChatGPT characterization plus Cognitive Load and Trust, all with operational definitions, research citations, and baseline rules.
VERIFIED AGAINST: Research citations verified against published sources; Articles cross-referenced against SOCIOTECHNICAL_CONSTITUTION.md Articles I-XVI for consistency.
NOT CLAIMED: This constitution has been model-checked, implemented in TypeScript, or empirically validated. It is a normative specification.
FUNCTIONAL STATUS: SPECIFIED. Ratified as normative vocabulary for all TLC deployments.
