# The TLC Verification Stack

TLC 2.0's claim is that governance is **verified, not asserted**. Four pieces, all open and
runnable on a clean checkout (zero runtime dependencies), make that concrete — and a CI workflow
re-runs them on every change.

```
            constitution (Articles I–XVI, invariants I1–I8)
                              │  one source of truth
                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  TLC-SL — Constitution as Code                                 │
   │  one invariant definition compiles to:                         │
   │    • runtime enforcement  → src/core/policy-engine.js          │
   │    • exhaustive model check (safety + guard-necessity)         │
   │    • TLA+ export          → checked by TLC in CI               │
   └──────────────────────────────────────────────────────────────┘
        │ decisions + verification results
        ▼
   ┌───────────────────────────────┐     ┌──────────────────────────────┐
   │  Evidence Chain v2            │     │  Probe-Gate (INV-PROBE-001)   │
   │  Ed25519 signatures + Merkle  │     │  rejects any gate that cannot │
   │  → independently verifiable   │     │  fail / pass / discriminate   │
   └───────────────────────────────┘     └──────────────────────────────┘
        │                                       │
        └──────────────► Governance CI ◄────────┘
            re-runs the whole stack on every push/PR
```

## The four pieces

| Piece | What it guarantees | Verify |
|---|---|---|
| **TLC-SL** (`tlc-sl/`) | 22 invariants (the full Article VIII set + INV-060, Article VII/X break-glass) each have one definition that is both enforced at runtime and exhaustively model-checked; the guard on each is proven load-bearing. Closes the spec↔enforcement drift the constitution's V&T statement flagged. | `npm run tlc:sl` → 22/22; `npm run tlc:sl:test` |
| **Evidence Chain v2** (`src/core/evidence-chain.mjs`) | Every evidence entry is Ed25519-signed and Merkle-committed, so a third party can verify the governance record offline with only the public key. | `npm run evidence:test`; `npm run tlc:sl:verify-evidence` |
| **Probe-Gate** (`probe-gate/`) | No "gate that cannot fail" can masquerade as a test — operationalizes `evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md`. | `npm run probe-gate:test` |
| **Governance CI** (`.github/workflows/governance-ci.yml`) | The whole stack re-runs on every push/PR, plus a no-drift check that generated artifacts still match the specs, plus TLC model-checking of the TLA+ exports. | runs on GitHub Actions |

## How the pieces connect

1. **TLC-SL** is the source of truth: one `.tlcsl` file per invariant (or grouped set) compiles to
   the runtime check the Policy Engine runs, the model the in-process checker proves, and the TLA+
   the CI model-checks. `tlc-sl/conformance/report.md` is the generated spec→enforcement→proof map.
2. **TLC-SL writes evidence**, and **Evidence Chain v2 signs it** (`npm run tlc:sl:sign-evidence`),
   producing `evidence/TLC-SL/verification.signed.jsonl` — verifiable against the committed
   `evidence/TLC-SL/evidence-public-key.pem`. The signing private key is never committed.
3. **Probe-Gate** guards the empirical layer: before any governance probe/gate is trusted, it must
   demonstrably be able to fail. This is the necessary (not sufficient) guard against the
   self-confessed failure modes in the governance-harness.
4. **Governance CI** ties it together: a green run means the invariants hold, the tests pass, the
   signed evidence verifies, and the generated artifacts are not stale.

## Honest status

- Verified locally and in CI: TLC-SL checker (22/22), all test suites (35 tests), evidence-chain
  signing/verification, probe-gate.
- The **TLC model-check job** runs in CI and is a **required gate**: TLC reported "No error" on
  all emitted modules on its first run (TLC Governance CI run #2), so the emitted TLA+ is now
  externally model-checked, not merely emitted. The in-process exhaustive checker remains the
  fast, dependency-free proof; TLC is the independent corroboration.
- No Lean 4 target yet. Probe-Gate checks discrimination, not construct validity. Evidence Chain v2
  proves a key signed the chain, not yet *whose* key (identity binding is the next step).
