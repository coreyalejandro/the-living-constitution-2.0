# consent-gateway-auth0 Inspection

**Inspected:** 2026-05-13
**Inspector:** Hermes (session 3)
**Branch:** classify/consent-gateway-auth0
**Canonical path:** /Users/coreyalejandro/Projects/consent-gateway-auth0

---

## Path disambiguation

find returned 2 distinct consent-gateway-auth0 directories:
- /Users/coreyalejandro/Projects/consent-gateway-auth0 ← CANONICAL (classified this session)
- /Users/coreyalejandro/Projects/the-living-constitution/projects/consent-gateway-auth0 ← copy inside TLC repo

Canonical selected by: standalone package.json, node_modules installed, vitest.config.ts,
__tests__/ directory, active git history (2026-04-06 most recent), HANDOFF.md.

---

## Files inspected

- package.json — full (50 lines)
- README.md — top 50 lines
- HANDOFF.md — top 40 lines
- vitest.config.ts — full (16 lines)
- app/ tree — maxdepth 3
- lib/ listing — auth0.ts, gateway/, policy-engine/, rate-limit.ts, vault-client.ts
- contexts/ listing — ConsentContext.tsx
- gateway-reference/ listing
- __tests__/ listing — 8 test files
- tsc --noEmit (via npm run typecheck) — PASS
- npm test (vitest run) — FAIL (ERR_REQUIRE_ESM config loader)

---

## Detected purpose

Auth0-integrated consent gateway for AI agents. Hackathon submission
(Auth0 AI Agent Hackathon).

An 8-stage authorization pipeline inserted between an AI agent's tool call
and downstream API execution:

1. Intercept — capture tool request
2. Policy — evaluate against operation allowlists + scope rules
3. Risk — classify LOW / MEDIUM / HIGH from component inventory
4. Step-Up — HIGH-risk actions require re-authentication via Auth0
5. Consent — user sees scopes, risk, audience, connection; approves or denies
6. Issuance — session subject token + OAuth token exchange (RFC 8693)
7. Execute — downstream API call (demo UI, not full production executor)
8. Audit — log decision, scopes, token metadata, timestamp

Key distinguishing features from consentchain:
- Real Auth0 SDK v4 (@auth0/nextjs-auth0 v4.16.1, @auth0/ai-langchain 1.0.0)
- RFC 8693 token exchange (connection-scoped, server-side only)
- Component inventory JSON manifest (connection, risk, requiredScopes, audience per tool)
- Rate limiter (in-memory sliding window)
- Audit store
- Demo video pipeline (Playwright + audio generation scripts)

---

## Relationship to consentchain

consentchain (/Users/coreyalejandro/Projects/consentchain):
- Turborepo pnpm monorepo, 9 packages, Prisma SQLite
- Auth0 placeholder only (env keys are scaffold values)
- HANDOFF: In Progress 2026-03-17 (phases 14-15 partial)

consent-gateway-auth0 (this repo):
- Standalone Next.js 14 single-app
- Real Auth0 SDK v4 integration, RFC 8693 fully specified
- HANDOFF: 2026-04-06 — "Token route enforces connection; tests pass (vitest run, tsc, next lint)"
- Hackathon submission with demo video scripts

These are NOT the same project. consent-gateway-auth0 is the production-intent
Auth0 implementation; consentchain is the monorepo scaffold with placeholder auth.

---

## Evidence found

git log (5 most recent):
- 2e46721: feat update video build scripts for dynamic port configuration
- 25111f6: fix show actionable message when token vault env vars are missing
- 080a967: feat implement comprehensive rendering script for demo video production
- 236f098: Add in-memory sliding-window rate limiter
- e138f9b: feat enhance consent log functionality and improve environment configuration

Most recent commit references video production scripts — suggests demo submission phase.

HANDOFF.md (2026-04-06) states "Token route enforces connection; tests pass (vitest run,
tsc, next lint)." Tests were passing at last known checkpoint on an earlier Node version.

---

## Routes found (real API routes)

app/api/auth/[auth0] — Auth0 SDK dynamic route handler (login, logout, callback)
app/api/gateway/audit — audit log endpoint
app/api/gateway/step-up — step-up challenge issuance
app/api/gateway/token — RFC 8693 token exchange (connection + audience → provider token)

---

## Test files found

__tests__/api-token-route.test.ts
__tests__/audit-store.test.ts
__tests__/consent-flow.test.ts
__tests__/inventory.test.ts
__tests__/policy-engine.test.ts
__tests__/schema-validation.test.ts
__tests__/vault-client.test.ts
__tests__/verify-auth0-env.test.ts

8 test files present. Vitest configured.

---

## Test result

npm test (vitest run):
FAIL — ERR_REQUIRE_ESM: require() of ES Module
node_modules/std-env/dist/index.mjs not supported.

Root cause: vitest.config.ts uses defineConfig (ESM) but vitest's CJS
dist/config.cjs is being required by the current Node 22 module resolution path.
Same class of failure as agent-sentinel (import.meta/Jest mismatch).
This is a configuration compatibility gap, not missing implementation.

HANDOFF says tests previously passed — regression introduced by Node version
or dependency update between 2026-04-06 and 2026-05-13.

---

## TypeScript compilation

npm run typecheck (tsc --noEmit): PASS (0 errors, empty output).

---

## Recommended truth_status

partial

Rationale:
- Real implementation: 8-stage gateway, Auth0 SDK v4, RFC 8693 token exchange,
  policy engine, audit store, rate limiter, component inventory — substantial.
- TypeScript compiles clean.
- HANDOFF confirms tests passed at last checkpoint (2026-04-06).
- Tests currently blocked by vitest ERR_REQUIRE_ESM — fixable config gap.
- Auth0 credentials required for actual auth flow (.env.local not inspected).
- Demo video pipeline (Playwright scripts) not tested this session.
- No live URL confirmed; no STATUS.json; no CRSP contract.
- Hackathon submission — "Built for the Auth0 AI Agent Hackathon."

---

## Recommended surface

exhibit

Rationale: Designed for external demonstration (hackathon submission),
includes demo video scripts, component inventory for UI display, demo UI shell.
Has real governance implementation (policy engine, audit log, RFC 8693 token exchange)
but primary purpose is showcase, not production deployment.

---

## Remaining unverified items

- Vitest test suite blocked (ERR_REQUIRE_ESM) — 8 test files unrun this session
- Auth0 credentials not inspected — .env.local contains real or placeholder values unknown
- Auth0 Dashboard configuration (token exchange, connections) not confirmed
- step-up re-authentication flow not confirmed end-to-end
- RFC 8693 token exchange not tested against live Auth0 tenant
- Demo video pipeline (Playwright + audio) not run
- No live URL confirmed
- No STATUS.json
- No CRSP governance contract bound
- Rate limiter is in-memory (not persistent across restarts)
- vault-client.ts throws if AUTH0_TOKEN_VAULT_CLIENT_ID / SECRET absent
- gateway-reference/ (alternate implementation reference) not inspected
- GitHub Actions CI workflow not confirmed passing in CI
