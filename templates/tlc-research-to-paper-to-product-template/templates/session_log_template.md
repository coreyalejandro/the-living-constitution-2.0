# Session Log — {{SESSION_ID}}

**Date:** {{DATE}}
**Start time:** {{START_TIME}}
**End time:** {{END_TIME}}
**Duration (minutes):** {{DURATION_MINUTES}}
**Session type:** prospective / retrospective / incomplete (circle one)

---

## Pre-session state

<!-- Brief plain-language note about cognitive state, energy level, or
     any condition relevant to the construct definitions. Optional. -->

{{PRE_SESSION_STATE}}

---

## Events log

<!-- Use event codes from DATA_DICTIONARY.md.
     Format: [offset_seconds] CODE — brief note
     Example: [120] DEP_OPAQUE — dependency reference without explanation given
     Use MISSING for offset if you did not track time. -->

| Offset (s) | Code | Note |
|---|---|---|
| {{OFFSET_1}} | {{CODE_1}} | {{NOTE_1}} |
| {{OFFSET_2}} | {{CODE_2}} | {{NOTE_2}} |

<!-- Add rows as needed. Do not backfill. Log what you observed. -->

---

## Post-session construct ratings

**{{CONSTRUCT_1_NAME}}** (1–5): {{SCORE_1}}
**{{CONSTRUCT_2_NAME}}** (1–5): {{SCORE_2}}
**{{CONSTRUCT_3_NAME}}** (1–5): {{SCORE_3}}
**{{CONSTRUCT_4_NAME}}** (1–5): {{SCORE_4}}

If any rating was not captured, write MISSING (not 0, not blank).

---

## Post-session notes

<!-- Plain language only. Do not quote copyrighted content.
     Describe what you observed, what felt notable, what surprised you. -->

{{POST_SESSION_NOTES}}

---

## Transfer status

- [ ] Transferred to workbook
- [ ] evidence_index.csv updated
- [ ] Transfer report written to reports/

Transfer date: {{TRANSFER_DATE}}
