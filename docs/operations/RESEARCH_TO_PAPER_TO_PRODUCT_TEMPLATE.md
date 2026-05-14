# TLC Research-to-Paper-to-Product Template — Operations Reference

**Location:** `templates/tlc-research-to-paper-to-product-template/`
**Creation script:** `scripts/create-research-project-from-template.mjs`
**Registry ID:** `TLC-RESEARCH-PAPER-PRODUCT-TEMPLATE`
**Status:** partial
**Last updated:** 2026-05-14

---

## Purpose

This document is the operational reference for the TLC research-to-paper-to-product
repo template. It covers how to use, maintain, and extend the template system.

---

## What the template produces

A new project repo with this structure:

```
<project-slug>/
  README.md                          ← project identity and public surface
  STATUS.md                          ← truth labels and verified scope
  C_RSP_BUILD_CONTRACT.md            ← governance contract
  .gitignore                         ← private/sensitive exclusions
  docs/
    STUDY_PROTOCOL.md                ← what is measured and how
    SAFETY_PROTOCOL.md               ← when to stop
    ETHICS_AND_BOUNDARIES.md         ← content boundaries
    DATA_DICTIONARY.md               ← every variable defined
    BLIND_MANS_REPO_SETUP.md         ← plain-language repo guide
    RESEARCHER_ENGINEER_HANDBOOK.md  ← day-to-day procedures
    PORTFOLIO_PUBLICATION_GATE.md    ← gate before portfolio promotion
    GITHUB_REVIEWER_SUMMARY_GATE.md  ← gate before README goes public
    VISUAL_UNDERSTANDING_LAYER.md    ← visual layer specification
  visuals/                           ← I8 invariant — all 6 files required
  schemas/                           ← JSON schemas for all data types
  data/                              ← raw, processed, private (gitignored)
  evidence/                          ← index + gitignored screenshots/excerpts
  analysis/                          ← notebooks, scripts, outputs
  paper/                             ← all paper sections
  product/                           ← product implementation
  reports/                           ← weekly + final packets
  templates/                         ← fill-in-the-blank session forms
  scripts/                           ← validators and generators
```

---

## How to create a new project

From the runtime root:

```bash
node scripts/create-research-project-from-template.mjs <project-slug>
```

The script will:
1. Copy the template to `/Users/coreyalejandro/Projects/<project-slug>`
2. Substitute all `{{PLACEHOLDER}}` values
3. Run `git init` and make an initial commit
4. Run `python3 scripts/validate_repo.py` in the new project
5. Stop with a FAIL if validation fails
6. Print exact next steps

---

## After creating a project

Required before data collection begins:

1. Fill in `C_RSP_BUILD_CONTRACT.md` — especially `{{RESEARCH_QUESTION}}`
2. Fill in `docs/STUDY_PROTOCOL.md` and `docs/DATA_DICTIONARY.md`
3. Replace placeholder content in `visuals/` with real diagrams
   (validate_repo.py will fail until all 6 visual files exceed 50 bytes)
4. Register the project in `registry/modules.registry.json`
5. Run `npm run ingest:verify` from the runtime root

---

## Template maintenance

When the template itself needs to change:

- Edit files in `templates/tlc-research-to-paper-to-product-template/`
- Re-run the creation script with a test slug to verify the change
- Do not modify files in generated projects to fix a template bug —
  fix the template, then note the change in a comment in the generated project

---

## Placeholder reference

All placeholders used in the template:

| Placeholder | Default value | Notes |
|---|---|---|
| `{{PROJECT_NAME}}` | Derived from slug (title case) | Auto-substituted |
| `{{PROJECT_SLUG}}` | Provided by user | Auto-substituted |
| `{{CONTRACT_DATE}}` | Today's date | Auto-substituted |
| `{{STATUS_DATE}}` | Today's date | Auto-substituted |
| `{{CONTRACT_ID}}` | CRSP-<SLUG>-001 | Auto-substituted |
| `{{RESEARCH_QUESTION}}` | TODO placeholder | Must be filled manually |
| `{{PRODUCT_TARGET}}` | TODO placeholder | Must be filled manually |
| `{{PUBLIC_DISPLAY_STATUS}}` | coming_soon | Auto-substituted |

All other `{{PLACEHOLDERS}}` in docs/ and templates/ must be filled manually.

---

## Reference instance

HIDRS maps to this template as follows:

| Template element | HIDRS instance |
|---|---|
| `{{RESEARCH_QUESTION}}` | Does LMS-delivered instruction produce measurable dependency opacity? |
| `{{PRODUCT_TARGET}}` | Web application / notebook demonstrating instructional dependency analysis |
| Construct 1 | dependency_opacity_score |
| Construct 2 | prioritization_load |
| Construct 3 | cognitive_switching_cost |
| Construct 4 | assessment_alignment_risk |
| Session ID format | C1L4 (Course N Lesson N) |
| Evidence ID format | E001, E002... |
| Retrospective scope | Course 1 Lessons 1–3 |
| Prospective start | Course 1 Lesson 4 |

---

## Visual Understanding Layer invariant

The visual layer is enforced by `validate_repo.py`. Every generated project
must have all 6 visual files with content (> 50 bytes) before:
- Portfolio promotion
- Reviewer surface publication
- Prospective data collection begins

This invariant mirrors I8 in `C_RSP_BUILD_CONTRACT.md` and cannot be waived.

---

## Not claimed

- Template not yet tested across multiple generated projects
- No CI integration (validate_repo.py is manual only)
- No remote template repository
- No package publication
- HIDRS is the only confirmed instance
