# SocioTechnical Constitution Runtime

**Contract ID:** CRSP-STC-RUNTIME-001  
**Version:** 1.0.0  
**Status:** Draft — Tier-1-MVG

This is the enforcement runtime for the SocioTechnical Constitution.
It implements the Contract Window, Policy Engine, Evidence Observatory,
Role-Based Access, Break-Glass Override, Constitutional Council Dashboard,
Amendment Process, and Integration Adaptors.

---

## What This Is

The SocioTechnical Constitution is a governance document that defines
principles, invariants, and processes for human-AI collaborative work.
This runtime makes those principles executable — it blocks policy
violations at the git hook, CI, and API layer, and surfaces governance
state through the Contract Window UI.

---

## Project Structure

    constitution/         The Constitution document and amendments
    contracts/active/     The current build contract (source of truth)
    contracts/archive/    Historical contract versions
    schemas/              JSON schemas for contracts, V&T, halts, evidence
    src/core/             Enforcement engine (Policy, Evidence, Roles)
    src/ui/               Contract Window and dashboard components
    src/adaptors/         Git hooks, CI plugin, LLM gateway
    src/cli/              tlc-cli command-line tool
    tests/                Unit, integration, and compliance tests
    evidence/             Immutable audit logs (JSONL, append-only)

---

## Build Sequence (11 Steps, Each Requires Human Gate)

    Step 1  - File System Layout
    Step 2  - Core Data Models and Schemas
    Step 3  - Contract Manager
    Step 4  - Policy Engine
    Step 5  - Evidence Observatory
    Step 6  - Contract Window (Strip + Kanban)
    Step 7  - Role-Based Access
    Step 8  - Break-Glass Override
    Step 9  - Constitutional Council Dashboard
    Step 10 - Amendment Process UI
    Step 11 - Integration Adaptors (Git, CI)

Each step must be approved by a human before the next begins.
See contracts/active/BUILD_CONTRACT.md for full specifications.

---

## Quick Start (when implemented)

    npm install
    npx tlc-cli validate              # validate active contract
    npx tlc-cli status                # show contract window summary
    npx tlc-cli break-glass --help    # emergency override workflow

---

## Evidence

All gate decisions, halt events, and overrides are written to:

    evidence/CRSP-STC-RUNTIME-001/lifecycle.jsonl
    evidence/CRSP-STC-RUNTIME-001/halt-log.jsonl
    evidence/CRSP-STC-RUNTIME-001/vnt-audit.jsonl

Logs are append-only and should never be edited manually.

---

## Governance State

Draft. Pending human approval of each implementation block.
Transitions to Active (Tier-2-Operational) after all acceptance
criteria in BUILD_CONTRACT.json are verified.

---

V&T: EXISTS (directory and contract scaffold) |
VERIFIED AGAINST git commit 353ef6a |
NOT CLAIMED: running code, working UI |
FUNCTIONAL STATUS: Scaffold only — awaiting implementation.
