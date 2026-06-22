# Eight Wonders Constitution Boundary Statement

**Version:** 1.0
**Status:** SPECIFIED
**Date:** 2026-06-22
**Scope:** Defines precisely what the Eight Wonders Constitution claims, does not claim, and explicitly defers.

---

## Purpose

This document is the normative boundary statement for the Eight Wonders Constitution domain layer. It prevents runtime claims from bleeding into this paper and domain claims from bleeding into the runtime or validation papers. The Eight Wonders Constitution is a **domain specification**, not a runtime specification, not an empirical validation study.

Source document: `modules/eight-wonders-constitution/paper/Eight_Wonders_Constitution_Relational_Economies_v1.0.md` (199 lines)

---

## What the Eight Wonders Constitution Claims

| Claim | Grounded In | Truth-State |
|---|---|---|
| AHI (Algorithmic Hermeneutical Injustice) theory — three vectors (Conceptual, Procedural, Institutional) | §I.A | SPECIFIED |
| The Relational Economy construct: purchases as covenant, not transaction | §I.B | SPECIFIED |
| Narrative (I₈) as upstream invariant — causal engine for all other invariants | §I.C | SPECIFIED |
| Eight invariant definitions: I₁ Trust, I₂ Authenticity, I₃ Status, I₄ Identity Signaling, I₅ Enacted Fidelity, I₆ Perceived Quality, I₇ Contextual Performance, I₈ Narrative | §II | SPECIFIED |
| Detection functions δ₁–δ₈ with proxy variables and decision logic | §III | SPECIFIED |
| Detection calibration on 5,000 labeled transactions; Delphi consensus (25 Black consumers + 5 experts); Krippendorff's α = 0.83 | §III preamble | PROPOSED (stated but not yet executed — appendix C is a stub) |
| Community Governance / Quarterly Threshold Review Board | §IV.A | SPECIFIED |
| Essentialism mitigation protocol | §IV.B | SPECIFIED |
| Frontin' phenomenon as canonical test case | §V | SPECIFIED |
| I₈ designated as upstream invariant via `getUpstreamInvariant()` | §II, §III.δ₈ | SPECIFIED |

---

## What the Eight Wonders Constitution Does NOT Claim

| Out-of-Scope Claim | Correct Location |
|---|---|
| Runtime enforcement mechanisms (Safety Gate, Halt Authority, etc.) | TLC Runtime paper |
| ConstitutionalInvariant TypeScript interface definition | `src/interfaces/constitutional-invariant.ts` |
| LTL formal properties | TLC Runtime paper §III.A |
| Evidence Chain Protocol | TLC Runtime paper §V.C |
| Empirical validation results (accuracy %, IAI reduction %) | Validation Study paper |
| Pilot data (N=10) or megaproject data (N=1000) | Validation Study paper |
| Instructional Integrity invariants | `constitutions/instructional-integrity/` |

---

## Domain-Specific Claims Grounded in Community Knowledge

The Eight Wonders Constitution contains domain claims that are non-falsifiable through the runtime architecture alone. These claims require:

1. **Community validation** — Delphi consensus with Black consumers and cultural experts (targeted α ≥ 0.75, reported as 0.83 in paper — currently PROPOSED, not yet executed)
2. **Threshold sensitivity analysis** — ±0.10 stability on all δₖ thresholds (Appendix D stub)
3. **Quarterly review board** — live governance of threshold evolution (not yet instantiated)

These are honest gaps. The domain specification (invariant definitions + detection function logic) is SPECIFIED. The calibration evidence is PROPOSED.

---

## AHI Theorem Boundary

The AHI Theorem appears in **two places** with different scopes:

| Location | Scope | Status |
|---|---|---|
| TLC Runtime paper §V.A | Domain-general: any model + any culturally situated invariant structure → violation | PROPOSED (Coq stub) |
| Eight Wonders Constitution §I.A + Appendix A | Eight Wonders instantiation: Black consumer relational economy | PROPOSED (Appendix A stub) |

The runtime's domain-general claim does NOT depend on the domain-specific instantiation being proved. The Eight Wonders claim does NOT modify the runtime mechanism. These are separate proofs.

---

## Namespace

Eight Wonders invariant IDs currently use the label scheme `I1_Trust … I8_Narrative` (or `I₁–I₈` in the paper). The constitutions/README.md documents a **known namespace collision**: these labels numerically collide with governance invariants `I1…I8` in `modules/governance-harness/` probe weights.

**Recommended resolution:** Rename Eight Wonders to `W-*` namespace (`W-001_Trust` through `W-008_Narrative`). This is deferred — it is a domain-ontology change, tracked in Scope_and_Decision_Log.md.

---

## What the Eight Wonders Constitution Explicitly Defers

| Deferred Item | Reason | Target |
|---|---|---|
| Coq proof — Eight Wonders AHI instantiation | Appendix A stub | Separate publication |
| Community panel methodology | Appendix B stub | Separate methodology section |
| Full δₖ calibration results (5-fold CV, all invariants) | Appendix C stub | Separate appendix |
| Threshold sensitivity analysis ±0.10 | Appendix D stub | Separate appendix |
| Quarterly review board charter | Appendix E stub | Governance documentation |
| TypeScript class implementation (`EightWondersConstitution implements Constitution`) | Interface specified; class is Week 2 deliverable | `modules/eight-wonders-constitution/src/` |
| `W-*` namespace rename | Deferred from Week 1 scope | Follow-up contract |

---

*V&T:*
*EXISTS (Verified Present): Eight Wonders Constitution specification at `modules/eight-wonders-constitution/paper/Eight_Wonders_Constitution_Relational_Economies_v1.0.md` (199 lines verified by direct read).*
*VERIFIED AGAINST: All section references verified against the actual file read during this session. Appendix stub status verified (all five appendices explicitly labeled as stubs).*
*NOT CLAIMED: That calibration data, Coq proofs, or community board charter exist. They do not.*
*FUNCTIONAL STATUS: Domain specification SPECIFIED. Empirical calibration PROPOSED.*
