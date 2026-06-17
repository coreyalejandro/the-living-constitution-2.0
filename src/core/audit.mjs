/**
 * src/core/audit.mjs
 * TLC 2.0 — Shared audit log writer with hash chain support (I9)
 *
 * All TLC scripts that write audit log entries MUST use appendAuditEntry()
 * from this module. This ensures every entry carries a prev_hash that links
 * it to the entry before it. Any deletion of an entry breaks the chain and
 * is detectable by tlc-audit-retention.mjs on the very first run with no
 * external state — no checkpoint, no git history required.
 *
 * Hash algorithm: SHA-256 of the raw JSON line (trimmed), stored as hex.
 * First entry in any log uses prev_hash: 'GENESIS'.
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { createHash } from 'crypto';

/**
 * sha256(str) → hex string
 */
export function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

/**
 * hashForEntry(rawLine)
 * Returns the SHA-256 hex of a raw JSON line as it appears in the log file.
 * This is what the NEXT entry stores as its prev_hash.
 */
export function hashForEntry(rawLine) {
  return sha256(rawLine.trim());
}

/**
 * appendAuditEntry(filePath, entry)
 *
 * Reads the last committed line of the log at filePath (if any) to compute
 * prev_hash, then appends the new entry as a JSON line.
 *
 * Thread safety: this is append-only and single-process; no locking needed
 * for the TLC single-operator use case.
 */
export function appendAuditEntry(filePath, entry) {
  mkdirSync(dirname(filePath), { recursive: true });

  let prevHash = 'GENESIS';
  if (existsSync(filePath)) {
    const lines = readFileSync(filePath, 'utf8')
      .trim().split('\n').filter(Boolean);
    if (lines.length > 0) {
      prevHash = hashForEntry(lines[lines.length - 1]);
    }
  }

  const record = { ...entry, prev_hash: prevHash };
  appendFileSync(filePath, JSON.stringify(record) + '\n');
}

/**
 * verifyChain(filePath)
 *
 * Returns { ok: true } or { ok: false, brokenAt: number, expected: string, actual: string }
 * Entries without prev_hash are treated as legacy (pre-chain) entries and skipped.
 * The first chained entry with prev_hash === 'GENESIS' is accepted regardless of position.
 */
export function verifyChain(filePath) {
  if (!existsSync(filePath)) return { ok: true, skipped: true };

  const rawLines = readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean);
  if (rawLines.length === 0) return { ok: true, empty: true };

  const parsed = rawLines.map((raw, idx) => {
    try { return { idx, raw, entry: JSON.parse(raw) }; }
    catch { return { idx, raw, entry: null }; }
  });

  for (const { idx, raw, entry } of parsed) {
    if (!entry || entry.prev_hash === undefined) continue; // legacy entry
    if (entry.prev_hash === 'GENESIS') continue;           // chain anchor

    const expected = hashForEntry(rawLines[idx - 1]);
    if (entry.prev_hash !== expected) {
      return {
        ok: false,
        brokenAt: idx + 1, // 1-indexed for humans
        expected: expected.slice(0, 16) + '…',
        actual: String(entry.prev_hash).slice(0, 16) + '…',
      };
    }
  }

  return { ok: true };
}
