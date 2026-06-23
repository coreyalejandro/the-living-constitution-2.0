# Performance & Scaling — TLC Evidence Chain (R12, v2.1)

This document answers the review's open question — *"How does this system perform
when N claims are active, or when the chain reaches millions of entries?"* — with
measured numbers, complexity analysis, identified bottlenecks, and the mitigations
shipped in v2.1.

Two scaling regimes are distinct and must not be conflated:

1. **Formal model (TLC).** Explicit-state model checking is exponential by nature.
   The model is a *bounded abstraction* used to prove the invariants; it is not the
   thing that runs in production.
2. **Runtime (the engine).** What actually executes per action / per ledger entry.
   This is where "millions of entries" and "decisions under load" live.

All numbers reproduced 2026-06-23 on the project sandbox (x86_64 Linux, Node
v24.14.1, single core for the JS benchmarks; TLC on Temurin 21, `-workers auto`).
Raw data: `src/evidence-chain/validation/bench-results.json` and the commands in
**§6**.

---

## 1. Formal model scaling (TLC) — exact closed form

The review noted the committed TLC run is small (484 distinct states). We swept the
model constants and found the reachable state space follows an **exact closed
form**:

> **|States| = 11^C · 2^P**, where C = #claims, P = #operators.

(11 = reachable `(truth-state, chain-length)` pairs per claim; 2^P = reachable
operator-revocation subsets.) Every scope below model-checked clean — **no error,
no deadlock** — so the invariants hold at every measured scale, and the prediction
is exact at each point:

| Claims C | Operators P | distinct states | 11^C·2^P | states generated | depth | wall |
|---:|---:|---:|---:|---:|---:|---:|
| 2 | 2 | 484 | 484 | 1,365 | 13 | 0.9 s |
| 3 | 2 | 5,324 | 5,324 | 19,845 | 18 | 1.3 s |
| 3 | 3 | 10,648 | 10,648 | 59,533 | 19 | 1.5 s |
| 4 | 2 | 58,564 | 58,564 | 271,525 | 23 | 2.0 s |
| 4 | 3 | 117,128 | 117,128 | 814,573 | 24 | 3.4 s |
| 5 | 2 | 644,204 | 644,204 | 3,572,405 | 28 | 8.6 s |

**Interpretation.** State count is exponential in C and P — expected for explicit-
state MC. This is *why* the committed gate uses a small scope: it exhaustively
proves the invariants on a sound bounded abstraction. Because the per-claim
behavior is identical and independent, the closed form generalizes the result
beyond the checked scopes; full unbounded assurance would use an inductive
invariant (TLAPS) — noted as future work in the paper outline. The model checker
is a *design-time* tool; it does not run per request.

---

## 2. Evidence-chain runtime scaling

Measured with `src/evidence-chain/validation/bench.ts`:

| entries | append /op | append total | verify /entry | verify total | Merkle root | incl-proof verify | proof siblings | ledger size |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1,000 | 137.6 µs | 0.14 s | 148 µs | 0.15 s | 6.7 ms | 70 µs | 10 | 0.5 MB |
| 10,000 | 121.5 µs | 1.2 s | 146 µs | 1.5 s | 51.9 ms | 42 µs | 14 | 5.3 MB |
| 100,000 | 116.7 µs | 11.7 s | 141 µs | 14.1 s | 563 ms | 58 µs | 17 | 53.6 MB |
| 1,000,000 | 115.4 µs | 115.4 s | 142 µs | 142.2 s | 6.4 s | ~57 µs | 20 | 459.5 MB |

A **one-million-entry** chain builds in ~115 s and **fully verifies intact in
~142 s**. The complexities:

- **Append — O(1) per entry.** Per-op time is flat (~115–138 µs) from 1k to 1M.
- **Full verify — O(n).** ~142 µs/entry, constant per entry; linear in total.
- **Merkle root — O(n).** Linear in entries.
- **Inclusion-proof verification — O(log n).** Proof size is ⌈log₂N⌉ siblings
  (10→20 from 1k→1M), and verification stays ~57 µs even at 1M entries.

### 2.1 The O(n²) → O(n) append fix

The pre-v2.1 ledger re-read the **entire** JSONL file on every append (to find the
tail hash), making bulk append **O(n²)**. Measured before/after on the same box:

| entries | append total (v2.0, O(n²)) | append total (v2.1, O(1)/op) | speedup |
|---:|---:|---:|---:|
| 2,000 | 1,080 ms | 275 ms | 3.9× |
| 8,000 | 20,481 ms | 960 ms | 21× |
| 16,000 | 75,379 ms | 1,888 ms | **40×** |

At v2.0's rate, a million-entry chain would have taken on the order of *days*; v2.1
does it in ~2 minutes. The fix is an in-memory tail-hash cache
(`ledger.ts` `lastHashCache`), sound under the append-only single-writer model the
ledger already assumes.

---

## 3. Cryptographic primitive floor

The per-entry cost is dominated by signing, not file I/O (5,000-op microbench):

| primitive | per op | throughput |
|---|---:|---:|
| Ed25519 sign | 89.8 µs | 11,136 /s |
| Ed25519 verify | 125.1 µs | 7,992 /s |
| SHA-256 | 0.76 µs | ~1.3 M /s |

So append throughput (~8,700/s) ≈ one Ed25519 signature per entry, and verify
throughput ≈ one verification per entry. This is the hard floor; any large speedup
requires batching/aggregate signatures, not I/O work.

---

## 4. Runtime enforcement latency (PolicyEngine)

"Decisions under load" for the runtime governor (`src/core/policy-engine.js`),
200k-iteration microbench:

| configuration | per decision | throughput |
|---|---:|---:|
| bare engine (halt checks) | 0.15 µs | 6.86 M /s |
| + all 22 TLC-SL invariants | 0.58 µs | 1.73 M /s |

Enforcing the entire constitution on every action adds ~0.43 µs — **>1.7 million
governed decisions/second**. Runtime governance is effectively free; the cost
center is evidence *signing*, not policy evaluation.

---

## 5. Bottlenecks & mitigations

| bottleneck | status | mitigation |
|---|---|---|
| Append O(n²) (full-file read per write) | **fixed in v2.1** | tail-hash cache → O(1)/op |
| Full verify O(n) | inherent (re-checks every signature) | pin the chain **head** (length + Merkle root) and audit only the appended tail; membership is provable in **O(log n)** via inclusion proofs (`inclusionProof`/`verifyInclusion`) without re-verifying the whole chain |
| Storage ~480 B/entry (460 MB at 1M) | linear, expected | per-claim ledger files + periodic rotation; the Merkle root + signed head are a constant-size commitment to an arbitrarily long chain |
| Ed25519 sign/verify floor (~90–125 µs) | inherent to per-entry signatures | batch/aggregate signatures (future work) |
| Concurrent external writers | out of scope | single-writer append-only model (documented) |

The head-pin + inclusion-proof path means an auditor does **not** pay O(n) to trust
a long chain: they verify the signed head once and check any specific entry in
O(log n).

---

## 6. Reproduce

```bash
# Evidence-chain runtime benchmark (writes bench-results.json)
node --import tsx/esm src/evidence-chain/validation/bench.ts 1000 10000 100000
node --import tsx/esm src/evidence-chain/validation/bench.ts 1000000     # millions

# TLA+ state-space scaling (vary the constants in EvidenceChain.cfg)
cd src/evidence-chain/spec
java -cp tla2tools.jar tlc2.TLC EvidenceChain -config EvidenceChain.cfg -workers auto

# Runtime enforcement latency uses src/core/policy-engine.js + tlc-sl loadInvariants()
```
