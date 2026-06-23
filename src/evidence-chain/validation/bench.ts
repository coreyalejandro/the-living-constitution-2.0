/**
 * TLC Evidence Chain — Performance Benchmark (R12, v2.1)
 *
 * Answers the "how does it scale?" question for the *runtime* (as opposed to the
 * bounded TLC model): append throughput, full-chain verification, Merkle-root
 * construction, and O(log n) inclusion-proof membership audit, measured at
 * increasing ledger sizes.
 *
 * Run (CI default sizes):  node --import tsx/esm src/evidence-chain/validation/bench.ts
 * Run (custom sizes):      node --import tsx/esm src/evidence-chain/validation/bench.ts 1000 10000 100000 1000000
 *
 * Writes src/evidence-chain/validation/bench-results.json for the audit trail.
 */
import { mkdtempSync, writeFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Ledger,
  generateKeypair,
  merkleRoot,
  inclusionProof,
  verifyInclusion,
  signBytes,
  verifySignature,
  sha256hex,
} from "../index.js";
import type { Claim } from "../index.js";

const sizes = process.argv.slice(2).map(Number).filter((n) => n > 0);
const SIZES = sizes.length ? sizes : [1_000, 10_000, 100_000];

const { publicKeyPem, privateKeyPem } = generateKeypair();

function node(i: number): Claim {
  return {
    id: `claim-${i}`, title: `n${i}`, description: "benchmark node",
    domainTags: ["bench"], createdAt: "2026-01-01T00:00:00.000Z",
    operator: "bench-op", state: "PROPOSED", applicableRuleIds: [],
  };
}

interface SizeResult {
  entries: number;
  append_total_ms: number;
  append_per_op_us: number;
  append_throughput_per_s: number;
  verify_total_ms: number;
  verify_per_entry_us: number;
  merkle_root_ms: number;
  inclusion_proof_siblings: number;
  inclusion_proof_gen_us: number;
  inclusion_proof_verify_us: number;
  ledger_bytes: number;
}

const results: SizeResult[] = [];

for (const N of SIZES) {
  const dir = mkdtempSync(join(tmpdir(), "tlc-bench-"));
  const ledger = new Ledger(dir, privateKeyPem, publicKeyPem);
  const claimId = "bench";

  // ── Append throughput (expect O(1) per op after the v2.1 tail-hash cache) ──
  const a0 = performance.now();
  for (let i = 0; i < N; i++) ledger.append(claimId, node(i));
  const a1 = performance.now();
  const appendTotal = a1 - a0;

  // ── Full-chain verification (O(n): every entry's hash + signature) ────────
  const v0 = performance.now();
  const vr = ledger.verify(claimId);
  const v1 = performance.now();
  if (!vr.ok) throw new Error(`verify failed at N=${N}: ${vr.reason}`);
  const verifyTotal = v1 - v0;

  // ── Merkle root over all entry hashes (O(n)) ──────────────────────────────
  const m0 = performance.now();
  const head = ledger.head(claimId);
  const m1 = performance.now();

  // ── Inclusion proof for a middle entry (O(log n) — sublinear membership) ──
  // Rebuild the leaf set to exercise the proof primitives directly.
  const leaves = Array.from({ length: N }, (_, i) => sha256hex(`leaf-${i}`));
  const idx = Math.floor(N / 2);
  const p0 = performance.now();
  const proof = inclusionProof(leaves, idx);
  const p1 = performance.now();
  const ok = verifyInclusion(proof.leaf, proof.siblings, proof.root);
  const p2 = performance.now();
  if (!ok) throw new Error(`inclusion proof failed at N=${N}`);

  const bytes = statSync(join(dir, `${claimId}.jsonl`)).size;

  results.push({
    entries: N,
    append_total_ms: +appendTotal.toFixed(1),
    append_per_op_us: +((appendTotal / N) * 1000).toFixed(2),
    append_throughput_per_s: Math.round(N / (appendTotal / 1000)),
    verify_total_ms: +verifyTotal.toFixed(1),
    verify_per_entry_us: +((verifyTotal / N) * 1000).toFixed(2),
    merkle_root_ms: +(m1 - m0).toFixed(2),
    inclusion_proof_siblings: proof.siblings.length,
    inclusion_proof_gen_us: +((p1 - p0) * 1000).toFixed(2),
    inclusion_proof_verify_us: +((p2 - p1) * 1000).toFixed(2),
    ledger_bytes: bytes,
  });
  void head;
}

// ── Ed25519 / SHA-256 primitive microbench (the per-op floor) ───────────────
const MB = 5_000;
const msg = Buffer.from("the quick brown fox governance evidence entry payload");
const s0 = performance.now();
let sig = "";
for (let i = 0; i < MB; i++) sig = signBytes(msg, privateKeyPem);
const s1 = performance.now();
for (let i = 0; i < MB; i++) verifySignature(msg, sig, publicKeyPem);
const s2 = performance.now();
const h0 = performance.now();
for (let i = 0; i < MB; i++) sha256hex(msg);
const h1 = performance.now();

const primitives = {
  ed25519_sign_per_op_us: +(((s1 - s0) / MB) * 1000).toFixed(2),
  ed25519_sign_ops_per_s: Math.round(MB / ((s1 - s0) / 1000)),
  ed25519_verify_per_op_us: +(((s2 - s1) / MB) * 1000).toFixed(2),
  ed25519_verify_ops_per_s: Math.round(MB / ((s2 - s1) / 1000)),
  sha256_per_op_us: +(((h1 - h0) / MB) * 1000).toFixed(2),
};

const out = {
  run_at: new Date().toISOString(),
  node: process.version,
  sizes: SIZES,
  results,
  primitives,
  notes: [
    "append is O(1) per entry (v2.1 tail-hash cache); pre-v2.1 it was O(n) per entry -> O(n^2) bulk.",
    "full verify is O(n) by design (re-checks every signature); use the pinned head + O(log n) inclusion proofs for incremental/membership audit.",
    "per-op floor is dominated by Ed25519 signing, not file I/O.",
  ],
};

console.log(JSON.stringify(out, null, 2));
const outPath = new URL("./bench-results.json", import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`\nBenchmark results written: ${outPath}`);
