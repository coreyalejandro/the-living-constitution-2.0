/**
 * TLC Evidence Chain Engine — Public API (spec §10)
 */

// Core engine
export { EvidenceChainEngine } from "./engine.js";
export type { EngineConfig } from "./engine.js";

// Types
export type {
  TruthState,
  EvidenceKind,
  EvidenceItem,
  ConstitutionRule,
  Claim,
  TransitionRecord,
  TransitionResult,
  EvidenceChain,
  OperatorKey,
  TraceabilityEntry,
  MigrationRecord,
  AuditBundle,
} from "./types.js";
export { TERMINAL_STATES, VALID_TRANSITIONS } from "./types.js";

// Crypto utilities (R7)
export {
  canonical,
  sha256hex,
  generateKeypair,
  signBytes,
  verifySignature,
  keyFingerprint,
  merkleRoot,
  inclusionProof,
  verifyInclusion,
} from "./crypto.js";
export type { Keypair, InclusionProof } from "./crypto.js";

// Signatures / keyring (R8)
export { OperatorKeyring, createHITLSignature } from "./signatures.js";

// Rules + migration (R9)
export { RuleStore, evaluateTransition, migrateClaimToNewRule } from "./rules.js";

// Ledger
export { Ledger } from "./ledger.js";
export type { VerifyOptions } from "./ledger.js";
