/**
 * TLC Evidence Chain Engine — ArtifactVault (spec §11.C)
 *
 * Phase 7 stub. The vault stores backing artifact files keyed by their
 * sha256 content hash. In production this would write to an immutable
 * content-addressable store; here it writes to a local directory.
 *
 * The interface is intentionally minimal so later implementations (S3,
 * IPFS, Git LFS) can drop in without changing callers.
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

// ── Public interface ──────────────────────────────────────────────────────

export interface VaultEntry {
  /** sha256 hex digest of the stored content */
  readonly hash: string;
  /** Original filename hint (not used as a key — hash is the key) */
  readonly filename: string;
  /** Byte size of the stored artifact */
  readonly size: number;
  /** ISO-8601 */
  readonly storedAt: string;
  /** Operator who deposited the artifact */
  readonly operator: string;
}

export interface IArtifactVault {
  /** Store raw bytes; returns the sha256 hash (content address). */
  store(content: Buffer, filename: string, operator: string): string;
  /** Retrieve artifact by hash. Returns undefined if not present. */
  retrieve(hash: string): Buffer | undefined;
  /** Check whether a hash is present in the vault. */
  has(hash: string): boolean;
  /** Return the VaultEntry metadata for a hash. */
  meta(hash: string): VaultEntry | undefined;
  /** List all stored artifacts. */
  list(): VaultEntry[];
}

// ── Filesystem implementation ─────────────────────────────────────────────

export class ArtifactVault implements IArtifactVault {
  private readonly dataDir: string;
  private readonly metaDir: string;

  constructor(private readonly vaultDir: string) {
    this.dataDir = join(vaultDir, "data");
    this.metaDir = join(vaultDir, "meta");
    mkdirSync(this.dataDir, { recursive: true });
    mkdirSync(this.metaDir, { recursive: true });
  }

  store(content: Buffer, filename: string, operator: string): string {
    const hash = createHash("sha256").update(content).digest("hex");
    const dataPath = join(this.dataDir, hash);
    const metaPath = join(this.metaDir, `${hash}.json`);

    if (!existsSync(dataPath)) {
      writeFileSync(dataPath, content);
    }
    if (!existsSync(metaPath)) {
      const entry: VaultEntry = {
        hash,
        filename,
        size: content.length,
        storedAt: new Date().toISOString(),
        operator,
      };
      writeFileSync(metaPath, JSON.stringify(entry, null, 2));
    }
    return hash;
  }

  retrieve(hash: string): Buffer | undefined {
    const p = join(this.dataDir, hash);
    if (!existsSync(p)) return undefined;
    return readFileSync(p);
  }

  has(hash: string): boolean {
    return existsSync(join(this.dataDir, hash));
  }

  meta(hash: string): VaultEntry | undefined {
    const p = join(this.metaDir, `${hash}.json`);
    if (!existsSync(p)) return undefined;
    try {
      return JSON.parse(readFileSync(p, "utf8")) as VaultEntry;
    } catch {
      return undefined;
    }
  }

  list(): VaultEntry[] {
    try {
      return readdirSync(this.metaDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => {
          try {
            return JSON.parse(
              readFileSync(join(this.metaDir, f), "utf8"),
            ) as VaultEntry;
          } catch {
            return null;
          }
        })
        .filter((e): e is VaultEntry => e !== null);
    } catch {
      return [];
    }
  }
}
