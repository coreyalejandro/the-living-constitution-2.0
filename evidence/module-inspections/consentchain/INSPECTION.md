# consentchain Inspection

**Inspected:** 2026-05-13
**Inspector:** Hermes (session 3)
**Branch:** classify/consentchain
**Canonical path:** /Users/coreyalejandro/Projects/consentchain

---

## Path disambiguation

find returned 6 consent-related dirs:
- /Users/coreyalejandro/Projects/consentchain ← CANONICAL (classified this session)
- /Users/coreyalejandro/Projects/consent-gateway-auth0 ← separate module, not classified yet
- /Users/coreyalejandro/Projects/the-living-constitution/projects/consentchain ← copy inside TLC
- /Users/coreyalejandro/Projects/the-living-constitution/projects/consentchain-pack ← pack variant
- /Users/coreyalejandro/Projects/the-living-constitution/projects/consent-gateway-auth0 ← copy
- /Users/coreyalejandro/Projects/the-living-constitution/verification/consentchain-family ← verification set

---

## Files inspected

- package.json (root) — full
- apps/web/package.json — full
- apps/web/README.md — top 30 lines (default Next.js scaffold README)
- HANDOFF.md — top 40 lines
- prisma/schema.prisma — top 40 lines
- apps/web/src/ — tree (find maxdepth 3)
- packages/ — listing: agent-sdk, google-executor, idempotency, ledger, policy-engine, shared, step-up, vault-client
- packages/*/src/ — file listings
- consentchain-build-contract.md — top 50 lines
- find: STATUS.json, STATUS.md — none found
- find: CRSP / BUILD_CONTRACT files — build contract is consentchain-build-contract.md (execution journal, not a governance CRSP)
- find: test files in src/ — NONE (only node_modules test files from deps)
- pnpm test — TIMED OUT (no test task in turbo.json)
- cd apps/web && pnpm exec tsc --noEmit — PASS (empty output = 0 errors)
- git log (5 commits), git status

---

## Detected purpose

Consent-chain authorization gateway.

A human-consent layer for AI agents: before an AI agent can execute a privileged
action (send email, book calendar, etc.), a human user must explicitly consent via
a step-up authentication challenge. The system logs every action to a tamper-evident
ledger.

Key concepts:
- Agent registration (API key hash, allowed services)
- Ledger (append-only signed log of every agent action)
- RevocationState (instant consent revocation)
- IdempotencyRecord (dedup repeat requests)
- StepUpChallenge (DB-backed human auth challenge)
- PolicyEngine (rules.ts — action approval rules)

Stack: Next.js 16 App Router, TypeScript, Prisma (SQLite), next-auth (Auth0),
zod, jose, pnpm + Turborepo monorepo.

HANDOFF.md status: "In Progress" (2026-03-17). Build contract phases 14-15 partial.
Phase 10 (Auth0) scaffolded but not connected to real credentials.

---

## Governance role

Human-consent governance module.

ConsentChain operationalizes the principle that AI agents may not take privileged
actions without explicit human consent, logged to an immutable ledger. This is
the TLC ecosystem's runtime enforcement layer for human oversight of AI agent
operations.

Related modules:
- consent-gateway-auth0 (auth0-specific gateway — separate module, not classified)
- the-living-constitution (policy authority that ConsentChain enforces)

---

## Research lane

ai_safety_human_oversight / consent_and_authorization

---

## Product lane

authorization_tool / governance_module

Intended as a deployable gateway service. No live URL confirmed.
SQLite dev.db present on disk (local state exists).

---

## Evidence found

git log (5 commits, most recent: chore update .gitignore):
- 7790934: chore update .gitignore
- c08fb4c: feat Contract Window with 6 collapsible sections
- a00dda7: move copy index.html from /tmp/deploy_combined
- 3b71ed7: Reframe portfolio to research agenda
- 78e83ef: feat Contract Window with collapsible sections

Note: git log is anomalous — these commits describe portfolio UI changes,
not ConsentChain changes. The git history suggests this repo may share a
git root with a parent monorepo (coreyalejandro-portfolio-v2 or similar).
The consentchain/ directory may be a subtree or was added without its own
clean git history.

dev.db present at both root and apps/web/ — Prisma migrations have been run locally.
HANDOFF.md (2026-03-17) documents build progress through Phase 15 partial.

---

## Routes found (real API routes)

apps/web/src/app/api/:
- /api/agent/action — gateway: validation → idempotency → revocation → policy → step-up → exec → ledger
- /api/auth/step-up — issue step-up challenge
- /api/auth/step-up/verify — verify step-up response
- /api/auth/[...nextauth] — Auth0 NextAuth route (scaffolded, not configured)
- /api/ledger — ledger query
- /api/revoke — revocation endpoint
- /api/services/connect/google — 501 placeholder

---

## Tests found

NONE in project source (src/, packages/*/src/).
pnpm test timed out — turbo.json has no test task defined.
apps/web does not have a test framework (jest, vitest) in package.json.

---

## TypeScript compilation

cd apps/web && pnpm exec tsc --noEmit: PASS (0 errors, 0 output).

---

## Recommended truth_status

partial

Rationale:
- Substantial implementation: 7 packages, 6+ API routes, Prisma schema with 4 models
  + StepUpChallenge, local dev.db shows migrations ran.
- TypeScript compiles clean in apps/web.
- No test suite — nothing machine-verifiable beyond tsc.
- Auth0 credentials not configured (.env.local has placeholder keys).
- HANDOFF.md status is "In Progress" — phases 14-15 partial.
- vault-client throws until configured — external dependency not satisfied.
- google-executor is mock implementation.
- No live URL, no deployment confirmed.
- Git history anomalous — may not represent ConsentChain-specific commits.

---

## Recommended implementation_status

partial

---

## Remaining unverified items

- No test suite — no passing tests
- Auth0 / NextAuth not configured with real credentials
- vault-client: throws until configured (external vault service required)
- google-executor: mock implementation only
- Build phases 14-15 partial per HANDOFF (agent action gateway not fully wired)
- Phase 10 (Auth0) scaffolded, env keys are placeholders
- No STATUS.json
- No CRSP governance contract bound
- Git history anomalous — shared git root with portfolio/parent
- No live URL, no deployment confirmed
- packages/agent-sdk/dist/ exists — built once, but tsc --noEmit not run there
- consentchain-build-contract.md is an execution journal, not a governance CRSP
