/**
 * TLC Runtime Constitutional Interface
 * Version: 1.0.0
 *
 * Any domain constitution that executes inside TLC Runtime must implement
 * ConstitutionalInvariant and Constitution.
 *
 * This is the normative contract between the runtime and the domain.
 * It is domain-agnostic. The runtime enforces this interface.
 * Domain theories are expressed as implementations.
 *
 * @see modules/tlc-runtime/paper/TLC_Runtime_Constitutional_Governance_Architecture_v1.0.md
 */

// ────────────────────────────────────────────────────────────────────────────
// Core Types
// ────────────────────────────────────────────────────────────────────────────

/**
 * The possible states an invariant can be in during evaluation.
 * - SATISFIED:      Invariant is met. Emission is permitted.
 * - VIOLATED:       Invariant is broken. Halt authority is triggered.
 * - AMBIGUOUS:      Insufficient signal. Triggers Narrative Injection Protocol after K cycles.
 * - NOT_APPLICABLE: Invariant is inactive for this context. Emission is permitted.
 */
export type InvariantState =
  | 'SATISFIED'
  | 'VIOLATED'
  | 'AMBIGUOUS'
  | 'NOT_APPLICABLE';

/**
 * The type of repair action the runtime should take.
 * - HALT:            Block all emission. Require explicit human clearance.
 * - PROMPT_USER:     Surface a targeted question to the human investigator.
 * - INJECT_CONTEXT:  Request injection of missing context (e.g., narrative baseline).
 * - ESCALATE:        Route to governance board or external authority.
 * - DISCLOSE:        Emit a pre-defined disclosure and log the incident.
 */
export type RepairType =
  | 'HALT'
  | 'PROMPT_USER'
  | 'INJECT_CONTEXT'
  | 'ESCALATE'
  | 'DISCLOSE';

// ────────────────────────────────────────────────────────────────────────────
// Context & Snapshot
// ────────────────────────────────────────────────────────────────────────────

/**
 * A snapshot of invariant states at a single turn.
 */
export interface ContextSnapshot {
  turn: number;
  state: Record<string, InvariantState>;
  timestamp: string; // ISO 8601
}

/**
 * The full context passed to every invariant evaluation.
 * Stateless: the invariant receives the full context and must not
 * mutate it or produce side effects inside evaluate().
 */
export interface Context {
  sessionId: string;
  turn: number;
  payload: Record<string, unknown>;
  history: ContextSnapshot[];
  /** Narrative baseline string, if established by upstream invariant */
  narrativeBaseline?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Repair Action
// ────────────────────────────────────────────────────────────────────────────

/**
 * The action the TLC Runtime should take when an invariant is VIOLATED or AMBIGUOUS.
 */
export interface RepairAction {
  type: RepairType;
  /** Human-readable message displayed in the Contract Window */
  message: string;
  /** If true, the runtime halts emission until this repair is cleared */
  blocking: boolean;
  /** Path to the evidence log entry for this repair event */
  evidencePath?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Constitutional Invariant Interface
// ────────────────────────────────────────────────────────────────────────────

/**
 * The normative contract every invariant must satisfy.
 *
 * RUNTIME GUARANTEES:
 * - evaluate() is called on every turn for all active invariants
 * - repair() is called only when evaluate() returns VIOLATED or AMBIGUOUS
 * - isUpstream = true means this invariant is evaluated before all others
 * - evaluate() must be pure (no side effects, no state mutation)
 * - evaluate() must not throw — return NOT_APPLICABLE when proxies are unavailable
 */
export interface ConstitutionalInvariant {
  /**
   * Stable identifier across versions.
   * Breaking changes require a new constitution version.
   * Example: "I1_Trust", "INV-001", "II-003"
   */
  id: string;

  /**
   * Human-readable description of what this invariant protects.
   * Displayed in the Contract Window.
   */
  description: string;

  /**
   * Evaluate invariant state given current context.
   * MUST be pure: no side effects, no throws.
   * Return NOT_APPLICABLE when required proxies are unavailable.
   */
  evaluate(context: Context): InvariantState;

  /**
   * Return the repair action when evaluate() returns VIOLATED or AMBIGUOUS.
   * Called by the runtime after evaluate() — never called if SATISFIED or NOT_APPLICABLE.
   */
  repair(context: Context): RepairAction;

  /**
   * True if this invariant must be SATISFIED before downstream invariants run.
   * The runtime enforces this topologically.
   * Only one invariant per constitution should be upstream.
   */
  isUpstream: boolean;

  /**
   * IDs of invariants that depend on this one being SATISFIED first.
   * Runtime uses this for dependency-ordered evaluation.
   */
  dependents: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Constitution Interface
// ────────────────────────────────────────────────────────────────────────────

/**
 * A domain constitution: a versioned, named set of ConstitutionalInvariants
 * that can be loaded into TLC Runtime.
 *
 * Example implementations:
 *   class EightWondersConstitution implements Constitution
 *   class InstructionalIntegrityConstitution implements Constitution
 *   class ResearchIntegrityConstitution implements Constitution
 */
export interface Constitution {
  /** Stable identifier (e.g., "eight-wonders", "instructional-integrity") */
  id: string;

  /** Semantic version string (e.g., "1.0.0") */
  version: string;

  /** All invariants active in this constitution */
  invariants: ConstitutionalInvariant[];

  /**
   * Returns the upstream invariant, if any.
   * The runtime evaluates this invariant first and applies the
   * Upstream Invariant Primacy Gate (LTL) to its result.
   * Return null if no upstream invariant is designated.
   */
  getUpstreamInvariant(): ConstitutionalInvariant | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Runtime Configuration
// ────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for a TLC Runtime instance.
 */
export interface TLCRuntimeConfig {
  constitution: Constitution;
  /** Path to the append-only evidence chain JSONL file */
  evidencePath: string;
  /**
   * Number of consecutive AMBIGUOUS upstream evaluations before
   * the Narrative Injection Protocol fires.
   * Default: 3
   */
  k_ambiguous_threshold?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Evidence Chain Entry
// ────────────────────────────────────────────────────────────────────────────

/**
 * A single append-only entry in the tamper-evident evidence chain.
 * Integrity hash covers all fields except integrity_hash itself.
 */
export interface EvidenceEntry {
  entry_id: string;
  timestamp: string; // ISO 8601
  session_id: string;
  turn: number;
  invariant_id: string;
  state: InvariantState;
  repair_action?: RepairAction;
  runtime_state: 'RUNNING' | 'HALTED' | 'AWAITING_FEEDBACK' | 'LOCKED' | 'TERMINATED';
  integrity_hash: string;
}
