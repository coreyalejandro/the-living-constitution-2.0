---
document_type: "C-RSP_CONTRACT"
id: "CRSP-TLC-WORKBENCH-LIFECYCLE-001"
version: "0.1.0"
status: "Draft"
binds_module: "TLC-WORKBENCH-LIFECYCLE"
parent_contract: "CRSP-TLC-WORKBENCH-001"
adoption_tier: "Tier-1-MVG"
author: "agent-produced (requires human acceptance gate before any truth_status upgrade)"
created: "2026-06-23"
---

# C-RSP Build Contract — TLC Workbench Lifecycle

Binds the canonical end-to-end R&D lifecycle the Workbench must implement.

## 1. Objective

Ensure TLC supports one coherent governed lifecycle:

**research → paper → product**

This lifecycle must be executable, inspectable, resumable, and evidence-backed.

## 2. Canonical Lifecycle

The Workbench MUST support the following ordered phases:

1. **Project Intake**
2. **Research Active**
3. **Evidence Bound**
4. **Analysis**
5. **Drafting**
6. **Review**
7. **Validation**
8. **Productization**
9. **Publication / Registration**

## 3. First-Class Domain Entities

The implementation MUST define and persist first-class entities for:

- Project
- ResearchSession
- Claim
- EvidenceItem
- EvidenceLink
- DraftSection
- PaperPacket
- ProductArtifact
- PublicationSurface
- RecoverySnapshot

## 4. Required Lifecycle Behaviors

### Project Intake
- define question
- define scope
- define target outputs
- define governing contract

### Research Active
- session start/resume
- note capture
- question capture
- hypothesis/claim capture
- blocker capture

### Evidence Bound
- attach evidence
- connect evidence to claims
- display missing required evidence

### Analysis
- summarize evidence posture
- show unresolved gaps
- prepare advancement readiness

### Drafting
- map claims to sections
- generate V&T surfaces
- produce paper packet structure

### Review
- show gaps, limitations, blockers, unresolved claims
- support reviewer-facing inspection

### Validation
- enforce truth-state and evidence rules
- block invalid advancement

### Productization
- convert outputs to registered module/artifact/demo/package

### Publication / Registration
- generate portfolio/release/public surface artifact where applicable

## 5. Mandatory Flow

The following flow MUST work end-to-end:

**Create Project → Start Session → Capture Claim → Bind Evidence → Advance Status → Generate Paper Packet → Generate Product Artifact**

## 6. Acceptance Criteria (with V&T)

- **AC-1** All lifecycle phases exist in code and state.
- **AC-2** Required domain entities exist and are persisted.
- **AC-3** Mandatory flow executes successfully in both surfaces.
- **AC-4** Invalid advancement is blocked with explicit halt reason.
- **AC-5** Paper packet generation references claims/evidence, not free-floating text only.
- **AC-6** Product artifact generation is linked to validated lifecycle state.

## 7. Halt Conditions

- `HALT_PROJECT_WITHOUT_SCOPE`
- `HALT_CLAIM_WITHOUT_BINDING`
- `HALT_EVIDENCELESS_ADVANCEMENT`
- `HALT_DRAFT_WITHOUT_TRACEABILITY`
- `HALT_PRODUCTIZATION_WITHOUT_VALIDATION`

## 8. V&T Statement — CRSP-TLC-WORKBENCH-LIFECYCLE-001

| Field | Value |
|---|---|
| **What** | Lifecycle contract for research → paper → product execution in the Workbench. |
| **True** | Defines the required states, entities, and mandatory end-to-end governed workflow. |
| **Unverified** | Whether every future research domain will fit this lifecycle without adaptation. |
| **Not Claimed** | This contract does not claim publication acceptance or external product success. |
| **Functional Status** | DRAFT — implementation pending. |
| **Evidence Ref** | lifecycle tests, generated paper packets, generated product artifacts |
