# Evidence Chain v2 — Ed25519 + Merkle (independently verifiable)

`src/core/evidence-chain.mjs` is an **additive** upgrade over `src/core/audit.mjs`. It does
not change or replace the existing SHA-256 `prev_hash` chain — it adds the two properties an
external auditor needs to verify the governance record **offline, without trusting the repo
or its host**:

1. **Authenticity (Ed25519).** Every entry is signed. A verifier holding only the **public**
   key can confirm each entry was produced by the private-key holder and that no field was
   altered after signing.
2. **Commitment (Merkle).** Entries are linked by `prev_hash` (chain) and committed by a
   Merkle root, so any single entry can be proven included with an O(log n) inclusion proof.

Zero dependencies (`node:crypto`, `node:fs`).

## Quick start

```bash
npm run evidence:test                 # 9 tests: sign/verify, tamper detection, Merkle proofs
# verify the committed demo log against its public key:
node src/core/evidence-chain.mjs verify evidence/signed-demo/governance.jsonl evidence/signed-demo/public-key.pem
# Merkle root of a log, and an inclusion proof for entry 0:
node src/core/evidence-chain.mjs root  evidence/signed-demo/governance.jsonl
node src/core/evidence-chain.mjs prove evidence/signed-demo/governance.jsonl 0
```

## Record shape

```
{ ...payload, prev_hash, entry_hash, sig }
```
- `entry_hash` = SHA-256 of `canonical(payload + prev_hash)` (keys sorted recursively).
- `sig` = base64 Ed25519 signature over the same canonical bytes.
- `prev_hash` = previous record's `entry_hash`, or `"GENESIS"` for the first.

`verifyLog(file, publicKeyPem)` recomputes `entry_hash`, checks chain linkage, and verifies
every signature — returning the exact entry index and reason on the first failure. Flipping a
single byte of content, a signature, or reordering entries all fail verification (see tests).

## API

| Function | Purpose |
|---|---|
| `generateKeypair()` | Ed25519 keypair (PEM) |
| `appendSignedEntry(file, entry, privateKeyPem)` | append a signed, chained entry |
| `verifyLog(file, publicKeyPem)` | verify authenticity + integrity + chain |
| `merkleRoot(leafHashes)` / `merkleRootOfLog(file)` | Merkle commitment |
| `inclusionProof(leafHashes, i)` / `verifyInclusion(leaf, siblings, root)` | membership proofs |

## Honest status (complete-claim rule)

- **VERIFIED here:** signing, verification, tamper detection, chain linkage, Merkle root, and
  inclusion proofs — all covered by `npm run evidence:test` (9 tests) and a committed demo log
  that verifies via the CLI.
- **NOT claimed:** this does not retrofit existing `audit.mjs` logs (they remain SHA-256-chained
  but unsigned); it does not establish a key-distribution/PKI or key-rotation scheme; and it
  does not by itself prove *who* the signer is — only that one key signed the chain. Binding a
  key to an identity (e.g. a published fingerprint, sigstore, or a committed allow-list of
  trusted public keys) is the recommended follow-up.
- The committed demo ships the **public key only**. The demo private key is intentionally not
  in the repository.

## Recommended next steps

1. Have `record-evidence` writers sign with a project key and publish the public key /
   fingerprint in the repo and the paper.
2. Anchor the Merkle root per release (e.g. in a signed tag or an external timestamp) so the
   full history is committed at a point in time.
3. Add a trusted-key allow-list so `verifyLog` also answers "signed by an authorized key."
