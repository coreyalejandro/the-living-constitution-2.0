# TLC Runtime Paper Outline

**Version:** 1.0
**Status:** SPECIFIED
**Date:** 2026-06-22
**Source:** `modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md` (318 lines, Draft v1.0)
**Target Venues:** AAAI, NeurIPS, IEEE TSE

---

## Paper Identification

**Full Title:** TLC Runtime: A Constitutional Governance Architecture for Human-Centered Investigation
**Short Title:** TLC Runtime Architecture (Paper 1 of 6)
**Status:** Draft v1.0 — Appendices stubbed
**Central Claim:** TLC is a constitutional runtime capable of executing arbitrary epistemic constitutions.

---

## Current Section Inventory

The following outline reflects **what exists in the current draft**. Sections with stubs are labeled. Nothing below is aspirational — it is an inventory.

### Abstract (EXISTS — lines 10–12)
- Five core guarantees: invariant-safety gating, halt authority, state locking, feedback obligation, narrative resolution
- Formal verification: LTL, model-checking, Coq
- Constitutional interface (`ConstitutionalInvariant`)
- Central claim stated
- Paper scope declared: platform specification only

---

### Section I: Introduction (EXISTS — lines 16–55)

**I.A. The Fluent Mirror Problem**
- Insight Atrophy: erosion of human hypothesis-generation capacity
- Downstream filtering critique: operates post-generation, cannot recover structure

**I.B. The Case for a Runtime, Not a Prompt**
- Constitutional prompting (Bai et al., 2022) critique: relies on model coherence
- TLC externalizes normative enforcement: auditable, replaceable, model-independent
- The compiler analogy: "TLC is a compiler"

**I.C. Constitutional Architecture: The Core Abstraction**
- Three-layer diagram: TLC Runtime → Constitution Interface → Domain Constitution
- The separation is the architectural contribution
- Domain-specific claims belong in the constitution's own specification document

**I.D. Insight Atrophy Reduction as the Primary Metric**
- IAI formula: `IAI = 1 - (H_post / H_pre)`
- IAI = 0: no atrophy. IAI = 1: complete collapse.
- Domain-general: evaluated independent of which constitution is loaded

---

### Section II: Constitutional Interface Specification (EXISTS — lines 58–131)

**II.A. TypeScript Interface Definition**
- `InvariantState` type (4 values)
- `Context` interface (sessionId, turn, payload, history, narrativeBaseline)
- `ContextSnapshot` interface
- `RepairAction` interface (type, message, blocking, evidencePath)
- `ConstitutionalInvariant` interface (id, description, evaluate, repair, isUpstream, dependents)
- `Constitution` interface (id, version, invariants, getUpstreamInvariant)

**II.B. Runtime Contract** (5 rules)
1. `getUpstreamInvariant()` returns the invariant whose VIOLATION blocks all others
2. `evaluate()` is stateless
3. `repair()` called only after VIOLATED or AMBIGUOUS
4. All invariant IDs are stable across versions
5. Implementations must not throw; return NOT_APPLICABLE when proxy unavailable

---

### Section III: Runtime Formal Specification (EXISTS — lines 134–204)

**III.A. LTL Core Properties** (5 formulas)
1. Safety Gate: `□(Emit(O) → (δₖ ∈ {SATISFIED, NOT_APPLICABLE}))`
2. Upstream Invariant Primacy Gate: `□(δ_upstream = VIOLATED → ¬Emit(O) U (δ_upstream = SATISFIED))`
3. Halt Execution Protocol: `□(halt_authority_active → ¬Emit(O) U (repair_cleared ∨ session_terminated))`
4. Feedback Obligation: `□(state_transition → ○ human_feedback_event)`
5. Task-State Locking: `□(task_state ≠ prev_task_state → (user_confirmation ∧ halt_authority_active))`

**III.B. Liveness and Deadlock Prevention**
- Bounded retry: K = 3 consecutive AMBIGUOUS → Narrative Injection Protocol
- Fail-safe disclosure: "Interpretation withheld: contextual baseline not established"
- Liveness property: `◇ repair_cleared` — proved in Coq, validated via model checking
- *Note: "proved in Coq" and "model checking" are PROPOSED — Appendix stubs*

**III.C. Operational Semantics: State Machine**
- 5 states: RUNNING | HALTED | AWAITING_FEEDBACK | LOCKED | TERMINATED
- Full transition table specified (lines 179–203)

---

### Section IV: Contract Window (EXISTS — lines 208–218)

- Real-time visualization of runtime state machine
- 4 design requirements: Explicit State, Repair Obligation Display, Audit Trail, Neurodivergent-First
- Neurodivergent-First: grounded in UDL (Meyer et al., 2014) and HCI accessibility research

---

### Section V: Verification Architecture (EXISTS — lines 221–236)

**V.A. Coq Formal Proof** — *STUB*
- AHI Impossibility Theorem (domain-general form): stated, not proved
- TLC deadlock freedom and liveness: stated, not proved
- "Full proof scripts are open-sourced" — **NOT YET TRUE**

**V.B. LTL Model Checking** — *STUB*
- "All five LTL formulas verified with TLC model checker over the full state machine"
- "Verification traces are in Appendix B" — **Appendix B is a stub**

**V.C. Evidence Chain Protocol** — *EXISTS (specified)*
- Tamper-evident JSONL, append-only, integrity-hashed per entry
- Sessions without active evidence chain cannot enter RUNNING state

---

### Section VI: Performance Characteristics (EXISTS — lines 240–241)

- ~120 ms per inference turn on A100 (stated, not measured — Appendix C is a stub)
- Evidence-log append: < 2 ms per turn (stated, not measured)
- Contract Window: client-side, no server-side latency (stated)

---

### Section VII: How to Load a Constitution (EXISTS — lines 245–262)

- TypeScript code example: `TLCRuntime` loading `EightWondersConstitution`
- `runtime.evaluate(context)` called on every turn
- Key claim: any constitution implementing the interface can be substituted without modifying the runtime

---

### Section VIII: Relationship to Existing Work (EXISTS — lines 265–271)

- Constitutional AI (Bai et al., 2022): TLC externalizes enforcement; complementary
- Verified Decoding / Program Monitors: TLC extends with domain-loadable constitutions and human governance interface
- ReAct / Deliberative Alignment: TLC provides formal governance layer beneath tool-augmented reasoning
- Rule-Based Guardrails: TLC's invariant gates evaluate semantic/structural properties, not keywords

---

### Section IX: Future Constitutions (EXISTS — lines 274–282)

- Eight Wonders Constitution (published separately)
- Instructional Integrity Constitution (Quantic research program)
- Research Integrity Constitution
- Platform generalizability claim: established when two independent constitutions execute correctly

---

### Section X: Conclusion (EXISTS — lines 286–288)

- Full architecture stack named
- Separation is the architectural contribution
- Domain claims belong in the constitution's own specification
- Empirical validation belongs in the validation study

---

### References (EXISTS — lines 292–302)

Bai et al. (2022), Barton & Hanley (2020), Du Bois (1903), Fricker (2007),
Ioannidis (2005), Lamport (1983), Meyer/Rose/Gordon (2014), Munafò et al. (2017)

---

### Appendices (STUBS — lines 306–310)

| Appendix | Title | Status |
|---|---|---|
| A | Coq proof — AHI Impossibility Theorem (domain-general) | STUB |
| B | LTL model-checking traces for all five core properties | STUB |
| C | Latency profiling on A100, CPU, edge hardware | STUB |
| D | Evidence chain schema and integrity verification procedure | STUB |

---

## Required Work Before Submission

| Item | Current State | Required State | Notes |
|---|---|---|---|
| Appendix A — Coq proof | PROPOSED | VERIFIED | Requires Coq toolchain + proof scripts |
| Appendix B — LTL traces | PROPOSED | VERIFIED | Requires TLC model checker run |
| Appendix C — Latency profiling | PROPOSED | VALIDATED | Requires A100 hardware access |
| Appendix D — Evidence chain schema | SPECIFIED | VERIFIED | `EvidenceEntry` interface exists; full schema doc needed |
| TypeScript compilation | PROPOSED | VERIFIED | Requires tsconfig.json + `npm run tsc` |
| `TLCRuntime` class implementation | PROPOSED | IMPLEMENTED | No class exists, only interface |
| Tier-1 Compliance Report | PROPOSED | SPECIFIED | Required before submission gate |
| OSF preregistration | PROPOSED | VERIFIED | Required before submission gate |
| Pre-submission Truth-State gate | PROPOSED | VERIFIED | All gate criteria in PROGRAM_ARCHITECTURE.md §Layer 6 |

---

*V&T:*
*EXISTS (Verified Present): Runtime paper at `modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md` (318 lines). All section titles and line numbers above verified by direct file read.*
*VERIFIED AGAINST: Section numbering and content cross-referenced against the actual file; no sections added that are not in the file.*
*NOT CLAIMED: That appendix content exists. That Coq proofs are written. That the TypeScript compiles.*
*FUNCTIONAL STATUS: Paper draft SPECIFIED (v1.0). Appendices PROPOSED.*
