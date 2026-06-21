/**
 * src/core/evidence-chain.mjs
 * TLC 2.1 — Independently-verifiable evidence chain (Ed25519 + Merkle).
 *
 * This is an ADDITIVE upgrade over src/core/audit.mjs. It does not modify or
 * replace the existing SHA-256 prev_hash chain; it layers two properties on top
 * so a third party can verify the governance record OFFLINE, without trusting
 * the repo or its host:
 *
 *   1. Authenticity — every entry is signed with Ed25519. A verifier holding
 *      only the PUBLIC key can confirm each entry was produced by the holder of
 *      the private key, and that no field was altered after signing.
 *   2. Tamper-evidence + commitment — entries are linked by prev_hash (chain),
 *      AND a Merkle root commits to the whole set so any single entry can be
 *      proven included with an O(log n) inclusion proof.
 *
 * Zero dependencies (node:crypto, node:fs only).
 *
 * Record shape (one JSON object per line):
 *   { ...payload, prev_hash, entry_hash, sig }
 *   - payload   : the caller's entry fields
 *   - prev_hash : entry_hash of the previous record, or "GENESIS"
 *   - entry_hash: sha256 hex of canonical(payload + prev_hash)
 *   - sig       : base64 Ed25519 signature over the same canonical bytes
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  createHash, generateKeyPairSync, sign as edSign, verify as edVerify,
  createPrivateKey, createPublicKey,
} from 'node:crypto';

/* ---------------- canonicalization + hashing ---------------- */

/** Deterministic JSON: object keys sorted recursively. */
export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

export function sha256hex(input) {
  return createHash('sha256').update(input).digest('hex');
}

function payloadOf(record) {
  const { entry_hash, sig, ...payload } = record;
  return payload;
}

/* ---------------- keys ---------------- */

export function generateKeypair() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKeyPem: publicKey, privateKeyPem: privateKey };
}

/* ---------------- append ---------------- */

function lastEntryHash(filePath) {
  if (!existsSync(filePath)) return 'GENESIS';
  const lines = readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length === 0) return 'GENESIS';
  try {
    return JSON.parse(lines[lines.length - 1]).entry_hash || 'GENESIS';
  } catch {
    return 'GENESIS';
  }
}

/**
 * Append a signed, chained entry. Returns the written record.
 */
export function appendSignedEntry(filePath, entry, privateKeyPem) {
  mkdirSync(dirname(filePath), { recursive: true });
  const prev_hash = lastEntryHash(filePath);
  const payload = { ...entry, prev_hash };
  const bytes = Buffer.from(canonical(payload));
  const entry_hash = sha256hex(bytes);
  const key = createPrivateKey(privateKeyPem);
  const sig = edSign(null, bytes, key).toString('base64');
  const record = { ...payload, entry_hash, sig };
  appendFileSync(filePath, JSON.stringify(record) + '\n');
  return record;
}

/* ---------------- verification ---------------- */

/**
 * Verify authenticity + integrity + chain linkage of a signed log.
 * Returns { ok:true, count } or { ok:false, brokenAt, reason }.
 */
export function verifyLog(filePath, publicKeyPem) {
  if (!existsSync(filePath)) return { ok: true, empty: true, count: 0 };
  const lines = readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length === 0) return { ok: true, empty: true, count: 0 };

  const key = createPublicKey(publicKeyPem);
  let prev = 'GENESIS';

  for (let i = 0; i < lines.length; i++) {
    let record;
    try { record = JSON.parse(lines[i]); }
    catch { return { ok: false, brokenAt: i + 1, reason: 'invalid JSON' }; }

    const payload = payloadOf(record);
    const bytes = Buffer.from(canonical(payload));

    const recomputed = sha256hex(bytes);
    if (recomputed !== record.entry_hash) {
      return { ok: false, brokenAt: i + 1, reason: 'entry_hash mismatch (content altered)' };
    }
    if (payload.prev_hash !== prev) {
      return { ok: false, brokenAt: i + 1, reason: `prev_hash mismatch (expected ${prev.slice(0, 12)}…)` };
    }
    let sigOk = false;
    try { sigOk = edVerify(null, bytes, key, Buffer.from(record.sig, 'base64')); }
    catch { sigOk = false; }
    if (!sigOk) {
      return { ok: false, brokenAt: i + 1, reason: 'signature verification failed' };
    }
    prev = record.entry_hash;
  }
  return { ok: true, count: lines.length };
}

/* ---------------- Merkle tree ---------------- */

const LEAF = '00';
const NODE = '01';

export function merkleRoot(leafHashes) {
  if (!leafHashes.length) return 'EMPTY';
  let level = leafHashes.map((h) => sha256hex(LEAF + h));
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i]; // duplicate last if odd
      next.push(sha256hex(NODE + left + right));
    }
    level = next;
  }
  return level[0];
}

/** Inclusion proof for leaf at index. Returns { leaf, index, siblings:[{hash,side}], root }. */
export function inclusionProof(leafHashes, index) {
  if (index < 0 || index >= leafHashes.length) throw new Error('index out of range');
  let level = leafHashes.map((h) => sha256hex(LEAF + h));
  const leaf = level[index];
  const siblings = [];
  let idx = index;
  while (level.length > 1) {
    const isRight = idx % 2 === 1;
    const sibIdx = isRight ? idx - 1 : Math.min(idx + 1, level.length - 1);
    siblings.push({ hash: level[sibIdx], side: isRight ? 'left' : 'right' });
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i];
      next.push(sha256hex(NODE + left + right));
    }
    level = next;
    idx = Math.floor(idx / 2);
  }
  return { leaf, index, siblings, root: level[0] };
}

export function verifyInclusion(leaf, siblings, root) {
  let h = leaf;
  for (const s of siblings) {
    h = s.side === 'left' ? sha256hex(NODE + s.hash + h) : sha256hex(NODE + h + s.hash);
  }
  return h === root;
}

export function leafHashesOf(filePath) {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean)
    .map((l) => JSON.parse(l).entry_hash);
}

export function merkleRootOfLog(filePath) {
  return merkleRoot(leafHashesOf(filePath));
}

/* ---------------- CLI ---------------- */

function main(argv) {
  const [cmd, ...rest] = argv.slice(2);
  if (cmd === 'verify') {
    const [log, pub] = rest;
    if (!log || !pub) { console.error('usage: verify <log.jsonl> <public-key.pem>'); process.exit(2); }
    const r = verifyLog(log, readFileSync(pub, 'utf8'));
    if (r.ok) { console.log(`OK — ${r.count || 0} entries verified (signatures + chain).`); process.exit(0); }
    console.error(`FAIL — entry ${r.brokenAt}: ${r.reason}`); process.exit(1);
  } else if (cmd === 'root') {
    const [log] = rest;
    if (!log) { console.error('usage: root <log.jsonl>'); process.exit(2); }
    console.log(merkleRootOfLog(log));
  } else if (cmd === 'prove') {
    const [log, idx] = rest;
    if (!log || idx === undefined) { console.error('usage: prove <log.jsonl> <index>'); process.exit(2); }
    const leaves = leafHashesOf(log);
    const proof = inclusionProof(leaves, Number(idx));
    const ok = verifyInclusion(proof.leaf, proof.siblings, proof.root);
    console.log(JSON.stringify({ ...proof, verified: ok }, null, 2));
  } else if (cmd === 'keygen') {
    const outDir = rest[0] || '.';
    mkdirSync(outDir, { recursive: true });
    const { publicKeyPem, privateKeyPem } = generateKeypair();
    writeFileSync(`${outDir}/public-key.pem`, publicKeyPem);
    writeFileSync(`${outDir}/private-key.pem`, privateKeyPem);
    console.log(`Wrote ${outDir}/public-key.pem and ${outDir}/private-key.pem`);
    console.log('Keep private-key.pem OUT of version control.');
  } else {
    console.error('commands: verify <log> <pub> | root <log> | prove <log> <index> | keygen [dir]');
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
