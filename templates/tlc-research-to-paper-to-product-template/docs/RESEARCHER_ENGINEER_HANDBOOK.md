# Researcher-Engineer Handbook — {{PROJECT_NAME}}

---

## Purpose

This handbook covers the operational procedures for the {{PROJECT_NAME}} project.
It is the day-to-day reference for running the study, writing code, and maintaining the repo.

---

## Before you begin any session

1. Run the repo validator:
   ```bash
   python3 scripts/validate_repo.py
   ```
   If it fails, fix errors before proceeding.

2. Check STATUS.md — confirm the current phase and any blocked items.

3. Open the session template:
   `templates/session_log_template.md`

---

## During data collection

- Use the event codes in DATA_DICTIONARY.md
- Shorthand is fine — expand within 2 hours
- Never skip the end-of-session ratings if they can be captured

---

## Workbook transfer procedure (Hermes)

1. Hermes inspects the workbook sheet names and headers before writing
2. Hermes reports all absent fields as MISSING before committing
3. Hermes writes a transfer report to reports/
4. Commit the workbook and transfer report together

Do not skip step 1. Do not write to the workbook without the inspection step.

---

## Adding a new evidence item

1. Create or capture the evidence artifact
2. Store it in the appropriate excluded folder (screenshots, excerpts, private)
3. Add an entry to evidence/index/evidence_index.csv
4. Record: evidence_id, session_id, evidence_type, description, location, date_captured, public_safe
5. Commit evidence_index.csv (not the artifact itself if it is in an excluded folder)

---

## Writing analysis scripts

- All scripts go in analysis/scripts/
- All outputs go in analysis/outputs/
- Scripts must be runnable without modification on a fresh clone
- Document dependencies in a requirements.txt or inline comment
- Never hardcode absolute paths — use relative paths from the repo root

---

## Running the validators

```bash
# Repo structure
python3 scripts/validate_repo.py

# Evidence index
python3 scripts/validate_evidence_index.py

# Claims
python3 scripts/validate_claims.py
```

All three must pass before any public claim is made.

---

## Writing paper sections

- paper/outline.md — update this when the structure changes
- paper/abstract.md — do not finalize until results are confirmed
- paper/methods.md — describe the protocol, not the tool
- paper/results.md — state what the data shows, not what you hoped
- paper/limitations.md — write this early, not last

Rule: every claim in paper/results.md must have an evidence source in evidence_index.csv.

---

## Weekly review procedure

1. Copy templates/weekly_review_template.md to reports/weekly/WEEK_NN.md
2. Fill in: sessions completed, events logged, anomalies, next-week plan
3. Commit the weekly report

---

## Before promoting to portfolio

Run docs/PORTFOLIO_PUBLICATION_GATE.md checklist.
All gates must pass. No exceptions.

---

## Naming conventions

- Session IDs: use a consistent format (e.g. C1L4 for Course 1 Lesson 4, or S001 for Session 001)
- Evidence IDs: E + zero-padded number (E001, E002...)
- File names: lowercase, hyphens, no spaces
- Branches: feature/description or fix/description
- Commits: imperative present tense ("Add session log for C1L4")
