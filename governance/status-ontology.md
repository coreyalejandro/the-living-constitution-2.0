# Governance status ontology

This file defines the canonical truth-status ontology for `coreyalejandro/the-living-constitution-2.0`.

## Canonical statuses

Only these statuses are canonical in machine-governed truth surfaces:

- `unverified`
- `specified`
- `partial`
- `working`
- `quarantined`
- `deprecated`

## Rules

1. Canonical artifacts MUST use only the statuses above.
2. Narrative artifacts MAY use other descriptive terms, but those terms are non-canonical.
3. Public summaries MUST NOT claim a stronger status than the claim ledger records.
4. Legacy vocabularies must be mapped into the canonical ontology before they can appear in generated status outputs.

## Legacy mapping guidance

| Legacy term | Canonical status |
|---|---|
| Draft | specified |
| Proposed | specified |
| SPECIFIED | specified |
| VERIFIED | partial |
| VALIDATED | working |
| WORKING | working |
| PARTIAL | partial |
| UNVERIFIED | unverified |
| Quarantined | quarantined |
| Deprecated | deprecated |

## Authority

- Authority: `canonical`
- Truth surface: `true`
- Machine enforced: `true`
