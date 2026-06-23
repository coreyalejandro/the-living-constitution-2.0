---
document_type: "C-RSP_CONTRACT"
id: "CRSP-TLC-WORKBENCH-ACCESSIBILITY-001"
version: "0.1.0"
status: "Draft"
binds_module: "TLC-WORKBENCH-ACCESSIBILITY"
parent_contract: "CRSP-TLC-WORKBENCH-001"
adoption_tier: "Tier-1-MVG"
author: "agent-produced (requires human acceptance gate before any truth_status upgrade)"
created: "2026-06-23"
---

# C-RSP Build Contract — TLC Workbench Accessibility + Neurodivergent-First UX

Binds accessibility and neurodivergent-first requirements for the Workbench.

## 1. Objective

Make accessibility and neurodivergent support a **hard build requirement**, not
a styling preference or later enhancement.

## 2. Accessibility Requirements

Both surfaces MUST support:

- keyboard-first navigation
- visible focus states
- reduced motion mode
- semantic labels / screen-reader-compatible structure
- color contrast meeting accessible standards
- low-vision-friendly information density options
- interrupt-safe autosave / recovery
- no core flow requiring mouse-only interaction

Web UI MUST additionally support:
- landmark structure
- accessible forms
- accessible modals/dialogs
- skip links or equivalent fast navigation

TUI MUST additionally support:
- predictable keybindings
- non-ambiguous navigation
- no hidden-only essential controls
- screen-reader-aware terminal output where feasible

## 3. Neurodivergent-First Requirements

The product MUST include:

- explicit “next action”
- resume-from-last-state flow
- open loops / unresolved questions view
- focus mode
- progressive disclosure
- adjustable density
- chunked task steps
- blocker visibility
- low-clutter default layout
- ability to begin from partial thought, not only fully structured input

## 4. Required Preference Controls

At minimum:
- reduced motion toggle
- density toggle
- font / typography mode including dyslexia-friendly option
- focus mode toggle
- recovery summary toggle or default surface

## 5. Audit Requirement

No release may claim VERIFIED or VALIDATED unless both exist:

1. automated accessibility audit artifacts
2. manual human accessibility / cognitive-load review artifact

## 6. Acceptance Criteria (with V&T)

- **AC-1** All core flows are keyboard-completable.
- **AC-2** Reduced motion mode exists and is test-covered.
- **AC-3** Density and typography preferences exist and persist.
- **AC-4** Resume/recovery flow exists in both surfaces.
- **AC-5** Automated accessibility audit passes required thresholds.
- **AC-6** Manual audit artifact is committed and references real screens/flows.
- **AC-7** Focus mode and explicit next-action affordance exist in both surfaces.

## 7. Halt Conditions

- `HALT_KEYBOARD_INCOMPLETE`
- `HALT_RECOVERY_FLOW_MISSING`
- `HALT_A11Y_AUDIT_MISSING`
- `HALT_MANUAL_A11Y_REVIEW_MISSING`
- `HALT_NEURODIVERGENT_SUPPORT_MISSING`

## 8. V&T Statement — CRSP-TLC-WORKBENCH-ACCESSIBILITY-001

| Field | Value |
|---|---|
| **What** | Accessibility and neurodivergent-first implementation contract for the Workbench. |
| **True** | Requires accessibility and cognitive-load-sensitive UX as release-gating concerns. |
| **Unverified** | Outcome improvements for all user populations absent longitudinal study. |
| **Not Claimed** | This contract does not claim universal accessibility perfection; it claims hard minimum accessible implementation and auditability. |
| **Functional Status** | DRAFT — implementation pending. |
| **Evidence Ref** | accessibility audit reports, manual review artifacts, UI preference tests |
