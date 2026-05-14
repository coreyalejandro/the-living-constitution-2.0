# Data Dictionary — {{PROJECT_NAME}}

**Version:** 1.0
**Effective date:** {{CONTRACT_DATE}}

Replace all `{{PLACEHOLDER}}` values with project-specific definitions.

---

## Overview

This dictionary defines every variable, construct, event type, and rating
scale used in the {{PROJECT_NAME}} study.

Every field that appears in the workbook, schemas, or evidence_index.csv
must be defined here before data collection begins.

---

## Constructs

### {{CONSTRUCT_1_NAME}}

- **Definition:** {{CONSTRUCT_1_DEFINITION}}
- **Operationalization:** {{CONSTRUCT_1_OPERATIONALIZATION}}
- **Scale:** {{CONSTRUCT_1_SCALE}}
  - 1 = {{SCALE_ANCHOR_LOW}}
  - 5 = {{SCALE_ANCHOR_HIGH}}
- **Capture method:** self-report after session
- **Missing data policy:** mark as MISSING if not captured during or within 2 hours of session

### {{CONSTRUCT_2_NAME}}

- **Definition:** {{CONSTRUCT_2_DEFINITION}}
- **Operationalization:** {{CONSTRUCT_2_OPERATIONALIZATION}}
- **Scale:** 1–5
- **Capture method:** self-report after session

---

## Event taxonomy

Events are logged during sessions using shorthand codes.
Each event type has:
- A code (used in Apple Notes during session)
- A full name
- A definition
- An example

| Code | Name | Definition | Example |
|---|---|---|---|
| {{EVENT_CODE_1}} | {{EVENT_NAME_1}} | {{EVENT_DEF_1}} | {{EVENT_EXAMPLE_1}} |
| {{EVENT_CODE_2}} | {{EVENT_NAME_2}} | {{EVENT_DEF_2}} | {{EVENT_EXAMPLE_2}} |

---

## Session fields

| Field | Type | Description | Missing policy |
|---|---|---|---|
| session_id | string | Unique ID for the session | Required — never missing |
| date | ISO 8601 date | Session date | Required — never missing |
| start_time | HH:MM | Session start time | MISSING if not recorded |
| end_time | HH:MM | Session end time | MISSING if not recorded |
| duration_minutes | integer | Elapsed minutes | MISSING if start/end missing |
| {{CONSTRUCT_1_SCORE}} | integer 1–5 | {{CONSTRUCT_1_NAME}} rating | MISSING if not rated |
| {{CONSTRUCT_2_SCORE}} | integer 1–5 | {{CONSTRUCT_2_NAME}} rating | MISSING if not rated |
| notes | text | Post-session observation notes | Empty string if none |
| session_type | enum | prospective / retrospective / incomplete | Required |
| recovery_confidence | integer 1–5 | Retrospective only — confidence in recall | MISSING if prospective |
| recovery_date | ISO 8601 date | Retrospective only — date of recovery entry | MISSING if prospective |

---

## Evidence index fields

| Field | Description |
|---|---|
| evidence_id | Unique identifier (e.g. E001) |
| session_id | Session this evidence belongs to |
| evidence_type | screenshot / note / log / artifact |
| description | Plain-language description |
| location | Path (relative or external reference) |
| date_captured | ISO 8601 date |
| public_safe | yes / no |

---

## Missing data policy

- MISSING means the data was not captured at all
- MISSING is not zero, not blank, not estimated
- Use the literal string MISSING in all data files when the value was not captured
- Do not impute MISSING values without documenting the imputation method in the analysis

---

## Forbidden field values

Never use these values in any committed data file:
- "Unknown" as a substitute for MISSING
- "N/A" as a substitute for MISSING
- Any verbatim quotation from a copyrighted source
- Any PII from third parties
