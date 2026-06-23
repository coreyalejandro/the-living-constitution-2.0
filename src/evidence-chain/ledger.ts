/**
 * TLC Evidence Chain Engine — Ledger (append-only storage)
 * Each chain is stored as a JSONL file. Records are signed + hash-chained.
 * The Merkle root provides an integrityHash over all chain nodes (R7).
 */
import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { Claim, EvidenceItem, TransitionRecord, EvidenceChain, ConstitutionRule } from "./types.js";
import {
  canonical,
  sha256hex,
  merkleRoot,
  signBytes,
  verifySignature,
  keyFingerprint,
} from "./crypto.js";

export type ChainNode = Claim | EvidenceItem | TransitionRecord;

interface LedgerRecord {
  node: ChainNode;
  prev_hash: string;
  signer: string;       // R11/A6: SHA-256(SPKI/DER) fingerprint of the signing key, bound into the signed payload
  entry_hash: string;
  sig: string;
}

/** Options for pinned, trust-anchored verification (R11 / A6 fix). */
export interface VerifyOptions {
  /** Out-of-band pinned fingerprint of the legitimate signer key. */
  expectedKeyFingerprint?: string;
  /** Out-of-band pinned chain head (length + Merkle root) to defeat truncation/rollback. */
  expectedHead?: { length: number; merkleRoot: string };
}

export class Ledger {
  private readonly signerFp: string;
  // Append throughput fix (v2.1): cache the tail hash per claim so `append` is
  // O(1) instead of re-reading the whole JSONL file on every write (which made
  // bulk append O(n²) — ~75s for 16k entries, infeasible at millions). Safe
  // under the append-only single-writer model: the writer owns the ledger.
  private readonly lastHashCache = new Map<string, string>();

  constructor(
    private readonly dir: string,
    private readonly privateKeyPem: string,
    private readonly publicKeyPem: string,
  ) {
    // The fingerprint of the key this ledger signs/verifies with. Used both to
    // stamp each entry (signer binding) and to compare against an out-of-band pin.
    this.signerFp = keyFingerprint(publicKeyPem);
  }

  /** Fingerprint of the signing key — record this out-of-band as the trust anchor. */
  signerFingerprint(): string {
    return this.signerFp;
  }

  private filePath(claimId: string): string {
    return join(this.dir, `${claimId}.jsonl`);
  }

  private lastHash(claimId: string): string {
    const cached = this.lastHashCache.get(claimId);
    if (cached !== undefined) return cached;   // O(1): no full-file read per append
    const fp = this.filePath(claimId);
    if (!existsSync(fp)) return "GENESIS";
    const lines = readFileSync(fp, "utf8").trim().split("\n").filter(Boolean);
    /* c8 ignore next 2 */
    if (lines.length === 0) return "GENESIS";
    /* c8 ignore start */
    try {
      const h = (JSON.parse(lines[lines.length - 1] as string) as LedgerRecord).entry_hash;
      this.lastHashCache.set(claimId, h);
      return h;
    } catch {
      return "GENESIS";
    }
    /* c8 ignore end */
  }

  append(claimId: string, node: ChainNode): LedgerRecord {
    const fp = this.filePath(claimId);
    mkdirSync(dirname(fp), { recursive: true });
    const prev_hash = this.lastHash(claimId);
    const signer = this.signerFp;
    // The signer fingerprint is part of the signed payload, so it is covered by
    // both entry_hash and the Ed25519 signature and cannot be altered silently.
    const payload = { node, prev_hash, signer };
    const bytes = Buffer.from(canonical(payload));
    const entry_hash = sha256hex(bytes);
    const sig = signBytes(bytes, this.privateKeyPem).toString();
    const record: LedgerRecord = { node, prev_hash, signer, entry_hash, sig };
    appendFileSync(fp, JSON.stringify(record) + "\n");
    this.lastHashCache.set(claimId, entry_hash);   // keep the tail hash hot → O(1) next append
    return record;
  }

  readAll(claimId: string): ChainNode[] {
    const fp = this.filePath(claimId);
    if (!existsSync(fp)) return [];
    return readFileSync(fp, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => (JSON.parse(l) as LedgerRecord).node);
  }

  /**
   * Verify the full chain: hash linkage + signatures (R7), with optional
   * out-of-band trust pinning that closes the A6 forgery path (R11).
   *
   * Without `opts`, behaviour is backward compatible: tamper-evidence over
   * content, ordering, signer binding, and signatures. This detects every
   * attack EXCEPT a fully self-consistent re-sign under a substituted key
   * (and tail truncation) — because a signature scheme cannot bootstrap trust
   * from data the attacker also controls.
   *
   * Supplying `opts.expectedKeyFingerprint` (the legitimate signer's fingerprint,
   * distributed out-of-band) rejects any substituted key, and
   * `opts.expectedHead` rejects truncation/rollback. This is the recommended
   * audit-grade verification policy.
   */
  verify(
    claimId: string,
    opts: VerifyOptions = {},
  ): { ok: boolean; brokenAt?: number; reason?: string } {
    const fp = this.filePath(claimId);
    if (!existsSync(fp)) return { ok: true };

    // R11 / A6 fix — trust anchor: the key this verifier uses must match the
    // out-of-band pin. Defeats "edit file + re-sign with attacker key + swap
    // the co-located public key", which is otherwise fully self-consistent.
    if (opts.expectedKeyFingerprint && this.signerFp !== opts.expectedKeyFingerprint) {
      return { ok: false, reason: "untrusted signer key: fingerprint does not match pinned trust anchor (A6)" };
    }

    const lines = readFileSync(fp, "utf8").trim().split("\n").filter(Boolean);
    let prev = "GENESIS";
    for (let i = 0; i < lines.length; i++) {
      let rec: LedgerRecord;
      try { rec = JSON.parse(lines[i] as string) as LedgerRecord; }
      catch { return { ok: false, brokenAt: i + 1, reason: "invalid JSON" }; }

      const payload = { node: rec.node, prev_hash: rec.prev_hash, signer: rec.signer };
      const bytes = Buffer.from(canonical(payload));
      const expected = sha256hex(bytes);
      if (expected !== rec.entry_hash) {
        return { ok: false, brokenAt: i + 1, reason: "entry_hash mismatch — content altered" };
      }
      if (rec.prev_hash !== prev) {
        return { ok: false, brokenAt: i + 1, reason: `prev_hash mismatch at entry ${i + 1}` };
      }
      // R11 / A6 — signer binding: the fingerprint committed in the signed
      // payload must match the key the verifier is using. Detects key
      // substitution where signer metadata and verifier key are inconsistent
      // (e.g. verifying with the wrong key, or partial re-signing).
      if (rec.signer !== this.signerFp) {
        return { ok: false, brokenAt: i + 1, reason: "signer fingerprint mismatch — key substitution detected (A6)" };
      }
      if (!verifySignature(bytes, rec.sig, this.publicKeyPem)) {
        return { ok: false, brokenAt: i + 1, reason: "signature verification failed" };
      }
      prev = rec.entry_hash;
    }

    // R11 / A6 fix — rollback/truncation: per-entry verification accepts a
    // truncated chain because a prefix of a valid chain is itself valid. The
    // out-of-band head pin (length + Merkle root) closes this.
    if (opts.expectedHead) {
      if (lines.length !== opts.expectedHead.length) {
        return { ok: false, reason: `chain length mismatch — expected ${opts.expectedHead.length}, found ${lines.length} (truncation/rollback) (A6)` };
      }
      const root = merkleRoot(lines.map((l) => (JSON.parse(l) as LedgerRecord).entry_hash));
      if (root !== opts.expectedHead.merkleRoot) {
        return { ok: false, reason: "merkle root mismatch — chain head pin violated (A6)" };
      }
    }

    return { ok: true };
  }

  /**
   * The current chain head: entry count + Merkle root. Record this out-of-band
   * (alongside the signer fingerprint) as the rollback-resistant trust anchor.
   */
  head(claimId: string): { length: number; merkleRoot: string } {
    const fp = this.filePath(claimId);
    if (!existsSync(fp)) return { length: 0, merkleRoot: "EMPTY" };
    const lines = readFileSync(fp, "utf8").trim().split("\n").filter(Boolean);
    const hashes = lines.map((l) => (JSON.parse(l) as LedgerRecord).entry_hash);
    return { length: lines.length, merkleRoot: merkleRoot(hashes) };
  }

  /**
   * Compute Merkle root over all entry_hashes in a claim's chain.
   */
  merkleRootOf(claimId: string): string {
    const fp = this.filePath(claimId);
    if (!existsSync(fp)) return "EMPTY";
    const hashes = readFileSync(fp, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => (JSON.parse(l) as LedgerRecord).entry_hash);
    return merkleRoot(hashes);
  }

  exists(claimId: string): boolean {
    /* c8 ignore start */
    return existsSync(this.filePath(claimId));
    /* c8 ignore end */
  }
}
