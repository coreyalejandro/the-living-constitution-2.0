# SOCIOTECHNICAL CONSTITUTION
## The Living Constitution 2.0

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

---

## ARTICLE III — CONTRACT GOVERNANCE

### Section 3.1 — C-RSP Contract Requirements

Every module must have a Constitutionally-Regulated Single Pass (C-RSP) contract.
A valid contract contains:

- `contract_id` — unique identifier
- `scope` — what this contract covers
- `not_claimed` — explicit list of what is NOT claimed
- `acceptance_criteria` — verifiable, binary completion conditions
- `halt_conditions` — conditions that freeze work
- `truth_surface` — evidence and review requirements

### Section 3.2 — Scope Boundaries

Work outside declared contract scope is unauthorized. The Policy Engine blocks:

- AI-generated code for components not in the contract
- Commits claiming completion of ACs not in the contract
- Status upgrades without evidence for all claimed ACs

### Section 3.3 — Contract Amendment

Contracts may be amended by:

1. Creating a new contract version with updated scope
2. Archiving the prior contract to `contracts/archive/`
3. Updating the module registry to reference the new contract
4. Committing the amendment with a REASON statement

---

## ARTICLE IV — EVIDENCE REQUIREMENTS

### Section 4.1 — Evidence Definition

Evidence is any artifact that independently confirms a claim. Valid evidence includes:

- Test output captured to file showing passing runs
- Terminal session logs showing working behavior
- Reviewer sign-off recorded in a dated file
- Automated CI run results linked to a commit

### Section 4.2 — Evidence Storage

All evidence lives in `evidence/` within each module.
The `evidence/index.md` file tracks all evidence by date, session, and AC.

### Section 4.3 — Evidence for Status Upgrades

| Target Status | Evidence Required |
|---------------|------------------|
| `partial` | At least 3 ACs with evidence on file |
| `working` | All ACs with evidence; reviewer approval |

---

## ARTICLE V — ROLE AUTHORITY

### Section 5.1 — Role Definitions

| Role | Authority |
|------|-----------|
| `Operator` | Full local authority over governed work |
| `AI_Assistant` | Reads and generates; cannot MERGE, DEPLOY, PUSH, or WRITE_PRODUCTION |
| `Reviewer` | Can approve status upgrades; cannot change scope |
| `Observer` | Read-only; no write authority |

### Section 5.2 — AI Authority Limits

AI assistants operating under TLC governance may:
- Generate code, documentation, and analysis within contract scope
- Propose status upgrades with supporting evidence
- Flag invariant violations

AI assistants may not:
- Self-report completion without evidence
- Upgrade a module's truth status unilaterally
- Bypass halt conditions
- Generate code outside declared contract scope without flagging the scope violation

---

## ARTICLE VI — SESSION GOVERNANCE

### Section 6.1 — Session Requirements

A governed session is a bounded unit of work tied to a specific module and contract.
Every session must:

1. Start with `tlc-work --module <ID>` (or equivalent context injection)
2. Operate within declared contract scope
3. End with `tlc-done --module <ID>` capturing evidence

### Section 6.2 — AI Context Injection

Before any AI session, inject the active contract context:

```bash
tlc-context --module <MODULE_ID>
# Then paste .ai-context/active-session.md at conversation start
```

AI assistants without this context are operating ungoverned.
Ungoverned AI output is not evidence and cannot support status upgrades.

### Section 6.3 — Session Records

Session records live in `.sessions/`. Each record captures:
- Module ID and contract ID
- Start and end timestamps
- Evidence files captured
- ACs claimed complete this session

---

## ARTICLE VII — BREAK-GLASS OVERRIDE

### Section 7.1 — When Break-Glass is Permitted

Break-Glass override (`TLC_BYPASS_HOOKS=1`) is permitted only when:

1. The pre-commit hook is blocking valid emergency work
2. A written justification is committed alongside the bypass
3. The bypass is reported in the module's evidence log within 24 hours

### Section 7.2 — Break-Glass Abuse

Using Break-Glass without justification is a governance violation.
The module is automatically quarantined on detection of unjustified bypass.
Resolution: write the missing justification, commit it, then request dequarantine.

---

## ARTICLE VIII — INVARIANTS (I1-I6)

These invariants are enforced by the Policy Engine, pre-commit hook, and validate_repo.py.
Violation of any invariant triggers an automatic halt.

### I1 — Contract Required

**Statement:** No work may proceed on a module without an active, valid C-RSP contract.
**Enforcement:** Pre-commit hook blocks commits from unregistered modules.
**Halt ID:** `HALT_CONTRACT_MISSING`
**Resolution:** Register the module with `tlc-new` or `tlc-register`.

### I2 — Evidence Required for Claims

**Statement:** Every claim of acceptance criteria completion must be accompanied by evidence.
**Enforcement:** Pre-commit hook warns when AC completion is staged without evidence file.
validate_repo.py checks evidence directory exists and is initialized.
**Halt ID:** `HALT_INVARIANT_FAILED`
**Resolution:** Capture evidence before claiming completion.

### I3 — Scope Boundary Enforcement

**Statement:** Work outside declared contract scope is unauthorized until the contract is amended.
**Enforcement:** Policy Engine evaluates action type against contract scope.
AI context injection includes scope boundaries so the AI can self-enforce.
**Halt ID:** `HALT_UNAUTHORIZED_ACTION`
**Resolution:** Amend contract scope or confine work to declared scope.

### I4 — Invariants Are Not Bypassable

**Statement:** Invariants I1-I6 cannot be silently circumvented.
Break-Glass exists for emergency use; using it requires explicit justification.
**Enforcement:** All bypasses log to evidence. Unjustified bypasses trigger quarantine.
**Halt ID:** `HALT_BREAK_GLASS_ABUSE`
**Resolution:** Write justification, commit it, request dequarantine.

### I5 — No Unauthorized PII

**Statement:** Personally identifiable information may not enter the codebase without
explicit authorization recorded in the active contract.
**Enforcement:** Pre-commit hook scans staged files for SSN, credit card, and plaintext
password patterns.
**Halt ID:** `HALT_PII_DETECTED`
**Resolution:** Redact the PII or add an explicit PII authorization to the contract.

### I6 — Quarantined Modules Are Read-Only

**Statement:** A quarantined module cannot receive commits until the quarantine is resolved.
**Enforcement:** Pre-commit hook blocks all commits on quarantined modules.
**Halt ID:** Quarantine status in registry.
**Resolution:** Resolve the underlying violation, update the registry truth_status, commit
the resolution with evidence.

### I7 — Status Inflation Prohibited

**Statement:** A module's truth_status may not be upgraded without meeting the evidence
requirements for the target status.
**Enforcement:** tlc-done proposes upgrades but does not auto-apply them.
Upgrades require human approval.
**Resolution:** Collect required evidence, then manually upgrade the registry entry.

### I8 — Visual Understanding Layer Required

**Statement:** Every module with non-trivial architecture must include a diagram or
visual topology description in its README or docs/.
**Enforcement:** validate_repo.py checks for Mermaid diagrams, flowcharts, or explicit
visual description in README.md.
**Resolution:** Add a Mermaid diagram to README.md before marking a module `partial`.

---

## ARTICLE IX — AMENDMENT PROCESS

### Section 9.1 — Amendment Procedure

Any article may be amended by:

1. Opening a branch named `constitution/amendment-<description>`
2. Editing this file with the proposed change
3. Adding an entry to the AMENDMENT LOG below
4. Getting explicit operator approval before merging
5. Merging with a commit message prefixed `CONSTITUTION:`

### Section 9.2 — Invariants I1-I6

Invariants I1-I6 require elevated justification to amend.
A plain rationale comment in the amendment is required.

---

---

## ARTICLE X — ENTERPRISE-LEVEL CONDITIONS

A module may not be represented as enterprise-level unless all conditions in this Article are met
and evidenced. Enterprise-level is not a marketing claim. It is a verifiable state.

### Section 10.1 — Audit Log Retention

**Condition:** All state transitions, session records, bypass events, and status upgrades must be
retained in an immutable log for a minimum of 90 days.

**What this means in practice:**
- `evidence/index.md` is append-only; entries are never deleted
- `.sessions/` records are never purged before 90 days
- Break-glass bypass events are permanently retained regardless of resolution

**Invariant I9:** Audit log retention < 90 days is a governance violation. Modules claiming
enterprise-level without audit retention are misrepresenting their status.

**Halt ID:** `HALT_AUDIT_RETENTION_VIOLATION`

### Section 10.2 — Role-Based Break-Glass Access

**Condition:** Break-glass override capability is restricted to named, authorized roles.
Anonymous or undocumented bypass is prohibited at enterprise tier.

**What this means in practice:**
- `TLC_BYPASS_HOOKS=1` requires the operator's role to be declared in the module contract
- Bypass events must record: who, when, why, and what was bypassed
- AI assistants are categorically prohibited from invoking break-glass

**Invariant I10:** Undocumented break-glass use at enterprise tier is a critical violation.

**Halt ID:** `HALT_UNAUTHORIZED_BREAKGLASS`

### Section 10.3 — SLA-Traceable Evidence Chains

**Condition:** Every acceptance criterion must be traceable from claim to evidence to session to
timestamp. An auditor must be able to reconstruct the full verification chain from the evidence
directory alone.

**What this means in practice:**
- Evidence files must include: date, session ID, AC reference, and verification method
- `evidence/index.md` must link every claimed AC to its evidence file
- No AC may be marked complete in a contract without a corresponding evidence entry

**Invariant I11:** Evidence chains with gaps are invalid. A claim with a broken chain reverts
to `unverified` status.

### Section 10.4 — Operational Runbooks

**Condition:** Enterprise-level modules must include documented runbooks for:
- Starting and stopping the module
- Recovering from a halt condition
- Performing a status upgrade ceremony
- Handling a quarantine event

**Location:** `docs/operations/` within the module directory.

---

## ARTICLE XI — PRODUCTION-READY CONDITIONS

A module may not be represented as production-ready unless all conditions in this Article are met.
Production-ready means it can be handed to another person who has never seen it, and they can
operate it safely.

### Section 11.1 — Zero-Downtime Contract Transitions

**Condition:** When a C-RSP contract is amended or replaced, the module must continue operating
under the prior contract until the new contract is fully ratified. There is no moment where a
module operates without a valid contract.

**What this means in practice:**
- New contract is written and validated before the old one is archived
- Registry update and contract archive happen in the same commit
- No commit may reference a contract that is not on disk

**Invariant I12:** A module without a valid contract on disk is immediately halted.

### Section 11.2 — Rollback Evidence Required Before Deploy

**Condition:** Any deployment or irreversible action must be preceded by a rollback plan
recorded in the evidence directory.

**What this means in practice:**
- `evidence/rollback-YYYY-MM-DD.md` must exist before any deploy evidence file
- Rollback plan must name: trigger conditions, rollback command, verification step
- AI assistants must refuse to generate deploy commands without a rollback plan on record

**Invariant I13:** Deploy without rollback evidence is a governance violation.

**Halt ID:** `HALT_DEPLOY_WITHOUT_ROLLBACK`

### Section 11.3 — Health Check Endpoints

**Condition:** Every runtime module must expose a mechanism to verify it is operating correctly.
This does not require a web server. It requires a verifiable signal.

**What this means in practice:**
- A CLI module: `node scripts/tlc-validate.mjs --health` exits 0 when healthy
- A web service: `GET /health` returns 200 with status payload
- A background process: a heartbeat file updated on each successful cycle
- The health check mechanism must be documented in `docs/operations/`

**Invariant I14:** A module with no documented health check cannot be declared production-ready.

### Section 11.4 — Dependency Pinning

**Condition:** All external dependencies must be pinned to specific versions in production-ready
modules. Floating version ranges (`^`, `~`, `*`) are prohibited in production manifests.

**What this means in practice:**
- `package.json` production deps use exact versions
- `requirements.txt` uses `==` not `>=`
- Lock files (`package-lock.json`, `yarn.lock`, `uv.lock`) are committed

### Section 11.5 — Handoff Completeness

**Condition:** A production-ready module must include a `HANDOFF.md` that enables a person
unfamiliar with the project to take over operation within 30 minutes.

**What this means in practice:**
- `HANDOFF.md` exists and is current (updated at least as recently as the last session)
- Contains: current state, working components, next steps, available commands, key files
- Does not assume prior knowledge of TLC 2.0

---

## ARTICLE XII — PRIVACY-FIRST CONDITIONS

Privacy-first is a design constraint, not a compliance checkbox. These conditions apply to every
module that handles any data about real people, including the operator themselves.

### Section 12.1 — No PII in Evidence Trails Without Consent Annotation

**Condition:** Personally identifiable information may not appear in any evidence file, session
record, or audit log without an explicit consent annotation in the active contract.

**What this means in practice:**
- Evidence files must not contain: names, email addresses, phone numbers, health data,
  location data, or any identifier that could be linked to a real person
- The pre-commit hook scans for known PII patterns (SSN, credit card, email regex)
- If PII is legitimately needed for evidence, the contract must contain a `pii_authorized` field
  with a named justification

**Invariant I5** (extended at privacy-first tier): PII detection is a hard block. Evidence files
with PII and no authorization annotation are deleted and the session is marked invalid.

### Section 12.2 — Data Minimization in Session Records

**Condition:** Session records must contain only what is necessary to reconstruct the governance
state. They must not contain conversation transcripts, personal communications, or user data
beyond: module ID, timestamps, AC references, and evidence file paths.

**What this means in practice:**
- `.sessions/*.json` files contain governance metadata only
- Conversation content stays in the AI platform's own storage
- `tlc-done` captures what happened, not what was said

### Section 12.3 — Operator-Controlled Purge

**Condition:** The operator must be able to purge any session record, evidence file, or audit
entry without requiring external approval or leaving residual data.

**What this means in practice:**
- `tlc-purge --module <ID> --before <date>` deletes session records older than the specified date
- Purge events are themselves logged (you cannot purge the purge log without a special flag)
- Evidence files are operator-owned; no external system has a copy without explicit consent

**Invariant I15:** A system that the operator cannot fully purge is not privacy-first.

### Section 12.4 — Local-First Data Residency

**Condition:** All governance data — registry, contracts, evidence, session records — lives on
operator-controlled infrastructure by default. Cloud sync is opt-in, never default.

**What this means in practice:**
- TLC 2.0 does not phone home
- No telemetry is collected or transmitted
- Git push is operator-initiated, not automatic
- Third-party AI APIs receive only what is included in the active session context

---

## ARTICLE XIII — AI GOVERNANCE CONDITIONS

This Article governs the behavior of AI assistants operating under TLC 2.0. It applies to
any AI system — Hermes Agent, Claude, Kimi, or any other — when working inside a TLC session.

### Section 13.1 — Governed vs. Ungoverned AI Sessions

**Condition:** Every AI session touching TLC-governed work must be initialized with an
active contract context. AI output from ungoverned sessions is inadmissible as evidence.

**Governed session requirements:**
- Active contract loaded before first message (via `tlc-context` + `active-session.md` or Hermes skill)
- Module ID and contract ID declared at session start
- AI output produced within contract scope

**Ungoverned session output:**
- Cannot be cited as evidence for AC completion
- Cannot be used to justify a status upgrade
- Can be used as a draft for review, subject to subsequent verification

### Section 13.2 — AI Refusal Requirements

An AI assistant operating under TLC governance must refuse to:

1. Generate code that bypasses a declared invariant
2. Self-report AC completion without evidence
3. Upgrade a module's truth_status without operator confirmation
4. Produce output that claims a scope broader than the active contract
5. Generate deploy commands without a rollback plan on record (Article XI.2)

If asked to violate these conditions, the AI must:
- Name the specific invariant being violated
- Decline the specific action
- Propose the compliant path (e.g., "Amend the contract scope first")

### Section 13.3 — Hermes Agent as Default AI Backbone

When Hermes Agent is the active AI assistant, the following additional conditions apply:

- Each TLC module has a corresponding Hermes skill (`~/.hermes/skills/tlc/crsp-<module-id>/SKILL.md`)
- Skills are synchronized from the registry by `tlc-sync-skills` after every status change
- Hermes sessions are launched via `tlc-hermes --module <ID>`, which loads the module skill
  and sets the session title to the module ID
- Session transcripts are searchable by module ID via `hermes sessions browse`
- The daily governance digest is delivered via Hermes cron

### Section 13.4 — AI Memory and Context Persistence

**Condition:** An AI assistant must not lose contract context mid-session due to context window
compression. The operator must be notified when context has been compressed.

**What this means in practice:**
- Hermes's built-in context compression is permitted
- After compression, the AI must re-confirm it still has the active contract in scope
- The `active-session.md` file may be re-injected mid-session if context is lost
- Losing contract context mid-session is a soft halt: work continues but output is flagged
  as potentially ungoverned until context is confirmed

---

## ARTICLE XIV — INSTALLABILITY CONDITIONS

TLC 2.0 is designed to be installed by others. A person with a working macOS or Linux machine,
Node.js ≥ 18, and Python ≥ 3.10 should be able to run `bash install.sh` and arrive at the same
governed workspace the original operator has.

### Section 14.1 — Bootstrap Completeness

**Condition:** `install.sh` must be sufficient to bootstrap a working TLC 2.0 workspace on a
fresh machine. It must not require prior knowledge, undocumented manual steps, or network access
beyond cloning the repo and installing declared dependencies.

**Verification:** A person who has never seen TLC 2.0 runs `bash install.sh` and immediately
has access to all `tlc-*` commands with no errors.

**Invariant I16:** `install.sh` that fails on a clean machine is a governance violation.
`install.sh` is production code. It has the same quality standard as any other script.

### Section 14.2 — Registry Portability

**Condition:** A fresh install starts with an empty registry (`{}` or minimal seed), not a copy
of the original operator's modules. The installer's modules are their own.

**What this means in practice:**
- `registry/modules.registry.json` in the repo is either empty or contains only template entries
  marked with `surface: example`
- The `install.sh` initializes a clean registry for the new operator
- The original operator's personal project paths are never hardcoded in shared files

### Section 14.3 — Configuration Portability

**Condition:** No file in the repo contains hardcoded paths to the original operator's home
directory, username, or project structure. All paths are derived at runtime from `$HOME` or
equivalent.

**Enforcement:** `install.sh` runs a path audit (`grep -r '/Users/coreyalejandro'`) and halts
if any hardcoded paths are found in shared scripts.

### Section 14.4 — Dependency Declaration

**Condition:** All dependencies required for a working TLC 2.0 installation are declared in
one of:
- `package.json` (Node.js dependencies)
- `requirements.txt` (Python dependencies)
- The "Prerequisites" section of `docs/INSTALLING.md`

No undeclared dependency may be assumed present.

---

## ARTICLE XV — SHAREABILITY CONDITIONS

Shareability governs what a TLC 2.0 operator may publish, present, or represent publicly
about their work. This Article protects both the operator and the people who might act on
their claims.

### Section 15.1 — Public Claim Authorization

**Condition:** A module may only be represented publicly when its truth_status is `working`
AND its surface classification permits public claims (see Article II, Section 2.2).

**Specific prohibitions:**
- Claiming a module is "production-ready" when truth_status is `partial` or lower
- Citing AI-generated output as your own verified finding without disclosure
- Presenting evidence from an ungoverned session as if it were governed

### Section 15.2 — Portfolio Representation

**Condition:** Any portfolio, resume, or public profile that references TLC-governed work must
accurately reflect the truth_status of each cited module at the time of publication.

**What this means in practice:**
- `tlc-report --format portfolio` generates a shareable snapshot with honest truth labels
- Portfolio entries must include: module ID, surface, truth_status, and verified scope
- Updating a portfolio entry for a module requires the module's truth_status to have changed

### Section 15.3 — Attribution of AI Contribution

**Condition:** Work produced with AI assistance under a governed session must disclose AI
involvement when the work is shared. The disclosure format is:

```
Produced under TLC 2.0 governance with AI assistance.
Contract: [CONTRACT_ID]
Evidence: on file
```

This is not a diminishment of the work. It is an accurate description of how it was produced.

### Section 15.4 — Forkability

**Condition:** TLC 2.0 must be forkable. Any person who wants the same governed workspace
may fork the repo, run `install.sh`, and arrive at a functionally equivalent system.
No part of the governance infrastructure may be proprietary, gated, or require the original
operator's credentials.

---

## AMENDMENT LOG

| Date | Article | Change | Author | Justification |
|------|---------|--------|--------|---------------|
| 2026-06-17 | All | Initial ratification of Articles I-IX | TLC 2.0 build | First formal version; SOCIOTECHNICAL_CONSTITUTION.md previously empty |
| 2026-06-17 | X-XV | Added enterprise, production, privacy, AI governance, installability, shareability articles | TLC 2.0 build | Canonical conditions for public distribution and enterprise adoption |

---

## V&T STATEMENT

EXISTS — SOCIOTECHNICAL_CONSTITUTION.md written with Articles I-IX
VERIFIED AGAINST — Halt conditions from contracts/active/BUILD_CONTRACT.json; invariants from src/git-hooks/pre-commit.mjs; halt IDs from policy-engine.js
NOT CLAIMED — This is a governance document, not running code. Enforcement is implemented in separate scripts.
FUNCTIONAL STATUS — Ratified. Enforcement implemented in pre-commit.mjs, validate_repo.py, and policy-engine.js.
