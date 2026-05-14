# TLC 2.0 Integration Map

## Purpose

This map classifies every known project, prototype, artifact, and route
that falls under TLC 2.0 governance. It is the human-readable companion
to the three registry JSON files.

Truth statuses default to `unverified` until a classification pass is run.
Do not upgrade a status without running `npm run verify:registry` first.

---

## Governance Core

| ID                         | Path / Repo                              | Status      |
|----------------------------|------------------------------------------|-------------|
| CRSP-STC-RUNTIME-001       | the-living-constitution-2.0/     | working     |
| TLC-ARTIFACTS-RESTRUCTURE  | tlc-artifacts-restructure/               | unverified  |
| TLC-EVIDENCE-OBSERVATORY   | tlc-evidence-observatory/                | unverified  |
| THE-LIVING-CONSTITUTION    | the-living-constitution/                 | unverified  |

Notes:
- CRSP-STC-RUNTIME-001 is the only entry promoted to `working`. Verified
  by npm run verify (5 suites, 9 tests) on 2026-05-13.
- All others are unverified pending classification pass.

---

## Hyperagent Prototypes

| ID                                    | Path / Repo                                        | Status      |
|---------------------------------------|----------------------------------------------------|-------------|
| AGENT-SENTINEL                        | agent-sentinel-alignment-anomaly-detector/         | unverified  |
| LLM-COUNCIL                           | llm-council/                                       | unverified  |
| MULTIAGENT-DEBATE                     | multiagent-debate/                                 | unverified  |
| META-PROMPT-ARCHITECT                 | meta-prompt-architect/                             | unverified  |
| MISALIGNMENT-EVIDENCE-LAB             | misalignment-evidence-lab/                         | unverified  |
| PROACTIVE-AI-CONSTITUTION-TOOLKIT     | PROACTIVE-AI-CONSTITUTION-TOOLKIT/                 | unverified  |
| AI-SAFETY-IDENTITY-STRATEGY           | ai-safety-identity-strategy/                       | unverified  |

Notes:
- None of these have been inspected in this classification pass.
- agent-sentinel has App.tsx + docker-compose suggesting a running prototype.
- llm-council has frontend + backend dirs suggesting partial implementation.
- All default to `unverified`. Run scan:projects to compare against registry.

---

## Portfolio Routes (Public Surface)

| ID                          | Path / Repo                          | Surface           | Status      |
|-----------------------------|--------------------------------------|-------------------|-------------|
| PORTFOLIO-V2                | coreyalejandro-portfolio-v2/         | public_portfolio  | unverified  |
| COREYS-AGENTIC-PORTFOLIO    | coreys-agentic-portfolio/            | public_portfolio  | unverified  |
| PORTFOLIO-MAIN-6            | corey-alejandro-main-portfolio-site-6| public_portfolio  | unverified  |

---

## Lab Routes (Private Surface)

| ID                          | Path / Repo                          | Surface       | Status      |
|-----------------------------|--------------------------------------|---------------|-------------|
| ZERO-SHOT-BUILD-OS-DOCS     | zero-shot-build-os-docs/             | private_lab   | unverified  |
| AI-SAFETY-IDENTITY-STRATEGY | ai-safety-identity-strategy/         | private_lab   | unverified  |
| RESEARCH-ORIGIN-STORY       | the-research-origin-story/           | private_lab   | unverified  |

---

## Documentation Routes

| ID                          | Path                                             | Surface       | Status      |
|-----------------------------|--------------------------------------------------|---------------|-------------|
| CONSTITUTION-MD             | constitution/SOCIOTECHNICAL_CONSTITUTION.md      | documentation | working     |
| CONTRACT-SCHEMA             | schemas/contract-schema.json                     | documentation | working     |
| EVIDENCE-SCHEMA             | schemas/evidence-entry.schema.json               | documentation | working     |
| HALT-SCHEMA                 | schemas/halt-condition.schema.json               | documentation | working     |
| VNT-SCHEMA                  | schemas/vnt-statement.schema.json                | documentation | working     |
| TLC-20-IDENTITY             | docs/integration/TLC_2_0_IDENTITY.md             | documentation | working     |
| TLC-20-INTEGRATION-MAP      | docs/integration/TLC_2_0_INTEGRATION_MAP.md      | documentation | working     |
| MODULES-REGISTRY            | registry/modules.registry.json                   | module_library| working     |
| ARTIFACTS-REGISTRY          | registry/artifacts.registry.json                 | module_library| working     |
| ROUTES-REGISTRY             | registry/routes.registry.json                    | module_library| working     |

Notes:
- Schema files were present and validated as of 2026-05-13 repair. Marked `working`.
- Registry files are newly created in this pass. Marked `working` as they are
  the authoritative source for this session.

---

## Evidence Artifacts

| ID                               | Path                                                   | Status      |
|----------------------------------|--------------------------------------------------------|-------------|
| HALT-LOG-001                     | evidence/CRSP-STC-RUNTIME-001/halt-log.jsonl           | working     |
| LIFECYCLE-LOG-001                | evidence/CRSP-STC-RUNTIME-001/lifecycle.jsonl          | working     |
| VNT-AUDIT-001                    | evidence/CRSP-STC-RUNTIME-001/vnt-audit.jsonl          | working     |

---

## Exhibit (Public Interactive)

No exhibits classified yet. Planned: Contract Window demo as public exhibit.

| ID                     | Path | Surface | Status  |
|------------------------|------|---------|---------|
| CONTRACT-WINDOW-EXHIBIT | TBD  | exhibit | planned |

---

## Routing Constraints

1. `governance_core` surfaces must pass `npm run verify` before any promotion.
2. `private_lab` surfaces are NOT linked from public_portfolio without explicit
   CRSP contract approval.
3. `deprecated` and `quarantined` entries remain in registry but are never
   promoted to a live route.
4. Evidence artifacts are append-only. Never overwrite or delete.

---

## Classification Pass Log

| Date       | Pass Type        | Performed By         | Result                         |
|------------|------------------|----------------------|--------------------------------|
| 2026-05-13 | Initial creation | CRSP agent session   | 7 files created, registries    |
|            |                  |                      | populated, core=working,       |
|            |                  |                      | all others=unverified          |

---
V&T: EXISTS — integration map created and bound to TLC 2.0 identity.
NOT CLAIMED — unverified entries not inspected in this pass.
FUNCTIONAL STATUS — map document only; no routes deployed or linked.
