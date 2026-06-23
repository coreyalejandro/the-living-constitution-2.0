# Trust Anchors (A6 / R11)

These are the **out-of-band pinned signer fingerprints** for the committed evidence
logs. A fingerprint is `SHA-256(SPKI/DER)` of the signing public key — stable across
PEM whitespace and independent of any attacker-editable log bytes.

Verification **fails closed** without one of these pins: a file-system adversary who
edits a log can also swap the co-located `*.pem`, so the verifier must trust the key
through a channel the attacker does not control. This file is that channel — it lives
in version control, so the canonical values come from the repo's git history (and, for
the strongest guarantee, a signed release tag), not from the log's own directory.

| Evidence log | Public key | Pinned fingerprint (SHA-256 of SPKI/DER) |
|---|---|---|
| `evidence/TLC-SL/verification.signed.jsonl` | `evidence/TLC-SL/evidence-public-key.pem` | `86830b85ea407ff97cdf2b888760142da9a27ad9e796eeff151ca36a5d285308` |
| `evidence/signed-demo/governance.jsonl` | `evidence/signed-demo/public-key.pem` | `9c62f3edc076bdf584f72e82c5776f989c102d9aa12dc9dec34349f86842803d` |

## Verify (pinned — the only accepted mode)

```bash
# Re-derive a fingerprint from a TRUSTED copy of the key:
node src/core/evidence-chain.mjs fingerprint evidence/TLC-SL/evidence-public-key.pem

# Verify the log against the pinned fingerprint (3rd arg). Refuses without it.
node src/core/evidence-chain.mjs verify \
  evidence/TLC-SL/verification.signed.jsonl \
  evidence/TLC-SL/evidence-public-key.pem \
  86830b85ea407ff97cdf2b888760142da9a27ad9e796eeff151ca36a5d285308

# Optional rollback protection: also pin the head (length + Merkle root) for a
# frozen-snapshot audit. Get the current head with:
node src/core/evidence-chain.mjs head evidence/TLC-SL/verification.signed.jsonl
#   …then pass <length> <merkleRoot> as the 4th and 5th args.
```

`npm run tlc:sl:verify-evidence` and `npm run evidence:verify` already pass the
correct pins, and the Governance CI verifies against them on every push/PR.

> The signing **private** keys are never committed. The fingerprint commits to the
> *public* key only; it lets a verifier reject a substituted key, it does not expose
> any secret.
