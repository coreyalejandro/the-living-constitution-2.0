import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  generateKeypair, appendSignedEntry, verifyLog,
  merkleRoot, inclusionProof, verifyInclusion, leafHashesOf, sha256hex,
} from './evidence-chain.mjs';

function freshLog() {
  const dir = mkdtempSync(join(tmpdir(), 'tlc-evchain-'));
  return join(dir, 'log.jsonl');
}

test('sign + verify roundtrip over a multi-entry log', () => {
  const { publicKeyPem, privateKeyPem } = generateKeypair();
  const log = freshLog();
  appendSignedEntry(log, { event: 'CONTRACT_BOUND', module: 'TLC-SL' }, privateKeyPem);
  appendSignedEntry(log, { event: 'VERIFICATION', invariant: 'INV-001', ok: true }, privateKeyPem);
  appendSignedEntry(log, { event: 'PR_OPENED', number: 1 }, privateKeyPem);
  const r = verifyLog(log, publicKeyPem);
  assert.equal(r.ok, true);
  assert.equal(r.count, 3);
});

test('first entry chains from GENESIS', () => {
  const { privateKeyPem } = generateKeypair();
  const log = freshLog();
  const rec = appendSignedEntry(log, { event: 'X' }, privateKeyPem);
  assert.equal(rec.prev_hash, 'GENESIS');
});

test('content tampering is detected (entry_hash mismatch)', () => {
  const { publicKeyPem, privateKeyPem } = generateKeypair();
  const log = freshLog();
  appendSignedEntry(log, { event: 'A', value: 1 }, privateKeyPem);
  appendSignedEntry(log, { event: 'B', value: 2 }, privateKeyPem);
  const lines = readFileSync(log, 'utf8').trim().split('\n');
  const rec = JSON.parse(lines[1]);
  rec.value = 999; // alter content but keep the old entry_hash + sig
  lines[1] = JSON.stringify(rec);
  writeFileSync(log, lines.join('\n') + '\n');
  const r = verifyLog(log, publicKeyPem);
  assert.equal(r.ok, false);
  assert.equal(r.brokenAt, 2);
});

test('signature tampering is detected', () => {
  const { publicKeyPem, privateKeyPem } = generateKeypair();
  const log = freshLog();
  appendSignedEntry(log, { event: 'A' }, privateKeyPem);
  const lines = readFileSync(log, 'utf8').trim().split('\n');
  const rec = JSON.parse(lines[0]);
  const buf = Buffer.from(rec.sig, 'base64'); buf[0] ^= 0xff; rec.sig = buf.toString('base64');
  lines[0] = JSON.stringify(rec);
  writeFileSync(log, lines.join('\n') + '\n');
  assert.equal(verifyLog(log, publicKeyPem).ok, false);
});

test('reordering entries breaks the chain', () => {
  const { publicKeyPem, privateKeyPem } = generateKeypair();
  const log = freshLog();
  appendSignedEntry(log, { event: 'A' }, privateKeyPem);
  appendSignedEntry(log, { event: 'B' }, privateKeyPem);
  const lines = readFileSync(log, 'utf8').trim().split('\n');
  writeFileSync(log, [lines[1], lines[0]].join('\n') + '\n');
  const r = verifyLog(log, publicKeyPem);
  assert.equal(r.ok, false);
});

test('a different public key fails verification', () => {
  const { privateKeyPem } = generateKeypair();
  const other = generateKeypair().publicKeyPem;
  const log = freshLog();
  appendSignedEntry(log, { event: 'A' }, privateKeyPem);
  assert.equal(verifyLog(log, other).ok, false);
});

test('merkle root is deterministic and inclusion proofs verify', () => {
  const leaves = ['a', 'b', 'c', 'd', 'e'].map(sha256hex);
  const root1 = merkleRoot(leaves);
  const root2 = merkleRoot(leaves);
  assert.equal(root1, root2);
  for (let i = 0; i < leaves.length; i++) {
    const p = inclusionProof(leaves, i);
    assert.equal(p.root, root1);
    assert.equal(verifyInclusion(p.leaf, p.siblings, p.root), true);
  }
});

test('an inclusion proof for the wrong leaf fails', () => {
  const leaves = ['a', 'b', 'c', 'd'].map(sha256hex);
  const p = inclusionProof(leaves, 2);
  const wrongLeaf = sha256hex('00' + sha256hex('z'));
  assert.equal(verifyInclusion(wrongLeaf, p.siblings, p.root), false);
});

test('merkle root over an actual signed log matches its leaves', () => {
  const { privateKeyPem } = generateKeypair();
  const log = freshLog();
  appendSignedEntry(log, { event: 'A' }, privateKeyPem);
  appendSignedEntry(log, { event: 'B' }, privateKeyPem);
  appendSignedEntry(log, { event: 'C' }, privateKeyPem);
  const leaves = leafHashesOf(log);
  assert.equal(leaves.length, 3);
  assert.equal(merkleRoot(leaves).length, 64);
});
