/**
 * TLC Core Constitution — TypeScript Interface Layer
 * Version: 1.0.0
 *
 * This file defines the typed contracts for every concept codified in the
 * TLC Core Constitution v1.0. All domain constitutions must be compatible
 * with these types. No domain constitution may narrow a type in a weakening
 * direction.
 *
 * @see constitutions/core/TLC_Core_Constitution_v1.0.md
 * @see src/interfaces/constitutional-invariant.ts
 */

// ────────────────────────────────────────────────────────────────────────────
// Article I — Truth-State
// ────────────────────────────────────────────────────────────────────────────

/**
 * The epistemic status of any claim, artifact, or system component.
 * Every claim starts at PROPOSED. Advancement requires external verification.
 * Self-advancement is a protocol violation.
 */
export type TruthState =
  | 'PROPOSED'       // Stated but not examined
  | 'SPECIFIED'      // Formally described with measurable criteria
  | 'IMPLEMENTED'    // Code or artifact exists
  | 'VERIFIED'       // Implementation matches specification (automated check)
  | 'VALIDATED'      // Meets quality standard in real conditions (real execution)
  | 'DEPLOYED'       // Operational and governed
  | 'RETRACTED';     // Previously advanced, now withdrawn — terminal state

/** The advancement criteria for each Truth-State transition */
export interface TruthStateTransition {
  from: TruthState;
  to: TruthState;
  criteria: string;
  evidenceRequired: EvidenceLevel;
}

// ────────────────────────────────────────────────────────────────────────────
// Article II — Evidence
// ────────────────────────────────────────────────────────────────────────────

/**
 * Evidence hierarchy levels.
 * Simulation output does not advance past E1 (SPECIFIED).
 */
export type EvidenceLevel =
  | 'E0'  // Assertion — stated claim, no artifact
  | 'E1'  // Specification — formal document with measurable criteria
  | 'E2'  // Artifact — code, file, or output on disk
  | 'E3'  // Automated check — test or validator that passes on demand
  | 'E4'  // Real-execution log — output from running the actual system
  | 'E5'; // Replicated result — E4 produced by an independent operator

/** A single evidence record */
export interface EvidenceRecord {
  id: string;
  level: EvidenceLevel;
  timestamp: string;        // ISO 8601
  sessionId: string;
  operator: string;
  artifactPath: string;     // Path to the backing artifact
  claim: string;            // The claim this evidence supports
  truthState: TruthState;   // The Truth-State this evidence justifies
  supersededBy?: string;    // ID of the record that supersedes this one
}

// ────────────────────────────────────────────────────────────────────────────
// Article III — V&T Protocol
// ────────────────────────────────────────────────────────────────────────────

/**
 * A Verification and Truth statement.
 * Every TLC output that makes a claim must end with one of these.
 * The V&T governs the response. It cannot introduce stronger claims
 * than the body established.
 */
export interface VTStatement {
  /** What was confirmed present — artifacts, paths, outputs */
  exists: string;
  /** The actual artifact, output, or check used for verification */
  verifiedAgainst: string;
  /** What this does NOT establish */
  notClaimed: string;
  /** Current Truth-State and operational condition */
  functionalStatus: string;
  /** Truth-State at time of statement */
  truthState: TruthState;
}

// ────────────────────────────────────────────────────────────────────────────
// Article IV — Tier-1 Quality
// ────────────────────────────────────────────────────────────────────────────

/**
 * A Tier-1 quality profile.
 * All eight criteria are required. None may be false for a VALIDATED claim.
 */
export interface Tier1QualityProfile {
  reproducible: boolean;      // Second operator can reproduce from provided materials
  traceable: boolean;         // Every result maps to raw artifact + processing step
  falsifiable: boolean;       // Central claim can be shown false by a defined test
  preregistered: boolean;     // Hypotheses and method committed before data collection
  realExecution: boolean;     // All results from actual system runs, not simulation
  statisticallyValid: boolean; // Effect sizes, CIs, power analysis reported
  adversariallyReviewed: boolean; // At least one reviewer explicitly tasked to find flaws
  openMethodology: boolean;   // Sufficient detail to replicate without contacting authors
}

/**
 * Returns true only if ALL eight criteria are met.
 * This function is the gate — not a suggestion.
 */
export function isTier1(profile: Tier1QualityProfile): boolean {
  return Object.values(profile).every(Boolean);
}

// ────────────────────────────────────────────────────────────────────────────
// Article V — Definition of Done
// ────────────────────────────────────────────────────────────────────────────

/** Artifact types and their minimum Done Truth-State */
export type ArtifactType =
  | 'specification'
  | 'implementation'
  | 'research_claim'
  | 'deployed_system'
  | 'evidence_artifact'
  | 'paper_draft'
  | 'paper_submission';

/** Minimum Done Truth-State by artifact type */
export const DONE_STATE: Record<ArtifactType, TruthState> = {
  specification:       'SPECIFIED',
  implementation:      'VERIFIED',
  research_claim:      'VALIDATED',
  deployed_system:     'DEPLOYED',
  evidence_artifact:   'VERIFIED',
  paper_draft:         'SPECIFIED',
  paper_submission:    'VALIDATED',
};

export interface DoneDeclaration {
  artifactId: string;
  artifactType: ArtifactType;
  currentTruthState: TruthState;
  requiredTruthState: TruthState;
  /** isDone() returns true only when currentTruthState >= requiredTruthState */
  isDone: boolean;
  evidenceRecordId: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Article VI — Neurodivergent-First
// ────────────────────────────────────────────────────────────────────────────

/**
 * Neurodivergent-First compliance profile.
 * Applies to every TLC artifact: code, docs, instructions, interfaces.
 * All properties required. None may be false in a compliant artifact.
 */
export interface NeurodivergentFirstProfile {
  explicitState: boolean;       // All states visible and labeled; no implicit states
  unambiguousAction: boolean;   // Every instruction has exactly one valid interpretation
  workingMemorySupport: boolean; // Information required at step N is stated at step N
  noSpatialLanguage: boolean;   // Location by label, not position
  predictableStructure: boolean; // Consistent format and sequence across documents
  cognitiveOffloading: boolean; // System externalizes state; user does not carry it
  pacingControl: boolean;       // User controls pace; system does not advance without confirmation
  errorRecovery: boolean;       // Every error state has a defined, non-punishing recovery path
}

// ────────────────────────────────────────────────────────────────────────────
// Article VII — High-Clarity Instruction Protocol (HCIP)
// ────────────────────────────────────────────────────────────────────────────

/**
 * HCIP compliance profile.
 * Extends NeurodivergentFirstProfile for step-by-step instruction documents.
 * Incorporates Article XVI (R1-R16) by reference.
 */
export interface HCIPProfile extends NeurodivergentFirstProfile {
  realityAnchor: boolean;         // Opens with what is real, what is safe, what success looks like
  scopeBoundary: boolean;         // First step states exactly what is and is not covered
  confirmationCheckpoints: boolean; // Checkpoint every 5 steps or after irreversible action
  progressVisibility: boolean;    // User always knows "Step N of M"
  noImpliedKnowledge: boolean;    // Every term defined before use
  errorIsolation: boolean;        // Error state tells user exactly what to copy and send
  schizophreniaSafeFraming: boolean; // No surveillance language; no ambiguous agency; concrete over abstract
  ocdSafeFraming: boolean;        // No open loops; every step closes explicitly; Done is stated
}

// ────────────────────────────────────────────────────────────────────────────
// Article VIII — Narrative-First
// ────────────────────────────────────────────────────────────────────────────

/**
 * Narrative-First constraint state.
 * The upstream invariant must be SATISFIED before any downstream
 * invariant is evaluated.
 */
export type NarrativeState =
  | 'ESTABLISHED'   // Interpretive context is confirmed
  | 'AMBIGUOUS'     // Context exists but is unclear — Narrative Injection Protocol fires after K cycles
  | 'ABSENT'        // No interpretive context available — runtime enters AMBIGUOUS, does not assume default
  | 'INJECTED';     // Context was supplied via Narrative Injection Protocol

export interface NarrativeContext {
  state: NarrativeState;
  baseline?: string;        // The established interpretive frame
  injectionCycle: number;   // How many AMBIGUOUS cycles have elapsed (triggers at K=3)
  sessionId: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Article IX — Scope
// ────────────────────────────────────────────────────────────────────────────

/**
 * Scope states for a contract, session, or investigation.
 */
export type ScopeState =
  | 'LOCKED'      // Fixed; any deviation triggers Task-State Locking
  | 'EXPANDING'   // Proposed change under review; original scope only until resolved
  | 'CONTESTED'   // Dispute active; emission halted
  | 'DEFERRED'    // Item moved to future contract — named, not dropped
  | 'CLOSED';     // Contract complete; scope frozen

export interface ScopeRecord {
  contractId: string;
  state: ScopeState;
  declaredBoundary: string;     // Exact scope at LOCKED time
  deferredItems: string[];      // Named deferred scope items
  expansionProposal?: string;   // Active expansion text when EXPANDING
  operatorConfirmation?: string; // Confirmation record when expanding
}

// ────────────────────────────────────────────────────────────────────────────
// Article X — Ambiguity
// ────────────────────────────────────────────────────────────────────────────

export type AmbiguityType = 'RESOLVABLE' | 'UNRESOLVABLE';

export interface AmbiguityEvent {
  sessionId: string;
  turn: number;
  invariantId: string;
  type: AmbiguityType;
  cycle: number;          // How many consecutive AMBIGUOUS evaluations
  prompt?: string;        // The clarification question sent to the user (RESOLVABLE)
  disclosure?: string;    // The disclosure emitted (UNRESOLVABLE)
  resolved: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Article XII — Golden
// ────────────────────────────────────────────────────────────────────────────

export type GoldenStatus =
  | 'GOLDEN'            // Current highest verified implementation
  | 'RETRACTED_GOLDEN'  // Previously Golden, now superseded — preserved, not deleted
  | 'CANDIDATE';        // Under evaluation for Golden designation

export interface GoldenArtifact {
  id: string;
  status: GoldenStatus;
  truthState: TruthState;
  tier1Profile: Tier1QualityProfile;
  designatedBy: string;           // Operator who designated Golden
  designatedAt: string;           // ISO 8601
  supersededBy?: string;          // ID of artifact that replaced this one
  artifactPath: string;
  /** isTrulyGolden: Truth-State VERIFIED+, all Tier-1 criteria met, no open critical deficiencies */
  isTrulyGolden: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Article XIII — Cognitive Load
// ────────────────────────────────────────────────────────────────────────────

export type CognitiveLoadComponent = 'INTRINSIC' | 'EXTRANEOUS' | 'GERMANE';

export interface CognitiveLoadViolation {
  component: CognitiveLoadComponent;
  description: string;
  rule: string;   // The specific constraint that was violated
  location: string; // File + line or step number
}

// ────────────────────────────────────────────────────────────────────────────
// Article XI — First-Class
// ────────────────────────────────────────────────────────────────────────────

/**
 * The five properties that are always First-Class in every TLC deployment.
 * No domain constitution may demote them.
 */
export interface FirstClassRequirements {
  neurodivergentAccessibility: boolean;   // Explicitly in architecture + evaluated + tested
  evidenceTraceability: boolean;          // Explicitly in architecture + evaluated + tested
  scopeIntegrity: boolean;                // Explicitly in architecture + evaluated + tested
  operatorConfirmation: boolean;          // State transitions require explicit confirmation
  narrativeContext: boolean;              // Upstream invariant designated and enforced
}

// ────────────────────────────────────────────────────────────────────────────
// Article XIV — Trust (System Trust — distinct from Eight Wonders domain trust)
// ────────────────────────────────────────────────────────────────────────────

export interface SystemTrustProfile {
  behavioral: boolean;    // System does what it says (E3 verified)
  epistemic: boolean;     // Claims map to evidence (V&T present and coherent)
  temporal: boolean;      // Consistent behavior over time (evidence chain across sessions)
  recovery: boolean;      // Fails gracefully, recovers explicitly
  operator: boolean;      // Human operator can always override (halt authority present)
}

// ────────────────────────────────────────────────────────────────────────────
// Core Constitution Contract
// ────────────────────────────────────────────────────────────────────────────

/**
 * Every domain constitution loaded into TLC Runtime must satisfy this contract.
 * It inherits all Core Constitution definitions and may not weaken any of them.
 */
export interface CoreConstitutionContract {
  /** Domain constitution ID */
  id: string;
  version: string;

  /** Core Constitution version this domain constitution inherits from */
  coreConstitutionVersion: string;

  /** The upstream invariant designation (Narrative-equivalent for this domain) */
  upstreamInvariantId: string;

  /**
   * Declare that this domain constitution satisfies all First-Class requirements.
   * The runtime checks this at load time.
   */
  firstClassRequirements: FirstClassRequirements;

  /**
   * The minimum Truth-State required for this constitution to enter DEPLOYED status.
   * Must be VALIDATED or higher. Cannot be set lower.
   */
  minimumDeployedTruthState: Extract<TruthState, 'VALIDATED' | 'DEPLOYED'>;
}
