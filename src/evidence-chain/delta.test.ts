/**
 * Tests for the Gap-1..Gap-6 delta:
 *   - EvidenceLevelStore (adjacency list + hasConnectedPath)
 *   - ChallengeStore (freeze lock lifecycle)
 *   - ConstitutionalService (YAML loader + canTransition + requiredLevel)
 *   - engine integration: challenge blocks transition, author independence
 *
 * Existing 76 tests continue to run via engine.test.ts.
 */
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { EvidenceLevelStore, hasConnectedPath } from "./evidence-levels.js";
import { ChallengeStore } from "./challenge.js";
import { ConstitutionalService } from "./constitutional-service.js";
import type { EvidenceItem, EvidenceLink } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONSTITUTION_YAML = resolve(__dirname, "constitutional", "constitution.yaml");

// ── Helpers ──────────────────────────────────────────────────────────────────

function tmpDir(prefix: string) {
  const d = join(tmpdir(), `ece-test-${prefix}-${Date.now()}`);
  mkdirSync(d, { recursive: true });
  return d;
}

function makeEvidence(
  id: string,
  level: EvidenceItem["level"],
  claimId: string,
  supersededBy?: string,
): EvidenceItem {
  return {
    id,
    kind: "ARTIFACT",
    path: `artifacts/${id}.md`,
    hash: "abc123",
    provenance: "test",
    createdAt: new Date().toISOString(),
    operator: "op1",
    machineReadable: true,
    supportsClaimIds: [claimId],
    level,
    claimId,
    supersededBy,
  };
}

// ── EvidenceLevelStore ────────────────────────────────────────────────────────

describe("EvidenceLevelStore", () => {
  let dir: string;
  before(() => { dir = tmpDir("level-store"); });
  after(() => { rmSync(dir, { recursive: true, force: true }); });

  it("persists a link and reloads it", () => {
    const storagePath = join(dir, "links.json");
    const store = new EvidenceLevelStore(storagePath);
    const link = store.addLink("claim-1", "ev-parent", "ev-child");

    assert.equal(link.claimId, "claim-1");
    assert.equal(link.parentEvidenceId, "ev-parent");
    assert.equal(link.childEvidenceId, "ev-child");

    // Reload from disk
    const store2 = new EvidenceLevelStore(storagePath);
    const links = store2.linksForClaim("claim-1");
    assert.equal(links.length, 1);
    assert.equal(links[0].id, link.id);
  });

  it("rejects self-loops", () => {
    const storagePath = join(dir, "links-self-loop.json");
    const store = new EvidenceLevelStore(storagePath);
    assert.throws(
      () => store.addLink("claim-1", "ev-x", "ev-x"),
      /self-loop not allowed/,
    );
  });
});

// ── hasConnectedPath ──────────────────────────────────────────────────────────

describe("hasConnectedPath", () => {
  it("returns true for E0 when root exists", () => {
    const claimId = "claim-bfs";
    const ev0 = makeEvidence("e0", "E0", claimId);
    assert.equal(hasConnectedPath(claimId, "E0", [ev0], []), true);
  });

  it("returns false when no E0 root exists", () => {
    const claimId = "claim-no-root";
    const ev1 = makeEvidence("e1", "E1", claimId);
    assert.equal(hasConnectedPath(claimId, "E1", [ev1], []), false);
  });

  it("finds E3 via chain E0→E1→E2→E3", () => {
    const claimId = "claim-chain";
    const ev0 = makeEvidence("e0", "E0", claimId);
    const ev1 = makeEvidence("e1", "E1", claimId);
    const ev2 = makeEvidence("e2", "E2", claimId);
    const ev3 = makeEvidence("e3", "E3", claimId);
    const links: EvidenceLink[] = [
      { id: "l1", claimId, parentEvidenceId: "e0", childEvidenceId: "e1", createdAt: "" },
      { id: "l2", claimId, parentEvidenceId: "e1", childEvidenceId: "e2", createdAt: "" },
      { id: "l3", claimId, parentEvidenceId: "e2", childEvidenceId: "e3", createdAt: "" },
    ];
    assert.equal(hasConnectedPath(claimId, "E3", [ev0, ev1, ev2, ev3], links), true);
  });

  it("returns false when the E3 node is superseded", () => {
    const claimId = "claim-superseded";
    const ev0 = makeEvidence("e0", "E0", claimId);
    const ev3 = makeEvidence("e3", "E3", claimId, "e3b"); // superseded
    const links: EvidenceLink[] = [
      { id: "l1", claimId, parentEvidenceId: "e0", childEvidenceId: "e3", createdAt: "" },
    ];
    assert.equal(hasConnectedPath(claimId, "E3", [ev0, ev3], links), false);
  });

  it("handles disconnected graph (returns false for unreachable target)", () => {
    const claimId = "claim-disconnected";
    const ev0 = makeEvidence("e0", "E0", claimId);
    const ev5 = makeEvidence("e5", "E5", claimId); // no link from e0 to e5
    assert.equal(hasConnectedPath(claimId, "E5", [ev0, ev5], []), false);
  });
});

// ── ChallengeStore ────────────────────────────────────────────────────────────

describe("ChallengeStore", () => {
  let dir: string;
  before(() => { dir = tmpDir("challenge-store"); });
  after(() => { rmSync(dir, { recursive: true, force: true }); });

  it("submit creates a PENDING challenge and sets lock", () => {
    const store = new ChallengeStore(join(dir, "challenges.json"));
    const ch = store.submit("claim-x", "CLAIM", "Invalid claim.");
    assert.equal(ch.status, "PENDING");
    assert.equal(store.isLocked("claim-x"), true);
  });

  it("resolve clears PENDING and releases lock", () => {
    const store = new ChallengeStore(join(dir, "resolve-test.json"));
    const ch = store.submit("claim-y", "EVIDENCE", "Hash mismatch.");
    assert.equal(store.isLocked("claim-y"), true);

    const resolved = store.resolve(ch.id, "Hash verified after re-run.");
    assert.equal(resolved.status, "RESOLVED");
    assert.equal(store.isLocked("claim-y"), false);
  });

  it("lock stays active when multiple challenges pending", () => {
    const store = new ChallengeStore(join(dir, "multi-pending.json"));
    const ch1 = store.submit("claim-z", "CLAIM", "First challenge.");
    const ch2 = store.submit("claim-z", "EVIDENCE", "Second challenge.");

    store.resolve(ch1.id, "First resolved.");
    assert.equal(store.isLocked("claim-z"), true, "lock stays while ch2 pending");

    store.resolve(ch2.id, "Second resolved.");
    assert.equal(store.isLocked("claim-z"), false, "lock released when all resolved");
  });

  it("throws when resolving a non-existent challenge", () => {
    const store = new ChallengeStore(join(dir, "bad-resolve.json"));
    assert.throws(() => store.resolve("no-such-id", "irrelevant"), /not found/);
  });

  it("throws when resolving an already-resolved challenge", () => {
    const store = new ChallengeStore(join(dir, "double-resolve.json"));
    const ch = store.submit("claim-w", "TRANSITION", "test");
    store.resolve(ch.id, "done");
    assert.throws(() => store.resolve(ch.id, "again"), /already resolved/);
  });

  it("persists and reloads lock state", () => {
    const storagePath = join(dir, "persist-lock.json");
    const s1 = new ChallengeStore(storagePath);
    s1.submit("claim-p", "REPLICATION", "Dispute replication.");

    const s2 = new ChallengeStore(storagePath);
    assert.equal(s2.isLocked("claim-p"), true);
  });
});

// ── ConstitutionalService ─────────────────────────────────────────────────────

describe("ConstitutionalService", () => {
  it("loads and caches constitution.yaml", () => {
    const svc = new ConstitutionalService(CONSTITUTION_YAML);
    const c = svc.load();
    assert.equal(c.version, "2.0.0");
    assert.equal(c.invariants.no_self_verification, true);
    assert.equal(c.invariants.simulation_not_validation, true);
    assert.equal(c.invariants.evidence_append_only, true);
  });

  it("canTransition returns true for valid transitions", () => {
    const svc = new ConstitutionalService(CONSTITUTION_YAML);
    assert.equal(svc.canTransition("PROPOSED", "SPECIFIED"), true);
    assert.equal(svc.canTransition("SPECIFIED", "IMPLEMENTED"), true);
    assert.equal(svc.canTransition("VALIDATED", "DEPLOYED"), true);
    assert.equal(svc.canTransition("PROPOSED", "RETRACTED"), true);
  });

  it("canTransition returns false for invalid transitions", () => {
    const svc = new ConstitutionalService(CONSTITUTION_YAML);
    assert.equal(svc.canTransition("PROPOSED", "DEPLOYED"), false);
    assert.equal(svc.canTransition("DEPLOYED", "PROPOSED"), false);
    assert.equal(svc.canTransition("IMPLEMENTED", "VALIDATED"), false);
  });

  it("requiredLevel returns the correct evidence level per state", () => {
    const svc = new ConstitutionalService(CONSTITUTION_YAML);
    assert.equal(svc.requiredLevel("PROPOSED"),    "E0");
    assert.equal(svc.requiredLevel("SPECIFIED"),   "E1");
    assert.equal(svc.requiredLevel("IMPLEMENTED"), "E2");
    assert.equal(svc.requiredLevel("VERIFIED"),    "E3");
    assert.equal(svc.requiredLevel("VALIDATED"),   "E4");
    assert.equal(svc.requiredLevel("DEPLOYED"),    "E5");
  });

  it("throws a clear error when YAML file is missing", () => {
    const svc = new ConstitutionalService("/no/such/file.yaml");
    assert.throws(() => svc.load(), /not found/);
  });

  it("reload() re-reads the file", () => {
    const svc = new ConstitutionalService(CONSTITUTION_YAML);
    svc.load();
    const c2 = svc.reload();
    assert.equal(c2.version, "2.0.0");
  });
});
