# Complete Claim Verification Rule

**Version:** 1.0.0
**Status:** Active — MANDATORY
**Last updated:** 2026-05-13

---

## Rule Statement

> A module is not "working" unless the COMPLETE CLAIM being made about that module is verified.
> A component may be working while the module remains partial.

This rule governs every truth_status assignment in the registry. It may not be
overridden by HANDOFF.md claims, README statements, or prior session notes.

---

## What "verified" means in this system

A claim is verified if and only if:
1. A command was run in this session (not a prior session or a referenced HANDOFF).
2. The command completed successfully with observable output.
3. The output was recorded in INSPECTION.md and in verified_scope.

A claim is NOT verified by:
- "The HANDOFF says tests pass" → HANDOFF is historical context, not current verification.
- "The README says it works" → README is aspirational documentation, not verification.
- "This compiled at some point" → Compilation at an unknown prior time is not current verification.
- "The test was passing when last I looked" → Looking is not running.

---

## Scope boundaries

The module truth_status applies to THE ENTIRE DECLARED SCOPE of the module.

If a module declares it is "a production-ready AI agent authorization gateway"
but only the TypeScript compilation was verified this session, then:
- truth_status = partial (not working)
- verified_scope = TypeScript compilation
- unverified_scope = auth flow, token exchange, persistence, deployment, tests

The word "working" in truth_status means the complete declared scope is verified.
It does not mean "the core logic compiles" or "one package passes tests."

---

## Component vs module distinction

A component is a sub-unit of a module (a package, a library, a single file).
A module is the entire project at the repo root.

A component may be working (all its tests pass, its scope is narrow and verified).
A module is working only when all its primary components are verified.

Example — CORRECT:
  Module: cognitive-governance-lab
  truth_status: partial
  verified_scope: {
    component: "governance-kernel",
    verification: "python -m pytest tests/ → 62 passed",
    covers: [contract_window.py, bicameral_review.py, invariant_checkers.py]
  }
  unverified_scope: [live pilot, IRR, paper submission, CRSP binding, ...]

Example — WRONG:
  Module: cognitive-governance-lab
  truth_status: working
  notes: "governance-kernel passes 62 tests"
  (WRONG because the module scope includes research program, live pilot, paper — all unverified)

---

## Config gap failures

A test suite that fails due to a configuration gap (not missing implementation)
does NOT automatically lower truth_status to unverified or broken.

Config gaps that are known and documentable:
- ERR_REQUIRE_ESM in vitest (Node 22 + CJS vitest config): config gap, not broken impl
- import.meta outside module in Jest: config gap, not broken impl
- Missing .env file with required API keys: external dependency, not broken impl

In these cases:
- truth_status MAY remain partial IF other verification exists (e.g., tsc passes)
- INSPECTION.md MUST document the exact failure mode
- unverified_scope MUST list the test suite as unrun with reason

---

## External dependency failures

These do NOT verify external integration claims:
- vault-client.ts present → does not verify "Token Vault works"
- Auth0 SDK installed → does not verify "Auth0 login works"
- Prisma schema present → does not verify "database persistence works"
- google-executor present → does not verify "Google API calls work"
- .env.local present → does not verify "credentials are valid"

Every external integration goes in unverified_scope unless end-to-end tested.

---

## Public claim discipline

If a module appears in a public portfolio, its public_display_status must reflect
the truth_status:
- truth_status=working → public_display_status MAY be "working"
- truth_status=partial → public_display_status MUST be "demo" or "draft", not "working"
- truth_status=draft → public_display_status MUST be "draft" or "coming_soon"
- truth_status=static_prototype → public_display_status MUST be "demo"

Claiming "working" in public when truth_status=partial is a COMPLETE_CLAIM violation.

---

## Enforcement

scripts/verify-registry.mjs enforces:
- partial modules with no unverified_scope → ERROR
- working modules with live_url=null routes only → WARNING
- exhibit/public_portfolio modules with no public_display_status → ERROR
- artifacts with no source_path → ERROR

INSPECTION.md must include:
- "Files inspected" section (explicit list)
- "Test result" section (exact command + exact output or "not run: reason")
- "Recommended truth_status" section with written rationale
