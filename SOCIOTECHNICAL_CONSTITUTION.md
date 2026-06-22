# SOCIOTECHNICAL CONSTITUTION
## The Living Constitution 2.0

**Authority:** canonical
**Truth surface:** true
**Machine enforced:** true
**Version:** 2.0.0
**Status:** Ratified
**Adopted:** 2026-06-17
**Enforcement Tier:** Tier-1-MVG (Minimum Viable Governance)
**Amendment Process:** See Article IX

---

## PREAMBLE

This Constitution governs the development, verification, and public representation of all work
produced under The Living Constitution (TLC) framework. It exists because claims about AI systems
carry real consequences — for the people those systems affect, for the researchers who build them,
and for the field of AI safety that depends on honest accounting.

The core commitment is simple:

**Nothing is claimed that has not been verified. Nothing is verified that has not been evidenced.
Nothing is evidenced that cannot be inspected.**

This Constitution does not make work easier. It makes work honest.

---

## ARTICLE I — FOUNDATIONAL PRINCIPLES

### Section 1.1 — Claim Integrity

Every output of TLC-governed work is classified by its truth status:

| Status | Meaning |
|--------|---------|
| `unverified` | Created; not yet tested or confirmed |
| `draft` | In active development; incomplete |
| `partial` | Some acceptance criteria met; evidence on file |
| `working` | All acceptance criteria met; evidence on file; reviewer approved |
| `quarantined` | Frozen pending resolution of a governance violation |
| `deprecated` | Superseded; archived |

No module may be represented publicly with a truth status higher than it has earned.

### Section 1.2 — Evidence Primacy

Claims exist in a hierarchy:

1. Running code producing verified output > specification claiming it will
2. Evidence file on disk > session note describing it
3. Reviewer-confirmed status > self-reported status

When evidence is absent, the claim does not exist.

### Section 1.3 — Neurodivergent-First Design

This governance system is designed for a monotropic, ADHD+OCD+autistic operator.
Structure enforces what executive function cannot reliably supply.
The system runs the operator, not the other way around.
Chaos is a governance failure, not a personal failure.

---

## ARTICLE II — MODULE GOVERNANCE

### Section 2.1 — Module Definition

A module is any discrete unit of work registered in `registry/modules.registry.json`.
Every module must have:

- A unique `id` (ALL-CAPS-HYPHENATED)
- A `truth_status`
- A `surface` classification
- A `contract_id` referencing an active C-RSP contract
- A `path` on disk

### Section 2.2 — Surface Classification

| Surface | Meaning | Public Claims Allowed |
|---------|---------|----------------------|
| `governance_core` | TLC runtime infrastructure | Yes, when working |
| `private_lab` | Research and experiments | No, without explicit review |
| `public_portfolio` | Portfolio-facing work | Yes, when working |
| `documentation` | Docs and specs | Yes |
| `module_library` | Reusable templates and libraries | Yes, when working |
| `exhibit` | Demonstrable artifacts | Yes, with caveats |

### Section 2.3 — Module Lifecycle

```
unverified → draft → partial → working
                              ↓
                         quarantined (on violation)
                              ↓
                        unverified (after resolution)
```

Status upgrades require evidence. Status downgrades to `quarantined` are automatic on
violation detection by the Policy Engine or pre-commit hook.
