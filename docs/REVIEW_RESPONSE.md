# Response to the External Review (v2.1)

The review graded the evidence-chain audit package **A+ on technical depth,
verification rigor, and honesty**, with one **B+ on narrative/framing**, and listed
three "Areas for Refinement." This document maps each recommendation to what was
done and the evidence — under the project's complete-claim rule (every "done" maps
to a command run with recorded output).

## The three recommendations

### 1. Narrative / Novelty (the B+ → addressed)
> "The artifacts prove *it works* but don't state the unique intellectual
> contribution vs. existing projects (e.g. blockchain, distributed ledgers)."

- **[docs/NOVELTY.md](NOVELTY.md)** — states the contribution (one invariant
  definition simultaneously proved + enforced + recorded), with an explicit
  blockchain/DLT contrast table (why it is neither needed nor sufficient here) and
  honest prior-art positioning vs. CSL-Core, AGENL, FORGE, OPA/Rego, QuadSentinel.
- **README** now has a "High-Assurance Evidence Chain (the Audit Package)" section
  giving the artifacts a high-level home and narrative.

### 2. Scaling & Performance (addressed with measured data)
> "TLC run is small (484 states). How does it perform at N claims / millions of
> entries? Bottlenecks under load?"

- **[docs/PERFORMANCE.md](PERFORMANCE.md)** + `src/evidence-chain/validation/bench.ts`
  + `bench-results.json`.
- **TLA+ scaling:** swept constants; reachable state space is the exact closed form
  **`11^C · 2^P`**, re-confirmed clean (no error) from 484 → **644,204** states.
- **Bottleneck found & fixed:** append was **O(n²)** (full-file read per write) —
  16k entries took 75 s. Fixed with an O(1) tail-hash cache → **40× faster**; a
  **1,000,000-entry** chain now builds in ~115 s and **fully verifies in ~142 s**.
- **Complexities:** append O(1)/entry, verify O(n), Merkle O(n), inclusion-proof
  verification **O(log n)**; runtime enforcement **>1.7 M decisions/s**.

### 3. Open vulnerability A6 (OPEN → CLOSED in v2.1)
> "A6 ('signature forgery bypass via file edit') is critical; 'OPEN' is not
> acceptable. Fix it in a documented v2.1."

- **[docs/SECURITY-A6-DISCLOSURE.md](SECURITY-A6-DISCLOSURE.md)** — full disclosure:
  the narrow v2.0 test masked the real attack (re-sign forged content under a
  substituted key); root cause (trust not anchored out-of-band); fix; residual risk.
- **Fix:** signer-key fingerprint bound into every signed entry; `verify()` accepts
  a pinned signer fingerprint and pinned chain head (`crypto.ts`, `ledger.ts`,
  `engine.ts`). Closes A6 **and** the related tail-truncation/rollback gap.
- **Proof:** red-team vectors **A10** (trust-root swap) and **A11** (truncation)
  record `unpinned verify ok=true` (gap is real) then `pinned verify` rejects (fix
  works). Red-team is now **11/11 BLOCKED**; a disclosure-grade unit test asserts
  both halves.

## Fidelity reconciliations (so the A+ artifacts are actually accurate)

The review's A+ rests on the audit artifacts being exact. While grounding in the
repo, these defects were found and corrected:

- **Traceability matrix cross-references were broken** — it cited crypto tests at
  "§1" (actually §5), red-team at "§6" (§8), property-based at "§5" (§7), and an
  `implemented_in: red-team-report.md` that **never existed** (the file is `.json`).
  `traceability-matrix.yaml` is re-synced to the real `engine.test.ts` sections, the
  test count corrected (73 → 87), and **R11** (A6 fix) and **R12** (performance)
  added.
- **R1 status was stale** (`SPEC_WRITTEN_PENDING_TLC_RUN`) though TLC had run →
  `VERIFIED_BY_TLC` with the scaling result.
- **CI gap closed:** the TypeScript audit package (the graded artifacts) was **not**
  in CI. A new `evidence-chain` job runs the engine test suite + 100% c8 coverage,
  the red-team runner (fails on any bypass), empirical validation, the benchmark,
  and TLC on `EvidenceChain.tla` — so the rigor is continuously enforced, not a
  one-time snapshot.

## Strengths preserved (per the review)

Formal methods (TLA+), property-based testing, 100% coverage, red-teaming, and the
honest vulnerability disclosure remain intact and are now wired into CI. Nothing in
the A+ surface was weakened; the B+ surface (narrative) is raised and the open
vulnerability is closed.

## Verify it yourself

```bash
node --import tsx/esm --test src/evidence-chain/engine.test.ts          # 87/87
node --import tsx/esm src/evidence-chain/validation/red-team-run.ts     # 11/11 BLOCKED
node --import tsx/esm src/evidence-chain/validation/empirical-run.ts    # 3/3 VALIDATED
node --import tsx/esm src/evidence-chain/validation/bench.ts            # performance
node_modules/.bin/c8 --include='src/evidence-chain/*.ts' --exclude='src/evidence-chain/*.test.ts' \
  --check-coverage --branches 100 --reporter=text \
  node --import tsx/esm --test src/evidence-chain/engine.test.ts        # 100% branch
```
