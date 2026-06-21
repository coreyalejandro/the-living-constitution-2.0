---
document_type: "C-RSP_CONTRACT"
id: "CRSP-EVIDENCE-CHAIN-001"
version: "0.1.0"
status: "Active"
binds_module: "EVIDENCE-CHAIN-V2"
parent_contract: "CRSP-STC-RUNTIME-001"
adoption_tier: "Tier-1-MVG"
author: "agent-produced (requires human acceptance gate before any truth_status upgrade)"
created: "2026-06-21"
---

# C-RSP Build Contract — Evidence Chain v2 (Ed25519 + Merkle)

Binds the `EVIDENCE-CHAIN-V2` module (`src/core/evidence-chain.mjs`). Written to satisfy
Invariant I1 (contract before a module is registered/bound) for code that was added to `main`
under the runtime module but not yet given its own governance binding.

## 1. Objective
Provide an additive, independently-verifiable evidence layer over the existing SHA-256 audit
chain: per-entry Ed25519 signatures, a Merkle commitment, and inclusion proofs, verifiable
offline with only a public key.

## 2. Not Claimed
- Does not replace or retrofit existing `src/core/audit.mjs` logs (those remain unsigned).
- Does not establish a PKI, key-rotation scheme, or identity binding (proves *a* key signed the
  chain, not *whose*).
- No visual understanding layer yet → not eligible for `working` under Invariant I8/INV-050.

## 3. Scope
In: canonicalization, Ed25519 sign/verify, prev_hash chain verification, Merkle root + inclusion
proofs, verifier CLI, the signed TLC-SL evidence demo. Out: identity binding, key management.

## 4. Acceptance Criteria (with V&T)
- **AC-1** `npm run evidence:test` → 9/9 pass. V&T: VERIFIED (run in CI + locally).
- **AC-2** Tamper (content/signature/reorder) fails verification. V&T: VERIFIED (test suite).
- **AC-3** `npm run tlc:sl:verify-evidence` verifies the signed TLC-SL log. V&T: VERIFIED.

## 5. Halt Conditions
`HALT_SIGNATURE_INVALID`, `HALT_CHAIN_BROKEN` — verification returns the failing entry index.

## 6. V&T Statement — CRSP-EVIDENCE-CHAIN-001
| Field | Value |
|---|---|
| **What** | The Ed25519 + Merkle evidence layer and its verifier. |
| **True** | 9/9 tests pass; signed TLC-SL evidence (29 entries) verifies; CI runs it. |
| **Unverified** | No identity binding / PKI; no visual layer; existing audit.mjs logs not retrofitted. |
| **Not Claimed** | See §2. |
| **Functional Status** | PARTIAL — verified core; no visual layer (INV-050 bars `working`). |
| **Evidence Ref** | `src/core/evidence-chain.test.mjs`, `evidence/signed-demo/`, `evidence/TLC-SL/verification.signed.jsonl` |
