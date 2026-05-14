# MODULE_STATUS.md
**Generated:** 2026-05-14
**Registry version:** 1.0.0

---

## Summary

| Metric | Count |
|---|---|
| Total modules classified | 21 |
| Total artifacts indexed  | 36 |
| Total routes registered  | 18 |

### By Truth Status

| Status | Count |
|---|---|
| [WORKING] | 2 |
| [PARTIAL] | 8 |
| [DRAFT] | 1 |
| [UNVERIFIED] | 9 |
| [PLANNED] | 1 |

### By Surface

| Surface | Count |
|---|---|
| Documentation | 3 |
| Exhibit | 2 |
| Governance Core | 6 |
| Module Library | 2 |
| Private Lab | 6 |
| Public Portfolio | 2 |

---

## Working Modules

### SocioTechnical Constitution Runtime
- **ID:** CRSP-STC-RUNTIME-001
- **Surface:** Governance Core
- **Verified scope:** full runtime (5 suites) — node --experimental-vm-modules jest → 9/9 tests pass; npm run validate → schema VALID
- **Routes:** /

### PROACTIVE — Constitutional AI Safety Agent for GitLab Duo
- **ID:** PROACTIVE-28441830
- **Surface:** Governance Core
- **Verified scope:** Python package core — python -m pytest tests/ — 731 passed in 1.37s (2026-05-13)
- **Routes:** /

---

## Partial Modules

*Implementation exists. At least one component is verified. Complete scope is broader than what is verified.*

### The Living Constitution
- **ID:** THE-LIVING-CONSTITUTION
- **Surface:** Governance Core
- **Verified scope:** STATUS.json + CRSP-001 contract — Files read directly: STATUS.json tip_state_truth=tip_verified, reviewer_status=approved; CRSP-001.json Guardian Kernel Tier-3-Constitutional Active
- **Unverified scope (8 items):**
  - local test suite (not run this session)
  - Docker/k8s infra not started
  - Next.js control-plane app not built
  - tlc-evals full model grading (requires ANTHROPIC_API_KEY)
  - tlc-semgraph not inspected
  - Python guardian service runtime not verified
  - CI pipeline status unknown
  - branch protection enforcement not confirmed live
- **Routes:** /governance/the-living-constitution (partial)

### Agent Sentinel — Alignment Anomaly Detector
- **ID:** AGENT-SENTINEL
- **Surface:** Private Lab
- **Verified scope:** TypeScript compilation — npx tsc --noEmit — 0 errors (2026-05-13)
- **Unverified scope (8 items):**
  - test suite: 2 suites fail — import.meta/Jest config mismatch (not fixed)
  - README.md: unresolved git merge conflict at top of file
  - .env deleted — Gemini API key required, not present in repo
  - dev server not started — no runtime behavior confirmed
  - Docker/nginx config not tested
  - pnpm-lock.yaml untracked — workspace config partially uncommitted
  - No live URL, no deployment confirmed
  - No STATUS.json, no CRSP contract bound
- **Routes:** /lab/agent-sentinel (unverified)

### Corey's Agentic Portfolio (Staging/Reference)
- **ID:** COREYS-AGENTIC-PORTFOLIO
- **Surface:** Public Portfolio
- **Verified scope:** pnpm build + tsc + 19 app routes — pnpm exec tsc --noEmit — 0 errors (ignoreBuildErrors removed 2026-05-14); pnpm build PASSES — all routes static prerendered. STATUS.json + CRSP-PORTFOLIO-001 contract added. data/portfolio-data.json synced from runtime registry.
- **Unverified scope (6 items):**
  - no test suite configured (stated in AGENTS.md)
  - component inventory: 9 drift warnings, exits 1 — unresolved
  - ai-safety-identity-strategy.md: referenced in README, not surface-scanned
  - live deployment URL: none (Vercel domain reassigned to coreyalejandro-portfolio-v2 on 2026-05-14)
  - Hyperagent Folio 001 content (portfolio-files.zip): not classified separately
  - SentinelOS module list accuracy: not verified against TLC registry
- **Routes:** /agentic (unverified), / (partial), /sentinel (partial)

### Cognitive Governance Lab
- **ID:** COGNITIVE-GOVERNANCE-LAB
- **Surface:** Module Library
- **Verified scope:** governance-kernel — python -m pytest tests/ — 62 passed in 0.22s (2026-05-13)
- **Unverified scope (9 items):**
  - research program: live pilot sessions (0 of 10 required) — NOT DONE
  - human inter-rater reliability (kappa >= 0.70) — NOT DONE
  - session-protocol.md — NOT WRITTEN
  - COLM 2026 paper — draft only, not submitted
  - Anthropic Fellows proposals — submitted, outcome unknown
  - insight_atrophy_index.py — present, no confirmed test coverage
  - CRSP contract binding — absent
  - STATUS.json — absent (no machine-readable project status)
  - Month 1 full gate — synthetic calibration only, not live-pilot-complete

### ConsentChain — Human Consent Gateway for AI Agents
- **ID:** CONSENTCHAIN
- **Surface:** Governance Core
- **Verified scope:** apps/web TypeScript compilation — cd apps/web && pnpm exec tsc --noEmit — 0 errors (2026-05-13)
- **Unverified scope (10 items):**
  - No test suite — turbo test timed out, no vitest/jest in package.json
  - Auth0 credentials not configured — .env.local has placeholder keys
  - vault-client throws until external vault service configured
  - google-executor is mock implementation only
  - HANDOFF.md status: In Progress (2026-03-17) — phases 14-15 partial
  - packages/agent-sdk: built once (dist/ exists) but not tsc-verified this session
  - No live URL, no deployment confirmed
  - No STATUS.json, no CRSP contract bound
  - Git history anomalous — shared git root with portfolio/parent repo
  - consent-gateway-auth0 (auth0-specific variant) — separate module, not classified
- **Routes:** /api/agent/action (partial)

### Consent Gateway Auth0 — 8-Stage AI Agent Authorization Pipeline
- **ID:** CONSENT-GATEWAY-AUTH0
- **Surface:** Exhibit
- **Verified scope:** TypeScript compilation + test file presence — npm run typecheck (tsc --noEmit) — 0 errors (2026-05-13); 8 test files confirmed in __tests__/; HANDOFF (2026-04-06) states tests passed at last checkpoint
- **Unverified scope (12 items):**
  - Vitest test suite blocked — ERR_REQUIRE_ESM in vitest config loader (Node 22 / CJS mismatch); 8 test files present but not run this session
  - Auth0 credentials — .env.local not inspected; real or placeholder values unknown
  - Auth0 Dashboard configuration (token exchange, connections, audiences) not confirmed
  - Step-up re-authentication flow not confirmed end-to-end
  - RFC 8693 token exchange not tested against live Auth0 tenant
  - Demo video pipeline (Playwright + audio generation) not run
  - gateway-reference/ alternate implementation reference not inspected
  - GitHub Actions CI workflow not confirmed passing
  - vault-client.ts throws if AUTH0_TOKEN_VAULT_CLIENT_ID / SECRET absent
  - Rate limiter in-memory only — not persistent across restarts
  - No live URL confirmed
  - No STATUS.json, no CRSP contract bound
- **Routes:** /api/gateway/token (partial)

### HIDRS — Instructional Dependency Study
- **ID:** HIDRS-INSTRUCTIONAL-DEPENDENCY-STUDY
- **Surface:** Module Library
- **Verified scope:** ["repo scaffold exists and validate_repo.py passes (exit 0, 0 errors)","C_RSP_BUILD_CONTRACT.md exists (6650 bytes, visual invariant I8 added)","docs/STUDY_PROTOCOL.md exists","docs/SAFETY_PROTOCOL.md exists","docs/DATA_DICTIONARY.md exists","schemas/event_schema.json, session_schema.json, retrospective_recovery_schema.json exist and lint clean","evidence/index/evidence_index.csv exists with header",".gitignore excludes data/private/*, evidence/screenshots/*, evidence/excerpts/*","STATUS.md contains RETROSPECTIVE and PROSPECTIVE_START markers","visual understanding layer exists — all 7 visual files present","visuals/architecture/system-architecture.mmd exists","visuals/app-flow/app-flow.mmd exists","visuals/user-journey/user-journey.mmd exists","visuals/pictographs/research-loop-pictograph.md exists","visuals/mock-demo/mock-demo-storyboard.md exists","visuals/illustrations/illustration-brief.md exists","validate_repo.py passes with visual checks enforced (27 files checked, exit 0)"]
- **Unverified scope (11 items):**
  - workbook not verified — not yet placed in workbook/ directory
  - no prospective data collected yet (starts at Course 1 Lesson 4)
  - no retrospective data entered for Course 1 Lessons 1–3
  - no weekly analysis generated
  - no final report generated
  - no external generalization claimed or verified
  - no course content audit beyond repo file scan
  - openpyxl workbook sheet names not confirmed
  - diagrams are initial Mermaid/text drafts — pending visual polish
  - no rendered PNG/SVG export yet
  - no mock demo video yet

### TLC Research-to-Paper-to-Product Repo Template
- **ID:** TLC-RESEARCH-PAPER-PRODUCT-TEMPLATE
- **Surface:** Governance Core
- **Verified scope:** ["template directory exists at templates/tlc-research-to-paper-to-product-template/","required structure exists: README.md, STATUS.md, C_RSP_BUILD_CONTRACT.md, .gitignore","docs/ tree: 9 files including VISUAL_UNDERSTANDING_LAYER.md and both gate docs","visuals/ tree: all 6 required files with content (architecture, app-flow, user-journey, pictograph, mock-demo, illustration-brief)","schemas/: 5 JSON schemas (event, session, artifact, claim, portfolio_packet) — lint clean","scripts/: validate_repo.py, validate_evidence_index.py, validate_claims.py, generate_weekly_report.py, generate_paper_packet.py, generate_portfolio_packet.py — all lint clean","templates/: 6 fill-in-the-blank markdown forms","paper/ tree: README + 8 section files","product/ tree: README + 4 .gitkeep dirs","evidence/index/evidence_index.csv with header",".gitignore excludes data/private/*, evidence/screenshots/*, evidence/excerpts/*","creation script: scripts/create-research-project-from-template.mjs (9568 bytes)","operations doc: docs/operations/RESEARCH_TO_PAPER_TO_PRODUCT_TEMPLATE.md","Visual Understanding Layer invariant I8 enforced in validate_repo.py"]
- **Unverified scope (6 items):**
  - not yet tested across multiple generated projects
  - create-research-project-from-template.mjs not run against a real project slug yet
  - no CI integration
  - no remote template repository
  - no package publication
  - HIDRS is the only confirmed instance — template/instance alignment not formally audited

---

## Draft Modules

*Structured content exists — documentation, evidence archives, proposals. No runnable code.*

- **TLC Artifacts — Session Evidence Repository** (TLC-ARTIFACTS-RESTRUCTURE) — Documentation
  Tier 1 empirical evidence corpus for 'Frontin at WorldMart' (NeurIPS/FAccT target). Holds session transcripts S01-S03, e

---

## Static Prototypes

*Built once, not maintained. Functional as a snapshot, not a living codebase.*

None classified yet.

---

## Unverified / Planned Modules

- **TLC Evidence Observatory** (TLC-EVIDENCE-OBSERVATORY) — [UNVERIFIED] — Governance Core
- **LLM Council** (LLM-COUNCIL) — [UNVERIFIED] — Private Lab
- **Multiagent Debate** (MULTIAGENT-DEBATE) — [UNVERIFIED] — Private Lab
- **Meta Prompt Architect** (META-PROMPT-ARCHITECT) — [UNVERIFIED] — Private Lab
- **Misalignment Evidence Lab** (MISALIGNMENT-EVIDENCE-LAB) — [UNVERIFIED] — Private Lab
- **Proactive AI Constitution Toolkit (documentation satellite)** (PROACTIVE-AI-CONSTITUTION-TOOLKIT) — [UNVERIFIED] — Documentation
- **AI Safety Identity Strategy** (AI-SAFETY-IDENTITY-STRATEGY) — [UNVERIFIED] — Private Lab
- **Zero Shot Build OS Docs** (ZERO-SHOT-BUILD-OS-DOCS) — [UNVERIFIED] — Documentation
- **Corey Alejandro Portfolio v2** (PORTFOLIO-V2) — [UNVERIFIED] — Public Portfolio
- **Contract Window Public Exhibit** (CONTRACT-WINDOW-EXHIBIT) — [PLANNED] — Exhibit

---

## Next Required Actions by Module

| Module | Status | Next Action |
|---|---|---|
| SocioTechnical Constitution Runtime | [WORKING] | Maintain — run tests on each change |
| The Living Constitution | [PARTIAL] | Resolve unverified_scope items or classify separately |
| TLC Artifacts — Session Evidence Repository | [DRAFT] | Inspect and classify when implementation begins |
| TLC Evidence Observatory | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Agent Sentinel — Alignment Anomaly Detector | [PARTIAL] | Resolve unverified_scope items or classify separately |
| LLM Council | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Multiagent Debate | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Meta Prompt Architect | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Misalignment Evidence Lab | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Proactive AI Constitution Toolkit (documentation satellite) | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| PROACTIVE — Constitutional AI Safety Agent for GitLab Duo | [WORKING] | Maintain — run tests on each change |
| AI Safety Identity Strategy | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Zero Shot Build OS Docs | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Corey Alejandro Portfolio v2 | [UNVERIFIED] | Run ingest SOP — inspect and classify |
| Corey's Agentic Portfolio (Staging/Reference) | [PARTIAL] | Resolve unverified_scope items or classify separately |
| Contract Window Public Exhibit | [PLANNED] | Build or remove from registry |
| Cognitive Governance Lab | [PARTIAL] | Resolve unverified_scope items or classify separately |
| ConsentChain — Human Consent Gateway for AI Agents | [PARTIAL] | Resolve unverified_scope items or classify separately |
| Consent Gateway Auth0 — 8-Stage AI Agent Authorization Pipeline | [PARTIAL] | Resolve unverified_scope items or classify separately |
| HIDRS — Instructional Dependency Study | [PARTIAL] | Resolve unverified_scope items or classify separately |
| TLC Research-to-Paper-to-Product Repo Template | [PARTIAL] | Resolve unverified_scope items or classify separately |

---

*Generated by scripts/generate-module-status.mjs — do not hand-edit. Re-run after any registry change.*