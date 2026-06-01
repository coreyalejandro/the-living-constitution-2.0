---
document_type: "CONSTITUTION"
id: "DOC-CONSTITUTION-TLC-2.0"
version: "2.0.0"
status: "Active"
schema: "4.0"
contract_id: "CRSP-STC-RUNTIME-001"
canonical_path: "constitution/THE_LIVING_CONSTITUTION.md"
repo: "the-living-constitution-2.0"
last_verified:
  author: "coreyalejandro"
  timestamp: "2026-06-01T00:00:00Z"
  method: "document authored consistent with all V2 schemas, contracts, and ops docs"
---

# The Living Constitution 2.0

**A sociotechnical governance document for the portfolio of AI safety research, evidence,
product modules, and public reviewer surfaces governed by the-living-constitution-2.0.**

---

## Preamble

This constitution governs the living system. Not the code in isolation. Not the model in
isolation. The system — the people, tools, roles, evidence records, and claims that move
through it together.

The Living Constitution 1.0 governed interaction between a single user and a single AI
session. It asked: can an interface be designed so that misalignment is surfaced and
contestable in real time? That question still stands. The instruments built to test it are
documented in the-living-constitution repo and remain active.

Version 2.0 changes the level of analysis. The research portfolio has grown to a
constellation of modules, each with its own claims, evidence state, and build status. A
constitution that only governs model output is not sufficient for a system that also governs
what is claimed to exist, at what status, by what evidence, and by whose authority.

The sociotechnical frame means this: culture, power, access, and context are not edge cases
in this governance system. They are structural inputs. Who can approve what, what evidence
is required before a claim can be made, what is public and what is private, which modules
serve which communities — these are governed decisions, not implementation details left to
convention.

This document is the authoritative reference for those decisions.

---

## Article I — What Is Governed

> Source: `docs/integration/TLC_2_0_IDENTITY.md` §Scope; `docs/integration/TLC_2_0_INTEGRATION_MAP.md` §Routing Constraints

### I.1 Scope

This constitution governs:

- All modules registered in `registry/modules.registry.json`
- All artifacts registered in `registry/artifacts.registry.json`
- All routes registered in `registry/routes.registry.json`
- All active C-RSP contracts in `contracts/active/`
- All evidence records in `evidence/`
- All schemas in `schemas/`
- All agents, scripts, and automated processes that act within this system
- All human roles with write or approval authority over any of the above

### I.2 What Is Not Governed

This constitution does not govern:

- Client work unrelated to governance or AI safety
- Third-party tooling not classified in the registry
- Infrastructure managed outside this codebase
- Modules with `truth_status: quarantined` — those are frozen pending review
- Claims made in personal writing not bound to a C-RSP contract

### I.3 Governing Authority

The authoritative truth surfaces in this system are, in descending order:

1. This constitution (`constitution/THE_LIVING_CONSTITUTION.md`)
2. The active C-RSP build contract (`contracts/active/BUILD_CONTRACT.md` / `BUILD_CONTRACT.json`)
3. The module registry (`registry/modules.registry.json`)
4. V&T statements attached to acceptance criteria
5. Evidence logs (`evidence/CRSP-STC-RUNTIME-001/*.jsonl`)

When documents conflict, the higher surface wins. Conflicts must be logged in the evidence
trail and resolved before the next classification pass.

---

## Article II — Classification and Truth Status

> Source: `docs/operations/CLASSIFICATION_STATUS_RULES.md` §Status Definitions, §Truth Status Decision Tree; `docs/operations/COMPLETE_CLAIM_VERIFICATION_RULE.md` §Rule Statement, §Scope boundaries, §Public claim discipline; `schemas/module.registry.schema.json` §truth_status enum

### II.1 Purpose

Every module, artifact, and route in this system carries a `truth_status`. That status is
not a quality judgment. It is an epistemic claim: what do we actually know about this thing,
based on evidence gathered in this session?

### II.2 Status Definitions

| Status | Meaning |
|---|---|
| `working` | The complete declared scope of the module is verified by a passing test suite or equivalent verification run in this session. |
| `partial` | Real implementation exists. At least one component is verified. The complete scope is broader than what is verified. |
| `draft` | Structured content exists (documents, specs, evidence). No runnable code. No test suite. |
| `static_prototype` | A UI or demo was built once, is not maintained, and has no build pipeline. |
| `planned` | Registered with intent. No files exist yet. |
| `deprecated` | Superseded. Kept for audit trail only. |
| `quarantined` | Known to be broken or unsafe. Must not be promoted. |
| `unverified` | Default. Not yet inspected in this classification pass. |

### II.3 The Complete Claim Rule

A module is not `working` unless the COMPLETE CLAIM being made about that module is
verified. A component may be working while the module remains `partial`.

This rule may not be overridden by HANDOFF.md claims, README statements, or references to
prior sessions. A claim is verified if and only if:

1. A command was run in this session.
2. The command completed with observable output.
3. The output was recorded in `verified_scope`.

### II.4 Required Fields by Status

- `working` → `verified_scope` required (component, command, date)
- `partial` → `verified_scope` + `unverified_scope` both required
- All others → no verified scope required; `notes` encouraged

### II.5 Public Display Rules

Truth status governs what may be shown publicly:

- `working` → public display status MAY be `working`
- `partial` → public display status MUST be `demo` or `draft`, never `working`
- `draft` → public display status MUST be `draft` or `coming_soon`
- `static_prototype` → public display status MUST be `demo`

Claiming `working` publicly when `truth_status: partial` is a complete-claim violation and
must be corrected before the next publication pass.

---

## Article III — Roles and Authority

> Source: `contracts/active/BUILD_CONTRACT.md` §9.5 Role-Based Access & Agent Authority Gates, §Permissions Matrix; `schemas/contract-schema.json` §role definitions

### III.1 Human Roles

| Role | Authority |
|---|---|
| `author` | Draft content, propose amendments, run classification passes |
| `developer` | Implement components, write tests, merge code with review |
| `qa` | Verify test suites, write inspection notes, block promotions on evidence gaps |
| `sre` | Deploy to approved environments in approved windows |
| `pm` | Approve experiment design, approve ethics-sensitive work |
| `constitutional_council` | Approve amendments, review overrides, break deadlocks |

### III.2 AI Agent Authority

AI agents operating within this system are subject to hard limits that no instruction can
override:

- An AI agent may NOT merge code, deploy to production, or promote a module's status.
- An AI agent may NOT modify evidence logs (evidence is append-only; only authorized
  agents may call the Evidence Observatory write API).
- An AI agent may NOT approve its own output. Every agent-produced artifact requires a
  human acceptance gate before it enters the active governance record.
- An AI agent MAY draft documents, propose classifications, run test suites, and write
  inspection notes — provided all output is labeled as agent-produced and subject to
  human review before any truth_status upgrade.

These limits apply regardless of instruction. They are structural, not advisory.

### III.3 Sociotechnical Authority Principle

This system is built to serve people whose safety, accessibility, and dignity are at stake
in AI interaction. The authority structure reflects that. Governance decisions that affect
vulnerable users — those with disabilities, those in high-stakes contexts, those with less
institutional access — require elevated review. The `pm` and `constitutional_council` roles
exist specifically to ensure those decisions are not made unilaterally by the developer
role.

---

## Article IV — C-RSP Contract Law

> Source: `contracts/active/BUILD_CONTRACT.md` §1 Contract Identity, §7 Lifecycle State Machine, §11 Halt Matrix; `schemas/contract-schema.json` §required fields, §status enum, §adoption_tier enum

### IV.1 What a C-RSP Contract Is

C-RSP means Constitutionally-Regulated Single Pass. A C-RSP contract is a machine-readable
governance document that binds a specific build scope. It defines:

- objective and not-claimed boundary
- scope and dependencies
- ordered build sequence with human approval gates
- acceptance criteria with V&T status per criterion
- halt conditions
- rollback and recovery procedure
- V&T statement for the contract itself

### IV.2 Contract Lifecycle

```
DRAFT
  → human reviews scope and acceptance criteria
ACTIVE (all gates signed)
  → build proceeds; every AC is tracked in evidence
FROZEN (release)
  → contract becomes read-only; no new ACs may be added
SUPERSEDED
  → a new version contract replaces this one; this contract remains in archive
ARCHIVED
  → retained for audit trail; no longer referenced in routing
```

### IV.3 Contract Authority

An active C-RSP contract is the second-highest authority in this system (after this
constitution). It supersedes HANDOFF notes, README claims, and agent-produced output
for the scope it governs.

Modules without a bound contract may not be promoted to `working` status. A contract
bound to a module must be in `contracts/active/` and must reference the module ID in its
scope.

### IV.4 Human Approval Gates

Every C-RSP contract contains ordered build steps. Each step ends with a human approval
gate: a signed commit, an explicit approval record in the evidence log, or a documented
acceptance sign-off by an authorized role. No step may be marked complete by an agent
acting alone.

### IV.5 Halt Conditions

A halt condition is a named state that blocks forward progress. Halt conditions are defined
in the contract's halt matrix. When triggered, the system:

1. Logs the event to the evidence observatory
2. Surfaces the halt in the Contract Window
3. Blocks any dependent action
4. Requires either a resolution or a break-glass override to proceed

Halt conditions may not be silently cleared. Every resolution must be logged with
`event_type: HALT_RESOLVED` and the method of resolution.

---

## Article V — Verification and Truth (V&T)

> Source: `schemas/vnt-statement.schema.json` §required, §properties; `docs/operations/COMPLETE_CLAIM_VERIFICATION_RULE.md` §What "verified" means in this system; `docs/operations/CLASSIFICATION_STATUS_RULES.md` §implementation_status vs truth_status

### V.1 The V&T Requirement

Every acceptance criterion in every C-RSP contract must carry a V&T statement before it
may be marked complete. A V&T statement has the following required fields:

| Field | Required | Meaning |
|---|---|---|
| `what` | yes | What was evaluated or produced |
| `true` | yes | What is verified and confirmed |
| `unverified` | yes | What remains unverified |
| `assumed` | no | What was assumed but not tested |
| `uncertain` | no | Known unknowns |
| `not_claimed` | no | Explicit statement of what is NOT being claimed |
| `functional_status` | no | EXISTS / PARTIAL / BROKEN / NOT_BUILT |
| `governance_state` | no | Draft / Active / Frozen / Superseded |
| `evidence_ref` | no | Path to supporting evidence log entry |

### V.2 What Counts as Verified

A claim is verified by evidence, not by assertion. The following do not constitute
verification:

- "The HANDOFF says it passed." — historical context, not current evidence
- "The README says it works." — documentation, not verification
- "This compiled at some point." — prior state, not current state
- "The test was passing when last I looked." — recollection, not a run

### V.3 Honest Status

This system requires honest status. Honest status means:

- Unverified items are listed, not omitted
- The not-claimed boundary is stated explicitly, not inferred
- A module classified as `partial` is labeled `partial` everywhere it appears, including
  public surfaces
- A module classified as `draft` is not represented as a working system

The V&T statement is the instrument for honest status at the acceptance-criterion level.
The truth_status field is the instrument at the module level. Both are mandatory for modules
with active C-RSP contracts.

### V.4 Evidence is Permanent

Evidence logs are append-only. They may not be modified, redacted, or deleted. If a prior
log entry is incorrect, a correction entry is appended with a reference to the prior entry
and the correction reason. The prior entry remains in the record.

---

## Article VI — The Visual Understanding Layer

> Source: `README.md` §Required Visual Understanding Layer (verbatim list); `docs/operations/RESEARCH_TO_PAPER_TO_PRODUCT_TEMPLATE.md`

### VI.1 Requirement

Every module classified as `working` or `partial` at the `governance_core` or
`public_portfolio` surface must include a visual understanding layer before that status is
considered final.

The visual understanding layer is not decorative. It exists because this system is built for
people whose cognitive access to dense technical text may be limited, and because
researchers reviewing governance claims need to see architecture, flow, and user journey
without reading the entire codebase first.

### VI.2 Minimum Visual Set

A complete visual understanding layer includes:

1. Architecture diagram — system components and their relationships
2. App or workflow diagram — how a task moves through the system
3. User journey diagram — at least one persona moving through a complete interaction
4. Pictograph or process explanation — the core mechanism in plain visual language
5. Mock demo, storyboard, or simulation — what the system looks like in use
6. Illustration brief — description of the intended visual approach for non-diagram surfaces

All diagrams must include a plain-language text description for screen readers.

### VI.3 Enforcement

A module missing its visual understanding layer may not be promoted from `partial` to
`working`. The promotion gate check includes a visual layer presence verification.

---

## Article VII — The Amendment Process

> Source: `contracts/active/BUILD_CONTRACT.md` §9.8 Amendment Process UI, §Amendment Workflow steps 1–6; `schemas/contract-schema.json` §status enum lifecycle states

### VII.1 Why Amendments Exist

This constitution is not fixed. Governance knowledge improves. Research surfaces new
failure modes. The research questions this system exists to test will produce findings that
should change how the system governs itself. The amendment process is how that happens
without chaos.

### VII.2 Amendment Workflow

```
TRIGGER
  User correction, new evidence, Constitutional Council proposal, or system failure log
     |
     v
DRAFT
  Author writes amendment to a versioned branch of constitution/
  Must include: article affected, change proposed, rationale, V&T statement
     |
     v
DIFF REVIEW
  System shows diff against current constitution version
  Review period: minimum 48 hours for non-emergency amendments
     |
     v
COUNCIL VOTE
  Constitutional Council votes per Article IX quorum rules
     |
     v
  APPROVED → merge to main constitution file
             log to evidence/CRSP-STC-RUNTIME-001/lifecycle.jsonl
             update constitution version in this document's frontmatter
             commit: "const: amend — Article [N] — [short description]"
     |
  REJECTED → draft archived with rejection reason in evidence log
             may be resubmitted after addressing council objections
```

### VII.3 Emergency Amendment

An emergency amendment may bypass the 48-hour review period if:

- The amendment corrects a halt condition that is blocking active builds
- Two Constitutional Council members jointly approve the bypass
- The bypass is logged in the evidence trail with `event_type: EMERGENCY_AMENDMENT`
- A standard review is completed within 7 days and the amendment is either ratified or
  reverted

### VII.4 What Cannot Be Amended Without Unanimity

The following may only be changed by unanimous Council vote:

- Article III.2 (AI agent hard limits)
- Article V.4 (evidence is permanent)
- Article IX.1 (Council composition and quorum)
- This clause itself (VII.4)

---

## Article VIII — Invariants

> Source: `contracts/active/BUILD_CONTRACT.md` §11 Halt Matrix (trigger/resolution pairs); `contracts/active/BUILD_CONTRACT.md` §8.4 Policy Engine rule definitions (INVARIANT_EXEC_03, HALT_PII_UNVERIFIED); `schemas/module.registry.schema.json` §if/then constraints; `schemas/vnt-statement.schema.json` §required

These are the machine-readable governance rules enforced by the Policy Engine. Each
invariant has an ID, a description, and an enforcement behavior (BLOCK, WARN, or LOG).

### VIII.1 Contract Invariants

| ID | Description | Enforcement |
|---|---|---|
| INV-001 | An active module without a bound C-RSP contract may not be promoted to `working`. | BLOCK |
| INV-002 | A C-RSP contract may not be marked `Active` until all required fields pass schema validation. | BLOCK |
| INV-003 | A contract step may not be marked complete without a human approval record in the evidence log. | BLOCK |
| INV-004 | A contract in `Frozen` status may not have new acceptance criteria added. | BLOCK |
| INV-005 | A superseded contract must reference its replacement contract ID. | WARN |

### VIII.2 Classification Invariants

| ID | Description | Enforcement |
|---|---|---|
| INV-010 | A module with `truth_status: working` must have a `verified_scope` field with a command, output, and date. | BLOCK |
| INV-011 | A module with `truth_status: partial` must have both `verified_scope` and `unverified_scope`. | BLOCK |
| INV-012 | A module at `public_portfolio` or `exhibit` surface must have `public_display_status` set. | BLOCK |
| INV-013 | A module with `truth_status: partial` must not have `public_display_status: working`. | BLOCK |
| INV-014 | A module with `truth_status: quarantined` may not appear in any public route. | BLOCK |

### VIII.3 Evidence Invariants

| ID | Description | Enforcement |
|---|---|---|
| INV-020 | Evidence log files are append-only. Write operations that modify existing lines are blocked. | BLOCK |
| INV-021 | Every halt event must produce a corresponding evidence log entry. | BLOCK |
| INV-022 | Every break-glass override must be logged with the approving role and reason. | BLOCK |
| INV-023 | Evidence logs must not contain PII unless explicitly authorized in the active contract. | BLOCK |

### VIII.4 V&T Invariants

| ID | Description | Enforcement |
|---|---|---|
| INV-030 | An acceptance criterion may not be marked complete without a V&T statement containing `what`, `true`, and `unverified`. | BLOCK |
| INV-031 | A V&T statement with empty `unverified` field on an unrun test suite is a violation. | BLOCK |
| INV-032 | V&T governance_state must match the lifecycle state of the artifact it describes. | WARN |

### VIII.5 Role and Authority Invariants

| ID | Description | Enforcement |
|---|---|---|
| INV-040 | An AI agent role may not trigger a merge, deploy, or status promotion action. | BLOCK |
| INV-041 | A break-glass override by an unauthorized role is blocked and logged as a security event. | BLOCK |
| INV-042 | A dual-approval break-glass on a high-risk service requires two distinct authorized roles. | BLOCK |

### VIII.6 Visual Understanding Layer Invariant

| ID | Description | Enforcement |
|---|---|---|
| INV-050 | A `governance_core` or `public_portfolio` module promoted to `working` without a visual understanding layer triggers a promotion block. | BLOCK |

---

## Article IX — The Constitutional Council

### IX.1 Composition and Quorum

The Constitutional Council is the governing body for amendments, override reviews, and
classification disputes. It consists of:

- The author of this repository (permanent seat)
- Up to four appointed members from the research community, AI safety practitioners, or
  affected communities — with preference for representation from communities most impacted
  by the systems governed here

Quorum for a standard amendment vote: majority of seated members (minimum two).
Quorum for an amendment under VII.4: unanimous seated Council.
Emergency amendment bypass: two seated members.

A Council member may not vote on an amendment they authored. If that produces a quorum
failure, the amendment is tabled until a qualified replacement is seated or the author
recuses and the amendment is re-attributed.

### IX.2 Council Oversight Responsibilities

The Council is responsible for:

- Reviewing all break-glass overrides within 72 hours of occurrence
- Conducting quarterly classification audits of all `working` modules
- Approving any new surface type added to the registry schema
- Resolving disputes between contract authority and constitution authority

### IX.3 Council Is Not a Bottleneck

This constitution is designed so that ordinary work — classification passes, artifact
registration, evidence logging, test runs, C-RSP contract execution — does not require
Council involvement. The Council governs the governance. It does not govern the builds.

When a Council decision is required and the Council is not yet fully seated, the author
holds all Council authority as sole seat. This is a known limitation of an early-stage
system. It does not make the governance fictional. It makes it honest about where it is.

---

## Halt Matrix

| Halt Condition | Trigger | Required Resolution |
|---|---|---|
| `HALT_CONTRACT_MISSING` | Active module without bound contract attempts status promotion | Bind a contract via CLI |
| `HALT_SCHEMA_INVALID` | Contract or registry file fails schema validation | Correct the schema violation; re-run verify |
| `HALT_INVARIANT_FAILED` | Any Article VIII invariant triggered during operation | Fix the violating artifact; log resolution |
| `HALT_PII_DETECTED` | PII in output without authorization | Redact; log; authorize override if required |
| `HALT_UNAUTHORIZED_ACTION` | Role attempts action outside allowed scope | Block; log; alert Council |
| `HALT_BREAK_GLASS_ABUSE` | Break-glass used without required approvals | Disable override; notify Council; log security event |
| `HALT_EVIDENCE_LOG_FULL` | Disk space for evidence logs exhausted | Free space or rotate logs; log alert |
| `HALT_VISUAL_LAYER_MISSING` | Working-status promotion attempted without visual understanding layer | Add visual layer; re-run promotion check |

---

## V&T Statement — DOC-CONSTITUTION-TLC-2.0

| Field | Value |
|---|---|
| **What** | The constitutional document for The Living Constitution 2.0, covering Articles I–IX: scope, classification rules, role authority, C-RSP contract law, V&T requirements, visual layer requirement, amendment process, invariants, and Constitutional Council. |
| **Principles Active** | Sociotechnical governance, honest status, evidence primacy, role-bounded authority, visual accessibility, amendment-by-evidence |
| **True** | All referenced source files exist and were read in the drafting session: `schemas/` (7 files confirmed), `contracts/active/BUILD_CONTRACT.md` (29,147 chars confirmed), `registry/modules.registry.json` (21 modules confirmed), `docs/operations/CLASSIFICATION_STATUS_RULES.md` (confirmed), `docs/operations/COMPLETE_CLAIM_VERIFICATION_RULE.md` (confirmed), `docs/integration/TLC_2_0_IDENTITY.md` (confirmed), `docs/integration/TLC_2_0_INTEGRATION_MAP.md` (confirmed), `README.md` (confirmed). Each article carries a `> Source:` citation traceable to a specific section of those files. |
| **Assumed** | The reader has access to `schemas/`, `registry/`, and `contracts/active/`. The Constitutional Council will be seated as the system matures. |
| **Uncertain** | Whether the Article VIII invariants as written here are exactly the invariants implemented in the Policy Engine source — that mapping requires a code-to-spec verification pass. |
| **Unverified** | Policy Engine implementation of Article VIII invariants (src/core/policy-engine.js not inspected). Amendment workflow UI (src/ui/amendment-editor/ not inspected). Council Dashboard (src/ui/council-dashboard/ not inspected). `npm run verify` against this document's schema — not run. |
| **Not Claimed** | This document is not a legal instrument. It does not govern systems outside the-living-constitution-2.0 repo scope. It does not claim the Policy Engine has implemented all invariants listed here. It does not claim the Council is currently seated. |
| **Functional Status** | DRAFT — authored and internally consistent. Pending: commit to repo, schema validation pass, Policy Engine alignment verification. |
| **Governance State** | Draft — pending human approval gates. |
| **Evidence Ref** | To be assigned on commit to evidence/CRSP-STC-RUNTIME-001/lifecycle.jsonl |
| **Evaluated At** | 2026-06-01T00:00:00Z |
| **Evaluator** | Hermes Agent (claude-sonnet-4-6 via bedrock) — agent-produced, requires human review before truth_status upgrade |

---

*Constitution version 2.0.0 — The Living Constitution 2.0*
*Governing repo: coreyalejandro/the-living-constitution-2.0*
*Bound contract: CRSP-STC-RUNTIME-001*
