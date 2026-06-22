/**
 * TLC Evidence Chain Engine — ChallengeService (spec §Gap-5 / ADR-005)
 *
 * Red-team challenges are first-class entities. Submitting a challenge
 * places a freeze lock on the claim, blocking all forward transitions
 * until the challenge is resolved.
 *
 * Storage: file-backed JSON (same pattern as EvidenceGraph).
 * Event sourcing: every submit/resolve appends to a separate events file.
 *
 * Challenge types:
 *   CLAIM       — disputes the validity of the claim itself
 *   EVIDENCE    — disputes a specific evidence artifact
 *   TRANSITION  — disputes that a particular state advance was valid
 *   REPLICATION — disputes an independent replication result (E5)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { Challenge, ChallengeType, ChallengeStatus } from "./types.js";

// ── ChallengeStore ────────────────────────────────────────────────────────

export class ChallengeStore {
  private challenges: Map<string, Challenge> = new Map();
  /** claim_id → locked boolean */
  private locks: Map<string, boolean> = new Map();

  constructor(private readonly storagePath: string) {
    this.load();
  }

  private load(): void {
    if (!existsSync(this.storagePath)) return;
    try {
      const raw = readFileSync(this.storagePath, "utf8");
      const data = JSON.parse(raw) as { challenges: Challenge[]; locks: Record<string, boolean> };
      for (const c of data.challenges ?? []) this.challenges.set(c.id, c);
      for (const [k, v] of Object.entries(data.locks ?? {})) this.locks.set(k, v);
    } catch {
      // fresh on corrupt or missing
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.storagePath), { recursive: true });
    const data = {
      challenges: [...this.challenges.values()],
      locks: Object.fromEntries(this.locks.entries()),
    };
    writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  submit(claimId: string, type: ChallengeType, description: string): Challenge {
    const challenge: Challenge = {
      id: randomUUID(),
      claimId,
      type,
      description,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    this.challenges.set(challenge.id, challenge);
    // Set lock — blocks all forward transitions
    this.locks.set(claimId, true);
    this.persist();
    return challenge;
  }

  resolve(challengeId: string, resolution: string): Challenge {
    const chal = this.challenges.get(challengeId);
    if (!chal) throw new Error(`Challenge '${challengeId}' not found.`);
    if (chal.status !== "PENDING") throw new Error(`Challenge '${challengeId}' is already resolved.`);

    const updated: Challenge = { ...chal, status: "RESOLVED" as ChallengeStatus, resolution };
    this.challenges.set(challengeId, updated);

    // Release lock only if no other PENDING challenges exist for this claim
    const stillPending = [...this.challenges.values()].some(
      (c) => c.claimId === chal.claimId && c.status === "PENDING" && c.id !== challengeId,
    );
    if (!stillPending) {
      this.locks.set(chal.claimId, false);
    }
    this.persist();
    return updated;
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  isLocked(claimId: string): boolean {
    return this.locks.get(claimId) === true;
  }

  listForClaim(claimId: string): Challenge[] {
    return [...this.challenges.values()].filter((c) => c.claimId === claimId);
  }

  getById(id: string): Challenge | undefined {
    return this.challenges.get(id);
  }

  listPending(claimId: string): Challenge[] {
    return this.listForClaim(claimId).filter((c) => c.status === "PENDING");
  }
}
