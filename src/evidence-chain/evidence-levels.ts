/**
 * TLC Evidence Chain Engine — Evidence Levels + Graph Connectivity
 *
 * Implements the E0-E5 evidence level model from spec §Gap-1 / §Gap-2:
 *   E0 — Root claim registration (the claim itself)
 *   E1 — Written specification
 *   E2 — Implementation artifact
 *   E3 — Verification (test / trace result)
 *   E4 — Real execution evidence (simulation not allowed)
 *   E5 — Independent replication
 *
 * Evidence connectivity is enforced via an adjacency list stored as JSON.
 * hasConnectedPath() uses BFS from the root E0 to verify that a target level
 * is reachable before allowing a state transition.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { EvidenceLevel, EvidenceLink, EvidenceItem } from "./types.js";

export { EvidenceLevel };

// ── EvidenceLevelStore ────────────────────────────────────────────────────

/**
 * File-backed adjacency list for evidence graph edges.
 * Each edge records a parent→child relationship between evidence items.
 */
export class EvidenceLevelStore {
  private links: Map<string, EvidenceLink> = new Map();

  constructor(private readonly storagePath: string) {
    this.load();
  }

  private load(): void {
    if (!existsSync(this.storagePath)) return;
    try {
      const raw = readFileSync(this.storagePath, "utf8");
      const arr = JSON.parse(raw) as EvidenceLink[];
      for (const l of arr) this.links.set(l.id, l);
    } catch {
      // fresh on corrupt or missing
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.storagePath), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify([...this.links.values()], null, 2),
    );
  }

  /**
   * Link a child evidence item to its parent.
   * Throws if a self-loop would be created.
   */
  addLink(
    claimId: string,
    parentEvidenceId: string,
    childEvidenceId: string,
  ): EvidenceLink {
    if (parentEvidenceId === childEvidenceId) {
      throw new Error("EvidenceLevelStore: self-loop not allowed.");
    }
    const link: EvidenceLink = {
      id: randomUUID(),
      parentEvidenceId,
      childEvidenceId,
      claimId,
      createdAt: new Date().toISOString(),
    };
    this.links.set(link.id, link);
    this.persist();
    return link;
  }

  /** Return all links belonging to a given claim. */
  linksForClaim(claimId: string): EvidenceLink[] {
    return [...this.links.values()].filter((l) => l.claimId === claimId);
  }

  /** Return all links in the store. */
  all(): EvidenceLink[] {
    return [...this.links.values()];
  }
}

// ── hasConnectedPath ──────────────────────────────────────────────────────

/**
 * BFS from the root E0 evidence item for `claimId`.
 * Returns true iff there is a connected path through evidence_links
 * from E0 to at least one non-superseded evidence item at `targetLevel`.
 *
 * This enforces ADR-002: adjacency list + application-level traversal.
 * The PostgreSQL `ltree` extension is NOT used.
 */
export function hasConnectedPath(
  claimId: string,
  targetLevel: EvidenceLevel,
  allEvidence: EvidenceItem[],
  links: EvidenceLink[],
): boolean {
  // Find root E0 for this claim (non-superseded)
  const root = allEvidence.find(
    (e) =>
      e.claimId === claimId &&
      e.level === "E0" &&
      !e.supersededBy,
  );
  if (!root) return false;

  // If target is E0 and root exists, trivially connected
  if (targetLevel === "E0") return true;

  // Build adjacency list (parent → [children])
  const adj = new Map<string, string[]>();
  for (const link of links) {
    if (!adj.has(link.parentEvidenceId)) adj.set(link.parentEvidenceId, []);
    adj.get(link.parentEvidenceId)!.push(link.childEvidenceId);
  }

  // BFS from root
  const visited = new Set<string>();
  const queue: string[] = [root.id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const ev = allEvidence.find((e) => e.id === current);
    if (ev && ev.level === targetLevel && !ev.supersededBy) return true;

    const children = adj.get(current) ?? [];
    for (const child of children) {
      if (!visited.has(child)) queue.push(child);
    }
  }
  return false;
}

/**
 * Return the minimum required EvidenceLevel for a given TruthState,
 * per the constitutional transitions table.
 */
export const STATE_TO_LEVEL: Record<string, EvidenceLevel> = {
  PROPOSED:    "E0",
  SPECIFIED:   "E1",
  IMPLEMENTED: "E2",
  VERIFIED:    "E3",
  VALIDATED:   "E4",
  DEPLOYED:    "E5",
};
