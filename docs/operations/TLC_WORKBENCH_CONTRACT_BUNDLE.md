# TLC Workbench Contract Bundle

This document describes the machine-readable TLC Workbench contract bundle for Issue `#15`.

## Purpose

The bundle turns the human-readable TLC Workbench contracts into a single machine entrypoint for agents, operators, and CI.

It covers:
- the parent TLC Workbench contract
- the surfaces child contract
- the accessibility child contract
- the lifecycle child contract
- the hardening child contract

## Files

Machine-readable contracts:
- `contracts/active/json/tlc-workbench.parent.contract.json`
- `contracts/active/json/tlc-workbench.surfaces.contract.json`
- `contracts/active/json/tlc-workbench.accessibility.contract.json`
- `contracts/active/json/tlc-workbench.lifecycle.contract.json`
- `contracts/active/json/tlc-workbench.hardening.contract.json`
- `contracts/active/json/tlc-workbench.bundle.json`

Schemas:
- `schemas/contracts/crsp-workbench-contract.schema.json`
- `schemas/contracts/crsp-workbench-bundle.schema.json`

Validator:
- `scripts/validate-workbench-contracts.mjs`

## Validation commands

Schema-only validation:

```bash
npm run contracts:workbench:schema
```

Full bundle validation:

```bash
npm run contracts:workbench:validate
```

Combined check:

```bash
npm run contracts:workbench:check
```

## What the validator enforces

The validator:
- validates the bundle file against the bundle schema
- validates every contract JSON file against the contract schema
- checks that referenced human-readable markdown contracts exist
- checks that bundle references match each contract file
- checks that contract, acceptance-criterion, and halt-condition IDs are unique across the bundle
- checks that parent, child, and dependency relationships resolve
- exits nonzero with explicit error messages when validation fails

## Validation order

The bundle validates contracts in this order:
1. `CRSP-TLC-WORKBENCH-001`
2. `CRSP-TLC-WORKBENCH-SURFACES-001`
3. `CRSP-TLC-WORKBENCH-ACCESSIBILITY-001`
4. `CRSP-TLC-WORKBENCH-LIFECYCLE-001`
5. `CRSP-TLC-WORKBENCH-HARDENING-001`

## Future tree creation rule

Future tree creation for this Workbench contract family must use the saved issue reference:
- `coreyalejandro/the-living-constitution-2.0#15`

Do not reuse the draft tag:
- `TLC-WORKBENCH-CRSP-001`
