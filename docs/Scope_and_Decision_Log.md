# Scope and Decision Log — Week 1 Architecture Separation

**Version:** 1.0
**Status:** ACTIVE
**Date:** 2026-06-22
**Session:** Week 1 Refactor (Architecture Separation)
**Operator:** Hermes Agent (delegated by Corey Alejandro)

---

## Purpose

This log records every scope decision made during the Week 1 Architecture Separation. It documents what was separated, what was retained together, what was deferred, and what scope risks remain open. Per Core Constitution Article IX, scope drift without a state transition is a protocol violation. This log is the state transition record for Week 1.

---

## What Was Separated (Successfully Extracted)

### 1. TLC Runtime Paper (Paper 1) — SEPARATED from domain content

**What was extracted:**
- Runtime architecture (Safety Gate, Upstream Primacy, Halt Authority, Feedback Obligation, Task-State Locking)
- LTL formal properties (5 formulas, domain-general)
- State machine (5 states, domain-general)
- ConstitutionalInvariant TypeScript interface
- IAI metric (domain-general formula)
- Contract Window design requirements
- Evidence Chain Protocol specification
- AHI Impossibility Theorem — domain-general form only

**Source:** v10 paper ("Governed Investigation, Not Fluent Mirrors") with domain content removed.
**Destination:** `modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md`
**Result:** 318-line domain-agnostic runtime specification.

---

### 2. Eight Wonders Constitution Paper (Paper 3) — SEPARATED from runtime claims

**What was extracted:**
- Eight invariant definitions (I₁–I₈)
- Detection functions δ₁–δ₈ with proxy variables and decision logic
- AHI theory in the Black consumer context
- Relational Economy ontology
- Frontin' phenomenon as canonical case
- Community Governance / Threshold Review Board structure
- AHI Impossibility Theorem — domain-specific instantiation

**Source:** v10 paper domain content.
**Destination:** `modules/eight-wonders-constitution/paper/Eight_Wonders_Constitution_Relational_Economies_v1.0.md`
**Result:** 199-line domain constitution specification.

---

### 3. Constitutional Interface — EXTRACTED as standalone TypeScript artifact

**What was extracted:**
- `ConstitutionalInvariant` interface (TypeScript)
- `Constitution` interface
- `TLCRuntimeConfig` interface
- `EvidenceEntry` interface
- `Context`, `ContextSnapshot`, `RepairAction` interfaces
- All type definitions with JSDoc contracts

**Destination:** `src/interfaces/constitutional-invariant.ts` (215 lines)
**Result:** Production-ready TypeScript interface. SPECIFIED. (Not yet compiled — no tsconfig.)

---

### 4. Instructional Integrity Constitution — SEPARATED namespace

**What was separated:** II-* namespace (6 invariants: II-001 through II-006) runs through the same runtime as INV-* (22 governance invariants).
**Evidence:** `npm run constitutions:check` passes 22/22 + 6/6 with 0 namespace overlap.
**Decision:** This is the **generalizability proof** — one runtime executes two constitutions in completely different domains (governance + instructional design).

---

## What Was Retained Together (Deliberate Non-Separation)

### 1. tlc-sl runtime and TypeScript interface — NOT merged

**Decision:** `tlc-sl/src/` (the working `.tlcsl` DSL runtime) and `src/interfaces/constitutional-invariant.ts` (the TypeScript interface specification) are NOT reconciled or merged in Week 1.

**Rationale:** They are parallel representations of the same architectural concept at different truth-states:
- `tlc-sl`: VERIFIED (constitutions:check passes)
- TypeScript interface: SPECIFIED (file exists, not compiled)

Merging them requires architectural design work beyond Week 1 scope. Tracked as open risk below.

**Scope state:** DEFERRED

---

### 2. Core Constitution and Domain Constitutions — layered, not separated

**Decision:** `constitutions/core/TLC_Core_Constitution_v1.0.md` (14 articles, 667 lines) defines vocabulary that domain constitutions inherit. This layered inheritance relationship is **by design** — do not separate them.

**The Core Constitution is a platform artifact, not a domain artifact.** It defines Truth-State, Evidence, V&T, Tier-1 Quality, Scope, Ambiguity, First-Class, Neurodivergent-First, Narrative-First, Trust, Cognitive Load, and other architectural vocabulary that applies to every TLC deployment.

---

### 3. SOCIOTECHNICAL_CONSTITUTION.md and INV-* invariants — NOT in scope for Week 1

**Decision:** The `tlc-sl/spec/` INV-* invariants (22 governance invariants compiled through the tlc-sl runtime) are the operational governance layer. They are NOT the same as the ConstitutionalInvariant TypeScript interface in `src/interfaces/`. Both exist. Reconciliation is deferred.

---

## What Was Deferred

| Item | Why Deferred | Scope State | Target |
|---|---|---|---|
| `W-*` namespace rename for Eight Wonders | Domain-ontology change touching probe-weight filenames in `modules/governance-harness/`. Requires a dedicated contract. | DEFERRED | Follow-up contract |
| Coq proof scripts (Appendix A of Runtime paper) | Requires Coq toolchain, domain expertise, and dedicated effort. Week 1 scope is architecture documents. | DEFERRED | Future appendix work |
| LTL model-checking traces (Appendix B of Runtime paper) | Requires TLC model checker run over full state machine. | DEFERRED | Future appendix work |
| TypeScript compilation (`tsconfig.json` + `npm run tsc`) | Requires tsconfig setup. Not blocking Week 1 docs. | DEFERRED | Week 2 |
| `EightWondersConstitution implements Constitution` class | Week 2 deliverable per PROGRAM_ARCHITECTURE.md timeline. | DEFERRED | Week 2 |
| tlc-sl / TypeScript interface reconciliation | Architectural design decision required. | DEFERRED | Month 1 |
| Community panel recruitment | Requires IRB/ethics checklist completion first. | DEFERRED | Week 5–8 |
| OSF preregistration | Requires method finalization. | DEFERRED | Before Phase 2 data collection |
| Validation Study (Paper 4) empirical results | No study has been run. 94.2%/68% figures are PROPOSED placeholders. | DEFERRED | Week 9–16 (N=10 pilot) |

---

## Red-Team Findings: Domain Contamination Scan

The following is a systematic review of the TLC Runtime paper for domain-specific content that should have been extracted. This is the red-team check against separation success.

### Runtime Paper §I.C Architecture Diagram (lines 34–44)

**Claim:** "Domain Constitution (e.g., EightWondersConstitution, InstructionalIntegrityConstitution, ResearchIntegrityConstitution)"

**Finding:** This is an illustrative example, not a domain claim. The names are used to make the abstraction concrete for the reader. **No invariant definitions, detection functions, or domain-specific thresholds appear here.**

**Decision:** PERMITTED — illustrative reference is architecturally appropriate. No extraction needed.

---

### Runtime Paper §VII How to Load a Constitution (lines 245–262)

**Claim:** TypeScript code example imports `EightWondersConstitution` by name.

**Finding:** The code example shows `import { EightWondersConstitution } from '@tlc/constitutions/eight-wonders'`. This is a pedagogical example of how *any* constitution loads. No Eight Wonders invariant content (no I₁–I₈ definitions, no δₖ functions, no AHI theory) appears.

**Decision:** PERMITTED — the import is an illustration of the interface pattern, not a domain specification. No extraction needed.

---

### Runtime Paper §IX Future Constitutions (lines 274–282)

**Claim:** "Eight Wonders Constitution — relational economy invariants for Black consumer behavior research (published separately)"

**Finding:** This is a one-line reference that names the constitution and its domain. No invariant definitions appear. The phrase "published separately" explicitly acknowledges the separation.

**Decision:** PERMITTED — forward reference to external artifact is architecturally correct.

---

### Runtime Paper §V.A Coq Proof (lines 223–227)

**Claim:** "given (a) a model trained exclusively on decontextualized data, (b) a task involving a culturally situated invariant structure..."

**Finding:** The Coq theorem is stated in domain-general terms ("a culturally situated invariant structure" — not "Black consumer behavior"). The Eight Wonders-specific instantiation is delegated to "Appendix A of this document" (the Eight Wonders paper).

**Decision:** PERMITTED — domain-general formulation is appropriate for the runtime paper. No extraction needed.

---

### Runtime Paper — IAI Terminology

**Potential risk:** IAI (Insight Atrophy Index) originated in the consumer behavior research context. Could a reviewer claim the runtime paper embeds consumer behavior framing?

**Finding:** In the runtime paper, IAI is defined exclusively as `IAI = 1 - (H_post / H_pre)` where H = count of distinct alternative hypotheses a human investigator can generate. No consumer behavior terms appear in the definition. The formula is domain-general (hypothesis generation applies to any investigation).

**Decision:** ACCEPTABLE — generalization is legitimate and complete. The formula contains no domain-specific vocabulary. Monitor if reviewer raises this concern.

---

### Runtime Paper — AHI Terminology

**Potential risk:** "AHI Impossibility Theorem" is named using "AHI" which stands for Algorithmic Hermeneutical Injustice — a term with a specific cultural context in the Eight Wonders paper.

**Finding:** In the runtime paper, the AHI theorem is stated in terms of: "(a) a model trained exclusively on decontextualized data, (b) a task involving a culturally situated invariant structure, (c) absence of runtime enforcement." No "Black consumer," "relational economy," or "structural marginalization" language appears.

**Decision:** MARGINAL — the term "AHI" itself carries cultural weight even when the theorem is generalized. Consider whether the runtime paper should use a more neutral theorem name. **Open risk** — not resolved in Week 1. Tracked below.

---

## Open Scope Risks

| Risk | Description | Severity | Owner |
|---|---|---|---|
| AHI theorem naming in runtime paper | "AHI" carries domain-specific cultural weight even when theorem is stated generally. A reviewer may challenge the runtime paper for embedding domain framing. | Medium | Paper 1 authors |
| `W-*` namespace collision | I1...I8 labels in governance-harness probe weights collide numerically with Eight Wonders I₁–I₈. Deferred rename. | Medium | Week 2 contract |
| tlc-sl / TypeScript interface duality | Two representations of the constitutional interface at different truth-states. Neither is canonically authoritative as "the" runtime. | High | Month 1 architectural decision |
| Appendix stubs in all three papers | Runtime, Eight Wonders, and Validation Study all have stub appendices. These are honestly labeled but represent real gaps before submission. | High | Phased completion |
| Validation Study placeholder figures | 94.2% and 68% figures are PROPOSED drafts. Risk of being quoted as if validated. | Critical | Scope lock — must not be used outside the draft paper context |
| TypeScript `TLCRuntime` class | No `TLCRuntime` class implementation exists. The `TLCRuntimeConfig` interface is specified but nothing implements it. | High | Week 3+ |
| Coq toolchain absent | No Coq installation verified in repo. Proofs are critical path for submission to AAAI/NeurIPS. | High | Requires dedicated toolchain setup |

---

## Scope States Summary

| Scope Area | State | Notes |
|---|---|---|
| Runtime paper domain-content extraction | CLOSED | Complete. Red-team found 0 violations. |
| Eight Wonders constitution standalone | CLOSED (spec) | Domain specification complete. Calibration deferred. |
| TypeScript interface | CLOSED (spec) | File exists. Compilation deferred. |
| Instructional Integrity separation | CLOSED | II-* namespace clean, 6/6 invariants verified. |
| W-* namespace rename | DEFERRED | Named, not dropped. |
| Coq proofs | DEFERRED | Named, not dropped. |
| Validation Study empirical results | DEFERRED | Study not run. Results are PROPOSED. |
| Week 1 documentation (this set) | CLOSING | 8 documents being produced in this session. |

---

*V&T:*
*EXISTS (Verified Present): Red-team review of Runtime paper (318 lines) against domain contamination. All five potential contamination sites reviewed. Scope decisions documented with rationale.*
*VERIFIED AGAINST: All section numbers and content cross-referenced against the actual runtime paper file during this session.*
*NOT CLAIMED: That all risks are resolved. Five open risks remain and are explicitly named.*
*FUNCTIONAL STATUS: ACTIVE log — to be updated at each subsequent session with new scope decisions.*
