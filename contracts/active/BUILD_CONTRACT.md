# C-RSP Build Contract — SocioTechnical Constitution Runtime
**Contract ID:** CRSP-STC-RUNTIME-001
**Version:** 1.0.0
**Schema:** 4.0
**Status:** Draft
**Adoption Tier:** Tier-1-MVG (Tier-2-Operational after human approval gates)

---

## 0. Instance Governance

- **Artifact Class:** Executed contract instance (zero-shot, single-pass synthesis).
- **Canonical Expansion:** C-RSP = Constitutionally-Regulated Single Pass.
- **Schema Authority:** `contract-schema.json` v4.0.
- **Zero-Shot Declaration:** This contract is drafted post-execution to formally bind the complete specification of the SocioTechnical Constitution runtime — every component, diagram, and interface — at a level of detail suitable for immediate implementation. The contract is monolithic for delivery but contains internal approval gates that require a human to sign off before each component's build proceeds.

---

## 1. Contract Identity

| Field | Value |
|-------|-------|
| **Contract Title** | SocioTechnical Constitution Runtime — Complete Component Specification |
| **Contract ID** | CRSP-STC-RUNTIME-001 |
| **Version** | 1.0.0 |
| **Scope** | Full specification of the runtime enforcement layer and all supporting components for the SocioTechnical Constitution, including: Contract Window, Policy Engine, Evidence Observatory, Constitutional Council Dashboard, Amendment Process UI, Break-Glass Override, Role-Based Access, Integration Adaptors, and the four required diagrams (File System, Architecture, App Flow, 3 Persona User Journeys). |
| **Primary Objective** | Provide an implementable, zero-translation blueprint for the entire runtime, where every component is described down to its data fields, states, interactions, and acceptance criteria. Each major component is gated by a human approval step. |
| **Not Claimed** | Actual running code; production-hardened infrastructure; integration with specific enterprise tools beyond abstract adaptors. |

---

## 2. Contract Topology

- **Topology Mode:** Satellite
- **Profile Type:** Satellite (no parent overlay)
- **Authoritative Truth Surfaces:** This BUILD_CONTRACT.md; the associated `SOCIOTECHNICAL_CONSTITUTION.md`; the diagrams embedded herein.

---

## 3. Baseline State

- **Existing Assets:** `SOCIOTECHNICAL_CONSTITUTION.md` (Preamble + Articles I-IX); PR #60; PROACTIVE PRD and research plans; Contract Window specification from prior conversation.
- **Constraints:** All components must obey the Constitution's principles, invariant set, and progressive enforcement model.
- **Known Gaps:** No runtime code; all specifications are declarative. Implementation will require a build environment with Node.js/Python, filesystem access, and optional LLM access for critique steps.

---

## 4. Dependencies and Inputs

- **Required Inputs:** `SOCIOTECHNICAL_CONSTITUTION.md` (constitutional authority); Contract Window specification (detailed UI design); C-RSP contract schema v4.0; evidence-logging schema.
- **External Dependencies:** A platform-to-be-chosen for UI (web or terminal), a persistence mechanism (local JSON files, sync via Git), optional LLM interface for constitutional critique.

---

## 5. Risk & Control Classification

- **Risk Class:** Medium (when runtime blocks developer workflows)
- **Side-Effect Class:** Internal
- **External Action Scope:** Blocks merges, deployments, or AI actions only after progressive enforcement.
- **Stop/Override Required:** Yes — break-glass procedure must be in place from Day 1.

---

## 6. Execution Model

**Overall Process:**
The implementation proceeds in **11 sequential blocks**, each ending with a human approval gate (a signed commit or equivalent). The order is dictated by dependency: infrastructure -> core governance -> interfaces -> integration.

### 6A. Ordered Operations (Master Build Sequence)

| Step | Component | Key Output | Human Gate |
|------|-----------|------------|------------|
| 1 | File System Layout & Project Skeleton | Directory structure, base configs | Approve folder structure |
| 2 | Core Data Models & Schemas | JSON schemas for contract, V&T, halt matrix, evidence | Schemas validated |
| 3 | Contract Manager (Read/Write) | Module that loads and persists build contracts | CRUD unit tests pass |
| 4 | Policy Engine & Invariant Enforcer | Rule engine that checks invariants and halt conditions | Simulate on sample contract |
| 5 | Evidence Observatory | Immutable JSONL logger, reader, evidence lookup | Logs created and queryable |
| 6 | Contract Window (Strip + Kanban) | Full implementation per spec in §8 | Visual demo matches spec |
| 7 | Role-Based Access & Agent Authority | Gate functions for PM/Dev/SRE/AI roles, override logic | Role matrix tests |
| 8 | Break-Glass Override Workflow | UI and backend for emergency override | Override logged and reversible |
| 9 | Constitutional Council Dashboard | Council member view: amendment proposals, override review | Dashboard displays mock data |
| 10 | Amendment Process UI | Versioned constitution editor, diff viewer, vote tally | Amendment lifecycle test |
| 11 | Integration Adaptors (Git, CI) | Webhook handlers, pre-receive hooks, CI plugins | End-to-end block demo |

Each step includes its own detailed spec below, diagrams where relevant, and acceptance criteria.

---

## 7. Lifecycle State Machine

- **Draft -> Active** after every human gate is signed.
- **Active -> Frozen** upon release.
- **Superseded** by major version amendment.

---

## 8. Component Specifications

### 8.1 File System Layout

```
sociotechnical-constitution-runtime/
├── constitution/
│   ├── SOCIOTECHNICAL_CONSTITUTION.md
│   └── amendments/
│       └── v1.0.0/
├── contracts/
│   ├── active/
│   │   └── BUILD_CONTRACT.json
│   └── archive/
├── schemas/
│   ├── contract-schema.json
│   ├── vnt-statement.schema.json
│   ├── halt-condition.schema.json
│   └── evidence-entry.schema.json
├── src/
│   ├── core/
│   │   ├── contract-manager.js
│   │   ├── policy-engine.js
│   │   ├── evidence-observatory.js
│   │   └── role-authorizer.js
│   ├── ui/
│   │   ├── contract-window/
│   │   │   ├── strip.jsx
│   │   │   ├── kanban-board.jsx
│   │   │   ├── vnt-detail.jsx
│   │   │   └── halt-matrix.jsx
│   │   ├── council-dashboard/
│   │   ├── amendment-editor/
│   │   └── break-glass.jsx
│   ├── adaptors/
│   │   ├── git-hooks/
│   │   ├── ci-plugin/
│   │   └── llm-gateway.js
│   └── cli/
│       └── tlc-cli.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── compliance/
├── evidence/
│   └── CRSP-STC-RUNTIME-001/
│       ├── lifecycle.jsonl
│       ├── halt-log.jsonl
│       └── vnt-audit.jsonl
├── package.json
├── config.yaml
└── README.md
```

**Rationale:**
- `constitution/` holds the canonical document; amendments are versioned.
- `contracts/active/` holds the current build contract governing the runtime itself; the Contract Window reads this.
- `schemas/` enforce data integrity.
- `src/core/` implements the backend enforcement; `src/ui/` the interfaces; `src/adaptors/` the external tool plugs.
- `evidence/` is the permanent, append-only audit log.

---

### 8.2 Architecture Diagram

```
+-----------------------------------------------------------------+
|                      USER INTERFACES                            |
|  +--------------+  +--------------+  +--------------------+    |
|  | CLI (tlc-cli)|  | Web Dashboard|  | IDE Extension (VS) |    |
|  +------+-------+  +------+-------+  +----------+---------+    |
|         |                 |                      |              |
|         +--------+--------+----------------------+              |
|                  |                                              |
|            +-----v-----+                                        |
|            | API Layer |                                        |
|            | (REST/WS) |                                        |
|            +-----+-----+                                        |
+-----------------+-----------------------------------------------+
                  |
+-----------------v-----------------------------------------------+
|                     ENFORCEMENT CORE                            |
|  +--------------------+  +-----------------+                   |
|  |  Contract Manager  |  |  Policy Engine  |                   |
|  |                    |  |  + Rule Evaluator                   |
|  +--------+-----------+  +-------+---------+                   |
|           |                      |                              |
|           +----------+-----------+                             |
|                      |                                         |
|          +-----------v-----------+                             |
|          |   Evidence Observatory|                             |
|          |   (immutable log)     |                             |
|          +-----------------------+                             |
+-----------------------------------------------------------------+
                  |
+-----------------v-----------------------------------------------+
|                     ADAPTORS & EXTERNAL                         |
|  +--------+  +--------+  +----------+  +--------------+        |
|  |Git Hook|  |CI Plugin|  |LLM Gateway|  |Notification  |      |
|  +--------+  +--------+  +----------+  |(Slack, etc.) |        |
|                                         +--------------+        |
+-----------------------------------------------------------------+
```

**Flow:**
1. A user action (commit, deploy request, AI assistant call) hits an adaptor.
2. The adaptor calls the API, which fetches the active contract.
3. The Policy Engine evaluates the action against the Constitution's invariants and halt conditions.
4. The Evidence Observatory records the decision and any V&T updates.
5. The Contract Window in the UI reflects the new state.

---

### 8.3 App Flow Diagram — PR Merge Check

```
Actor: Developer pushes code, opens PR
System: Git hook fires -> sends PR metadata to Runtime API
API -> Contract Manager: fetch active contract for repo
Policy Engine:
  - Evaluate INVARIANT_EXEC_03 (all ACs must have V&T)
  - Evaluate HALT_PII_UNVERIFIED if PII paths exist
  - If all pass -> return ALLOW
  - If halt -> return BLOCK + evidence link
API -> Git hook: respond with pass/fail
Evidence Observatory: log evaluation with decision
Contract Window: update kanban card to "Blocked" if fail, show halt reason
Developer sees Contract Window strip turn red with halt reason
Developer can expand, view halt matrix, challenge or fix issue
```

---

### 8.4 Three Persona User Journeys

#### Journey A: Developer (PR blocked by PII policy)

1. David opens a PR to add a new logging statement that may include email addresses.
2. Git push triggers the pre-receive hook.
3. Policy Engine's PII regex matches; HALT_PII_UNVERIFIED fires.
4. Contract Window strip turns red: BLOCKED: PII likely in log statement.
5. David expands the window, sees the halt matrix, clicks the evidence link to view the flagged line.
6. David either anonymizes the log or requests a break-glass override with justification.
7. Break-glass approved (or code fixed); next push passes; kanban moves to Done.

**Diagram:**
```
[David pushes] -> [Git Hook] -> [Policy Engine] -> [BLOCK] -> [Strip turns red]
   |
   v
[David expands Contract Window] -> [Sees Halt Matrix] -> [Fixes code / Override] -> [Push passes]
```

#### Journey B: SRE (Emergency hotfix during change freeze)

1. Production incident: SRE Maria needs to deploy a hotfix outside the change window.
2. Maria invokes `tlc break-glass` CLI, provides incident ID and justification.
3. Break-Glass Override workflow requests approval; Maria submits.
4. System logs the override in the Evidence Observatory.
5. Contract Window shows override active with timer.
6. Maria deploys; after resolution, the system reminds her to close the override.
7. Override is reviewed post-incident by the Constitutional Council.

**Diagram:**
```
[Maria invokes break-glass] -> [Requests justification] -> [Logs in Evidence] -> [Window shows timer]
   |
   v
[Deploy proceeds] -> [Post-incident review by Council]
```

#### Journey C: Product Manager (Experiment approval)

1. PM Alex creates a new A/B test spec that targets users in a sensitive region.
2. Alex runs the experiment through the Constitution's spec checker.
3. Policy Engine flags potential fairness risk; halts launch.
4. Contract Window shows: Launch Blocked: Fairness check required.
5. Alex expands and clicks "Request Council Review".
6. The amendment/exception workflow sends a proposal to the Constitutional Council.
7. Council votes to approve with conditions; window updates; experiment can launch with added consent.

**Diagram:**
```
[Alex writes spec] -> [Spec checker flags fairness] -> [Window: Blocked]
   |
   v
[Alex requests review] -> [Council votes] -> [Approved with conditions] -> [Window: Active with warning]
```

---

## 9. Detailed Component Specifications (Build-Level)

### 9.1 Contract Manager

**Purpose:** Load, parse, validate, and persist the C-RSP build contract.

**Data Model:**
- `Contract` object with all fields from contract-schema.json.
- In-memory representation and file serialization as JSON or YAML.

**Functions:**
- `load(contractPath)` -> Contract
- `save(contract)` -> writes to `contracts/active/BUILD_CONTRACT.json`
- `validate(contract)` -> list of schema violations
- `watch(contractPath, callback)` -> live reload for Contract Window

**Acceptance Criteria:**
- AC-CM-01: Loads a valid contract without errors.
- AC-CM-02: Fails loading with clear message if schema violated.
- AC-CM-03: Write updates are atomic (write to temp, rename).
- AC-CM-04: `validate` catches missing required fields as per contract-schema.json.

---

### 9.2 Policy Engine & Invariant Enforcer

**Purpose:** Evaluates events (PR open, deploy request, AI action) against the Constitution's invariants and halt conditions.

**Input:** Event type, payload (e.g., PR diff, command), current contract state.

**Processing:**
- Load rule set from `constitution/SOCIOTECHNICAL_CONSTITUTION.md` invariants (Article VIII) and additional policies.
- Apply each rule sequentially; any halt condition -> aggregate results.
- Return: `{ decision: ALLOW | BLOCK | WARN, halted: [halt_condition_ids], evidence_paths: [...] }`.

**Rule Definitions (Example):**
```yaml
- id: INVARIANT_EXEC_03
  description: "All acceptance criteria must have V&T status verified"
  evaluate: |
    contract.acceptance_criteria.forEach(ac => {
      if (!ac.vnt || ac.vnt.unverified.length > 0) return BLOCK;
    })
- id: HALT_PII_UNVERIFIED
  description: "No PII in output unless explicitly authorized"
  evaluate: |
    if payload.diff_contains_pii && !contract.authorizations.pii_override) return BLOCK;
```

**Testing:**
- Mock events and contracts; unit test each rule.
- Dry-run mode against historical PRs to measure false-positive rate.

**Acceptance Criteria:**
- AC-PE-01: All Article VIII invariants are implemented as testable rules.
- AC-PE-02: Halt matrix entries can be triggered by simulated events.
- AC-PE-03: Rule evaluation completes within 200ms for up to 50 rules.
- AC-PE-04: `WARN` decision does not block but flags in V&T.

---

### 9.3 Evidence Observatory

**Purpose:** Immutable, append-only log of every gate decision, action, V&T update, and exception.

**Format:** JSONL files under `evidence/<contract-id>/`. Each line is a JSON object with:
`timestamp`, `event_type`, `contract_id`, `component`, `decision`, `evidence_paths`, `user`, `role`.

**Write API:** `EvidenceObservatory.log(event)` appends to the appropriate file. Write is synchronous to avoid loss.

**Read API:** `EvidenceObservatory.query({contract_id, event_type, since})` returns matching lines.

**Retention:** Logs are kept indefinitely; rotation based on file size (e.g., daily). Integrity guaranteed by append-only; if filesystem supports, lock files.

**Acceptance Criteria:**
- AC-EO-01: All gate evaluations are logged immutably.
- AC-EO-02: Query returns evidence for specific contract and time range.
- AC-EO-03: Logging fails if disk full, and alert is raised.
- AC-EO-04: Logs include enough detail to reconstruct the decision for audit.

---

### 9.4 Contract Window (Full Spec)

**Strip (always-visible top bar):**
- Fields: risk indicator, intent summary, progress (ACs done/total), budget remaining, V&T summary badge, expand button.
- Color states: green (all clear), amber (warnings), red (blocked).

**Kanban Board:**
- Four columns: Backlog / In Progress / Blocked / Done.
- Populated from the contract's acceptance_criteria array.
- Cards are draggable; drag updates AC status in the contract file.

**AC Cards:**
- Show: AC ID, short description, V&T status icon, assignee, last-updated timestamp.
- Click to expand V&T Detail panel.

**Halt Matrix:**
- Table of all halt conditions with columns: ID, Trigger, Status (active/resolved), Resolution path.

**V&T Detail:**
- Expandable per AC: shows Exists, Verified Against, Not Claimed, Functional Status fields.

**Challenge/Repair:**
- Buttons on blocked cards: "Challenge" (opens dispute), "Repair" (creates linked repair task).

**Acceptance Criteria:**
- AC-CW-01: Strip renders within 100ms of contract load.
- AC-CW-02: Strip color matches highest-severity halt condition.
- AC-CW-03: Kanban cards accurately reflect AC status from contract.
- AC-CW-04: Dragging a card updates the underlying contract file.
- AC-CW-05: Halt matrix shows all active halts with resolution links.
- AC-CW-06: V&T detail shows all four fields per AC.
- AC-CW-07: Challenge and Repair buttons are only visible to authorized roles.
- AC-CW-08: Contract Window live-reloads when contract file changes on disk.

---

### 9.5 Role-Based Access & Agent Authority Gates

**Purpose:** Enforce Article III role boundaries and AI assistant limits.

**Roles:** PM, Developer, QA, SRE, AI_Assistant, Constitutional_Council.

**Permissions Matrix:**
- `can_merge`: Developer (with review), AI_Assistant (never)
- `can_deploy`: SRE (in approved window), AI_Assistant (never)
- `can_approve_experiment`: PM (with ethics check)
- `break_glass_authorized`: SRE (on call), Constitutional_Council

**Implementation:**
- At every actuation gate, call `RoleAuthorizer.canPerform(user, action, context)`.
- Returns allowed/denied with reason.
- For AI actions, strict limits apply regardless of instruction.

**Acceptance Criteria:**
- AC-RB-01: AI assistant cannot trigger merge or deploy actions even if instructed.
- AC-RB-02: SRE can execute a deploy during approved window with valid credential.
- AC-RB-03: Break-glass requires dual approval for high-risk services.

---

### 9.6 Break-Glass Override Workflow

**Purpose:** Allow emergency bypass of a block with full audit trail.

**Steps:**
1. User clicks "Break-Glass" in Contract Window (button only visible if authorized).
2. System prompts for: principle being overridden, reason, scope (which ACs), time limit (max 24h), second approver if needed.
3. Upon submission, request is logged in Evidence Observatory with `event_type: BREAK_GLASS_REQUESTED`.
4. If second approval required, notification is sent; second approver approves.
5. Override status written into contract's `overrides` section.
6. Policy Engine checks for active override when evaluating blocks; allows bypass for defined scope/time.
7. When time expires, override is automatically deactivated and logged.
8. The Contract Window shows a timer and override badge.

**Acceptance Criteria:**
- AC-BG-01: Break-glass cannot be used for roles without authorization.
- AC-BG-02: Override correctly bypasses specified halt conditions.
- AC-BG-03: Override auto-expires and is logged.
- AC-BG-04: All override events appear in Evidence Observatory and Council dashboard.

---

### 9.7 Constitutional Council Dashboard

**Purpose:** Interface for Council members to oversee the Constitution's health.

**Features:**
- List of recent overrides with status, justification, and expiry.
- Amendment proposals with vote counts.
- Drift detection alerts (unusual override patterns, high block rates).
- Meeting minutes and decision records.
- Access to full Evidence Observatory queries.

**Acceptance Criteria:**
- AC-CC-01: Dashboard displays active overrides within 10 seconds of occurrence.
- AC-CC-02: Amendment voting works and results are recorded in the Constitution's amendment log.
- AC-CC-03: Only Council members can access.

---

### 9.8 Amendment Process UI

**Purpose:** Facilitate the formal amendment process from Article VII.

**Workflow:**
1. Author drafts amendment in a versioned editor (branched off current constitution).
2. System shows a diff against the current version.
3. Author submits for review; notification to Council.
4. Council discusses (comments), then votes digitally.
5. If approved with quorum (as per Article IX), the amendment is merged into the main constitution file.
6. System updates the active constitution version and logs the amendment in the Evidence Observatory.

**Acceptance Criteria:**
- AC-AP-01: Amendments can be proposed, diffed, and submitted.
- AC-AP-02: Voting follows the Council's defined quorum.
- AC-AP-03: Approved amendments are reflected in the runtime immediately.

---

### 9.9 Integration Adaptors

**Git Hook (pre-receive):**
- Receives push events, extracts commit metadata.
- Calls Policy Engine with `event_type: PRE_RECEIVE`.
- Rejects push if blocked; output message links to Contract Window.

**CI Plugin (GitHub Actions / Jenkins):**
- Action that calls the runtime API before deployment step.
- Fetches contract, runs gate check; sets build status.

**LLM Gateway Adaptor:**
- Sits between the agent and the completion API.
- Before returning model output, passes it through the Policy Engine (with content and intent).
- Can block, redact, or append V&T statement to the response.

**Acceptance Criteria:**
- AC-IA-01: Git hook blocks push when policy demands, with clear message.
- AC-IA-02: CI plugin fails the build if gates not met.
- AC-IA-03: LLM gateway adds V&T metadata to flagged responses.

---

## 10. Acceptance Criteria Master List

| ID | Description | Component |
|----|-------------|-----------|
| AC-CM-01 | Loads a valid contract without errors | Contract Manager |
| AC-CM-02 | Fails loading with clear message if schema violated | Contract Manager |
| AC-CM-03 | Write updates are atomic | Contract Manager |
| AC-CM-04 | validate catches missing required fields | Contract Manager |
| AC-PE-01 | All Article VIII invariants implemented as testable rules | Policy Engine |
| AC-PE-02 | Halt matrix entries can be triggered by simulated events | Policy Engine |
| AC-PE-03 | Rule evaluation completes within 200ms for up to 50 rules | Policy Engine |
| AC-PE-04 | WARN decision does not block but flags in V&T | Policy Engine |
| AC-EO-01 | All gate evaluations are logged immutably | Evidence Observatory |
| AC-EO-02 | Query returns evidence for specific contract and time range | Evidence Observatory |
| AC-EO-03 | Logging fails if disk full, alert is raised | Evidence Observatory |
| AC-EO-04 | Logs include enough detail to reconstruct the decision | Evidence Observatory |
| AC-CW-01 | Strip renders within 100ms of contract load | Contract Window |
| AC-CW-02 | Strip color matches highest-severity halt condition | Contract Window |
| AC-CW-03 | Kanban cards accurately reflect AC status | Contract Window |
| AC-CW-04 | Dragging a card updates the underlying contract file | Contract Window |
| AC-CW-05 | Halt matrix shows all active halts with resolution links | Contract Window |
| AC-CW-06 | V&T detail shows all four fields per AC | Contract Window |
| AC-CW-07 | Challenge/Repair buttons only visible to authorized roles | Contract Window |
| AC-CW-08 | Contract Window live-reloads when contract file changes | Contract Window |
| AC-RB-01 | AI assistant cannot trigger merge or deploy | Role Authorizer |
| AC-RB-02 | SRE can deploy during approved window | Role Authorizer |
| AC-RB-03 | Break-glass requires dual approval for high-risk services | Role Authorizer |
| AC-BG-01 | Break-glass cannot be used for unauthorized roles | Break-Glass |
| AC-BG-02 | Override correctly bypasses specified halt conditions | Break-Glass |
| AC-BG-03 | Override auto-expires and is logged | Break-Glass |
| AC-BG-04 | All override events appear in Observatory and Council dashboard | Break-Glass |
| AC-CC-01 | Dashboard displays active overrides within 10 seconds | Council Dashboard |
| AC-CC-02 | Amendment voting records results in amendment log | Council Dashboard |
| AC-CC-03 | Only Council members can access dashboard | Council Dashboard |
| AC-AP-01 | Amendments can be proposed, diffed, and submitted | Amendment UI |
| AC-AP-02 | Voting follows the Council's defined quorum | Amendment UI |
| AC-AP-03 | Approved amendments reflected in runtime immediately | Amendment UI |
| AC-IA-01 | Git hook blocks push when policy demands | Integration Adaptors |
| AC-IA-02 | CI plugin fails the build if gates not met | Integration Adaptors |
| AC-IA-03 | LLM gateway adds V&T metadata to flagged responses | Integration Adaptors |
| AC-SYS-01 | All components communicate via defined APIs/events | System |
| AC-SYS-02 | System can run entirely from a local folder | System |
| AC-SYS-03 | The Constitution's own V&T is tracked in Evidence Observatory | System |

---

## 11. Halt Matrix (System-Level)

| Halt Condition | Trigger | Resolution |
|----------------|---------|------------|
| HALT_CONTRACT_MISSING | Active build contract not found in `contracts/active/` | Create one via CLI |
| HALT_SCHEMA_INVALID | Contract fails schema validation | Correct contract format |
| HALT_INVARIANT_FAILED | Any Article VIII invariant broken during operation | Fix the violating artifact; clear halt |
| HALT_PII_DETECTED | PII detected without authorization | Redact or authorize override |
| HALT_UNAUTHORIZED_ACTION | Role attempts action outside allowed scope | Block; log; alert |
| HALT_BREAK_GLASS_ABUSE | Break-glass used without required approvals | Disable override; notify Council |
| HALT_EVIDENCE_LOG_FULL | Disk space for evidence logs exhausted | Free space or rotate |

---

## 12. Rollback & Recovery

- **Safe-State:** All components are stateless beyond the contract and evidence files. Rollback means reverting to previous constitution version or clearing active overrides.
- **Procedure:** Use Git to revert `constitution/` or `contracts/active/` to prior version; restart runtime. Evidence logs are preserved.
- **Authority:** Constitutional Council or lead developer.

---

## 13. Evidence & Truth Surface

- **Primary Evidence Paths:** `evidence/CRSP-STC-RUNTIME-001/*`
- **Reports Generated:** This BUILD_CONTRACT.md serves as the source of truth for what must be built.
- **Audit Artifacts:** Lifecycle events, halt decisions, V&T updates.

---

## 14. Adoption Tiers

- **Tier-1-MVG:** This contract is the specification; all components defined.
- **Tier-2-Operational:** Achieved after all acceptance criteria are verified and a working demo blocks a real PR.

---

## 15. Unresolved Field Ledger

- No unresolved fields that block Tier-1; implementation details (choice of UI framework, specific LLM adapter) are left open but bounded.

---

## 16. Instance Declaration

This BUILD_CONTRACT.md binds the full specification of the SocioTechnical Constitution runtime. It is a zero-shot synthesis that includes every component at operative detail, with clear approval gates. The implementation sequence is defined. The system is ready to be built.

---

## V&T Statement — CRSP-STC-RUNTIME-001

| Field | Value |
|-------|-------|
| **What** | Complete build contract for the SocioTechnical Constitution runtime, including UI, enforcement, evidence, council, amendment, and integration components, plus four diagrams. |
| **Principles Active** | All six constitutional principles |
| **True** | All components are specified with data models, acceptance criteria, and halt behavior. Four diagrams (file system, architecture, app flow, persona journeys) are present. |
| **Assumed** | The implementing team has access to the defined schemas and the Sociotechnical Constitution document. |
| **Uncertain** | Exact choice of UI library or language may shift; the spec is abstract enough to accommodate. |
| **Unverified** | Whether the system as specified will achieve the intended governance outcomes without quantitative validation. |
| **Governance State** | Draft — pending human approval gates. |

---

*End of Contract*
Next step: A human must review and approve each implementation block. After all gates, this contract transitions to Active and the runtime becomes Tier-2-Operational.
