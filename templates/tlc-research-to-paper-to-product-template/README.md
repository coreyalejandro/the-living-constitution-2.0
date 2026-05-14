# TLC Research-to-Paper-to-Product Repo Template

**Template version:** 1.0.0
**Template status:** partial
**Last updated:** 2026-05-14
**Governed by:** Sociotechnical Constitution (TLC 2.0)

---

## What this template is

A reusable scaffold for launching TLC 2.0 governed research projects that move through the complete pipeline:

```
research protocol
  ↓
evidence capture
  ↓
analysis
  ↓
paper packet
  ↓
product packet
  ↓
portfolio packet
  ↓
GitHub / reviewer surface
```

Every project generated from this template starts with the same governance structure, evidence model, visual understanding layer, and publication gate. You fill in the research-specific content. The template supplies the skeleton, the invariants, and the validators.

---

## When to use it

Use this template when starting any research project that:

- Has a defined research question
- Will produce evidence (observations, logs, measurements, artefacts)
- Will produce a paper, a product, or both
- Will eventually become a public portfolio item
- Must be governed by a C-RSP contract before work begins

Do not use this template for:
- Pure engineering repos with no research question
- Exploratory spikes (use the spike skill instead)
- One-off analysis scripts with no publication intent

---

## How it supports research → paper → product

The template enforces a braid structure:

- **Research lane**: protocol → evidence → analysis → paper sections
- **Product lane**: product requirements → components → API → demo
- **Portfolio lane**: claims → evidence sources → truth labels → portfolio packet → reviewer surface

Every public claim must be traceable from research to evidence to paper/product. The template makes that traceability mandatory at every gate.

---

## How it connects to TLC 2.0

Projects generated from this template are registered as TLC 2.0 modules in:
`sociotechnical-constitution-runtime/registry/modules.registry.json`

The runtime registry governs what this portfolio is allowed to claim about each project. The truth labels (working / partial / draft / static_prototype / planned / unverified) in STATUS.md must match the registry.

The portfolio surface (coreyalejandro.com) derives its project cards from the registry output. Do not hand-author claims on the portfolio homepage that conflict with the registry.

---

## What is public-safe

By default, the following are public-safe:
- README.md
- STATUS.md
- C_RSP_BUILD_CONTRACT.md
- docs/ (all protocol documents)
- visuals/ (all visual understanding files)
- schemas/ (all JSON schemas)
- evidence/index/evidence_index.csv
- paper/ (all sections after IRB/ethics review)
- reports/final/ (after publication gate)

---

## What must stay private

The following must NEVER be committed to a public repo:
- data/private/ — raw PII, session recordings, private notes
- evidence/screenshots/ — screenshots containing course content, participant screens, or PII
- evidence/excerpts/ — direct quotations from copyrighted course materials
- Any API keys, credentials, .env files
- Copyrighted LMS content (quiz answers, lesson text, assessments)
- Unpublished paper drafts before co-author review

These are excluded in the template .gitignore. Never override those exclusions.

---

## How to instantiate a new project

Run the creation script from the runtime root:

```bash
node scripts/create-research-project-from-template.mjs <project-slug>
```

Example:
```bash
node scripts/create-research-project-from-template.mjs hidrs-instructional-dependency-study
```

The script will:
1. Copy this template to `/Users/coreyalejandro/Projects/<project-slug>`
2. Replace placeholders with your project slug and defaults
3. Initialize git
4. Run validate_repo.py — stops if it fails
5. Print exact next steps

After instantiation, fill in:
- `{{RESEARCH_QUESTION}}` in STUDY_PROTOCOL.md
- `{{PRODUCT_TARGET}}` in C_RSP_BUILD_CONTRACT.md
- The first STATUS.md entry

---

## Instance pattern: HIDRS

The first concrete instance of this template is:
`/Users/coreyalejandro/Projects/hidrs-instructional-dependency-study`

HIDRS demonstrates:
- How to scope a research protocol with a single participant
- How to distinguish retrospective vs prospective data capture
- How to handle MISSING data correctly (mark it, never estimate)
- How visual understanding layer maps to an N-of-1 observational study
- How to wire a workbook as the data surface
- How to integrate Apple Notes → Hermes → workbook as the transfer pipeline

Refer to HIDRS for concrete examples. Do not copy HIDRS-specific course details into generic template files.

---

## Reference instances

| Project | Slug | Status |
|---|---|---|
| HIDRS Instructional Dependency Study | hidrs-instructional-dependency-study | partial |

---

## Visual Understanding Layer (mandatory)

A repo generated from this template is INCOMPLETE if the visual layer is absent.

Required visuals before any public promotion:
1. `visuals/architecture/system-architecture.mmd` — system and data flow
2. `visuals/app-flow/app-flow.mmd` — workflow or application flow
3. `visuals/user-journey/user-journey.mmd` — participant or user journey
4. `visuals/pictographs/research-loop-pictograph.md` — plain-language process diagram
5. `visuals/mock-demo/mock-demo-storyboard.md` — demo or exhibit storyboard
6. `visuals/illustrations/illustration-brief.md` — illustration direction brief

validate_repo.py will FAIL if any of these are missing or empty.

---

## Not claimed

- This template is not tested across multiple generated projects yet
- No CI integration
- No remote template repository
- No package publication
- Template itself is partial — see STATUS.md
