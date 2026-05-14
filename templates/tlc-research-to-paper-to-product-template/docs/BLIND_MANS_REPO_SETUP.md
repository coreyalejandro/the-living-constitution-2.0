# Blind Man's Repo Setup Guide — {{PROJECT_NAME}}

This document explains the repository structure in plain language.
It assumes you have never seen this repo before and cannot rely on visual context.

---

## What this repo is

A folder of files on your computer.
It tracks one research project: {{PROJECT_NAME}}.
Git keeps a version history so you can undo mistakes.

The project follows the TLC 2.0 research-to-paper-to-product pipeline governed
by the Sociotechnical Constitution runtime registry.

---

## The one file that tells you the current state

`STATUS.md` — read this first.
It tells you what is working, what is not, and what is not claimed.

---

## What each folder does

### data/raw/
Place raw input files here. Plain text, CSV, or JSON. No private content.

### data/processed/
Cleaned or transformed versions of raw files. Scripts write here.

### data/private/
EXCLUDED FROM GIT. Never committed.
Put anything sensitive here — private notes, PII, anything you are unsure about.
It stays only on your machine.

### evidence/index/
One file: `evidence_index.csv`. This is a log of all evidence items.
The actual screenshots and excerpts stay in excluded folders.

### evidence/screenshots/
EXCLUDED FROM GIT. Reference screenshots only.

### evidence/excerpts/
EXCLUDED FROM GIT. Text excerpts that may contain copyrighted content.

### docs/
Protocol and guide documents. The instruction set for the project.
- STUDY_PROTOCOL.md — what you are measuring and how
- SAFETY_PROTOCOL.md — when to stop and what to do
- ETHICS_AND_BOUNDARIES.md — content boundaries
- DATA_DICTIONARY.md — every variable defined
- BLIND_MANS_REPO_SETUP.md — this file
- RESEARCHER_ENGINEER_HANDBOOK.md — operational procedures
- PORTFOLIO_PUBLICATION_GATE.md — gates before portfolio promotion
- GITHUB_REVIEWER_SUMMARY_GATE.md — gates before README goes public
- VISUAL_UNDERSTANDING_LAYER.md — visual layer specification

### visuals/
Required visual artifacts. The repo is incomplete without all 6 files.
See docs/VISUAL_UNDERSTANDING_LAYER.md for what each file must contain.

### schemas/
JSON schemas for all structured data. Validate data against these before committing.

### analysis/
Notebooks and scripts that process evidence into findings.
Outputs go in analysis/outputs/.

### paper/
Paper sections. Write one file per section.
paper/outline.md is the working structure.
paper/abstract.md is the submission-facing claim.

### product/
Product implementation. app/, components/, lib/, api/ follow the project stack.

### reports/
- reports/weekly/ — weekly progress notes
- reports/final/ — portfolio and publication packets

### templates/
Fill-in-the-blank templates for recurring tasks.
Do not modify templates directly — copy them and fill in the copy.

### scripts/
Python validators and report generators.
Run `python3 scripts/validate_repo.py` first when you open the repo.

### C_RSP_BUILD_CONTRACT.md
The governance contract for this project.
Read this before making any change that affects scope.

---

## First thing to run when you open this repo

```bash
cd /path/to/{{PROJECT_SLUG}}
python3 scripts/validate_repo.py
```

If it fails: fix the errors before doing anything else.
If it passes: check STATUS.md for current state.

---

## Where data flows

```
Session observation
  ↓
Apple Notes (raw shorthand)
  ↓
Hermes agent (inspects workbook, writes structured data)
  ↓
Workbook (canonical data surface)
  ↓
evidence/index/evidence_index.csv (evidence log)
  ↓
analysis/scripts/ (processing)
  ↓
analysis/outputs/ (findings)
  ↓
paper/ (sections)
  ↓
reports/final/ (portfolio packet)
```

---

## What is never committed

- data/private/ — stays on your machine only
- evidence/screenshots/ — excluded
- evidence/excerpts/ — excluded
- .env files — excluded
- Copyrighted course content — forbidden
