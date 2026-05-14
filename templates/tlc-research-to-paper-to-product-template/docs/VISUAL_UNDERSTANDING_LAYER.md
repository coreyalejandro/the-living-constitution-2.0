# Visual Understanding Layer — {{PROJECT_NAME}}

**Status:** {{VISUAL_LAYER_STATUS}}
**Last updated:** {{STATUS_DATE}}

---

## Invariant (nonnegotiable)

> The repo must include architecture, workflow/app-flow, user journey,
> pictograph/process explanation, mock demo/storyboard, and illustration brief
> before it may be considered user-ready, portfolio-ready, publication-ready,
> or safe to use for prospective work.
>
> If the visual layer is missing, incomplete, placeholder-only, or contradicts
> the written protocol, validate_repo.py MUST FAIL.

This invariant cannot be waived.

---

## Required files and their purpose

### 1. visuals/architecture/system-architecture.mmd

**Purpose:** Shows the full system: data sources, processing stages,
outputs, and the relationships between them.

**Must include:**
- All major data flows
- All external dependencies
- The validation / governance step
- Where evidence is stored

**Reviewer use:** Allows a reviewer to understand the system without
reading the code. A blind reader should be able to describe the
data flow from this diagram alone.

---

### 2. visuals/app-flow/app-flow.mmd

**Purpose:** Shows the workflow from the researcher's or user's perspective,
step by step, from start to output.

**Must include:**
- Decision points
- Branching paths (e.g. what happens if a session is INCOMPLETE)
- The end state for each path

---

### 3. visuals/user-journey/user-journey.mmd

**Purpose:** Shows the experience of the primary actor (researcher, user,
participant) across the full study or product lifecycle.

**Must include:**
- Phases (before, during, after)
- Touchpoints with tools and artifacts
- Emotional or cognitive state markers if relevant to the research

---

### 4. visuals/pictographs/research-loop-pictograph.md

**Purpose:** A plain-language process explanation that can be understood
without technical knowledge. Written in markdown with ASCII or Mermaid
diagrams. Not a code diagram — a communication tool.

**Must include:**
- What the study measures and why
- The sequence of actions in plain language
- What output the researcher gets at each stage

---

### 5. visuals/mock-demo/mock-demo-storyboard.md

**Purpose:** A storyboard showing what a demo, exhibit, or product walkthrough
would look like for a reviewer or user who has never seen the project.

**Must include:**
- Frame-by-frame or step-by-step description
- What the reviewer sees at each step
- What claim is being demonstrated at each step

---

### 6. visuals/illustrations/illustration-brief.md

**Purpose:** Direction brief for any human-readable illustrations, diagrams,
or visual artifacts that will accompany the paper or portfolio exhibit.

**Must include:**
- What concepts need visual representation
- The intended audience for each illustration
- Style guidance (plain, technical, narrative)
- Whether illustrations are for paper, portfolio, or both

---

## Status of this visual layer

| File | Status | Notes |
|---|---|---|
| system-architecture.mmd | {{STATUS_ARCH}} | |
| app-flow.mmd | {{STATUS_FLOW}} | |
| user-journey.mmd | {{STATUS_JOURNEY}} | |
| research-loop-pictograph.md | {{STATUS_PICTOGRAPH}} | |
| mock-demo-storyboard.md | {{STATUS_DEMO}} | |
| illustration-brief.md | {{STATUS_ILLUSTRATION}} | |

Replace each `{{STATUS_*}}` with: placeholder / draft / complete

If any status is placeholder: the repo may not be promoted to portfolio.

---

## Rendering

Mermaid files (.mmd) can be rendered:
- In GitHub (native Mermaid rendering in READMEs)
- With `mmdc` (Mermaid CLI): `mmdc -i file.mmd -o file.svg`
- In VS Code with the Mermaid Preview extension
- At https://mermaid.live

---

## Reference instance

See HIDRS at:
`/Users/coreyalejandro/Projects/hidrs-instructional-dependency-study/visuals/`
for a complete example of all 6 files filled in for an N-of-1 observational study.
