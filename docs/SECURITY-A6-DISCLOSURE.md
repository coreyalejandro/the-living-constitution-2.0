# Security Disclosure A6 — Signature Forgery via File Edit (Trust-Root Substitution)

**Component:** TLC Evidence Chain Engine (`src/evidence-chain/`)
**Identifier:** A6 (red-team vector) / R11 (remediation requirement)
**Discovered:** 2026-06-22 (external expert review of the v2.0 audit package)
**Status:** **CLOSED under the pinned-verification policy** (v2.1); residual risk documented below.
**Severity:** High (integrity bypass) — exploitable only by an adversary who already has write access to the ledger files.

This disclosure follows the project's complete-claim rule: every "fixed" / "verified"
statement below maps to a command run this session with recorded output (see
**Verification** and `validation/red-team-report.json`).

---

## 1. Summary

The v2.0 evidence chain is tamper-evident: it hash-chains every ledger entry and
signs each with Ed25519, and its red-team suite (A1–A9) showed content tampering,
sig replacement, and reordering are all detected.

The external review correctly identified that vector **A6 as tested was too narrow**.
The committed A6 test only replaced a signature with *garbage* — which fails the
signature check trivially. It did **not** test the realistic attack: an adversary
who can edit the ledger file can also **re-sign forged content with their own key
and substitute the public key the verifier uses**, producing a fully self-consistent
forged chain. Because `verify()` trusted whatever public key it was handed, that
forgery was accepted. A related gap — **tail truncation / rollback** — was likewise
undetected, because a prefix of a valid hash chain is itself a valid chain.

Both are now closed by anchoring trust **out-of-band**: a pinned signer-key
fingerprint and a pinned chain head.

---

## 2. Affected design (v2.0)

`Ledger.verify()` recomputed each entry's `entry_hash`, checked `prev_hash`
linkage, and verified the Ed25519 signature against `this.publicKeyPem` — the key
passed into the engine at construction. In any persistent deployment that key is
read from a file (e.g. an `evidence-public-key.pem` co-located with the ledger, as
the sibling `.mjs` chain's `evidence:verify` script does). Nothing bound the
verification to a *specific, externally trusted* signer identity.

## 3. The vulnerability

**A10 — trust-root key substitution ("signature forgery via file edit").** An
adversary with filesystem write access:

1. edits node content in the ledger (e.g. rewrites a claim title);
2. recomputes `entry_hash` (SHA-256 is public);
3. re-signs every entry with **their own** Ed25519 private key;
4. replaces the co-located public-key file with **their own** public key.

The resulting chain is internally consistent, so `verify()` — handed the
substituted key — returns `ok: true`. The forgery succeeds.

**A11 — tail truncation / rollback.** Deleting the last entries leaves a shorter
chain whose links and signatures still verify, so `verify()` returns `ok: true` on
a rolled-back ledger.

**Root cause (the "API constraint").** A signature scheme can only be as
trustworthy as the *authenticity of the public key the verifier uses* and the
*completeness of the data it is shown*. When the trust root (the key) and the
extent (the head) come from the same medium the attacker controls, signatures
provide no protection against that attacker. This is fundamental, not a coding
slip — which is exactly why the fix lives in the **trust model**, not in a patch to
the signature call.

## 4. Proof the gap was real

The v2.1 red-team runner performs the full attack and records, for each vector,
that **unpinned verification accepts it** before showing the pin rejects it
(`validation/red-team-report.json`):

```
A10  unpinned verify ok=true (insecure by design — no out-of-band trust);
     pinned verify rejected: untrusted signer key: fingerprint does not match pinned trust anchor (A6)
A11  unpinned verify ok=true (prefix of a valid chain stays valid);
     head pin rejected: chain length mismatch — expected 3, found 2 (truncation/rollback) (A6)
```

The disclosure-grade unit test asserts both halves explicitly
(`engine.test.ts` §12, "full trust-root swap — unpinned accepts, pinned rejects").

## 5. The fix (v2.1)

Trust is now anchored **out-of-band**, in three layers:

1. **Signer-key fingerprint** — `keyFingerprint(pem)` = `SHA-256(SPKI/DER)` of the
   public key (`crypto.ts`). Stable, attacker-independent identity for a signer.
2. **Signer binding** — every ledger entry now commits its signer fingerprint
   inside the signed payload (`ledger.ts` `append`), so the signing identity is
   covered by both `entry_hash` and the signature, and `verify()` rejects entries
   whose committed signer does not match the verifying key (catches wrong-key /
   partial-resign verification).
3. **Pinned verification** — `verify(claimId, { expectedKeyFingerprint, expectedHead })`:
   * `expectedKeyFingerprint` (the legitimate signer's fingerprint, distributed
     out-of-band) is compared to the verifier's own key; a substituted key is
     rejected **even when the forged chain is internally consistent** (closes A10).
   * `expectedHead` (`{ length, merkleRoot }`, pinned out-of-band) rejects
     truncation/rollback (closes A11).

The engine exposes `signerFingerprint()` and `chainHead(claimId)` so a deployment
can record the anchor when a ledger is created, and `exportAuditBundle()` now
carries `signerFingerprint` + `head` so a third party can independently pin and
re-verify a bundle without trusting any attacker-editable key file.

4. **Enforced by default — fail closed (v2.1).** Verification now *refuses to run*
   unless the caller supplies a trust anchor (`expectedKeyFingerprint` and/or
   `expectedHead`) or explicitly acknowledges an in-process self-check
   (`trustProvidedKey: true`). There is no longer a silent "trust whatever key I was
   handed" default, so the A6-unsafe check cannot be run by accident.
5. **The `.mjs` CLI verifier is hardened too.** `src/core/evidence-chain.mjs verify`
   now **refuses without a pinned fingerprint** (exit 2) and rejects a key whose
   fingerprint does not match the pin (exit 1). The canonical pins are recorded
   out-of-band in `evidence/TRUST_ANCHORS.md`; `npm run tlc:sl:verify-evidence` /
   `npm run evidence:verify` pass them and CI enforces them.

Recommended audit-grade call:

```ts
engine.verifyIntegrityHash(claimId, {
  expectedKeyFingerprint: PINNED_FINGERPRINT,   // from a trusted channel
  expectedHead:           PINNED_HEAD,          // { length, merkleRoot }
});
```

## 6. Verification (commands run this session)

| Check | Command | Result |
|---|---|---|
| Red-team, 11 vectors | `node … validation/red-team-run.ts` | **11/11 BLOCKED**, `allBlocked: true` |
| Engine test suite | `node … --test src/evidence-chain/engine.test.ts` | **87/87 pass** (incl. §12 A6) |
| Empirical pipeline | `node … validation/empirical-run.ts` | 3/3 claims VALIDATED, chains intact |
| Coverage (new branches) | node built-in coverage | new code 100%; only `/* c8 ignore */` blocks uncounted |

## 7. Residual risk (honest scoping)

- **The pin must travel a channel the attacker does not control.** This is inherent
  to digital signatures — you cannot bootstrap trust from data the adversary can
  also rewrite. Recommended carriers: a signed git tag/release, a commit-signed
  trust-anchor file, or an auditor-supplied fingerprint. Storing the fingerprint in
  the same writable directory as the ledger re-opens A10.
- **Verification fails closed (v2.1).** There is no unpinned default: a caller must
  pin (`expectedKeyFingerprint`/`expectedHead`) or explicitly pass
  `trustProvidedKey: true` for an in-process self-check. The `trustProvidedKey`
  escape is intentionally available for the writing process (which already trusts
  its in-memory key) and is *not* safe for a third party verifying a key loaded
  from disk — third parties MUST pin. The CLI does not expose that escape at all.
- **The append O(1) tail-hash cache** assumes the single-writer, append-only model
  the ledger already documents; concurrent external writers are out of scope.

## 8. Reclassification

| | v2.0 | v2.1 |
|---|---|---|
| A6 (narrow sig replacement) | BLOCKED | BLOCKED |
| A10 (trust-root substitution) | **not tested → exploitable** | **BLOCKED (pinned)** |
| A11 (tail truncation/rollback) | **not tested → exploitable** | **BLOCKED (pinned head)** |

A6 is **CLOSED** under the documented pinned-verification policy, with the residual
risk in §7 stated rather than hidden — consistent with the project's radical-honesty
standard.
