/**
 * TLC Evidence Chain Engine — Data Model (v2.0)
 * Spec §4. All types map 1:1 to the specification.
 */

// ─── Truth-State machine ───────────────────────────────────────────────────

export type TruthState =
  | "PROPOSED"
  | "SPECIFIED"
  | "IMPLEMENTED"
  | "VERIFIED"
  | "VALIDATED"
  | "DEPLOYED"
  | "RETRACTED"
  | "REVIEW_REQUIRED";

/** Terminal states: no further forward transitions allowed. */
export const TERMINAL_STATES = new Set<TruthState>([
  "DEPLOYED",
  "RETRACTED",
]);

/** All valid forward transitions (from → to). */
export const VALID_TRANSITIONS: Record<string, TruthState[]> = {
  PROPOSED:        ["SPECIFIED", "RETRACTED"],
  SPECIFIED:       ["IMPLEMENTED", "RETRACTED"],
  IMPLEMENTED:     ["VERIFIED", "RETRACTED"],
  VERIFIED:        ["VALIDATED", "RETRACTED"],
  VALIDATED:       ["DEPLOYED", "RETRACTED"],
  REVIEW_REQUIRED: ["SPECIFIED", "IMPLEMENTED", "VERIFIED", "RETRACTED"],
};

// ─── Evidence kinds ────────────────────────────────────────────────────────

export type EvidenceKind =
  | "SPEC"       // written specification / design doc
  | "ARTIFACT"   // produced artefact (code, model, paper)
  | "TEST"       // test suite result
  | "TRACE"      // execution / LTL trace
  | "BENCHMARK"  // quantitative measurement
  | "HITL"       // human-in-the-loop review (requires signature)
  | "RETRO";     // retraction rationale

// ─── EvidenceItem ─────────────────────────────────────────────────────────

export interface EvidenceItem {
  readonly id: string;
  readonly kind: EvidenceKind;
  readonly path: string;           // repo-relative path to artefact
  readonly hash: string;           // sha256 of artefact content
  readonly provenance: string;     // short description of origin
  readonly createdAt: string;      // ISO-8601
  readonly operator: string;       // operator id (key fingerprint or name)
  readonly machineReadable: boolean;
  readonly supportsClaimIds: string[];
  // R8: HITL items MUST carry a valid digital signature
  readonly signature?: string;             // base64 Ed25519 over canonical(item fields)
  readonly verificationMethod?: "pgp" | "git-commit" | "ed25519";
}

// ─── ConstitutionRule ──────────────────────────────────────────────────────

export interface ConstitutionRule {
  readonly id: string;
  readonly version: string;                   // semver, e.g. "1.0.0"
  readonly name: string;
  readonly appliesTo: string[];               // claim domain tags
  readonly requiredEvidenceKinds: EvidenceKind[];
  readonly requiredTruthState: TruthState;
  readonly blockOnMissingEvidence: boolean;
  readonly requireOperationalAttestation: boolean;  // R10
  readonly constitutionClause: string;        // R2: traceability ref
}

// ─── Claim ─────────────────────────────────────────────────────────────────

export interface Claim {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly domainTags: string[];
  readonly createdAt: string;
  readonly operator: string;
  readonly state: TruthState;
  readonly applicableRuleIds: string[];
}

// ─── TransitionRecord ──────────────────────────────────────────────────────

export type TransitionResult =
  | "ALLOWED"
  | "BLOCKED"
  | "REVIEW_REQUIRED"
  | "RETRACTED";

export interface TransitionRecord {
  readonly id: string;
  readonly claimId: string;
  readonly fromState: TruthState;
  readonly toState: TruthState;
  readonly triggeredBy: string;     // operator id
  readonly timestamp: string;       // ISO-8601
  readonly ruleId: string;          // which rule version governed this transition
  readonly result: TransitionResult;
  readonly notes: string;
}

// ─── EvidenceChain ─────────────────────────────────────────────────────────

export interface EvidenceChain {
  readonly id: string;
  readonly claimId: string;
  readonly nodes: ReadonlyArray<Claim | EvidenceItem | TransitionRecord>;
  readonly currentState: TruthState;
  readonly integrityHash: string;            // Merkle root over all node hashes (R7)
  readonly applicableConstitutionRules: ConstitutionRule[];
}

// ─── Operator key (R8) ────────────────────────────────────────────────────

export interface OperatorKey {
  readonly id: string;           // fingerprint or name
  readonly publicKeyPem: string;
  readonly registeredAt: string;
  readonly constitutionRef: string;   // clause that authorises this operator
  readonly revoked: boolean;
}

// ─── Traceability matrix entry (R2) ───────────────────────────────────────

export interface TraceabilityEntry {
  readonly engineElement: string;       // e.g. "TruthState.VALIDATED"
  readonly constitutionClause: string;  // e.g. "Core §3.2"
  readonly domainConstitutionRef?: string;
  readonly notes: string;
}

// ─── Migration record (R9) ────────────────────────────────────────────────

export interface MigrationRecord {
  readonly claimId: string;
  readonly oldRuleId: string;
  readonly newRuleId: string;
  readonly timestamp: string;
  readonly result: "MAINTAINED" | "REVIEW_REQUIRED";
  readonly notes: string;
}

// ─── Audit bundle export ──────────────────────────────────────────────────

export interface AuditBundle {
  readonly exportedAt: string;
  readonly claimId: string;
  readonly chain: EvidenceChain;
  readonly integrityVerified: boolean;
  readonly merkleRoot: string;
  readonly missingEvidence: string[];      // evidence kinds that are absent
}
