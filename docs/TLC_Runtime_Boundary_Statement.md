# TLC Runtime Boundary Statement

**Version:** 1.0
**Status:** SPECIFIED
**Date:** 2026-06-22
**Scope:** Defines precisely what TLC Runtime claims, does not claim, and explicitly defers.

---

## Purpose

This document is the normative boundary statement for the TLC Runtime layer. It exists to prevent scope contamination in either direction: runtime claims bleeding into domain papers, and domain claims being attributed to the runtime. Any reviewer, paper, or agent operating inside this repo must consult this document before making a claim that touches Layer 1.

---

## What TLC Runtime Claims

These claims belong exclusively to the runtime paper:
`modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md`

| Claim | Grounded In | Truth-State |
|---|---|---|
| TLC is a domain-agnostic constitutional runtime | Runtime paper Abstract, §I.C | SPECIFIED |
| Five core runtime guarantees (safety gating, halt authority, state locking, feedback obligation, narrative resolution) | Runtime paper Abstract | SPECIFIED |
| ConstitutionalInvariant interface contract | `src/interfaces/constitutional-invariant.ts` (215 lines) | SPECIFIED |
| Five LTL formal properties (Safety Gate, Upstream Primacy, Halt, Feedback Obligation, Task-State Locking) | Runtime paper §III.A | SPECIFIED |
| State machine with five states (RUNNING / HALTED / AWAITING_FEEDBACK / LOCKED / TERMINATED) | Runtime paper §III.C | SPECIFIED |
| Insight Atrophy Index (IAI) as domain-general metric | Runtime paper §I.D | SPECIFIED |
| Contract Window design requirements | Runtime paper §IV | SPECIFIED |
| Evidence Chain Protocol (tamper-evident JSONL) | Runtime paper §V.C | SPECIFIED |
| AHI Impossibility Theorem (domain-general Coq form) | Runtime paper §V.A | PROPOSED (Appendix A is a stub) |
| LTL model-checking over full state machine | Runtime paper §V.B | PROPOSED (Appendix B is a stub) |
| ~120 ms per-turn latency on A100 | Runtime paper §VI | PROPOSED (Appendix C is a stub) |

---

## What TLC Runtime Does NOT Claim

These are explicitly out of scope for the runtime paper. Any occurrence of these claims inside
`modules/tlc-runtime/` is a boundary violation requiring extraction.

| Out-of-Scope Claim | Correct Location |
|---|---|
| Eight Wonders invariant definitions (I₁–I₈) | `modules/eight-wonders-constitution/paper/` |
| Detection functions δₖ (thresholds, proxy variables) | Eight Wonders Constitution paper |
| AHI theory in the Black consumer context | Eight Wonders Constitution paper |
| Relational Economy ontology | Eight Wonders Constitution paper |
| Frontin' phenomenon | Eight Wonders Constitution paper |
| Community governance / Threshold Review Board | Eight Wonders Constitution paper |
| Empirical validation results (accuracy, IAI reduction) | Validation Study paper |
| N=10 pilot or N=1000 megaproject results | Validation Study paper |
| Instructional Integrity invariant definitions (II-001–II-006) | `constitutions/instructional-integrity/` |
| CAMM, CALT, m-DTCI, m-NAP instruments | Layer 3 / frameworks/research/ |

---

## Cross-References Permitted in the Runtime Paper

The following references appear in the runtime paper and are **permitted** as illustrative cross-references, not domain-content embeddings:

1. **§I.C Architecture diagram** — mentions `EightWondersConstitution` as a concrete name in the diagram. This is an example, not a domain claim. Permitted.
2. **§VII code example** — imports `EightWondersConstitution` to illustrate how any constitution loads. Permitted.
3. **§IX Future Constitutions** — names Eight Wonders, Instructional Integrity, and Research Integrity constitutions as planned. Permitted (these are references to external artifacts, not domain specifications).
4. **§V.A Coq Theorem** — "a model trained on decontextualized data ... will inevitably produce outputs that violate at least one invariant" — this is stated as domain-general. Permitted (the Eight Wonders instantiation belongs in Eight Wonders Appendix A, per that paper's own V&T statement).

---

## Scope Risk: IAI Terminology

The Insight Atrophy Index (IAI) originated conceptually in the Black consumer behavior research context. The runtime paper generalizes it as a domain-agnostic metric. **Risk:** if a reviewer challenges the runtime paper for "embedding consumer behavior framing," the response is: IAI is defined in §I.D exclusively through the formula `IAI = 1 - (H_post / H_pre)` where H is hypothesis count — no consumer-specific terms appear in that definition. This is acceptable generalization, not contamination. Monitored in the Scope_and_Decision_Log.

---

## What TLC Runtime Explicitly Defers

| Deferred Item | Reason | Target |
|---|---|---|
| Coq proof scripts | Appendix A stub — requires Coq toolchain | Future: Appendix A completion |
| LTL model-checking traces | Appendix B stub — requires TLA+/TLC tool run | Future: Appendix B completion |
| Latency profiling on A100/CPU/edge | Appendix C stub — requires hardware access | Future: Appendix C completion |
| Evidence chain schema detail | Appendix D stub | Future: Appendix D completion |
| TypeScript compilation verification | No tsconfig present | Week 2: add tsconfig + npm run tsc |
| Class-level implementations (EightWondersConstitution, etc.) | Interface specified; classes are domain artifacts | Respective domain constitution repos |

---

*V&T:*
*EXISTS (Verified Present): Boundary statement grounded in runtime paper at `modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md` (318 lines) and `src/interfaces/constitutional-invariant.ts` (215 lines).*
*VERIFIED AGAINST: Section references and line claims verified by direct file read during this session.*
*NOT CLAIMED: That any deferred item is complete. Stubs are stubs.*
*FUNCTIONAL STATUS: SPECIFIED — boundary enforcement document ready for use.*
