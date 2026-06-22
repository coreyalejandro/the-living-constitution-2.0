# Constitution Interface Draft

**Version:** 1.0
**Status:** SPECIFIED
**Date:** 2026-06-22
**Source File:** `src/interfaces/constitutional-invariant.ts` (215 lines)
**Runtime Dependency:** This interface is the normative contract between TLC Runtime and any domain constitution. It is not domain-specific.

---

## Purpose

This document is the human-readable specification of the TypeScript Constitutional Interface. It documents **what actually exists in `src/interfaces/constitutional-invariant.ts`**, not what is aspirational. Every type, interface, and contract rule below reflects the actual file contents as of 2026-06-22.

---

## Core Type Definitions

### InvariantState (line 26–30)

```typescript
export type InvariantState =
  | 'SATISFIED'
  | 'VIOLATED'
  | 'AMBIGUOUS'
  | 'NOT_APPLICABLE';
```

**Semantics:**
- `SATISFIED` — Invariant is met. Emission is permitted.
- `VIOLATED` — Invariant is broken. Halt authority is triggered. `repair()` is called.
- `AMBIGUOUS` — Insufficient signal. After K consecutive AMBIGUOUS cycles on the upstream invariant, the Narrative Injection Protocol fires.
- `NOT_APPLICABLE` — Invariant is inactive for this context. Emission permitted. Must be returned (not thrown) when required proxies are unavailable.

### RepairType (line 40–45)

```typescript
export type RepairType =
  | 'HALT'
  | 'PROMPT_USER'
  | 'INJECT_CONTEXT'
  | 'ESCALATE'
  | 'DISCLOSE';
```

**Semantics:**
- `HALT` — Block all emission. Require explicit human clearance.
- `PROMPT_USER` — Surface a targeted question to the human investigator.
- `INJECT_CONTEXT` — Request injection of missing context (e.g., narrative baseline).
- `ESCALATE` — Route to governance board or external authority.
- `DISCLOSE` — Emit a pre-defined disclosure and log the incident.

---

## Context Interfaces

### ContextSnapshot (line 54–58)

```typescript
export interface ContextSnapshot {
  turn: number;
  state: Record<string, InvariantState>;
  timestamp: string; // ISO 8601
}
```

Captures invariant state at a single turn. Used for history replay and audit.

### Context (line 65–72)

```typescript
export interface Context {
  sessionId: string;
  turn: number;
  payload: Record<string, unknown>;
  history: ContextSnapshot[];
  narrativeBaseline?: string;
}
```

The full context passed to every invariant evaluation. **Stateless contract**: invariants receive Context but must not mutate it or produce side effects inside `evaluate()`. The `narrativeBaseline` field is set by the runtime once the upstream invariant is SATISFIED.

---

## RepairAction Interface (line 81–89)

```typescript
export interface RepairAction {
  type: RepairType;
  message: string;
  blocking: boolean;
  evidencePath?: string;
}
```

- `message` — Human-readable message displayed in the Contract Window.
- `blocking` — If `true`, the runtime halts emission until this repair is cleared.
- `evidencePath` — Optional path to the evidence log entry for this repair event.

---

## ConstitutionalInvariant Interface (line 105–144)

```typescript
export interface ConstitutionalInvariant {
  id: string;
  description: string;
  evaluate(context: Context): InvariantState;
  repair(context: Context): RepairAction;
  isUpstream: boolean;
  dependents: string[];
}
```

### Runtime Guarantees (from JSDoc at line 98–104)

1. `evaluate()` is called on **every turn** for all active invariants.
2. `repair()` is called **only** when `evaluate()` returns `VIOLATED` or `AMBIGUOUS`.
3. `isUpstream = true` means this invariant is evaluated before all others.
4. `evaluate()` must be **pure** — no side effects, no state mutation.
5. `evaluate()` must **not throw** — return `NOT_APPLICABLE` when proxies are unavailable.

### Field Contracts

| Field | Type | Contract |
|---|---|---|
| `id` | `string` | Stable across versions. Breaking ID changes require a new constitution version. Example: `"I1_Trust"`, `"INV-001"`, `"II-003"` |
| `description` | `string` | Human-readable. Displayed in Contract Window. |
| `evaluate` | `(context: Context) => InvariantState` | Pure function. No throws. No side effects. |
| `repair` | `(context: Context) => RepairAction` | Called only after VIOLATED or AMBIGUOUS. |
| `isUpstream` | `boolean` | Only one invariant per constitution should be `true`. |
| `dependents` | `string[]` | IDs of invariants that depend on this one being SATISFIED. Runtime uses for dependency-ordered evaluation. |

---

## Constitution Interface (line 159–176)

```typescript
export interface Constitution {
  id: string;
  version: string;
  invariants: ConstitutionalInvariant[];
  getUpstreamInvariant(): ConstitutionalInvariant | null;
}
```

### Field Contracts

| Field | Type | Contract |
|---|---|---|
| `id` | `string` | Stable identifier (e.g., `"eight-wonders"`, `"instructional-integrity"`) |
| `version` | `string` | Semantic version string (e.g., `"1.0.0"`) |
| `invariants` | `ConstitutionalInvariant[]` | All invariants active in this constitution |
| `getUpstreamInvariant()` | `() => ConstitutionalInvariant \| null` | Returns the invariant the runtime evaluates first and applies Upstream Primacy Gate to. Return `null` if no upstream invariant is designated. |

---

## TLCRuntimeConfig Interface (line 185–195)

```typescript
export interface TLCRuntimeConfig {
  constitution: Constitution;
  evidencePath: string;
  k_ambiguous_threshold?: number;
}
```

- `constitution` — The loaded constitution implementing `Constitution`.
- `evidencePath` — Path to the append-only evidence chain JSONL file.
- `k_ambiguous_threshold` — Consecutive AMBIGUOUS upstream evaluations before Narrative Injection Protocol fires. Default: 3. Must not be set below 1 (per Core Constitution Article X, §X.2).

---

## EvidenceEntry Interface (line 205–215)

```typescript
export interface EvidenceEntry {
  entry_id: string;
  timestamp: string;       // ISO 8601
  session_id: string;
  turn: number;
  invariant_id: string;
  state: InvariantState;
  repair_action?: RepairAction;
  runtime_state: 'RUNNING' | 'HALTED' | 'AWAITING_FEEDBACK' | 'LOCKED' | 'TERMINATED';
  integrity_hash: string;
}
```

The `runtime_state` values here are the exact five states of the TLC state machine (Runtime paper §III.C). The `integrity_hash` covers all fields except itself (per Runtime paper §V.C).

---

## Known Interface Gaps (Honest Assessment)

| Gap | Status | Notes |
|---|---|---|
| No `tsconfig.json` in repo root | PROPOSED | TypeScript compilation not verified as of 2026-06-22 |
| No class implementations in repo (`EightWondersConstitution`, etc.) | PROPOSED | Interface defined; implementations are domain artifacts |
| No `TLCRuntime` class implementation | PROPOSED | Config interface defined; runtime class is not in src/ |
| `tlc-sl/src/` implements a different (older) runtime model | PARALLEL | `tlc-sl` uses `.tlcsl` DSL; `constitutional-invariant.ts` is the TypeScript contract for the newer architecture |

---

## Relationship to tlc-sl Runtime

The `tlc-sl/src/` directory implements a working runtime using a `.tlcsl` DSL (verified: `npm run constitutions:check` passes 22/22 + 6/6). The TypeScript `ConstitutionalInvariant` interface in `src/interfaces/` is the **architectural specification** for the TypeScript-native runtime described in the Runtime paper. These are parallel representations of the same architectural concept — not in conflict, but currently at different truth-states:

- `tlc-sl` runtime: VERIFIED (constitutions:check passes)
- `constitutional-invariant.ts` TypeScript interface: SPECIFIED (file exists, not compiled or tested)

---

*V&T:*
*EXISTS (Verified Present): `src/interfaces/constitutional-invariant.ts` (215 lines, verified by direct file read). All types and interfaces above copied verbatim from the file.*
*VERIFIED AGAINST: Every code block above was read from the actual file; line numbers cross-referenced.*
*NOT CLAIMED: That the TypeScript interface compiles (no tsconfig). That implementations exist. That the tlc-sl runtime and the TypeScript interface are fully reconciled.*
*FUNCTIONAL STATUS: Interface SPECIFIED. No compilation evidence.*
