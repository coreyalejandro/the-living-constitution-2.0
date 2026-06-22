/**
 * TLC Evidence Chain Engine — ConstitutionalService (spec §Gap-3 / ADR-003)
 *
 * Constitutional constraints are externalized in constitution.yaml, versioned
 * alongside the code. The service loads this file at startup, caches the
 * result in memory, and exposes a canTransition() method called by the
 * TruthStateService (engine.ts) before every state change.
 *
 * Decouples governance rules from business logic; allows constitutional
 * amendments without code redeployment; supports audit of rule application.
 *
 * Depends on js-yaml (already in package.json dependencies).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import type { TruthState, EvidenceLevel } from "./types.js";

// ── Constitution shape ────────────────────────────────────────────────────

export interface ConstitutionTransitions {
  /** Which states may follow which. */
  allowed_transitions: Record<string, string[]>;
  /** Minimum EvidenceLevel required to enter each state. */
  required_evidence_levels: Record<string, EvidenceLevel>;
}

export interface ConstitutionInvariants {
  no_self_verification: boolean;     // ECE-I3: E3+ evidence may not be authored by claim owner
  simulation_not_validation: boolean; // ECE-I4: E4 requires real execution, not simulation
  evidence_append_only: boolean;      // ECE-I5: evidence may not be deleted
}

export interface Constitution {
  version: string;
  transitions: ConstitutionTransitions;
  invariants: ConstitutionInvariants;
}

// ── ConstitutionalService ─────────────────────────────────────────────────

export class ConstitutionalService {
  private cached: Constitution | null = null;

  constructor(private readonly yamlPath: string) {}

  /** Load and cache the constitution from YAML. Throws if file not found. */
  load(): Constitution {
    if (this.cached) return this.cached;
    if (!existsSync(this.yamlPath)) {
      throw new Error(
        `ConstitutionalService: constitution.yaml not found at '${this.yamlPath}'. ` +
        `Ensure it exists or pass the correct path.`,
      );
    }
    const raw = readFileSync(this.yamlPath, "utf8");
    this.cached = yaml.load(raw) as Constitution;
    return this.cached;
  }

  /** Force a reload (use after amending the YAML at runtime). */
  reload(): Constitution {
    this.cached = null;
    return this.load();
  }

  /**
   * Check whether a transition from `fromState` to `targetState` is allowed
   * by the constitutional transition table.
   */
  canTransition(fromState: TruthState, targetState: TruthState): boolean {
    const c = this.load();
    const allowed = c.transitions.allowed_transitions[fromState] ?? [];
    return allowed.includes(targetState);
  }

  /**
   * Return the minimum EvidenceLevel required to enter a given state.
   * Returns undefined if no level requirement is configured for that state.
   */
  requiredLevel(targetState: TruthState): EvidenceLevel | undefined {
    return this.load().transitions.required_evidence_levels[targetState];
  }

  /** Return the full parsed constitution. */
  get(): Constitution {
    return this.load();
  }
}

// ── Default factory (relative to this module) ─────────────────────────────

/**
 * Construct a ConstitutionalService pointed at the default
 * constitutional/constitution.yaml shipped alongside this module.
 */
export function defaultConstitutionalService(): ConstitutionalService {
  // Works for both ESM (import.meta.url) and commonjs (__dirname) contexts
  let base: string;
  try {
    base = dirname(fileURLToPath(import.meta.url));
  } catch {
    base = process.cwd();
  }
  const yamlPath = resolve(base, "constitutional", "constitution.yaml");
  return new ConstitutionalService(yamlPath);
}
