# {{PROJECT_NAME}}

**Module ID:** {{MODULE_ID}}
**Surface:** {{SURFACE}}
**Created:** {{DATE}}
**Contract:** {{CONTRACT_ID}}

---

{{PROJECT_NAME}} is a TLC 2.0 governed module in the {{SURFACE}} surface.
All work proceeds under contract {{CONTRACT_ID}} and invariants I1-I6.

## Status

See STATUS.md for current truth status and retrospective entries.

## Quick Start

```bash
# Install dependencies if any
# npm install

# Validate scaffold integrity
python validate_repo.py

# Start a governed session
tlc-work --module {{MODULE_ID}}
```

## Governance

This project is governed by The Living Constitution 2.0.

All work must comply with the active C-RSP contract and invariants I1-I6:
- I1: Active contract required before work proceeds
- I2: Every completion claim requires evidence
- I3: Stay within declared contract scope
- I4: Invariants cannot be bypassed without Break-Glass override
- I5: No PII without authorization
- I6: Quarantined modules are read-only

## What This Does Not Claim

- Production readiness without explicit safety review
- Generalizability beyond verified local scope
- Completion of any acceptance criteria until evidence is captured

## Reviewer Start Points

| Need | File |
|------|------|
| Truth status | STATUS.md |
| Active contract | C_RSP_BUILD_CONTRACT.md |
| Evidence | evidence/ |
| Acceptance criteria | C_RSP_BUILD_CONTRACT.md |

## V&T Statement

EXISTS — Scaffold files created by tlc-new from tlc-research-template
VERIFIED AGAINST — File creation confirmed
NOT CLAIMED — Any acceptance criteria; any working functionality; any verified behavior
FUNCTIONAL STATUS — Scaffold only. truth_status=unverified. Awaiting first session.
