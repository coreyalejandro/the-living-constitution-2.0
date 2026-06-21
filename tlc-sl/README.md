# TLC-SL — Constitution as Code

**One definition of a constitutional invariant. Three compiled targets: runtime enforcement,
an exhaustive model check, and a TLA+ export. No drift between what is written, what is
enforced, and what is proven.**

```bash
npm run tlc:sl            # compile + model-check every invariant
npm run tlc:sl:test       # run the test suite (node --test, zero dependencies)
node scripts/tlc-spec.mjs # the same check, as the /spec terminal command runs it
```

---

## The problem this solves (inside this repo)

In TLC 2.0 today, each invariant lives in **three** places that can silently drift apart:

1. **Prose** in `constitution/THE_LIVING_CONSTITUTION.md` (Article VIII, I1–I8).
2. **Hand-coded JavaScript** in `src/core/policy-engine.js` and `src/git-hooks/pre-commit.mjs`.
3. **JSON-schema constraints** in `schemas/`.

The constitution's own V&T statement flags this exact gap as *unverified*:

> "Whether the Article VIII invariants as written here are exactly the invariants implemented
> in the Policy Engine — that mapping requires a code-to-spec verification pass."

TLC-SL closes it. You write the invariant once, in a small formal language. The compiler emits
the runtime check **and** a model the checker proves **and** a TLA+ module — all from the one
source. The generated `tlc-sl/conformance/report.md` is that code-to-spec verification pass,
produced from live runs.

## What it looks like

```tlcsl
invariant "INV-001" {
  title "Contract before promotion"
  article "VIII.1 / IV.3"
  level BLOCK
  rationale "An active module without a bound C-RSP contract may not be promoted to working."

  var contract domain { none, active, frozen }
  var status   domain { unverified, partial, working }
  init { contract = none, status = unverified }

  op BIND_CONTRACT   { guard true            effect { contract = active } }
  op PROMOTE_WORKING { guard contract != none effect { status = working } }

  safety status = working implies contract != none
}
```

`npm run tlc:sl` then reports:

```
PASS  INV-001  safety holds over 8 reachable states; 1/2 guards proven necessary
```

## The invariants shipped

The full Article VIII set is now expressed in TLC-SL — **21 invariants**, all verified by the
in-process checker (`npm run tlc:sl`). Grouped by constitution section:

| Section | Invariants |
|---|---|
| VIII.1 Contract | INV-001 (contract before promotion), INV-002 (active needs schema-valid), INV-003 (step needs human approval), INV-004 (frozen admits no new AC), INV-005 (superseded references replacement — WARN) |
| VIII.2 Classification | INV-010 (`working` needs verified_scope), INV-011 (`partial` needs both scopes), INV-012 (public surface needs public_display_status), INV-013 (`partial` may not display `working`), INV-014 (quarantined in no public route) |
| VIII.3 Evidence | INV-020 (append-only), INV-021 (halt produces evidence), INV-022 (break-glass is logged), INV-023 (PII needs authorization) |
| VIII.4 V&T | INV-030 (AC complete needs V&T), INV-031 (empty `unverified` on unrun suite is a violation), INV-032 (governance_state matches lifecycle — WARN) |
| VIII.5 Role/authority | INV-040 (AI agents may not merge/deploy/push/write-prod/promote), INV-041 (unauthorized break-glass blocked), INV-042 (dual-approval needs two approvals) |
| VIII.6 Visual | INV-050 (`working` promotion needs a visual understanding layer) |

Spec sources: `spec/INV-001*.tlcsl` … plus the grouped sets `spec/INV-contract-set.tlcsl`,
`spec/INV-classification-set.tlcsl`, `spec/INV-evidence-vnt-set.tlcsl`,
`spec/INV-authority-visual-set.tlcsl`. The full mapping (invariant → spec → check result) is in
`conformance/report.md`.

## Verification status — held to the complete-claim rule

This module obeys the same honesty discipline as the rest of TLC. Here is exactly what is and
is not verified in this build:

| Target | What it produces | Status in this build |
|---|---|---|
| **In-process checker** (`--target check`) | Exhaustive BFS proving safety + guard-necessity over each finite state space | **VERIFIED** — run here; all 6 hold; see test suite |
| **JavaScript** (`--target js`) | Runtime enforcement wired into the Policy Engine | **VERIFIED** — integration tests pass; blocks actions the legacy engine missed |
| **TLA+** (`--target tla`) | A `.tla` module + `.cfg` for the TLC model checker | **EMITTED, NOT CHECKED** — TLC needs Java + `tla2tools.jar`, absent here. Output is `unverified`. |
| **Lean 4** | Proof artifacts | **NOT BUILT** in v0.1 |

The guard-necessity ("mutation") check is worth calling out: for each guarded operation, the
checker removes the guard and confirms a safety violation becomes reachable. A guard that can
be removed without breaking safety is reported as *not necessary* (INV-001 shows 1 of 2) —
reported honestly, not hidden.

## How it wires into the Policy Engine

`src/core/policy-engine.js` now accepts optional invariants and is fully backward compatible
(constructing it with no invariants behaves exactly as before):

```js
import PolicyEngine from './src/core/policy-engine.js';
import { loadInvariants } from './tlc-sl/src/enforce.mjs';
// after: npm run tlc:sl:compile  (emits tlc-sl/generated/models)
const engine = new PolicyEngine(contract, { invariants: loadInvariants() });

engine.evaluate({ type: 'PROMOTE_WORKING', contract: 'none', verified_scope: 'no' });
// -> { decision: 'BLOCK', halts: ['INV-001','INV-010'], reasons: [...] }
```

The legacy engine **allows** that action (it only knew about MERGE/DEPLOY-style role checks).
TLC-SL catches it — from a definition the model checker also proves. That is the point.

## Prior art and honest positioning

TLC-SL is **not** the first formal language for AI governance, and this repo will not claim it
is. The space already includes serious work, and you should know it:

- **CSL-Core (Chimera Specification Language)** — a `.csl` DSL for AI agents with Z3 + TLA+
  verification, BLOCK/WARN/LOG enforcement, and a Python-BFS fallback when Java/TLC is absent.
  The closest sibling to TLC-SL in shape.
- **AGENL (Emergence AI)** — a DSL whose contracts are proven in **Lean 4** and enforced at
  runtime, with audit trails and human escalation.
- **FORGE** — formal runtime guarantee enforcement using **Datalog** as the policy language,
  with static analyses for contradiction and reachability.
- **OPA / Rego**, **GOPAL** (Rego policies encoding the EU AI Act and NIST AI RMF), **Cupcake**,
  **NAIL**, and SMT-based Rego verifiers — the broader policy-as-code ecosystem.

**What is actually distinct about TLC-SL is narrow and specific:** it is the source-of-truth
layer for *this* governance system — it unifies an existing written constitution (I1–I8), an
existing runtime Policy Engine, and an existing append-only evidence hash-chain, and it emits a
conformance report that closes the spec-to-enforcement gap the constitution itself flagged as
unverified. It also ships zero-dependency so it runs on a clean checkout with no install. The
contribution is the integration and the honesty, not the invention of governance-as-code.

## What this module does NOT claim

- Not the first or only formal language for AI governance (see above).
- The TLA+ output has not been run through TLC in this build.
- No Lean 4 target exists yet.
- The in-process checker is exhaustive only over the small finite-domain models the invariants
  declare; it is not a general-purpose model checker for unbounded systems.
- Wiring TLC-SL into the Policy Engine changes no Article III.2 hard limit on AI agents.

## Roadmap (recommended next pull requests)

1. **Run TLC in CI** — add a job that runs `tla2tools.jar` against the emitted `.tla` modules
   and records the result to evidence, upgrading the TLA+ row from emitted to verified.
2. **Author the remaining Article VIII invariants** (INV-002..005, 012–014, 021–022, 030–032,
   041–042, 050) in TLC-SL.
3. **Lean 4 target** for the invariants whose properties warrant a proof rather than a check.
4. **Generate the pre-commit checks** from the same models, so the commit hook and the Policy
   Engine share one source too.

## Files

```
tlc-sl/
  CRSP_TLC_SL_CONTRACT.md   the C-RSP build contract (written before code; Invariant I1)
  grammar.md                the language grammar and semantics
  README.md                 this file
  spec/*.tlcsl              the invariants (21, the full Article VIII set)
  src/
    lexer.mjs parser.mjs    front end
    model.mjs               builds the transition system
    interp.mjs              the one shared evaluator (no-drift guarantee)
    checker.mjs             exhaustive safety + guard-necessity checker
    targets/js.mjs          JavaScript enforcement target
    targets/tla.mjs         TLA+ export target
    compile.mjs             CLI + programmatic API
    enforce.mjs             runtime loader used by the Policy Engine
    conformance.mjs         generates the conformance report from live runs
    record-evidence.mjs     appends verification results to the evidence hash-chain
  generated/                emitted models, JS, and TLA+ (regenerate with tlc:sl:compile)
  conformance/report.md     code-to-spec verification pass (generated)
  docs/architecture.md      visual understanding layer (Invariant I8)
  tests/*.test.mjs          node --test suite (zero dependencies)
```

## V&T Statement — TLC-SL v0.1

| Field | Value |
|---|---|
| **What** | A specification language compiling one invariant definition to runtime enforcement, an in-process exhaustive model check, and a TLA+ export. The full Article VIII set — 21 invariants — is shipped. |
| **True** | Parser, checker (safety + necessity), JS target, Policy Engine integration, conformance report, and evidence recording all run; the node:test suite passes; 21/21 invariants verified by the in-process checker. Commands: `npm run tlc:sl`, `npm run tlc:sl:test`. |
| **Unverified** | TLA+ output not run through TLC (no Java/tla2tools here). No Lean target. Checker is exhaustive only over the declared finite models. |
| **Not Claimed** | See "What this module does NOT claim." Notably not the first governance DSL. |
| **Functional Status** | PARTIAL — verified core (checker + runtime) is `working`; TLA+ path is `draft`/`unverified`. |
| **Governance State** | Bound to `CRSP-TLC-SL-001`. Agent-produced; requires a human acceptance gate before any truth_status upgrade. |
| **Evidence Ref** | `evidence/TLC-SL/verification.jsonl` (hash-chained) and `tlc-sl/conformance/report.md`. |
