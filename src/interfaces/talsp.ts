/**
 * TLC TALSP v4.2 TypeScript Interface Layer
 * Version: 1.0.0
 *
 * Typed contracts for all constructs introduced by TALSP Template v4.2.
 * These interfaces enforce the research program OS at compile time.
 * All domain constitutions, studies, and governance bodies must
 * conform to these types.
 *
 * Import from this file:
 *   import type { NAP, DTCI, CCI, CAMMStudy, ... } from './talsp.js';
 */

// ─── Truth-State (from Core Constitution Article I) ───────────────────────

export type TruthState =
  | 'PROPOSED'
  | 'SPECIFIED'
  | 'IMPLEMENTED'
  | 'VERIFIED'
  | 'VALIDATED'
  | 'DEPLOYED'
  | 'RETRACTED';

// ─── Cognitive Profile ─────────────────────────────────────────────────────

export type CognitiveLoadSensitivity = 'low' | 'medium' | 'high';
export type PreferredModality = 'text' | 'voice' | 'visual' | 'multimodal';
export type PacingPreference = 'self_paced' | 'timed' | 'flexible';
export type SensoryProfile = 'standard' | 'low_stimulation' | 'high_contrast';
export type CommunicationStyle = 'literal' | 'narrative' | 'structured';
export type ExecutiveFunctionSupport = 'minimal' | 'moderate' | 'full';

/**
 * Neurodivergent Adaptation Profile (NAP)
 * Participant-owned cognitive profile driving system adaptation.
 * Participant may edit at any time during a governed session.
 */
export interface NAP {
  version: '1.0';
  participant_id: string;
  created_at: string;        // ISO 8601
  last_modified: string;     // ISO 8601
  edit_count: number;        // Profile Ownership metric
  profile: {
    cognitive_load_sensitivity: CognitiveLoadSensitivity;
    preferred_modality: PreferredModality;
    pacing_preference: PacingPreference;
    sensory_profile: SensoryProfile;
    communication_style: CommunicationStyle;
    executive_function_support: ExecutiveFunctionSupport;
  };
  custom_notes?: string;
}

/**
 * Minimal NAP (m-NAP) — same schema as NAP.
 * Distinguished by usage context (bootstrapped pilot).
 */
export type MinimalNAP = NAP;

// ─── Trust Calibration ─────────────────────────────────────────────────────

/**
 * DTCI Assessment Point
 * Computed at each response in a governed session.
 */
export interface DTCIPoint {
  participant_id: string;
  session_id: string;
  timestamp: string;
  item_id: string;
  response: string;
  correct: boolean;
  confidence_rating: number;        // raw Likert value
  confidence_scale_max: number;     // e.g. 5
  confidence_normalized: number;    // [0,1]
  window_proportion_correct: number; // proportion correct in last N items
  m_dtci: number;                   // [0,1] — higher is better calibrated
  constitution_id: string;
}

/**
 * DTCI Session Summary
 */
export interface DTCISession {
  participant_id: string;
  session_id: string;
  points: DTCIPoint[];
  mean_dtci: number;
  dtci_trajectory: 'improving' | 'stable' | 'degrading';
  chae_notification_required: boolean; // true if mean_dtci < 0.4
}

// ─── Constitutional Compliance Index ──────────────────────────────────────

/**
 * CCI Session Record
 * CCI = (passing invariant checks) / (total invariant checks) per session window.
 */
export interface CCIRecord {
  session_id: string;
  constitution_id: string;
  timestamp: string;
  total_checks: number;
  passing_checks: number;
  cci: number;                    // [0,1]
  halt_eligible: boolean;         // true if cci < 0.8
  halt_occurred: boolean;
  invariant_violations: Array<{
    invariant_id: string;
    description: string;
    severity: 'warning' | 'violation' | 'critical';
  }>;
}

// ─── Neurodivergent Success Metrics ───────────────────────────────────────

/**
 * Session-level neurodivergent success metrics.
 * Computed per session, aggregated at study level.
 */
export interface NeurodivergentMetrics {
  participant_id: string;
  session_id: string;
  timestamp: string;

  /** Sensory Comfort Score [0-100] full / [1-5] bootstrapped */
  sensory_comfort_score: number;

  /** Autonomy Index — proportion positive responses [0-1] */
  autonomy_index: number;

  /** Cognitive Load Variance — SD of mental effort ratings */
  cognitive_load_variance: number;

  /** Trust Calibration Match — mean |confidence - correctness| [0-1] */
  trust_calibration_match: number;

  /** Profile Ownership — did participant edit NAP? */
  profile_ownership: boolean;
  nap_edit_count: number;

  /**
   * Community Influence — proportion of decisions originating from community.
   * Computed at study level, not session level. null if not yet computed.
   */
  community_influence: number | null;
}

export interface NeurodivergentMetricsThresholds {
  scs_review: 60;       // Mean SCS < 60 → CHAE review
  scs_publication: 75;  // Mean SCS ≥ 75 → publication eligible
  ai_review: 0.70;      // AI < 70% → NAB review
  ai_publication: 0.80;
  clv_review: 2.5;      // CLV > 2.5 SD → session design review
  clv_publication: 1.5;
  tcm_review: 0.40;     // TCM > 0.4 → instructional design review
  tcm_publication: 0.25;
  po_review: 0.30;      // PO < 30% → UX review
  po_publication: 0.50;
  ci_review: 0.40;      // CI < 40% → governance review
  ci_publication: 0.50;
}

// ─── CAMM Study ────────────────────────────────────────────────────────────

export type StudyPhase =
  | 'PROTOCOL_DESIGN'
  | 'BUILD'
  | 'PILOT'
  | 'OPEN_SOURCE'
  | 'MEGAPROJECT_SETUP'
  | 'DATA_COLLECTION'
  | 'ANALYSIS'
  | 'PUBLICATION';

export type StudyScale = 'bootstrapped' | 'megaproject';

/**
 * CAMM Study descriptor.
 * Every TLC-governed study must be registered as a CAMMStudy.
 */
export interface CAMMStudy {
  study_id: string;
  title: string;
  constitution_ids: string[];      // must be ≥ 1
  scale: StudyScale;
  current_phase: StudyPhase;
  truth_state: TruthState;
  n_participants: number;
  n_sites: number;
  cognitive_profiles_represented: number; // ≥ 3 bootstrapped, ≥ 5 megaproject
  preregistration_url: string | null;
  osf_doi: string | null;
  zenodo_doi: string | null;
  chae_approved: boolean;
  nab_approved: boolean;
  tier1_compliance_report_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Governance Bodies ─────────────────────────────────────────────────────

export type GovernanceBodyType = 'CHAE' | 'NAB' | 'CGB' | 'OSSC';
export type GovernanceScale = 'full' | 'bootstrapped';

export interface GovernanceDecision {
  body: GovernanceBodyType;
  decision_id: string;
  timestamp: string;
  study_id: string;
  decision: string;
  outcome: 'approved' | 'approved_with_conditions' | 'rejected' | 'deferred';
  conditions?: string;
  reviewer_count: number;
  binding: true;           // all governance decisions are binding
  evidence_entry_hash?: string; // link to signed evidence chain entry
}

// ─── Tier-1 Compliance ─────────────────────────────────────────────────────

export type Tier1CriterionStatus =
  | 'PROPOSED'
  | 'SPECIFIED'
  | 'IMPLEMENTED'
  | 'VERIFIED'
  | 'VALIDATED';

export interface Tier1ComplianceReport {
  report_id: string;
  study_id: string;
  phase: StudyPhase;
  date: string;
  researcher: string;
  chae_lead: string;
  criteria: Array<{
    criterion: string;
    status: Tier1CriterionStatus;
    evidence_url: string | null;
    gaps: string[];
    remediation: string | null;
  }>;
  overall_verdict: 'Tier-1 Compliant' | 'Compliant with Gaps' | 'Non-Compliant';
  neurodivergent_metrics_summary: Partial<NeurodivergentMetrics>;
  cci_summary: Pick<CCIRecord, 'cci' | 'halt_occurred' | 'invariant_violations'>;
  signatures: {
    researcher: string;
    chae_lead: string;
    ossc_lead: string | null;
    date: string;
  };
}

// ─── Publication ───────────────────────────────────────────────────────────

export type PublicationVenue =
  | 'CHI' | 'AAAI' | 'NeurIPS' | 'IEEE_TSE'
  | 'IJAIED' | 'Nature_Human_Behaviour'
  | 'FOSS_ICSE' | 'FAccT' | 'OTHER';

export interface PublicationRecord {
  paper_id: string;
  title: string;
  study_id: string;
  target_venues: PublicationVenue[];
  truth_state: TruthState;          // must be VERIFIED minimum before submission
  tier1_compliance_report_id: string;
  preregistration_url: string;
  zenodo_doi: string | null;
  acm_artifacts_badge: boolean;
  nab_coauthorship_offered: boolean;
  whitewashing_check_complete: boolean;
  vnt_statement_included: boolean;
  submitted_at: string | null;
  published_at: string | null;
}
