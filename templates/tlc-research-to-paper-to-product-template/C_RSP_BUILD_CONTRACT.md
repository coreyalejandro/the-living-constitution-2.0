# C-RSP Build Contract — {{PROJECT_NAME}}

**Contract ID:** {{CONTRACT_ID}}
**Contract version:** 1.0.0
**Date:** {{CONTRACT_DATE}}
**Status:** DRAFT — replace all placeholders before beginning work

---

## Objective

{{RESEARCH_QUESTION}}

<!-- Example:
Does LMS-delivered instruction produce measurable dependency opacity
across courses in a professional certificate program?
-->

---

## Repo / system

`{{PROJECT_SLUG}}`

---

## Topology mode

N-of-1 observational study / single-researcher project

<!-- Replace with actual topology:
- N-of-1 observational study
- Multi-participant controlled experiment
- Engineering implementation + evaluation
- Literature synthesis + theoretical contribution
- Mixed methods (specify phases)
-->

---

## Profile type

<!-- Choose one or more:
- Researcher as sole participant
- Independent researcher
- Engineer-researcher
- Multi-site research team
-->

{{PROFILE_TYPE}}

---

## Verifier class

<!-- Describe how the work will be verified:
- Internal: validate_repo.py passes, evidence index populated
- External: peer review, IRB, replication
- Automated: test suite, schema validation
- Manual: researcher review, annotation audit
-->

- Internal repo validator: `scripts/validate_repo.py`
- Evidence index: `evidence/index/evidence_index.csv`
- Schema validation: `schemas/`
- Publication gate: `docs/PORTFOLIO_PUBLICATION_GATE.md`

---

## Baseline state

<!-- Describe the state of the repo at contract signing:
- What exists
- What is confirmed working
- What is absent
-->

Repo scaffold exists. validate_repo.py passes. No data collected. No analysis performed.

---

## Scope boundary

<!-- List exactly what this contract covers.
     Be specific. Anything not listed here is out of scope.
-->

IN SCOPE:
- {{SCOPE_ITEM_1}}
- {{SCOPE_ITEM_2}}
- {{SCOPE_ITEM_3}}

<!-- Example for HIDRS:
- Observing and logging instructional events during Course 1 of one professional certificate program
- Measuring four constructs: dependency_opacity_score, prioritization_load, cognitive_switching_cost, assessment_alignment_risk
- Retrospective capture for Lessons 1-3 (completed before study began)
- Prospective logging from Lesson 4 forward
- Workbook as primary data surface
- Paper packet targeting one venue
-->

---

## Not-claimed boundary

<!-- List exactly what this contract does NOT cover.
     These items must not appear as claims in STATUS.md or the portfolio.
-->

NOT IN SCOPE / NOT CLAIMED:
- Generalizability to populations beyond this study's declared scope
- External validity unless separately established
- Statistical significance unless explicitly computed
- Any result not traceable to evidence/index/evidence_index.csv
- Any claim made before validate_repo.py passes
- {{NOT_CLAIMED_1}}
- {{NOT_CLAIMED_2}}

---

## Dependencies

<!-- List external dependencies that could block the work:
- Data sources
- Tools and services
- Human participants or reviewers
- APIs or platforms
- Institutional approvals
-->

- {{DEPENDENCY_1}}
- {{DEPENDENCY_2}}

---

## Artifacts

<!-- List the expected deliverables with paths and format:
-->

| Artifact | Path | Format | Status |
|---|---|---|---|
| Study protocol | docs/STUDY_PROTOCOL.md | markdown | planned |
| Evidence index | evidence/index/evidence_index.csv | csv | planned |
| Analysis outputs | analysis/outputs/ | varies | planned |
| Paper abstract | paper/abstract.md | markdown | planned |
| Paper outline | paper/outline.md | markdown | planned |
| Product requirements | product/README.md | markdown | planned |
| Portfolio packet | reports/final/ | markdown | planned |

---

## Invariants

The following invariants must hold at all times:

**I1 — Evidence integrity**
No evidence item may be altered after it is committed to evidence/index/evidence_index.csv. Corrections require a new entry with a correction note.

**I2 — Missing data policy**
Missing data is marked MISSING. It is never estimated, averaged, or imputed without explicit documentation of the imputation method.

**I3 — Private data exclusion**
data/private/, evidence/screenshots/, and evidence/excerpts/ must remain excluded from git at all times. validate_repo.py checks this.

**I4 — Claim traceability**
Every public claim must be traceable to at least one entry in evidence/index/evidence_index.csv. Claims without evidence are unverified.

**I5 — Contract-first**
No prospective data collection begins before C_RSP_BUILD_CONTRACT.md is complete and STATUS.md is initialized.

**I6 — Status accuracy**
STATUS.md truth labels must match the runtime registry entry for this project. They must not be upgraded without running validate_repo.py and updating the registry.

**I7 — No copyrighted content**
No copyrighted LMS lesson text, quiz answers, or assessment content may be committed to any non-excluded directory.

**I8 — Visual Understanding Layer (NONNEGOTIABLE)**
The repo must include architecture, workflow/app-flow, user journey, pictograph/process explanation, mock demo/storyboard, and illustration brief before it may be considered user-ready, portfolio-ready, publication-ready, or safe to use for prospective work.

If the visual layer is missing, incomplete, placeholder-only, or contradicts the written protocol, validate_repo.py MUST FAIL with an explicit error message. This invariant cannot be waived.

---

## Acceptance criteria

<!-- Define what "done" means for each major phase:
-->

### Phase 1 — Scaffold complete
- [ ] validate_repo.py passes (exit 0)
- [ ] C_RSP_BUILD_CONTRACT.md exists and is non-empty
- [ ] STATUS.md initialized
- [ ] Visual understanding layer: all 6 files exist
- [ ] evidence/index/evidence_index.csv exists with header
- [ ] .gitignore excludes private/sensitive folders
- [ ] Registry entry created in modules.registry.json

### Phase 2 — Data collection complete
- [ ] All planned sessions logged in evidence_index.csv
- [ ] No MISSING fields that could have been captured prospectively
- [ ] Workbook passes validate_workbook.py

### Phase 3 — Analysis complete
- [ ] analysis/outputs/ populated
- [ ] Claims drafted in paper/results.md
- [ ] Each claim traceable to evidence

### Phase 4 — Paper packet complete
- [ ] All paper sections written
- [ ] Abstract states scope limitations explicitly
- [ ] References complete in paper/references.bib

### Phase 5 — Portfolio gate passed
- [ ] docs/PORTFOLIO_PUBLICATION_GATE.md checklist completed
- [ ] Portfolio packet generated
- [ ] Registry entry updated to reflect final status
- [ ] GitHub reviewer summary gate passed

---

## Halt conditions

Stop and do not continue if:
- validate_repo.py fails and the failure is not immediately correctable
- An invariant is violated (especially I3, I7, I8)
- Data collection produces results that require scope expansion beyond this contract
- A dependency becomes unavailable and blocks more than one phase
- Evidence integrity is compromised

On halt: mark STATUS.md as HALTED, record the halt reason and date, open a resolution note.

---

## Truth surface

Primary truth surface: `STATUS.md`
Secondary truth surface: `evidence/index/evidence_index.csv`
Registry entry: `sociotechnical-constitution-runtime/registry/modules.registry.json`
Public reviewer surface: `coreyalejandro.com/modules`

---

## Rollback / recovery

If a phase produces bad data or a violated invariant:
1. Do not delete evidence — create a correction entry
2. Revert STATUS.md to the last valid state
3. Document what happened in a recovery note in reports/
4. Run validate_repo.py after recovery
5. Do not resume prospective logging until recovery is confirmed

---

## Product target

{{PRODUCT_TARGET}}

<!-- Example:
A web application or notebook that demonstrates the research finding
and allows a reviewer to interact with the evidence surface.
-->

---

## Paper target

{{PAPER_TARGET}}

<!-- Example:
One academic paper targeting {{VENUE}} by {{DEADLINE}}.
Working title: {{WORKING_TITLE}}
-->
