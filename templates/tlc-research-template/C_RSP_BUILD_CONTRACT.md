# C-RSP Build Contract — {{PROJECT_NAME}}

**Contract ID:** {{CONTRACT_ID}}
**Module:** {{MODULE_ID}}
**Surface:** {{SURFACE}}
**Created:** {{DATE}}
**Status:** Draft

---

## 1. Objective

Build and validate {{PROJECT_NAME}} as a TLC-governed module within the {{SURFACE}} surface.

## 2. Scope

{{PROJECT_NAME}} implementation within verified local scope.
Work proceeds in a single machine context without external integrations
unless explicitly authorized in this contract.

## 3. Not Claimed

- Production deployment without explicit safety review
- Generalizability beyond verified local scope
- Integration with external services not listed in Dependencies
- Any behavior not backed by evidence in the evidence/ directory

## 4. Dependencies

- TLC-2.0-runtime (the-living-constitution-2.0)
- Node.js >= 18

## 5. Acceptance Criteria

- [ ] AC-001: Project scaffold passes validate_repo.py (0 errors)
- [ ] AC-002: C-RSP contract is bound and valid (this file exists and is complete)
- [ ] AC-003: Evidence index initialized (evidence/index.md created)
- [ ] AC-004: STATUS.md created with initial truth_status=unverified
- [ ] AC-005: Visual Understanding Layer documented (I8 — diagram or description of system)
- [ ] AC-006: First session completed and logged (tlc-work + tlc-done cycle run once)
- [ ] AC-007: At least one unverified_scope item moved to verified
- [ ] AC-008: Pre-commit hook installed and blocks quarantined module commits

## 6. Halt Conditions

- HLT-001: Invariant violation detected — halt and resolve before continuing
- HLT-002: Evidence index corrupted or missing when claims are made
- HLT-003: Scope boundary violated — work outside declared scope detected

## 7. Truth Surface

- Evidence Required: Yes
- Reviewer Required: Before truth_status upgrade to working
- Public Claim Allowed: No — until truth_status=working and verified_date set

## 8. Lifecycle

- Draft → Active: When AC-001 through AC-004 are complete
- Active → Partial: When at least 3 of 8 ACs are complete with evidence
- Partial → Working: When all 8 ACs are complete and human reviewer approves

## 9. V&T Statement

EXISTS — C_RSP_BUILD_CONTRACT.md created from tlc-research-template
VERIFIED AGAINST — File creation via tlc-new
NOT CLAIMED — Any acceptance criteria completion; any verified functionality
FUNCTIONAL STATUS — Draft contract. Awaiting AC-001 (scaffold validation).
