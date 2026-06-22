/**
 * TLC Evidence Chain Engine — EvidenceGraph (spec §12)
 *
 * A directed acyclic graph of inter-claim relationships. Each edge records
 * how one claim depends on, was generated from, supersedes, or contradicts
 * another. Persisted as a single JSON file; rebuilt in-process on load.
 *
 * Phase 7 stub — full cycle detection and topological query will follow
 * when the claim corpus is large enough to warrant it.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { EdgeKind, EvidenceGraphEdge, EvidenceGraphNode } from "./types.js";

export class EvidenceGraph {
  /** All edges keyed by edge id */
  private edges: Map<string, EvidenceGraphEdge> = new Map();

  constructor(private readonly storagePath: string) {
    this.load();
  }

  // ── Persistence ──────────────────────────────────────────────────────────

  private load(): void {
    if (!existsSync(this.storagePath)) return;
    try {
      const raw = readFileSync(this.storagePath, "utf8");
      const arr = JSON.parse(raw) as EvidenceGraphEdge[];
      for (const e of arr) this.edges.set(e.id, e);
    } catch {
      // fresh graph on corrupt/missing file
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.storagePath), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify([...this.edges.values()], null, 2),
    );
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  /**
   * Add a directed edge from one claim to another.
   * Returns the created EvidenceGraphEdge.
   */
  addEdge(
    fromClaimId: string,
    toClaimId: string,
    kind: EdgeKind,
    operator: string,
    notes = "",
  ): EvidenceGraphEdge {
    if (fromClaimId === toClaimId) {
      throw new Error("EvidenceGraph: self-loop not allowed.");
    }
    // Duplicate check: same (from, to, kind) pair
    for (const e of this.edges.values()) {
      if (
        e.fromClaimId === fromClaimId &&
        e.toClaimId === toClaimId &&
        e.kind === kind
      ) {
        throw new Error(
          `EvidenceGraph: duplicate edge ${fromClaimId} -[${kind}]-> ${toClaimId}.`,
        );
      }
    }
    const edge: EvidenceGraphEdge = {
      id: randomUUID(),
      fromClaimId,
      toClaimId,
      kind,
      notes,
      createdAt: new Date().toISOString(),
      operator,
    };
    this.edges.set(edge.id, edge);
    this.persist();
    return edge;
  }

  /** Remove an edge by id. */
  removeEdge(edgeId: string): void {
    if (!this.edges.has(edgeId)) {
      throw new Error(`EvidenceGraph: edge '${edgeId}' not found.`);
    }
    this.edges.delete(edgeId);
    this.persist();
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  /** Return the node view (in + out edges) for a claim. */
  node(claimId: string): EvidenceGraphNode {
    const inEdges: EvidenceGraphEdge[] = [];
    const outEdges: EvidenceGraphEdge[] = [];
    for (const e of this.edges.values()) {
      if (e.toClaimId === claimId) inEdges.push(e);
      if (e.fromClaimId === claimId) outEdges.push(e);
    }
    return { claimId, inEdges, outEdges };
  }

  /** All edges in the graph. */
  allEdges(): EvidenceGraphEdge[] {
    return [...this.edges.values()];
  }

  /** All edges of a given kind. */
  edgesByKind(kind: EdgeKind): EvidenceGraphEdge[] {
    return [...this.edges.values()].filter((e) => e.kind === kind);
  }

  /** Return direct dependencies of a claim (what it depends_on). */
  dependencies(claimId: string): string[] {
    return [...this.edges.values()]
      .filter((e) => e.fromClaimId === claimId && e.kind === "depends_on")
      .map((e) => e.toClaimId);
  }

  /** Return all claims that depend on this one. */
  dependents(claimId: string): string[] {
    return [...this.edges.values()]
      .filter((e) => e.toClaimId === claimId && e.kind === "depends_on")
      .map((e) => e.fromClaimId);
  }

  /** Total number of edges. */
  edgeCount(): number {
    return this.edges.size;
  }
}
