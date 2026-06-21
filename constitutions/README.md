# Constitutions — TLC as a platform, not a single theory

**TLC-SL is a constitutional runtime that executes multiple, independent epistemic
constitutions through one interface.** A *constitution* is a directory of `.tlcsl` invariants. The
runtime — the compiler, the exhaustive in-process checker, the TLA+ emitter, and the Policy Engine
enforcer in `tlc-sl/src/` — is **constitution-agnostic**: it is not modified to load a new
constitution. Only data (the `.tlcsl` files) changes.

This directory holds the platform registry and the second constitution that proves the point.

```
        TLC-SL Runtime  (tlc-sl/src/ — the Constitution Interface)
                 │  loads, model-checks, and enforces any constitution
     ┌───────────┴────────────┐
     ▼                        ▼
 TLC Governance          Instructional Integrity
 constitution            constitution
 (INV-*, tlc-sl/spec)    (II-*, constitutions/instructional-integrity)
 Article VIII + VII/X    mastery, Gagné, CLT, scaffolding, UDL, Merrill
```

## Proof: one runtime, two constitutions

```bash
npm run constitutions:check
# -> tlc-governance 22/22 ; instructional-integrity 6/6 ; namespace overlap 0 ; PLATFORM VERIFIED
```

The two constitutions share **no** invariant ids and **no** domain vocabulary — one is about
contracts/evidence/break-glass, the other about learners/mastery/cognitive load — yet both compile
and model-check through the identical runtime. That is the difference between "TLC is a governance
theory" and "TLC is a runtime that can execute arbitrary epistemic constitutions": the latter is
now demonstrated, not asserted.

## The Constitution Interface (what every constitution implements)

Each invariant, in any constitution, declares:
- `id`, `title`, `article`, `level` (`BLOCK` | `WARN` | `LOG`), `rationale`
- finite-domain **state** variables + per-action **input** variables
- guarded **operations** (`guard` predicate, optional `effect`)
- a **safety** predicate over state

…and compiles to (1) runtime enforcement via `decide(model, action)`, (2) an exhaustive
safety + guard-necessity model check, and (3) a TLA+ export. This is the interface the external
review asked to be made explicit; `tlc-sl/grammar.md` is its specification.

## Namespaces (de-entangling the layers)

The review flagged that the runtime and the domain ontology were conflated. They are kept in
disjoint namespaces here:

| Namespace | Constitution / ontology | Location |
|---|---|---|
| `INV-*` | TLC governance (runtime) | `tlc-sl/spec/` |
| `II-*` | Instructional Integrity (domain) | `constitutions/instructional-integrity/` |
| `W-*` | **Recommended** rename for the Eight Wonders relational-economy ontology | currently `I1_..I8_` labels in `modules/governance-harness/` |

**Known collision (follow-up):** the Eight Wonders constructs are currently labelled `I1_Trust …
I8_Narrative` in the governance-harness probe weights, which numerically collides with the
governance invariants `I1…I8`. Renaming the Eight Wonders to `W-*` (touching the probe-weight
filenames) is recommended but deferred — it is a domain-ontology change, separate from this
platform work.

## Adding a constitution

1. Create `constitutions/<name>/spec/*.tlcsl` (pick a fresh id namespace).
2. `node tlc-sl/src/compile.mjs constitutions/<name>/spec --target all --out constitutions/<name>`
3. Register it in `constitutions/registry.json`.
4. `npm run constitutions:check` — the runtime model-checks it with no code changes.
