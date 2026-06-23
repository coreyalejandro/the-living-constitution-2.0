---
document_type: "C-RSP_CONTRACT"
id: "CRSP-TLC-WORKBENCH-SURFACES-001"
version: "0.1.0"
status: "Draft"
binds_module: "TLC-WORKBENCH-SURFACES"
parent_contract: "CRSP-TLC-WORKBENCH-001"
adoption_tier: "Tier-1-MVG"
author: "agent-produced (requires human acceptance gate before any truth_status upgrade)"
created: "2026-06-23"
---

# C-RSP Build Contract — TLC Workbench Surfaces

Binds the dual-surface requirement for the TLC Workbench.

## 1. Objective

Ensure the product exposes **two first-class operator surfaces** over a shared
application layer:

- **TUI** for low-friction, keyboard-first daily use
- **Web UI** for spatial, visual, and review-heavy workflows

Neither surface may become a second-class shell.

## 2. Required Surface Model

The implementation MUST provide:

### TUI
- launch path from `tlc` / `scripts/tlc.mjs`
- keyboard-first interaction
- fast resume path
- session recovery
- claim/evidence operations
- lifecycle stage visibility
- explicit next actions
- command palette or equivalent global action interface

### Web UI
- parity for all core lifecycle operations
- richer visualization for graph/board/review flows
- module/project dashboard
- lifecycle board
- evidence graph
- draft/paper assembly interface
- product/publication view

## 3. Core Flows That MUST Exist in Both Surfaces

1. Create Project
2. Open / Resume Project
3. Start Session
4. Capture Notes / Questions / Claims
5. Attach / Bind Evidence
6. View Blockers / Missing Evidence
7. Advance Claim / Truth State
8. Generate Paper Packet
9. Generate Product Artifact
10. Close Session / Save Recovery State

## 4. Parity Rule

A flow is considered core if it changes project, claim, evidence, draft,
truth-state, or publication status.

All core flows MUST exist in both surfaces.

Differences allowed:
- Web UI may provide richer visualization
- TUI may provide faster command-driven access

Differences NOT allowed:
- Web UI has a capability the TUI lacks for a core flow
- TUI has a capability the Web UI lacks for a core flow
- one surface bypasses governance checks the other enforces

## 5. Required Files / Architecture

At minimum:
- `src/app/services/`
- `src/web/`
- `src/tui/`
- shared models/state used by both
- parity tests

## 6. Acceptance Criteria (with V&T)

- **AC-1** Both surfaces compile and launch.
- **AC-2** Both surfaces execute all 10 core flows.
- **AC-3** Shared services are used by both surfaces for lifecycle mutation.
- **AC-4** Automated parity tests prove equivalent outcomes for core flows.
- **AC-5** No core lifecycle mutation is implemented surface-locally only.

## 7. Halt Conditions

- `HALT_TUI_MISSING_CORE_FLOW`
- `HALT_WEB_MISSING_CORE_FLOW`
- `HALT_SURFACE_LOCAL_MUTATION`
- `HALT_PARITY_TEST_FAILURE`

## 8. V&T Statement — CRSP-TLC-WORKBENCH-SURFACES-001

| Field | Value |
|---|---|
| **What** | Dual-surface implementation contract for the TLC Workbench. |
| **True** | Requires both TUI and Web UI to expose the full core lifecycle over shared services. |
| **Unverified** | Visual design quality and user preference beyond the specified functional parity. |
| **Not Claimed** | This contract does not prescribe a specific frontend framework. |
| **Functional Status** | DRAFT — implementation pending. |
| **Evidence Ref** | `src/web/`, `src/tui/`, parity test artifacts |
