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

## AMENDMENT LOG

| Date | Article | Change | Author | Justification |
|------|---------|--------|--------|---------------|
| 2026-06-17 | All | Initial ratification of Articles I-IX | TLC 2.0 build | First formal version; SOCIOTECHNICAL_CONSTITUTION.md previously empty |

---

## V&T STATEMENT

EXISTS — SOCIOTECHNICAL_CONSTITUTION.md written with Articles I-IX
VERIFIED AGAINST — Halt conditions from contracts/active/BUILD_CONTRACT.json; invariants from src/git-hooks/pre-commit.mjs; halt IDs from policy-engine.js
NOT CLAIMED — This is a governance document, not running code. Enforcement is implemented in separate scripts.
FUNCTIONAL STATUS — Ratified. Enforcement implemented in pre-commit.mjs, validate_repo.py, and policy-engine.js.
