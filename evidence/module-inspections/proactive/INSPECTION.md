# PROACTIVE Inspection

**Inspected:** 2026-05-13
**Inspector:** Hermes (session 3)
**Branch:** classify/proactive
**Canonical path:** /Users/coreyalejandro/Projects/28441830

---

## Path disambiguation

find returned multiple PROACTIVE-related dirs. Canonical repo selected:
  /Users/coreyalejandro/Projects/28441830

Basis for selection: only dir with pyproject.toml, 15 test files, 731 tests
passing, .gitlab/duo agent config, and active git history. All other dirs
(proactive-research-program, PROACTIVE-AI-CONSTITUTION-TOOLKIT,
proactive-migration-package, PROACTIVE_MIGRATION_PACKAGE, proactive-demo,
proactive-gitlab-agent) are forks, archives, or satellites — not classified
this session.

---

## Files inspected

- AGENTS.md — project overview, module structure
- README.md — top 40 lines (description, version, status)
- pyproject.toml — full (build system, deps, version 4.0.0)
- tests/ listing — 15 test files confirmed
- find: STATUS.json, STATUS.md — none found
- find: CRSP / BUILD_CONTRACT files — none found (contract_window.py is
  implementation, not a governance contract file)
- evidence/ listing — 2 markdown files (kiro deception evidence)
- .gitlab/ tree — proactive-agent.yml, proactive-triage.yml, claude.yaml
- python -m pytest tests/ — full output
- git log (5 commits)

---

## Detected purpose

Constitutional AI safety agent for GitLab Duo Chat.

Analyzes merge requests, descriptions, diffs, and metadata against a
constitutional framework. Detects: unsupported claims, phantom work,
unverified confidence, missing traceability.

Five failure classes: F1 (claim without evidence), F2 (phantom completion),
F3 (unverified confidence), F4 (missing traceability), F5 (cross-episode drift).

Core modules: cli.py, col.py (Cognitive Operating Layer), contract_window.py,
drift_detector.py, gitlab_client.py, llm_client.py, mr_analyzer.py,
report_formatter.py, severity_scorer.py, label_assigner.py, validator.py,
vt_generator.py, web_ui.py.

README declared status: "Production-ready within defined hackathon scope."

---

## Governance role

Governance module + safety tool.

PROACTIVE is the enforcement layer for the Living Constitution's epistemic
reliability invariants. It operationalizes the constitutional framework as
a GitLab-native code review pipeline. It is the implementation artifact that
makes the TLC 2.0 governance system machine-actionable in a dev workflow.

---

## Research lane

ai_safety_epistemic_reliability / constitutional_ai_safety

Enforces F1-F5 failure class detection as safety invariants in MR review.
Related to cognitive-governance-lab's contract_window.py — PROACTIVE is the
production application; cognitive-governance-lab is the research prototype.

---

## Product lane

safety_tool / governance_module

GitLab Duo agent. Python package installable via pip. CLI entry point
(proactive.cli). Web UI present (web_ui.py). Docker-deployable (inferred
from egg-info and dependency structure).

---

## Evidence found

git log (5 commits), all on main:
- 9ac6627: chore: gitignore large demo mp4s (GitHub 100MB limit)
- fcb410c: Merge: sync main with upstream — no functional modifications
- 3e51579: Merge branch docs/video-production-deliverables
- 66deec9: docs: add video production deliverables — script, edit plan, judge guide
- 86964cb: Merge branch duo-edit-20260325-145733

.gitlab/duo/agents/proactive-agent.yml — GitLab AI Catalog registration
.gitlab/duo/flows/proactive-triage.yml — triage flow definition
evidence/ — kiro_deception.md, kiro_admits_lying.md (behavioral evidence)

---

## Routes found

Web UI route: web_ui.py exists (87% coverage). No confirmed live URL.
GitLab Duo Chat integration via proactive-agent.yml — not a web route.

---

## Tests found

15 test files, 731 tests, 1 warning (non-critical PytestCollectionWarning),
1.37s runtime. Coverage 72% overall.

Key coverage:
- contract_window.py: 98%
- report_formatter.py: 98%
- severity_scorer.py: 99%
- vt_generator.py: 96%
- semantic_drift_detector.py: 95%
- mr_analyzer.py: 90%

Low coverage (by design — require live API keys):
- cli.py: 0% (requires GitLab + Anthropic API)
- gitlab_client.py: 0% (requires GitLab API)
- llm_client.py: 38%

---

## Recommended truth_status

working

Rationale:
- 731 tests pass in 1.37s with no failures.
- Core constitutional enforcement modules verified at 90-99% coverage.
- GitLab agent config registered (.gitlab/duo/agents/).
- Python package installable (pyproject.toml, proactive.egg-info present).
- README declares "Production-ready within defined hackathon scope."

Low coverage on cli.py and gitlab_client.py is expected — those require live
API credentials and are integration-surface, not core logic.

---

## Recommended implementation_status

working

---

## Remaining unverified items

- No STATUS.json — no machine-readable project status file
- No CRSP governance contract bound
- cli.py: 0% coverage — requires Anthropic + GitLab API keys to exercise
- gitlab_client.py: 0% coverage — same
- Web UI: 87% coverage but no live URL confirmed
- GitLab Duo Chat integration: agent registered but not confirmed deployed live
- Satellite repos (proactive-research-program, proactive-migration-package,
  proactive-demo, proactive-gitlab-agent, PROACTIVE-AI-CONSTITUTION-TOOLKIT)
  not classified — their relationship to this canonical repo is unverified
- "Production-ready within defined hackathon scope" — hackathon scope not
  formally documented in this repo
