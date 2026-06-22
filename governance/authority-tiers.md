# Authority tiers

This file defines repository authority tiers.

## Tiers

- `canonical`: authoritative machine-governed source of truth
- `derived`: generated from canonical sources
- `narrative`: explanatory, planning, interpretive, or research framing
- `experimental`: provisional work not yet admitted to the canonical truth surface
- `archived`: retained for history, not active governance

## Rules

1. Files under `governance/`, `contracts/`, `schemas/`, and `registry/` should be treated as canonical unless marked otherwise.
2. Generated summaries are `derived`.
3. Roadmaps, architecture essays, and visionary framing are `narrative`.
4. Experimental specifications and prototypes are `experimental` until admitted through the claim ledger and evidence process.
5. Archived materials must not be read by CI status generators.

## Required metadata fields

Governance-relevant files should declare:

- `Authority`
- `Truth surface`
- `Machine enforced`

## Authority

- Authority: `canonical`
- Truth surface: `true`
- Machine enforced: `true`
