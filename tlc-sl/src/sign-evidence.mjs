#!/usr/bin/env node
/**
 * tlc-sl/src/sign-evidence.mjs
 * Bridge: sign the TLC-SL verification evidence with evidence-chain v2 (Ed25519 + Merkle),
 * so the TLC-SL governance record is independently verifiable by a holder of the public key.
 *
 * Reads the existing hash-chained verification.jsonl, re-emits each entry as an Ed25519-signed,
 * prev_hash-chained record into verification.signed.jsonl.
 *
 * Usage:
 *   # one-time keygen + sign (private key written OUTSIDE the repo; only the public key is committed)
 *   node tlc-sl/src/sign-evidence.mjs --keygen \
 *     --private-key /abs/outside/repo/tlc-evidence-private-key.pem \
 *     --public-key  evidence/TLC-SL/evidence-public-key.pem
 *
 *   # sign with an existing key (e.g. in CI, key provided via a secret file)
 *   TLC_EVIDENCE_PRIVATE_KEY=/path/key.pem node tlc-sl/src/sign-evidence.mjs
 *
 * Verify:
 *   node src/core/evidence-chain.mjs verify evidence/TLC-SL/verification.signed.jsonl evidence/TLC-SL/evidence-public-key.pem
 */

import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateKeypair, appendSignedEntry, verifyLog, merkleRootOfLog } from '../../src/core/evidence-chain.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : dflt;
}
const hasFlag = (name) => process.argv.includes(name);

const IN = resolve(REPO_ROOT, arg('--in', 'evidence/TLC-SL/verification.jsonl'));
const OUT = resolve(REPO_ROOT, arg('--out', 'evidence/TLC-SL/verification.signed.jsonl'));
const PUB = resolve(REPO_ROOT, arg('--public-key', 'evidence/TLC-SL/evidence-public-key.pem'));
let privPath = arg('--private-key', process.env.TLC_EVIDENCE_PRIVATE_KEY || '');

if (hasFlag('--keygen')) {
  if (!privPath) { console.error('ERROR: --keygen requires --private-key <path>'); process.exit(2); }
  const { publicKeyPem, privateKeyPem } = generateKeypair();
  mkdirSync(dirname(privPath), { recursive: true });
  writeFileSync(privPath, privateKeyPem);
  mkdirSync(dirname(PUB), { recursive: true });
  writeFileSync(PUB, publicKeyPem);
  console.log(`Generated keypair. Public key -> ${PUB} (commit this). Private key -> ${privPath} (DO NOT commit).`);
}

if (!privPath || !existsSync(privPath)) {
  console.error('ERROR: no private key. Pass --private-key <path> or set TLC_EVIDENCE_PRIVATE_KEY (or run with --keygen).');
  process.exit(2);
}
if (!existsSync(IN)) { console.error(`ERROR: source evidence not found: ${IN}`); process.exit(2); }

const privateKeyPem = readFileSync(privPath, 'utf8');

// Re-sign from scratch (idempotent): the signed log is a fresh, independently-verifiable view.
if (existsSync(OUT)) rmSync(OUT);

const lines = readFileSync(IN, 'utf8').trim().split('\n').filter(Boolean);
let n = 0;
for (const line of lines) {
  let entry;
  try { entry = JSON.parse(line); } catch { continue; }
  // Drop the unsigned chain's own prev_hash; evidence-chain re-chains + signs.
  const { prev_hash, ...payload } = entry;
  appendSignedEntry(OUT, payload, privateKeyPem);
  n++;
}

const publicKeyPem = readFileSync(PUB, 'utf8');
const v = verifyLog(OUT, publicKeyPem);
console.log(`Signed ${n} entries -> ${OUT.replace(REPO_ROOT + '/', '')}`);
console.log(`Verify: ${JSON.stringify(v)}`);
console.log(`Merkle root: ${merkleRootOfLog(OUT)}`);
if (!v.ok) process.exit(1);
