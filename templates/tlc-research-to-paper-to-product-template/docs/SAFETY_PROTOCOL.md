# Safety Protocol — {{PROJECT_NAME}}

---

## Purpose

This protocol defines when to stop data collection, what to do after stopping,
and how to return to the study safely.

---

## Stop conditions

Stop immediately and do not continue the session if:

1. **Cognitive distress** — confusion, frustration, or overwhelm reaches a level
   that is no longer tolerable or productive.

2. **Physical discomfort** — eye strain, headache, fatigue, or any physical state
   that would impair reliable observation.

3. **Technical failure** — the capture system (Apple Notes, workbook, logging tool)
   is not working before the session begins. Do not attempt to reconstruct from
   memory after the session.

4. **Platform unavailability** — the primary data source (platform, tool, system
   being studied) becomes unavailable mid-session. Mark session as INCOMPLETE.

5. **Data integrity risk** — any situation where continuing would require
   reconstructing data after the fact. Stop and mark INCOMPLETE rather than backfill.

6. **Scope creep** — the session reveals that continuing would require capturing
   content outside the declared scope boundary in C_RSP_BUILD_CONTRACT.md.
   Stop, document the scope question, and resume only after scope is updated.

7. **Psychiatric or health crisis** — stop immediately. The study is not worth it.

---

## After stopping

1. Mark the session as INCOMPLETE in the workbook
2. Record: time stopped, reason (brief plain language)
3. Do not attempt to resume the same session as a different session
4. Do not backfill with estimates
5. Return to the study only when the stop condition is resolved

---

## Researcher wellbeing

This study involves the researcher as a participant. That means:

- If a session is stressful, stop. The study will wait.
- If the construct measurement feels distressing to report, the construct
  definition may need revision. Document the concern and flag it.
- Retrospective recovery sessions are the highest-distress sessions.
  Schedule them when cognitive load is already low. Never schedule them
  back-to-back with other demanding work.

---

## Escalation

If a stop condition persists for more than 7 days, record it in STATUS.md
as a BLOCKED status with a plain-language description.

If the BLOCKED status cannot be resolved without scope changes, update
C_RSP_BUILD_CONTRACT.md and STATUS.md before resuming.
