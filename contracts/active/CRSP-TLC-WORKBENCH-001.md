---
document_type: "C-RSP_CONTRACT"
id: "CRSP-TLC-WORKBENCH-001"
version: "0.1.0"
status: "Draft"
binds_module: "TLC-WORKBENCH"
parent_contract: "CRSP-STC-RUNTIME-001"
adoption_tier: "Tier-1-MVG"
author: "agent-produced (requires human acceptance gate before any truth_status upgrade)"
created: "2026-06-23"
child_contracts:
  - "CRSP-TLC-WORKBENCH-SURFACES-001"
  - "CRSP-TLC-WORKBENCH-ACCESSIBILITY-001"
  - "CRSP-TLC-WORKBENCH-LIFECYCLE-001"
  - "CRSP-TLC-WORKBENCH-HARDENING-001"
---

# C-RSP Build Contract — TLC Workbench

Binds the `TLC-WORKBENCH` product initiative: a neurodivergent-first, dual-surface
(Web UI + TUI) governed R&D workbench that supports the end-to-end lifecycle
**research → paper → product**.

This contract is **non-negotiable** and **agent-executable**. It is written so any agent,
human, or mixed team must implement to spec or halt.

## 1. Objective

Transform TLC from a governance-heavy research operating system into a usable,
in-demand, accessible, neurodivergent-first operator workbench for advanced
researchers, research engineers, and governed AI product builders.

The target artifact is not just infrastructure. It is a daily-driver tool that:

- supports structured and messy inquiry,
- preserves epistemic rigor,
- reduces cognitive overload,
- records verifiable evidence,
- helps users move from investigation to publishable paper artifacts,
- and helps turn validated outputs into product/demo/portfolio modules.

## 2. Non-Negotiable Requirements

The Workbench MUST:

1. expose **two first-class operator surfaces**:
   - a keyboard-first TUI
   - a richer Web UI

2. support one canonical end-to-end lifecycle:
   - Create Project
   - Start / Resume Session
   - Capture Notes / Claims / Questions
   - Bind Evidence
   - Advance Truth State / Claim State
   - Generate Paper Packet
   - Generate Product / Module Artifact
   - Publish / Register Outcome

3. be **neurodivergent-first**, meaning:
   - low ambiguity
   - explicit next actions
   - interruption-safe recovery
   - reduced context switching
   - adjustable information density
   - keyboard-first operation
   - accessible semantics
   - predictable state transitions

4. preserve TLC’s governance guarantees:
   - contract before claim
   - evidence before advancement
   - truth-state gate
   - append-only evidence chain
   - halt on invalid advancement
   - auditable operator acknowledgment where required

5. be implementable by agents without interpretive drift:
   - all deliverables named
   - all acceptance criteria testable
   - all halt conditions explicit
   - all V&T obligations specified

## 3. Scope

In scope:
- product architecture for the Workbench
- shared services and domain models
- TUI/Web parity for core flows
- accessibility and neurodivergent-first interaction requirements
- research → paper → product lifecycle implementation
- hardened CI and evidence-backed build enforcement

Out of scope:
- proving market demand
- full institutional deployment
- claims of outcome superiority absent empirical validation
- replacement of all legacy TLC modules in one pass

## 4. Required Deliverables

The implementation MUST introduce, at minimum:

- `src/app/services/`
- `src/app/state/`
- `src/app/models/`
- `src/web/`
- `src/tui/` upgrades sufficient for parity
- lifecycle orchestration services
- accessibility preferences/state layer
- canonical project/workflow entities
- tests for TUI/Web parity
- CI enforcement for truth-state + evidence requirements
- evidence entries for all truth-state-advancing build claims

## 5. Acceptance Criteria (with V&T)

- **AC-1** A parent Workbench module is added to registry/binding surfaces with no I1 gap.
- **AC-2** Child contracts for surfaces, accessibility, lifecycle, and hardening are committed.
- **AC-3** Shared app/service architecture exists and is used by both Web UI and TUI.
- **AC-4** Canonical lifecycle works end-to-end in both surfaces.
- **AC-5** All truth-state claims for the Workbench are backed by committed V&T.
- **AC-6** Any implementation that omits required accessibility or parity checks is BLOCKED.

V&T for each AC must include:
- EXISTS
- VERIFIED AGAINST
- NOT CLAIMED
- FUNCTIONAL STATUS

## 6. Halt Conditions

- `HALT_WORKBENCH_CONTRACT_MISSING`
- `HALT_SURFACE_PARITY_BROKEN`
- `HALT_ACCESSIBILITY_REQUIREMENT_MISSING`
- `HALT_LIFECYCLE_INCOMPLETE`
- `HALT_TRUTH_STATE_ADVANCE_WITHOUT_EVIDENCE`

## 7. V&T Statement — CRSP-TLC-WORKBENCH-001

| Field | Value |
|---|---|
| **What** | Parent binding contract for the TLC Workbench initiative. |
| **True** | Defines the non-negotiable implementation envelope for the productization of TLC into a dual-surface governed R&D workbench. |
| **Unverified** | Whether the implemented product becomes in-demand in the market; whether it improves researcher throughput absent empirical study. |
| **Not Claimed** | This contract does not itself prove usability, adoption, or research outcome improvement. |
| **Functional Status** | DRAFT — binding spec only; implementation pending. |
| **Evidence Ref** | `contracts/active/CRSP-TLC-WORKBENCH-*.md` |
