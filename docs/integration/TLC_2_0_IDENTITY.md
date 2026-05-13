# TLC 2.0 Identity

## What TLC 2.0 Is

TLC 2.0 (The Living Constitution, version 2.0) is the integration layer that
connects the SocioTechnical Constitution Runtime (this repo) to the broader
constellation of governance tooling, evidence labs, portfolio surfaces, and
public-facing exhibits produced under the CRSP/UPOS-7-VS methodology.

TLC 1.0 was a standalone document-based constitution repo. TLC 2.0 extends
that to a runtime-enforced, multi-surface system with classified modules,
route surfaces, and artifact registries.

## Scope

TLC 2.0 governs:

- The governance core runtime (this repo)
- Existing TLC project artifacts and evidence files
- Hyperagent prototypes built under CRSP contracts
- Portfolio and Lab public surfaces
- Documentation routes
- Evidence artifact trail

TLC 2.0 does NOT govern:

- Client work unrelated to governance or AI safety
- Third-party tooling that has not been classified in the registry
- Infrastructure managed outside this codebase

## Control Plane Location

The integration control plane lives inside this repo at:

  registry/modules.registry.json    — classified modules
  registry/artifacts.registry.json  — evidence and build artifacts
  registry/routes.registry.json     — surface routing map

Scripts:

  scripts/scan-projects.mjs         — walks /Projects, reports unregistered modules
  scripts/verify-registry.mjs       — validates registry schema + truth status coverage

## Surfaces

| Surface ID         | Description                                         |
|--------------------|-----------------------------------------------------|
| governance_core    | This runtime repo. Policy engine, CLI, schemas.     |
| private_lab        | Active R&D. Not public. Prototypes and experiments. |
| public_portfolio   | Published portfolio routes. Corey's public work.    |
| documentation      | Docs, specs, and constitutional text.               |
| module_library     | Reusable governance modules and shared schemas.     |
| exhibit            | Public-facing demos, interactive exhibits.          |

## Truth Statuses

| Status            | Meaning                                                    |
|-------------------|------------------------------------------------------------|
| working           | Verified functional. Tests or manual check confirmed.      |
| partial           | Core path works. Known gaps remain.                        |
| static_prototype  | UI or demo exists but no live data or runtime logic.       |
| draft             | Written but not run or tested.                             |
| planned           | Registered. Not yet built.                                 |
| deprecated        | No longer maintained. Kept for audit trail only.           |
| quarantined       | Known broken or unsafe. Do not promote.                    |
| unverified        | Default. Not yet inspected in this classification pass.    |

## Versioning

This identity document is locked to:

  contract_id : CRSP-STC-RUNTIME-001
  tlc_version : 2.0.0
  schema_date : 2026-05-13

Updates require a V&T statement and a corresponding entry in
evidence/CRSP-STC-RUNTIME-001/lifecycle.jsonl.

---
V&T: EXISTS — TLC 2.0 identity declared and bound to active contract.
NOT CLAIMED — external systems verified. FUNCTIONAL STATUS — identity doc only.
