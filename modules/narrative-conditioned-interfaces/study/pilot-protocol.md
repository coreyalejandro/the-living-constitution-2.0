# Pilot Study Protocol — Narrative-First Adversarial Loop (NFL)

**Module:** NARRATIVE-CONDITIONED-INTERFACES  
**Version:** 1.0  
**Date:** 2026-06-19  
**truth_status:** PROPOSED — protocol not yet executed; no participants recruited

---

## Purpose

This document is the complete pre-registration-ready protocol for the pilot study
preceding the full 3-condition evaluation (N=240). The pilot runs N=24 over a single
session to validate: (1) IQR inter-rater reliability, (2) NFL protocol fidelity,
(3) task suitability, and (4) session timing.

This is a design document. No participants have been recruited. No data exists.

---

## Research Questions

**RQ1 (Pilot Primary):** Can the NFL protocol be delivered in a single 2-hour
session with acceptable fidelity, measured by protocol adherence rate ≥ 80%?

**RQ2 (Pilot Secondary):** Does the IQR achieve ICC ≥ 0.86 across three blind
expert raters when applied to insights generated in this task?

**RQ3 (Exploratory):** Is there a detectable signal in IQR scores between NFL
and GenAI conditions in a single session (underpowered, exploratory only)?

---

## Design

**Type:** Randomized 2-condition between-subjects pilot  
**N:** 24 (12 per condition)  
**Duration:** Single session, approximately 2 hours per participant  
**Setting:** Remote (videoconference + shared analytical environment)  
**Conditions:**

| Condition | Description | n |
|-----------|-------------|---|
| C2-PILOT | Standard GenAI (GPT-4 class, no NFL constraints) | 12 |
| C3-PILOT | NFL Protocol (structured interface, Stage 1/3/5 human-only) | 12 |

**Why no C1 (Human-Only) in pilot?** C1 requires matched 4-hour workshop
for dosage control. A single-session pilot cannot deliver that condition
with validity. C1 will be included in the full study.

---

## Participant Eligibility

**Inclusion criteria:**

- Age 18 or older
- Self-reported regular use of data analysis tools (≥ 1 analysis task per week)
  for at least 6 months
- Proficient in English (written comprehension required for task)
- Access to a computer with stable internet connection

**Exclusion criteria:**

- Current employment at the research team's affiliated institution
  (conflict of interest)
- Prior exposure to NFL protocol materials (compromises condition naivety)
- Participation in any prior study using these specific analytical tasks

**Recruitment:**

Convenience sample + purposive sampling for practitioner diversity.
Suggested channels: professional networks, data practitioner communities
(e.g., Analyst Collective, data.world community, academic mailing lists).
No payment model specified at pilot stage — this is a design target.

**Target practitioner roles (purposive balance):**
- Data analysts / BI professionals: 8
- Research analysts (market research, UX research, policy): 8
- Graduate students in data-intensive fields: 8

---

## Task Design

All participants analyze the same dataset. The analytical task is designed to
have a non-obvious insight available: the "right answer" is not the first pattern
a practitioner would notice.

**Task:** The Riverside Health Equity Dataset (constructed, no PII)

*Dataset description:* Anonymized aggregate data from three community health
clinics. Variables include: patient care-team transition count (0–5+), refill
adherence rate, zip code pharmacy density index, clinic ID, insurance status
bucket (3 categories), quarter of service. N=847 aggregate rows (clinic × quarter ×
insurance × transition-count bucket). No individual patient records.

*Task prompt (C2-PILOT and C3-PILOT, same text):*

> You have 90 minutes to analyze the Riverside Health dataset provided.
> Your deliverable: a single written insight (150–300 words) that a clinic
> director could act on. The insight should explain a pattern you found and
> why it matters.

*Difference between conditions: the interface, not the task.*

C2-PILOT participants receive: dataset + open AI chat (GPT-4 class) +
a standard text editor. No structural constraints.

C3-PILOT participants receive: dataset + NFL-constrained interface with
5 required stage inputs before the AI is accessible. Stages 1, 3, 5 are
text-entry fields that must be completed before the system advances.
Stage 4 (Adversarial Challenge) is AI-assisted but the rater reviews the
AI challenge and must respond in writing before Stage 5 unlocks.

---

## NFL Interface Specification (C3-PILOT)

The interface is a linear, stage-gated form. Each stage must be completed
before the next is accessible. AI is available only at Stages 2 and 4.

**Stage 1 — Hypothesis (human-only)**

> Before you view any AI analysis: write your initial hypothesis.
> What pattern do you expect to find, and why?
> (Required: 2–5 sentences. AI access unlocks after submission.)

*Interface rule: Stage 2 link is disabled until Stage 1 is submitted.
Submission is final — no editing after Stage 2 opens.*

**Stage 2 — Evidence (AI-assisted)**

> Now explore the data with AI assistance. Use the chat interface below.
> When you have identified your key evidence pattern, summarize it here
> in 3–8 bullet points before proceeding.

*Interface rule: Stage 3 unlocks after evidence summary is submitted.*

**Stage 3 — Invariance (human-only)**

> Before proceeding: check your pattern for stability. Answer each:
> 1. Does this pattern appear in more than one part of the data (e.g.,
>    different clinics, different time periods)?
> 2. Would a colleague looking at this data independently likely reach
>    the same interpretation?
> 3. What is the simplest alternative explanation for this pattern?

*Interface rule: AI chat is disabled during Stage 3. Stage 4 unlocks
after Stage 3 submission.*

**Stage 4 — Adversarial Challenge (AI-assisted)**

> The AI below will challenge your pattern. Read its challenge carefully.
> Then write your rebuttal: either (a) explain why your pattern holds
> despite the challenge, or (b) revise your pattern in light of it.

*Interface rule: AI is pre-prompted to generate 2 adversarial challenges
automatically on stage entry. Participant must respond in writing.
Stage 5 unlocks after rebuttal is submitted.*

**Stage 5 — Refined Insight (human-only)**

> Write your final insight (150–300 words). This is your deliverable.
> The AI chat is disabled. Use only your analysis and your judgment.

*Interface rule: AI is fully disabled at Stage 5. Final submission
exports the Stage 5 text for IQR scoring.*

---

## Measures

### Primary — IQR (Insight Quality Rubric)

Three blind expert raters score each Stage 5 insight using the IQR
(see instruments/iqr-scoring-rubric.md). Raters are blind to condition.
Raters calibrated before the study using the IQR calibration protocol
with anchor exemplars.

**IQR administration:** Stage 5 text is extracted, assigned a random
numeric ID, stripped of any condition markers or identifying language, and
distributed to raters in randomized order. Each rater scores independently
before comparison.

### Secondary — WGCTA Short Form

Watson-Glaser Critical Thinking Appraisal (short form, 40 items) is
administered pre-task and post-task. Time: approximately 20–25 minutes each.

Note for pilot: WGCTA change from a single session is not expected to be
significant or interpretable — the instrument is designed for pre-post
across weeks. The pilot administers it to: (1) establish baseline, (2) test
administration flow, (3) confirm the instrument is feasible in this population.

### Process — Protocol Fidelity Log

For C3-PILOT: automated log of time-on-task per stage, word count per stage
input, number of AI turns in Stages 2 and 4. Fidelity is defined as:

- Stage 1 submitted before any AI access (binary)
- Stage 3 submitted without AI use (binary, verified from log)
- Stage 5 submitted without AI use (binary, verified from log)
- Minimum word counts met per stage (binary)

**Fidelity threshold: ≥ 80% of Stage 1/3/5 submissions comply with
human-only rule.** Below 80%: interface has a compliance failure and must
be redesigned before full study.

### Process — NASA-TLX (Cognitive Load)

6-item NASA Task Load Index administered after the analytical task. Measures
mental demand, physical demand, temporal demand, performance, effort, and
frustration. Used to detect if NFL adds unacceptable cognitive burden that
would confound IQR results.

---

## Session Flow

**Total: approximately 2 hours 15 minutes**

| Time | Activity | Duration |
|------|----------|----------|
| 0:00–0:10 | Welcome, consent, eligibility confirmation | 10 min |
| 0:10–0:20 | WGCTA pre-test (short form) | ~20 min |
| 0:30–0:35 | Task briefing + interface tutorial (condition-appropriate) | 5 min |
| 0:35–2:05 | Analytical task (90 min timed) | 90 min |
| 2:05–2:15 | WGCTA post-test | ~10 min |
| 2:15–2:25 | NASA-TLX + brief exit interview (3 questions) | 10 min |
| 2:25–2:30 | Debrief, next steps, data rights confirmation | 5 min |

**Exit interview questions (3 items, open-response):**
1. Did the interface feel like it supported or blocked your analytical work?
2. Was there a moment where you wanted to skip a step? Which one and why?
3. What was the most useful part of the process?

---

## Statistical Analysis Plan

**RQ1 (Fidelity):** Descriptive — proportion of participants meeting fidelity
threshold per stage. If < 80%: document which stage and revise interface.

**RQ2 (IQR ICC):** Two-way mixed ICC, absolute agreement, average measures,
calculated from the 24 scored insights (3 raters each). Report ICC with 95% CI.
Do not proceed to full study if ICC < 0.75.

**RQ3 (IQR signal, exploratory):** Independent-samples t-test on total IQR
scores, C2-PILOT vs. C3-PILOT. Report Cohen's d. With N=12 per condition, the
study is underpowered for a definitive test (estimated power < 0.40 for d = 0.5).
A null result does not disconfirm the intervention. Report as exploratory only.

**NASA-TLX:** Descriptive by condition. If C3-PILOT shows substantially higher
total workload than C2-PILOT (>20 points on 0–100 scale), flag as a design
concern for full study.

---

## Pilot Gate Conditions

The pilot passes and the full study may proceed if all four gates are met:

| Gate | Condition | Threshold |
|------|-----------|-----------|
| G1 | IQR ICC | ≥ 0.75 (note: target for full study is ≥ 0.86; 0.75 is minimum for pilot) |
| G2 | NFL fidelity | ≥ 80% Stage 1/3/5 compliance |
| G3 | Session timing | Mean session ≤ 2 hours 30 minutes |
| G4 | No critical task failure | ≥ 20 of 24 participants produce a scorable Stage 5 insight |

If any gate fails: document failure, revise the specific component that failed,
and re-run a 12-participant micro-pilot on revised materials before full study.

---

## Ethical Considerations

- Informed consent required before any data collection
- Participants may withdraw at any time without consequence
- Data stored with numeric IDs; no names linked to analytical outputs
- Participants notified that their insights will be scored and described in aggregate
- No deception used in this study — condition assignments are disclosed at debrief
- Data retention: 5 years after publication; then de-identified aggregate data only

**IRB note:** This protocol requires IRB review before participant recruitment.
The document is structured to support IRB submission. The truth_status of this
document is PROPOSED: IRB has not been consulted and approval has not been sought.

---

## Remaining Open Items Before Pilot Can Launch

1. IRB submission and approval (institution TBD)
2. NFL interface implementation (web app or structured Google Form equivalent)
3. Rater recruitment (3 expert raters, compensated) and IQR calibration session
4. WGCTA license acquisition (Pearson TalentLens)
5. Participant recruitment (24 practitioners)
6. Facilitator training (1 session, 90 min)
7. Pilot data analysis and gate check
8. Full study amendment if any gate fails

---

## V&T Statement

EXISTS: Complete pilot protocol — design, eligibility criteria, task specification,
NFL interface specification (5 stages, human-only rules, fidelity log), measures
(IQR, WGCTA, NASA-TLX), session flow (2h15m), statistical analysis plan, 4
pre-specified gate conditions, ethical framework.

VERIFIED AGAINST: IQR defined in instruments/iqr-scoring-rubric.md.
NFL stages defined in paper_v02_neurips_trimmed.md Section 3.
WGCTA citation verified [Watson & Glaser, 2010].

NOT CLAIMED: Pilot has been executed. Any participant has been recruited. IRB
has been consulted. IQR ICC has been measured. NFL fidelity has been measured.

FUNCTIONAL STATUS: Pre-registration-ready design document. Can be submitted to
OSF or AsPredicted as a pre-registration before data collection. Cannot support
any empirical claims until the pilot is run and gate conditions are checked.
