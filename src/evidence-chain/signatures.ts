/**
 * TLC Evidence Chain Engine — Operator keyring (R8)
 * Stores, retrieves, and validates operator public keys.
 * All HITL evidence items must be verified through this module.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { OperatorKey } from "./types.js";
import { verifySignature, signBytes, canonical } from "./crypto.js";

export class OperatorKeyring {
  private keys: Map<string, OperatorKey> = new Map();

  constructor(private readonly storagePath: string) {
    this.load();
  }

  private load(): void {
    if (!existsSync(this.storagePath)) return;
    try {
      const raw = readFileSync(this.storagePath, "utf8");
      const entries = JSON.parse(raw) as OperatorKey[];
      for (const k of entries) this.keys.set(k.id, k);
    } catch {
      // corrupted store — start fresh
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.storagePath), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify([...this.keys.values()], null, 2),
    );
  }

  register(key: OperatorKey): void {
    const existing = this.keys.get(key.id);
    if (existing && !existing.revoked) {
      throw new Error(`Operator key '${key.id}' already registered and active.`);
    }
    this.keys.set(key.id, key);
    this.persist();
  }

  revoke(id: string): void {
    const existing = this.keys.get(id);
    if (!existing) throw new Error(`Operator key '${id}' not found.`);
    this.keys.set(id, { ...existing, revoked: true });
    this.persist();
  }

  get(id: string): OperatorKey | undefined {
    return this.keys.get(id);
  }

  getActive(id: string): OperatorKey {
    const k = this.keys.get(id);
    if (!k) throw new Error(`Operator '${id}' not registered.`);
    if (k.revoked) throw new Error(`Operator '${id}' key is revoked.`);
    return k;
  }

  /**
   * Verify a HITL evidence item's Ed25519 signature.
   * Payload signed is: canonical({ id, kind, path, hash, provenance,
   *   createdAt, operator, machineReadable, supportsClaimIds }).
   */
  verifyHITL(operatorId: string, payload: unknown, sigBase64: string): boolean {
    const key = this.getActive(operatorId);
    const bytes = Buffer.from(canonical(payload));
    return verifySignature(bytes, sigBase64, key.publicKeyPem);
  }

  all(): OperatorKey[] {
    return [...this.keys.values()];
  }
}

/**
 * Produce a HITL signature over a canonical payload.
 * Use this when preparing an EvidenceItem of kind HITL.
 */
export function createHITLSignature(
  payload: unknown,
  privateKeyPem: string,
): string {
  const bytes = Buffer.from(canonical(payload));
  return signBytes(bytes, privateKeyPem);
}
