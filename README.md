# The Living Constitution 2.0

**A Research Program Operating System for Constitutional AI Governance**

```
TLC Runtime Program
│
├── Runtime Architecture        — formal governance engine
├── Constitution Framework      — how constitutions are built
├── Research Framework          — Tier-1 execution infrastructure
├── Validation Framework        — empirical evaluation machinery
├── Governance Framework        — audit, evidence, community boards
└── Publication Pipeline        — paper-to-product pathway
```

One command to enter the system:

```bash
node scripts/tlc.mjs
```

---

## What This Is

TLC is a constitutional runtime that enforces externally specified epistemic
invariants during language model inference. It is not a framework document.
It is not a set of principles. It is running infrastructure.

The architectural insight: a governance runtime and a domain constitution are
different artifacts. TLC executes constitutions. Constitutions encode domain
theory. The two can be developed, criticized, and published independently.

```
TLC Runtime
    ↓
Constitution Interface
    ↓
Domain Constitution
    ↓
Empirical Validation
```

The Eight Wonders is the first constitution. Instructional Integrity is the
second. The moment two independent constitutions run correctly inside TLC,
the platform generalizability claim is empirically established.

---

## The Three-Paper Structure

A single paper cannot defend a runtime architecture, a domain theory, and
empirical results simultaneously. Each layer is a separate publication:

| Paper | Claim | Location |
|---|---|---|
| TLC Runtime v1.0 | TLC executes arbitrary epistemic constitutions | modules/tlc-runtime/ |
| Eight Wonders Constitution v1.0 | Eight Wonders is a constitutional ontology for relational economies | modules/eight-wonders-constitution/ |
| Validation Study v1.0 | TLC + Eight Wonders recovers invariants at 94%, reduces IAI by 68% | modules/validation-study/ |

Reviewers must engage each layer on its own terms. Attacking the Eight Wonders
does not touch the runtime. Attacking the runtime does not disprove AHI theory.
Attacking empirical results does not invalidate the constitutional specification.

---

## The Constitution Family

Any domain that can be expressed as evaluable invariants can run inside TLC:

```
TLC Runtime
│
├── Eight Wonders Constitution          (relational economies — Black consumer behavior)
├── Instructional Integrity Constitution (learning systems — Quantic research)
├── Research Integrity Constitution     (epistemic governance — AI safety)
├── Clinical Trust Constitution         (patient-clinician dynamics)
├── AI Safety Constitution              (alignment invariants)
└── Neurodivergent Accessibility Constitution (cognitive access)
```

Each constitution is independently publishable. Each validation study is
independently replicable. The runtime is not modified between constitutions.

---

## Repository Structure

```
the-living-constitution-2.0/
│
├── modules/
│   ├── tlc-runtime/                    Platform paper + runtime code
│   ├── eight-wonders-constitution/     Domain constitution (Paper 2)
│   ├── validation-study/               Empirical paper (Paper 3)
│   ├── constitution-engineering/       CEM — how constitutions are built
│   ├── instructional-integrity/        Second constitution (Quantic research)
│   ├── governance-harness/             Probe training + gate metrics
│   ├── governed-investigation/         Original paper (v10 preserved)
│   └── narrative-conditioned-interfaces/
│
├── src/
│   ├── interfaces/
│   │   └── constitutional-invariant.ts  The typed platform contract
│   └── core/
│       ├── audit.mjs
│       └── evidence-chain.mjs
│
├── constitutions/                      Compiled constitution specs
├── tlc-sl/                             TLC Specification Language
├── probe-gate/                         Gate validation tooling
├── evidence/                           Append-only audit chain
├── registry/                           Module registry
├── scripts/                            All TLC CLI scripts
├── templates/                          Research project scaffolds
├── docs/                               Operations + onboarding
└── contracts/active/                   Active governance contracts
```

---

## The Constitutional Interface

Any constitution that executes inside TLC implements:

```typescript
interface ConstitutionalInvariant {
  id: string
  description: string
  evaluate(context: Context): InvariantState
  repair(context: Context): RepairAction
  isUpstream: boolean
  dependents: string[]
}

interface Constitution {
  id: string
  version: string
  invariants: ConstitutionalInvariant[]
  getUpstreamInvariant(): ConstitutionalInvariant | null
}
```

Full specification: src/interfaces/constitutional-invariant.ts

---

## Formal Guarantees

Five LTL properties are verified against the runtime state machine:

1. Safety Gate — no emission while any invariant is VIOLATED
2. Upstream Primacy — upstream invariant gates all downstream evaluation
3. Halt Authority — hard halt on active violations until repair clears
4. Feedback Obligation — human acknowledgment required on state transitions
5. Task-State Locking — scope drift triggers automatic halt

Proved deadlock-free and live under finite human response time (Coq).

---

## High-Assurance Evidence Chain (the Audit Package)

`src/evidence-chain/` is the high-assurance core that makes governance decisions
**auditable**: a typed, append-only, tamper-evident ledger (Ed25519 + SHA-256
hash-chaining + Merkle commitments) with a full engineering audit package.

**Why it matters (the contribution).** AI labs publish constitutions as prose;
the gap is that nothing mechanically ties the principle to runtime behavior or
proves what the system did. This layer is novel as an *integration*: one invariant
definition is simultaneously **proved** (TLA+/TLC), **enforced** (runtime
PolicyEngine), and **recorded** (auditable evidence) — and it is deliberately *not*
a blockchain (single accountable operator, trust pinned out-of-band, no Byzantine
consensus). Full argument, including the blockchain/DLT contrast: **[docs/NOVELTY.md](docs/NOVELTY.md)**.

**Verification rigor (every claim maps to a command):**

- **Formal (R1):** TLA+ model-checked with TLC — clean (no error/deadlock). The
  reachable state space is the exact closed form `11^C · 2^P`, re-confirmed up to
  644,204 states. See `src/evidence-chain/spec/TLC_RESULTS.md`, [docs/PERFORMANCE.md](docs/PERFORMANCE.md).
- **Traceability (R2):** every requirement → file → test in
  `src/evidence-chain/spec/traceability-matrix.yaml` (re-synced to source).
- **Tests + coverage (R3/R4):** 87 tests (node:test + fast-check), 100% branch
  coverage (c8).
- **Red-team (R6):** 11/11 attack vectors BLOCKED
  (`src/evidence-chain/validation/red-team-report.json`).

**Security — A6 fixed (v2.1).** The review flagged that the v2.0 A6 test was too
narrow and that a "signature forgery via file edit" (re-sign forged content under a
substituted key) remained open. v2.1 closes it with out-of-band trust anchoring
(pinned signer fingerprint + pinned chain head) and adds red-team vectors A10/A11.
Full disclosure, root cause, fix, and residual risk: **[docs/SECURITY-A6-DISCLOSURE.md](docs/SECURITY-A6-DISCLOSURE.md)**.

**Performance — scales to millions.** Append is O(1)/entry (an O(n²) bottleneck was
found and fixed — 40× faster at 16k entries), full verify is O(n), membership audit
is O(log n). A 1,000,000-entry chain builds in ~115 s and fully verifies in ~142 s;
runtime enforcement runs >1.7 M governed decisions/s. See **[docs/PERFORMANCE.md](docs/PERFORMANCE.md)**.

A point-by-point response to the external review is in **[docs/REVIEW_RESPONSE.md](docs/REVIEW_RESPONSE.md)**.

---

## Quick Start

```bash
# Clone
git clone https://github.com/coreyalejandro/the-living-constitution-2.0
cd the-living-constitution-2.0

# Install
npm install

# Enter TLC
node scripts/tlc.mjs

# Run governance harness
cd modules/governance-harness
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python3 run_harness.py

# Health check
node scripts/tlc-health.mjs
```

---

## AI Session Capture with Entire

If you want automatic AI session capture in this repo, install the Entire CLI
separately, then run:

```bash
npm run entire:enable
# or pick the agent up front
npm run entire:enable -- --agent codex
npm run entire:status
```

Entire keeps transcripts tied to commits, gives this repo searchable agent
history, makes it easier to recover to a known-good checkpoint, and makes it
clearer why a change happened. This is additive to TLC: keep the existing
governance workflow and `src/git-hooks/pre-commit.mjs` in place.

---

## Verification Standard

Every empirical claim in this repository must be backed by a
VERIFICATION_AND_TRUTH.md file committed alongside the evidence. No claim
is published without a corresponding V&T that specifies:

- EXISTS: what was verified and present
- VERIFIED AGAINST: the actual artifact or output
- NOT CLAIMED: what this does not establish
- FUNCTIONAL STATUS: current state of the implementation

---

## For Researchers

The full research arc is in docs/RESEARCH-ARC.md.
Onboarding is in docs/ONBOARDING.md.
The program architecture is in PROGRAM_ARCHITECTURE.md.

To start a new constitution or study:

```bash
node scripts/create-research-project-from-template.mjs <project-slug>
```

---

## For AI Labs

TLC is what a governance system looks like when it produces evidence instead
of documentation. Every governance decision is logged to a tamper-evident
evidence chain. Every invariant evaluation is auditable. Every state transition
requires human acknowledgment.

If your lab publishes principles, TLC asks you to run them.
