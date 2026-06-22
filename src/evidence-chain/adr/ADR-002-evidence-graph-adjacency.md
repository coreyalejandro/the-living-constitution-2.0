# ADR-002: Evidence Graph Connectivity via Adjacency List (no ltree)

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** TLC Core Team  
**Context:** spec §Gap-2

---

## Context

The golden-grade spec requires that the engine can verify **connected path** from a
root E0 evidence item to any higher-level evidence item before allowing a state
transition. The question is how to store and query that adjacency.

Two options were considered:

### Option A — PostgreSQL `ltree` extension

Store evidence paths as hierarchical label trees using PostgreSQL's `ltree` type.
Supports efficient ancestor/descendant queries via the `<@` operator.

**Rejected because:**
- Requires the `ltree` extension to be enabled in every deployment target.
- The TLC engine must also run without a database (file-backed mode for dev/CI).
- `ltree` paths must be strings; mapping UUIDs to `ltree` labels adds friction.
- Binding to a Postgres extension limits portability.

### Option B — Adjacency list (accepted)

Store evidence links as `EvidenceLink` records in a flat table or JSON file:
```
{ id, parentEvidenceId, childEvidenceId, claimId, createdAt }
```

Connectivity is verified in-process using BFS (`hasConnectedPath()` in
`evidence-levels.ts`). This approach:

- Runs identically with file-backed JSON and PostgreSQL (same application code).
- Imposes no Postgres extension dependency.
- BFS is O(V + E) over the evidence graph; chains are small in practice.
- Cycles are naturally prevented: evidence items are append-only (ECE-I5) and
  `addLink()` rejects self-loops.

---

## Decision

Use a flat adjacency list (`evidence_links` table / `EvidenceLevelStore`) with
application-level BFS traversal. Do NOT use `ltree`.

---

## Consequences

- `EvidenceLevelStore` maintains the in-memory + persisted adjacency list.
- `hasConnectedPath(claimId, targetLevel, allEvidence, links)` in
  `evidence-levels.ts` performs BFS and is the canonical connectivity check.
- The PostgreSQL schema (`db/schema.sql`) provides a `evidence_links` table with
  a standard foreign-key design, ready for migration from file-backed JSON.
- All engine tests must verify connectivity checks (see `engine.test.ts`).
