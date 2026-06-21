/**
 * TLC Evidence Chain Engine — Cryptographic utilities (R7)
 * Ed25519 signatures + SHA-256 + Merkle tree.
 */
import {
  createHash,
  generateKeyPairSync,
  sign as edSign,
  verify as edVerify,
  createPrivateKey,
  createPublicKey,
  type KeyObject,
} from "node:crypto";

// ─── Canonical JSON ───────────────────────────────────────────────────────

/** Deterministic JSON: keys sorted recursively. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + (value as unknown[]).map(canonical).join(",") + "]";
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonical(obj[k])).join(",") + "}";
}

// ─── Hashing ──────────────────────────────────────────────────────────────

export function sha256hex(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

// ─── Key generation ───────────────────────────────────────────────────────

export interface Keypair {
  publicKeyPem: string;
  privateKeyPem: string;
}

export function generateKeypair(): Keypair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKeyPem: publicKey, privateKeyPem: privateKey };
}

// ─── Ed25519 sign / verify ────────────────────────────────────────────────

export function signBytes(bytes: Buffer, privateKeyPem: string): string {
  const key: KeyObject = createPrivateKey(privateKeyPem);
  return edSign(null, bytes, key).toString("base64");
}

export function verifySignature(
  bytes: Buffer,
  sigBase64: string,
  publicKeyPem: string,
): boolean {
  try {
    const key: KeyObject = createPublicKey(publicKeyPem);
    return edVerify(null, bytes, key, Buffer.from(sigBase64, "base64"));
  } catch {
    return false;
  }
}

// ─── Merkle tree (R7) ─────────────────────────────────────────────────────

const LEAF_PREFIX = "00";
const NODE_PREFIX = "01";

export function merkleRoot(leafHashes: string[]): string {
  if (leafHashes.length === 0) return "EMPTY";
  let level = leafHashes.map((h) => sha256hex(LEAF_PREFIX + h));
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i] as string;
      const right = i + 1 < level.length ? (level[i + 1] as string) : left;
      next.push(sha256hex(NODE_PREFIX + left + right));
    }
    level = next;
  }
  return level[0] as string;
}

export interface InclusionProof {
  leaf: string;
  index: number;
  siblings: Array<{ hash: string; side: "left" | "right" }>;
  root: string;
}

export function inclusionProof(leafHashes: string[], index: number): InclusionProof {
  if (index < 0 || index >= leafHashes.length) throw new Error("index out of range");
  let level = leafHashes.map((h) => sha256hex(LEAF_PREFIX + h));
  const leaf = level[index] as string;
  const siblings: InclusionProof["siblings"] = [];
  let idx = index;
  while (level.length > 1) {
    const isRight = idx % 2 === 1;
    const sibIdx = isRight ? idx - 1 : Math.min(idx + 1, level.length - 1);
    siblings.push({
      hash: level[sibIdx] as string,
      side: isRight ? "left" : "right",
    });
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i] as string;
      const right = i + 1 < level.length ? (level[i + 1] as string) : left;
      next.push(sha256hex(NODE_PREFIX + left + right));
    }
    level = next;
    idx = Math.floor(idx / 2);
  }
  return { leaf, index, siblings, root: level[0] as string };
}

export function verifyInclusion(
  leaf: string,
  siblings: InclusionProof["siblings"],
  root: string,
): boolean {
  let h = leaf;
  for (const s of siblings) {
    h = s.side === "left"
      ? sha256hex(NODE_PREFIX + s.hash + h)
      : sha256hex(NODE_PREFIX + h + s.hash);
  }
  return h === root;
}
