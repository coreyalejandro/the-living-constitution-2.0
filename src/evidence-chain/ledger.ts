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
} from "./crypto.js";

export type ChainNode = Claim | EvidenceItem | TransitionRecord;

interface LedgerRecord {
  node: ChainNode;
  prev_hash: string;
  entry_hash: string;
  sig: string;
}

export class Ledger {
  constructor(
    private readonly dir: string,
    private readonly privateKeyPem: string,
    private readonly publicKeyPem: string,
  ) {}

  private filePath(claimId: string): string {
    return join(this.dir, `${claimId}.jsonl`);
  }

  private lastHash(claimId: string): string {
    const fp = this.filePath(claimId);
    if (!existsSync(fp)) return "GENESIS";
    const lines = readFileSync(fp, "utf8").trim().split("\n").filter(Boolean);
    /* c8 ignore next 2 */
    if (lines.length === 0) return "GENESIS";
    /* c8 ignore start */
    try {
      return (JSON.parse(lines[lines.length - 1] as string) as LedgerRecord).entry_hash;
    } catch {
      return "GENESIS";
    }
    /* c8 ignore end */
  }

  append(claimId: string, node: ChainNode): LedgerRecord {
    const fp = this.filePath(claimId);
    mkdirSync(dirname(fp), { recursive: true });
    const prev_hash = this.lastHash(claimId);
    const payload = { node, prev_hash };
    const bytes = Buffer.from(canonical(payload));
    const entry_hash = sha256hex(bytes);
    const sig = signBytes(bytes, this.privateKeyPem).toString();
    const record: LedgerRecord = { node, prev_hash, entry_hash, sig };
    appendFileSync(fp, JSON.stringify(record) + "\n");
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
   * Verify the full chain: hash linkage + signatures (R7).
   */
  verify(claimId: string): { ok: boolean; brokenAt?: number; reason?: string } {
    const fp = this.filePath(claimId);
    if (!existsSync(fp)) return { ok: true };
    const lines = readFileSync(fp, "utf8").trim().split("\n").filter(Boolean);
    let prev = "GENESIS";
    for (let i = 0; i < lines.length; i++) {
      let rec: LedgerRecord;
      try { rec = JSON.parse(lines[i] as string) as LedgerRecord; }
      catch { return { ok: false, brokenAt: i + 1, reason: "invalid JSON" }; }

      const payload = { node: rec.node, prev_hash: rec.prev_hash };
      const bytes = Buffer.from(canonical(payload));
      const expected = sha256hex(bytes);
      if (expected !== rec.entry_hash) {
        return { ok: false, brokenAt: i + 1, reason: "entry_hash mismatch — content altered" };
      }
      if (rec.prev_hash !== prev) {
        return { ok: false, brokenAt: i + 1, reason: `prev_hash mismatch at entry ${i + 1}` };
      }
      if (!verifySignature(bytes, rec.sig, this.publicKeyPem)) {
        return { ok: false, brokenAt: i + 1, reason: "signature verification failed" };
      }
      prev = rec.entry_hash;
    }
    return { ok: true };
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
