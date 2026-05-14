# Study Protocol — {{PROJECT_NAME}}

**Protocol version:** 1.0
**Effective date:** {{CONTRACT_DATE}}
**Project:** {{PROJECT_SLUG}}

Replace all `{{PLACEHOLDER}}` values before beginning data collection.

---

## Research Questions

**RQ1:** {{RESEARCH_QUESTION_1}}

**RQ2:** {{RESEARCH_QUESTION_2}}

**RQ3:** {{RESEARCH_QUESTION_3}}

---

## Study Design

<!-- Describe the study design:
- N-of-1 / single participant / single case
- Observational / experimental / mixed
- Longitudinal / cross-sectional
- Retrospective / prospective / mixed
-->

{{STUDY_DESIGN_DESCRIPTION}}

---

## Constructs and Measures

<!-- For each construct, define:
- Name
- Definition (operational)
- Measurement scale
- Data source
- Capture method
-->

| Construct | Definition | Scale | Source | Method |
|---|---|---|---|---|
| {{CONSTRUCT_1}} | {{DEFINITION_1}} | {{SCALE_1}} | {{SOURCE_1}} | {{METHOD_1}} |
| {{CONSTRUCT_2}} | {{DEFINITION_2}} | {{SCALE_2}} | {{SOURCE_2}} | {{METHOD_2}} |

See DATA_DICTIONARY.md for full operationalization.

---

## Measurement Protocol

### Before each session
1. Open the session log template: `templates/session_log_template.md`
2. Record: session ID, date, start time
3. Note any pre-session state relevant to the construct definitions

### During the session
1. Log events using the event taxonomy in DATA_DICTIONARY.md
2. Do not interrupt session flow for extended note-taking
3. Use shorthand; expand within 2 hours

### After each session
1. Record end time and session duration
2. Rate all constructs on their defined scales
3. Write post-session notes (plain language, no copyrighted content)
4. Transfer to workbook within 24 hours
5. Log to evidence/index/evidence_index.csv

---

## Retrospective Recovery Protocol

Apply only to sessions completed before the study began.

Rules:
- Record only what you actually remember
- Do not estimate, average, or reconstruct
- Mark all missing fields as MISSING
- Record recovery_confidence (1–5) and recovery_date
- Do not re-take sessions to recover data

Use template: `templates/retrospective_recovery_template.md`

---

## Data Transfer Pipeline

```
Session observation
  ↓
Apple Notes (raw capture during session)
  ↓
Hermes (transfer operator — inspects workbook before writing)
  ↓
Workbook (canonical data surface)
  ↓
evidence/index/evidence_index.csv (evidence log)
```

Hermes must inspect workbook sheet headers before every transfer.
Never manually enter data into the workbook without first running the inspection step.
Mark all absent fields MISSING before committing.

---

## Scope and Limitations

### In scope
- {{SCOPE_ITEM_1}}
- {{SCOPE_ITEM_2}}

### Out of scope / limitations
- Generalizability to other participants or populations is not claimed
- {{LIMITATION_1}}
- {{LIMITATION_2}}

---

## Ethics and boundaries

See docs/ETHICS_AND_BOUNDARIES.md.

---

## Stop conditions

See docs/SAFETY_PROTOCOL.md.
