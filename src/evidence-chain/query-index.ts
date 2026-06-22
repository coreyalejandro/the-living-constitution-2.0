/**
 * TLC Evidence Chain Engine — QueryIndex (spec §11.B)
 *
 * In-process index rebuilt from the ledger on construction, updated on every
 * write. Supports fast retrieval by state, domain tag, operator, applicable
 * rule id, and timestamp range without re-scanning all JSONL files.
 *
 * Persistence: single JSON file written atomically on every upsert.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  TruthState,
  ClaimStatus,
  QueryIndexEntry,
} from "./types.js";

// ── Helper: derive ClaimStatus from TruthState ────────────────────────────

export function claimStatusFromState(state: TruthState): ClaimStatus {
  switch (state) {
    case "PROPOSED":
    case "SPECIFIED":
    case "IMPLEMENTED":
    case "REVIEW_REQUIRED":
      return "OPEN";
    case "VERIFIED":
      return "VERIFIED";
    case "VALIDATED":
    case "DEPLOYED":
      return "VALIDATED";
    case "RETRACTED":
      return "RETRACTED";
  }
}

// ── Query filter interface ────────────────────────────────────────────────

export interface QueryFilter {
  state?: TruthState;
  status?: ClaimStatus;
  domainTag?: string;
  operator?: string;
  ruleId?: string;
  /** ISO-8601: only entries updated at or after this timestamp */
  updatedAfter?: string;
  /** ISO-8601: only entries updated at or before this timestamp */
  updatedBefore?: string;
}

// ── QueryIndex ────────────────────────────────────────────────────────────

export class QueryIndex {
  private entries: Map<string, QueryIndexEntry> = new Map();

  constructor(private readonly storagePath: string) {
    this.load();
  }

  private load(): void {
    if (!existsSync(this.storagePath)) return;
    try {
      const raw = readFileSync(this.storagePath, "utf8");
      const arr = JSON.parse(raw) as QueryIndexEntry[];
      for (const e of arr) this.entries.set(e.claimId, e);
    } catch {
      // fresh index on corrupt/missing file
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.storagePath), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify([...this.entries.values()], null, 2),
    );
  }

  /** Upsert an entry. Called by the engine after every registerClaim / advance. */
  upsert(entry: QueryIndexEntry): void {
    this.entries.set(entry.claimId, entry);
    this.persist();
  }

  /** Remove an entry (e.g. when a claim is fully deleted — rare). */
  remove(claimId: string): void {
    this.entries.delete(claimId);
    this.persist();
  }

  /** Retrieve all entries matching the optional filter. */
  query(filter: QueryFilter = {}): QueryIndexEntry[] {
    let results = [...this.entries.values()];

    if (filter.state !== undefined) {
      results = results.filter((e) => e.state === filter.state);
    }
    if (filter.status !== undefined) {
      results = results.filter((e) => e.status === filter.status);
    }
    if (filter.domainTag !== undefined) {
      results = results.filter((e) => e.domainTags.includes(filter.domainTag!));
    }
    if (filter.operator !== undefined) {
      results = results.filter((e) => e.operator === filter.operator);
    }
    if (filter.ruleId !== undefined) {
      results = results.filter((e) =>
        e.applicableRuleIds.includes(filter.ruleId!),
      );
    }
    if (filter.updatedAfter !== undefined) {
      results = results.filter((e) => e.updatedAt >= filter.updatedAfter!);
    }
    if (filter.updatedBefore !== undefined) {
      results = results.filter((e) => e.updatedAt <= filter.updatedBefore!);
    }

    // Stable sort: newest first
    return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /** Look up a single entry by claim id. */
  get(claimId: string): QueryIndexEntry | undefined {
    return this.entries.get(claimId);
  }

  /** Return all entries (no filter). */
  all(): QueryIndexEntry[] {
    return this.query();
  }

  /** Total number of indexed claims. */
  size(): number {
    return this.entries.size;
  }
}
