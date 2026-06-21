# Neurodivergent Success Metrics

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Research Framework
**Layer:** 3 — Research Framework
**Date:** 2026-06-21

---

## Purpose

These six metrics are the primary outcome measures for any TLC-governed study
involving neurodivergent participants or neurodivergent-first design.
They are not secondary accessibility checks. They are first-class research outcomes.

All six feed directly into Tier-1 governance reporting and the live dashboard.

---

## Metric Definitions

### 1. Sensory Comfort Score (SCS)

**What it measures:** Self-reported sensory comfort during a governed session.

**Full instrument:** Visual analogue scale (0-100).
Prompt: "How comfortable was your sensory experience during this session?"

**Bootstrapped instrument:** Single-item Likert (1-5) via Google Form.
Prompt: "How comfortable did this feel? (1 = very uncomfortable, 5 = very comfortable)"

**Reporting threshold:** Mean SCS < 60 triggers a CHAE review of session design.
**Tier-1 benchmark:** Mean SCS ≥ 75 across all participants required for publication.

---

### 2. Autonomy Index (AI)

**What it measures:** Participant's felt sense of control over the governed session.

**Full instrument:** 5-item Likert scale + free text.
Items address: choice of pacing, ability to stop, ability to modify interface,
feeling that decisions were respected, freedom to deviate from defaults.

**Bootstrapped instrument:** 1-question survey.
Prompt: "Did you feel in control of this experience? (Yes / Somewhat / No)" + optional text.

**Reporting threshold:** < 70% "Yes" or "Somewhat" responses triggers NAB review.
**Tier-1 benchmark:** ≥ 80% positive responses required for publication.

---

### 3. Cognitive Load Variance (CLV)

**What it measures:** Intra-participant fluctuation in mental effort across tasks.
High variance indicates an inconsistent or poorly adaptive system.
Low variance indicates stable, well-calibrated cognitive support.

**Full instrument:** Statistical dispersion (SD) of NASA-TLX mental demand
subscale across all tasks in a session.

**Bootstrapped instrument:** Standard deviation of single-item mental effort
ratings (Paas scale, 1-9) across tasks.

**Reporting threshold:** CLV > 2.5 (SD) triggers investigation into session design.
**Tier-1 benchmark:** CLV ≤ 1.5 in NAP-matched conditions vs. > 2.0 in control.

---

### 4. Trust Calibration Match (TCM)

**What it measures:** Alignment between a participant's expressed confidence
and their actual performance. Derived from DTCI (see CALT_Theory.md).

**Full instrument:** Polynomial regression residuals between DTCI trajectory
and self-reported confidence ratings.

**Bootstrapped instrument:** Difference score: |expressed confidence (1-5) −
proportion correct on last 5 items|. Lower = better calibration.

**Reporting threshold:** Mean TCM > 0.4 triggers review of instructional design.
**Tier-1 benchmark:** Mean TCM ≤ 0.25 in constitutionally governed vs. > 0.4 in control.

---

### 5. Profile Ownership (PO)

**What it measures:** Degree to which participants actively exercise control
over their Neurodivergent Adaptation Profile (NAP).

**Full instrument:** Editor usage logs — % of participants who make ≥1 edit
to their NAP during the study.

**Bootstrapped instrument:** Count of edits to a local JSON file via a simple
form. Binary: participant edited (1) or did not edit (0).

**Reporting threshold:** PO < 30% triggers UX review of profile editing interface.
**Tier-1 benchmark:** PO ≥ 50% demonstrates meaningful participant agency.

---

### 6. Community Influence (CI)

**What it measures:** Degree to which participant community exercises real
decision-making power in governance bodies (NAB/CGB/CHAE).

**Full instrument:** Quarterly anonymous survey — % of NAB/CGB decisions
that originated from community proposals vs. researcher proposals.

**Bootstrapped instrument:** Post-pilot focus group with advisory circle.
Prompt: "Did you feel your input changed how the system works? (Yes / No / Unsure)"

**Reporting threshold:** CI < 40% community-originated decisions triggers
governance structure review.
**Tier-1 benchmark:** ≥ 50% community-originated decisions for publication.

---

## Dashboard Integration

All six metrics feed into the Constitutional Compliance Index (CCI) dashboard.
SCS and CLV are session-level metrics (computed per session).
AI and PO are study-level metrics (computed across all sessions per participant).
TCM is computed at each assessment point.
CI is computed quarterly.

Dashboard location: tlc-dashboard.mjs (existing script, requires metric integration).

---

## Truth-State

| Metric | Truth-State | Next Step |
|---|---|---|
| SCS | SPECIFIED | Bootstrapped pilot administration |
| AI | SPECIFIED | Bootstrapped pilot administration |
| CLV | SPECIFIED | Bootstrapped pilot administration |
| TCM | SPECIFIED | DTCI implementation + pilot |
| PO | SPECIFIED | NAP editor implementation |
| CI | SPECIFIED | NAB formation + quarterly cycle |
