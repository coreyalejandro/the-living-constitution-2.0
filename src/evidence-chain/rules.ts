/**
 * TLC Evidence Chain Engine — ConstitutionRule store + evaluator (R9)
 * Versioned rules with migration: when a rule is updated, all non-terminal
 * claims under the old version are re-evaluated.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  ConstitutionRule,
  Claim,
  TruthState,
  MigrationRecord,
} from "./types.js";

export class RuleStore {
  /** Map from rule id → version → rule */
  private rules: Map<string, Map<string, ConstitutionRule>> = new Map();
  /** Latest version per rule id */
  private latest: Map<string, string> = new Map();

  constructor(private readonly storagePath: string) {
    this.load();
  }

  private load(): void {
    if (!existsSync(this.storagePath)) return;
    try {
      const raw = readFileSync(this.storagePath, "utf8");
      const entries = JSON.parse(raw) as ConstitutionRule[];
      for (const r of entries) this.add(r, false);
    } catch {
      // fresh
    }
  }

  private persist(): void {
    const all: ConstitutionRule[] = [];
    for (const versions of this.rules.values()) {
      all.push(...versions.values());
    }
    mkdirSync(dirname(this.storagePath), { recursive: true });
    writeFileSync(this.storagePath, JSON.stringify(all, null, 2));
  }

  add(rule: ConstitutionRule, save = true): void {
    if (!this.rules.has(rule.id)) {
      this.rules.set(rule.id, new Map());
    }
    (this.rules.get(rule.id) as Map<string, ConstitutionRule>).set(
      rule.version,
      rule,
    );
    // Track latest by simple lexicographic version comparison
    const cur = this.latest.get(rule.id);
    if (!cur || rule.version > cur) this.latest.set(rule.id, rule.version);
    if (save) this.persist();
  }

  getLatest(id: string): ConstitutionRule {
    const ver = this.latest.get(id);
    if (!ver) throw new Error(`Rule '${id}' not found.`);
    return (this.rules.get(id) as Map<string, ConstitutionRule>).get(ver) as ConstitutionRule;
  }

  getVersion(id: string, version: string): ConstitutionRule {
    const ver = this.rules.get(id)?.get(version);
    if (!ver) throw new Error(`Rule '${id}@${version}' not found.`);
    return ver;
  }

  latestVersion(id: string): string {
    const ver = this.latest.get(id);
    if (!ver) throw new Error(`Rule '${id}' not found.`);
    return ver;
  }

  all(): ConstitutionRule[] {
    const out: ConstitutionRule[] = [];
    for (const versions of this.rules.values()) {
      out.push(...versions.values());
    }
    return out;
  }
}

/**
 * Evaluate whether a claim can advance under a given rule.
 * Returns: "ALLOWED" | "BLOCKED" | "REVIEW_REQUIRED"
 *
 * Evidence requirements only apply when the transition target meets or exceeds
 * the rule's requiredTruthState in the forward ordering.
 */
export function evaluateTransition(
  claim: Claim,
  targetState: TruthState,
  presentEvidenceKinds: Set<string>,
  hasOperationalAttestation: boolean,
  rule: ConstitutionRule,
): "ALLOWED" | "BLOCKED" | "REVIEW_REQUIRED" {
  // Check that domain tags match
  const domainMatch =
    rule.appliesTo.length === 0 ||
    rule.appliesTo.some((tag) => claim.domainTags.includes(tag));
  if (!domainMatch) return "ALLOWED"; // rule doesn't apply

  // Only enforce evidence/attestation requirements once the target state
  // meets or exceeds the rule's requiredTruthState in the forward ordering.
  const ORDER: TruthState[] = [
    "PROPOSED", "SPECIFIED", "IMPLEMENTED", "VERIFIED", "VALIDATED", "DEPLOYED",
  ];
  const targetIdx = ORDER.indexOf(targetState);
  const requiredIdx = ORDER.indexOf(rule.requiredTruthState as TruthState);
  if (targetIdx < requiredIdx) return "ALLOWED"; // rule not yet triggered

  // Check evidence kinds
  const missingKinds = rule.requiredEvidenceKinds.filter(
    (k) => !presentEvidenceKinds.has(k),
  );
  if (rule.blockOnMissingEvidence && missingKinds.length > 0) {
    return "BLOCKED";
  }

  // VALIDATED requires operational attestation (R10)
  if (
    targetState === "VALIDATED" &&
    rule.requireOperationalAttestation &&
    !hasOperationalAttestation
  ) {
    return "BLOCKED";
  }

  return "ALLOWED";
}

/**
 * Migrate a non-terminal claim when a rule is updated (R9).
 * Returns a MigrationRecord describing the outcome.
 */
export function migrateClaimToNewRule(
  claim: Claim,
  oldRuleId: string,
  oldRuleVersion: string,
  newRule: ConstitutionRule,
  presentEvidenceKinds: Set<string>,
  hasOperationalAttestation: boolean,
): MigrationRecord {
  const result = evaluateTransition(
    claim,
    claim.state,
    presentEvidenceKinds,
    hasOperationalAttestation,
    newRule,
  );

  return {
    claimId: claim.id,
    oldRuleId,
    newRuleId: `${newRule.id}@${newRule.version}`,
    timestamp: new Date().toISOString(),
    result: result === "ALLOWED" ? "MAINTAINED" : "REVIEW_REQUIRED",
    notes:
      result === "ALLOWED"
        ? `Claim remains ${claim.state} under ${newRule.id}@${newRule.version}`
        : `Rule ${newRule.id} updated to version ${newRule.version}: stricter evidence required. Claim flagged REVIEW_REQUIRED.`,
  };
}
