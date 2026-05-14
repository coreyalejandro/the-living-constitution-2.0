# coreys-agentic-portfolio Inspection

**Inspected:** 2026-05-14
**Inspector:** Hermes (session 4)
**Branch:** classify/portfolio
**Canonical path:** /Users/coreyalejandro/Projects/coreys-agentic-portfolio
**Registry ID:** COREYS-AGENTIC-PORTFOLIO

---

## Disambiguation

12 portfolio-related directories found. Canonical selected on evidence weight:

| Signal | coreys-agentic-portfolio | reason |
|---|---|---|
| AGENTS.md + CLAUDE.md | present | active dev environment |
| App routes | 16 (home, portfolio, sentinel, docs, playground, contact, templates, hero-experience, style-guide, preview, test-refactor, api/contact, api/playground) | real product routes |
| MCP SDK dep | @modelcontextprotocol/sdk ^1.22.0 | agentic integration intent |
| Component inventory system | 7 governance scripts | schema-governed component tracking |
| Next.js version | 15 + React 19 | current |
| TLC alignment | "align portfolio projects with Living Constitution Commonwealth" (latest commit) | actively aligned with this system |
| pnpm build | PASSES | confirmed this session |

Rejected: coreyalejandro-portfolio-v2 (3-route C-RSP variant, narrower scope, no AGENTS.md).
Rejected: corey-alejandro-main-portfolio-site-6, v0-* (older variants, stale structure).

---

## Stack

- Framework: Next.js 14/15 App Router + TypeScript (strict mode) + Tailwind CSS
- Component system: shadcn/ui (Radix primitives)
- Package manager: pnpm
- AI/Agent deps: @modelcontextprotocol/sdk, @cfworker/json-schema
- No test framework configured (stated in AGENTS.md)
- next.config.mjs: ignoreBuildErrors: true, typescript.ignoreBuildErrors: true

---

## Routes Confirmed Present

| Route | Path | Notes |
|---|---|---|
| Home | / (via app/(home)/page.tsx) | primary public front door |
| Portfolio | /portfolio | project showcase |
| Sentinel | /sentinel | SentinelOS lab demo |
| Sentinel incident sim | /sentinel/incident-simulation | incident simulation demo |
| Documentation | /documentation | docs route |
| Audio experience | /documentation/audio-experience | audio UI demo |
| Hero experience | /hero-experience | hero variant |
| Playground | /playground | interactive playground |
| Contact | /contact | contact form |
| Style guide | /style-guide | design system reference |
| Preview / hero | /preview, /preview/hero | preview variants |
| Templates | /templates/hero, /templates/landing, /templates/portfolio, /templates/resume | template library |
| API contact | /api/contact | form submission endpoint |
| API playground | /api/playground | playground API |

---

## Governance Files

- README.md: governs identity via ai-safety-identity-strategy.md (referenced but not found in this pass)
- AGENTS.md: agent command reference, architecture summary
- CLAUDE.md: present (not read — not required for classification)
- No STATUS.json, no CRSP contract, no BUILD_CONTRACT.md, no HANDOFF.md

---

## Build Verification

```
pnpm build → PASSES (2026-05-14)
All 16+ routes prerendered or server-rendered
next.config.mjs: ignoreBuildErrors: true
```

## TypeScript Errors (tsc --noEmit)

7 errors found — build passes because ignoreBuildErrors: true suppresses them:
1. Cannot find module '@/components/design-system/ComponentReviewGallery' (archived component)
2. floating-card.tsx: Expected 1 arg, got 0 (2 instances)
3. organic-title.tsx: Expected 1 arg, got 0
4. particle-field.tsx: Expected 1 arg, got 0
5. floating-nav.tsx: Expected 1 arg, got 0
6. useVoiceNav.ts: SpeechRecognition type missing (browser API, needs lib: "dom" or @types/dom-speech-recognition)
7. useVoiceNav.ts: SpeechRecognitionEvent missing

All errors are in creative-chaos components and a voice nav hook. Core routes and components unaffected.

## Component Inventory

9 drift warnings (unregistered or missing files). Component inventory:check exits 1.
Working but needs reconciliation.

---

## Truth Status Decision

| Claim | Verified? |
|---|---|
| Next.js build passes | YES — pnpm build succeeds |
| 16 app routes present | YES — directory structure confirmed |
| Public front door exists at / | YES — app/(home)/page.tsx present |
| SentinelOS Sentinel route | YES — app/sentinel/ present |
| No test suite | CONFIRMED — AGENTS.md explicitly states "No test framework configured" |
| tsc clean | NO — 7 errors (suppressed by ignoreBuildErrors) |
| Component inventory clean | NO — 9 drift warnings |
| ai-safety-identity-strategy.md present | UNVERIFIED — referenced in README, not found in surface scan |
| Live deployment URL | NONE — no live_url confirmed this session |
| Hyperagent content | app/portfolio/ and portfolio-files.zip present — classify exhibit separately |
| data/ directory | ABSENT — no data dir yet |
| STATUS.json | ABSENT |
| CRSP contract | ABSENT |

**Module truth_status: partial**

Build passes. Real routes present. No test suite. tsc has 7 suppressed errors. Component inventory drifts. No live URL. Missing CRSP contract. No STATUS.json.

This is a partial public_portfolio — real implementation, real routes, real build, no test verification, no governance contract.

---

## Verified Scope

- pnpm build: all routes compile and prerender/server-render
- 16 app routes: directory structure confirmed
- MCP SDK, Radix UI, shadcn/ui, Tailwind: declared in package.json
- Component inventory system: 7 governance scripts present and executable

## Unverified Scope

- Test suite: none configured
- tsc: 7 real errors suppressed by ignoreBuildErrors
- Component inventory: 9 drift warnings (exits 1)
- ai-safety-identity-strategy.md: referenced but not surface-scanned
- Live deployment URL: none confirmed
- CRSP governance contract: absent
- data/ directory: absent — no PORTFOLIO_DATA.json consumed yet
- Hyperagent Folio 001 content (portfolio-files.zip): classified separately as exhibit
- SentinelOS module list accuracy: not verified against TLC registry

---

## Next Required Actions

1. Copy PORTFOLIO_DATA.json into data/portfolio-data.json
2. Build minimum routes consuming data/portfolio-data.json
3. Fix tsc errors (creative-chaos components + voice nav types)
4. Reconcile component inventory (9 warnings → clean)
5. Create CRSP governance contract for this repo
6. Add STATUS.json
7. Confirm or create live deployment URL
8. Classify Hyperagent Folio 001 (portfolio-files.zip) separately as exhibit/static_prototype
