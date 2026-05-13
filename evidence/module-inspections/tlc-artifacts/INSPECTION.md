# tlc-artifacts-restructure Inspection

**Inspected:** 2026-05-13
**Inspector:** Hermes (session 3)
**Branch:** classify/tlc-artifacts

---

## Local path

/Users/coreyalejandro/Projects/tlc-artifacts-restructure

---

## Files inspected

- README.md (full first 60 lines)
- manifest/evidence-manifest.md (top 40 lines)
- sessions/ listing + sessions/primary-evidence/ listing
- codebook/ listing
- methodology/ listing
- tlc-golden-prd/ listing
- tlc-model-refactor-plan/ listing
- find: package.json, pyproject.toml, Makefile, *.sh — none found
- find: STATUS.json, STATUS.md — none found
- git log (5 commits)
- git status

---

## Detected purpose

Empirical evidence corpus for the Contract Window and Cognitive Safety research
program. Holds verbatim session transcripts (S01–S03) from extended human-AI
collaborative sessions conducted under the Living Constitution governance protocol
(February–April 2026). Every file in sessions/primary-evidence/ is cited by name
in the associated paper: "Frontin' at WorldMart: The Eight Wonders of Black
Shopping and the Rise of Generative Epistemic Invariants" (NeurIPS/FAccT
submission target).

Contains:
- sessions/primary-evidence/  — S01 (Claude), S02 (Gemini part 1), S03 (Gemini part 2)
- sessions/supplementary/     — supporting sessions, not directly cited
- sessions/development/       — working sessions (NOT empirical evidence)
- manifest/evidence-manifest.md — claim-to-session-to-line mapping
- codebook/annotation-guide.md, vt-statement-spec.md
- methodology/session-protocol.md, evaluation-prompt-template.md
- tlc-golden-prd/ — PRD HTML artifacts
- tlc-model-refactor-plan/ — model refactor plan docs

---

## Governance role

Tier 1 evidence corpus backing the cognitive safety research program.
Not a governance runtime or library — it is the empirical substrate from which
paper observations are derived and the source for COGNITIVE-GOVERNANCE-LAB's
research claims.

---

## Research lane

ai_safety_governance / cognitive_safety_evidence

Source data and evidence documentation for the "Frontin' at WorldMart" paper.
Backs H1 (Intent Fidelity), H2 (Bilateral Repair), H3 (Accessibility) via
session records. Obs 4 evidence (BREAK_GLASS) is cross-referenced but stored in
cognitive-governance-lab.

---

## Product lane

evidence_archive

No product routes. No web app. No deployable artifact.

---

## Evidence found

- git log: 5 commits. Most recent: "remove Remotion video artifact sessions —
  not constitutional evidence" — shows active curation decisions, not stale dump.
- 3 primary evidence sessions present on disk (S01, S02, S03).
- evidence-manifest.md: claim-to-session mapping exists. Some line references
  marked "TBD — full audit pending" (e.g. S01 Obs 1 mapping).
- Obs 2 primary archive is a .docx external to this repo (kimi.com share link).
- Obs 4 evidence cross-referenced to cognitive-governance-lab; not stored here.
- codebook: annotation-guide.md and vt-statement-spec.md present.
- methodology/session-protocol.md present.

---

## Routes found

None. Pure document/evidence repository.

---

## Tests found

None. No package.json, pyproject.toml, Makefile, or test runner of any kind.
No machine-checkable artifact index.

---

## Recommended truth_status

draft

Rationale:
- Structured evidence repository with real content and active curation.
- Evidence manifest exists but citation audit is incomplete (S01 line refs are TBD).
- Obs 2 primary archive is external (.docx, kimi.com link) — not repo-resident.
- No STATUS.json, no verifier, no test suite.
- Paper is not yet submitted — this is pre-submission evidence preparation.
- "draft" correctly signals: real organized content, not yet submission-ready.

NOT partial: partial implies implementation in progress.
NOT working: no verifier exists to produce a working result.
NOT unverified: files were read, git history confirms active curation.

---

## Recommended implementation_status

draft

---

## Remaining unverified items

- S01 line references in evidence-manifest.md: "TBD — full audit pending"
- Obs 2 kimi.com share link: not confirmed accessible this session
- Obs 4 BREAK_GLASS artifact: stored in cognitive-governance-lab, not verified here
- tlc-golden-prd/: HTML PRD files present — purpose relative to evidence corpus unclear
- sessions/supplementary/ and sessions/development/ contents: not read this session
- Paper submission status: NeurIPS/FAccT target, not confirmed submitted
- No CRSP contract bound
- No STATUS.json
