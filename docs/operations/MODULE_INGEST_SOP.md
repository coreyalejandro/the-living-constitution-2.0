# Module Ingest SOP

**Version:** 1.0.0
**Status:** Active
**Last updated:** 2026-05-13
**Applies to:** All TLC 2.0 classification sessions in
`/Users/coreyalejandro/Projects/the-living-constitution-2.0`

---

## Purpose

This SOP formalizes the repeatable procedure for classifying a project repo
into the TLC 2.0 registry. Every classification session must follow these steps
exactly and in order. No module may be added with truth_status above `unverified`
without completing Phase 2 inspection and passing Phase 3 verification.

---

## Phase 0 — Preparation

0.1 Confirm working directory:
    /Users/coreyalejandro/Projects/the-living-constitution-2.0

0.2 Create a feature branch:
    git checkout -b classify/<module-slug>

0.3 Confirm main is green before branching:
    npm run verify:registry
    npm run verify
    npm test
    All three must pass before inspection begins.

---

## Phase 1 — Discovery

1.1 Locate the canonical repo using find with -iname patterns.
    Always run find first; never assume the path.

1.2 Identify multiple repos with overlapping names and record them.
    Classify only the canonical repo this session.
    Document non-canonical copies in INSPECTION.md under "Path disambiguation."

1.3 Determine the canonical repo by these signals, in priority order:
    - Has its own package.json / pyproject.toml at root
    - Has its own node_modules / venv / .venv installed
    - Has its own git history (git log returns commits specific to this project)
    - Has a HANDOFF.md that describes this project specifically
    - Is NOT a subdirectory copy inside another project

---

## Phase 2 — Inspection

Read these files first, in this order:
    1. README.md (top 50 lines)
    2. STATUS.json / STATUS.md if present
    3. package.json / pyproject.toml / requirements.txt if present
    4. HANDOFF.md / BUILD_CONTRACT.md / CRSP files if present
    5. app/ src/ lib/ scripts/ tests/ docs/ — directory trees only first
    6. Evidence files: evidence/ reports/ outputs/ if present
    7. git log --oneline -5 and git status

Do NOT read entire source files unless disambiguation requires it.
Signal-to-noise ratio matters: read structure, not implementation.

Record every file read in INSPECTION.md under "Files inspected."

---

## Phase 3 — Verification

Attempt the project's own verifier, test suite, or build check:

    For Python projects:
        python -m pytest tests/ -q 2>&1 | tail -5

    For Node/TypeScript projects:
        npm run typecheck (tsc --noEmit)
        npm test / vitest run / jest

    For projects with no test runner:
        Note "no test runner found" — do not invent one.

Record the exact command and exact output in INSPECTION.md.

Failure modes that do NOT lower truth_status:
    - ERR_REQUIRE_ESM in vitest config (Node 22 CJS mismatch — fixable config gap)
    - import.meta outside module in Jest (config gap, not missing implementation)
    - Missing .env / API keys required to run dev server

Failure modes that DO lower truth_status:
    - Test suite exists and has failing tests (not config failures)
    - Build fails (tsc --noEmit returns type errors)
    - Required source files are absent or empty

---

## Phase 4 — Classification

See CLASSIFICATION_STATUS_RULES.md for the full decision tree.

Required fields for every module entry:
    id, label, path, surface, truth_status, components, contract_id,
    verified_date, implementation_status, public_display_status,
    research_lane, product_lane, verified_scope, unverified_scope, notes

If truth_status = partial, BOTH verified_scope AND unverified_scope are required.
If truth_status = working, verified_scope is required; unverified_scope is optional.
If truth_status = draft or unverified, neither scope field is required.

See COMPLETE_CLAIM_VERIFICATION_RULE.md before assigning any status above draft.

---

## Phase 5 — Registry Update

5.1 Add or update the module in registry/modules.registry.json.
5.2 Add relevant artifacts to registry/artifacts.registry.json.
    - At minimum: one artifact per module (config file, schema, key doc, or manifest).
    - Do not add artifacts for files not inspected.
5.3 Add routes to registry/routes.registry.json only if real routes exist.
    - A route exists if: there is a real Next.js API route file, Flask/FastAPI route,
      or web UI entry point in the source code.
    - Do not add routes for planned or aspirational endpoints.

5.4 Create INSPECTION.md:
    evidence/module-inspections/<module-slug>/INSPECTION.md

5.5 Run:
    npm run verify:registry
    npm run verify
    npm test
    All three must pass before committing.

---

## Phase 6 — Commit

Commit message format:
    git commit -m "Classify <module-slug> module"

Always include:
    registry/ (all three registry files)
    evidence/module-inspections/<module-slug>/INSPECTION.md

Never commit:
    HANDOFF.md updates in the same commit as module classification
    Generated files (MODULE_STATUS.md, PORTFOLIO_DATA.json) in classification commits

---

## Phase 7 — Merge

Merge the classify/* branch into main after verification.
Delete the classify/* branch after merging if desired.

Run the full verify + test suite on main after every merge.

---

## Ingest frequency

Classify one module per session. Do not batch-classify.
Batching produces weaker inspection signals and higher false-positive truth_status claims.

---

## Files created per ingest session

| File | Created by | Purpose |
|---|---|---|
| evidence/module-inspections/<slug>/INSPECTION.md | Inspector | Durable inspection record |
| registry/modules.registry.json (patched) | Inspector | Module entry |
| registry/artifacts.registry.json (patched) | Inspector | Artifact entries |
| registry/routes.registry.json (patched) | Inspector | Route entries if applicable |
