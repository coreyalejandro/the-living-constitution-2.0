# Research Loop — Plain Language Process Explanation

This document explains how {{PROJECT_NAME}} works without technical jargon.
It is written for someone who has never seen this project.

---

## What this study does

{{PROJECT_NAME}} measures {{WHAT_IS_MEASURED}} during {{WHAT_IS_OBSERVED}}.

The goal is to answer: {{RESEARCH_QUESTION_PLAIN_LANGUAGE}}

---

## The loop, step by step

```
1. OBSERVE
   ↓
   You do the thing being studied (take a lesson, use a tool, attend a session).
   While you do it, you note what happens — what confused you, what took extra
   effort, what felt misaligned.

2. LOG
   ↓
   You write down what you noticed, using short codes.
   You do this during or right after — not days later.

3. RATE
   ↓
   After it's done, you rate a few things on a 1-to-5 scale.
   If you can't remember something, you write MISSING.
   You never guess.

4. TRANSFER
   ↓
   A tool (Hermes) takes your notes and puts them in a structured workbook.
   It checks the workbook first so it doesn't overwrite anything.
   It marks any blank fields as MISSING before it saves.

5. LOG THE EVIDENCE
   ↓
   You add a line to a CSV file that records what evidence exists.
   This is your audit trail.

6. VALIDATE
   ↓
   A script checks that the repo is complete.
   If anything is missing — including the visual diagrams — it stops you.
   You fix the problem, then continue.

7. ANALYZE
   ↓
   When enough data is collected, scripts process it.
   The output is findings, not conclusions.
   Conclusions require evidence.

8. WRITE
   ↓
   The findings become paper sections.
   Each claim in the paper must have an evidence source.
   No claim without evidence. No evidence without a source.

9. PACKAGE
   ↓
   The paper and product outputs are assembled into packets.
   The portfolio packet goes through a gate before it goes public.

10. PUBLISH
    ↓
    The registry entry is updated.
    The portfolio surface shows the truth label.
    A reviewer can follow the evidence trail from claim to source.
```

---

## What gets committed to git

- Notes and ratings (your words, no copyrighted content)
- Evidence index (the log, not the screenshots)
- Analysis outputs
- Paper sections
- Visual diagrams

## What never gets committed

- Screenshots containing copyrighted material
- Full course text excerpts
- Private notes
- Anything in the excluded folders

---

## Why the visual layer is mandatory

A reviewer who cannot see a diagram of how the system works cannot assess
whether the claims are supported by the structure.

Without the visual layer, the project is a black box.
A black box cannot be public-ready.
