# agent-sentinel-alignment-anomaly-detector Inspection

**Inspected:** 2026-05-13
**Inspector:** Hermes (session 3)
**Branch:** classify/agent-sentinel

---

## Local path

/Users/coreyalejandro/Projects/agent-sentinel-alignment-anomaly-detector

---

## Files inspected

- README.md — top 70 lines (unresolved merge conflict found)
- package.json — full
- metadata.json — full
- src/ tree (find -maxdepth 3)
- services/ tree
- jest.config.js — via find (exists)
- git log (5 commits)
- git status
- npm test output
- npx tsc --noEmit output
- find: STATUS.json, STATUS.md — none found

---

## Detected purpose

React/TypeScript/Vite frontend application: AI agent log analyzer and behavioral
anomaly detection dashboard. Calls Gemini API (or Groq) to analyze agent inference
traces and detect constitutional breaches, misalignment, and model drift.

metadata.json description: "A professional research tool for analyzing AI agent
inference traces to detect constitutional breaches, misalignment, and model drift
using advanced reasoning models."

Docker + nginx config present — intended for production deployment.

---

## Governance role

Safety tooling — diagnostic instrument for detecting AI alignment failures.
Not a governance runtime. Not a governance evidence archive.
Portfolio-viable demo of the Agent Sentinel concept.

---

## Research lane

ai_safety_governance / alignment_anomaly_detection

Implements the Agent Sentinel concept: analyzing AI agent session logs against
constitutional invariants to detect drift, misalignment, and boundary violations.

---

## Product lane

safety_tool / portfolio_demo

Vite SPA with Gemini API integration. Docker/nginx config for deployment.
No live URL confirmed. API key dependency (.env deleted in git status).

---

## Evidence found

git log (5 commits):
- a9f0123: fixed/lint
- 30b0b72: feat: Implement ErrorBoundary component with tests
- b3c42a7: fix: resolve all TypeScript build errors, tsc+vite build passes clean
- e4234cd: feat: Implement ErrorBoundary component with tests
- 6960007: feat: Implement Agent Sentinel core functionality

tsc --noEmit: PASSES with zero errors.
npm test: FAILS — 2 test suites fail (0 tests run).
Failure: import.meta.env used in src/config/environment.ts — valid in Vite,
not in Jest's jsdom environment. This is a Jest/Vite config mismatch, not
missing implementation. Fix requires jest.config.js transform or moduleNameMapper
to stub import.meta.

---

## Merge conflict found

README.md has an unresolved git merge conflict at the top:
  <<<<<<< HEAD
  (generic AI Studio template content — "Run and deploy your AI Studio app")
  =======
  # Agent Sentinel — Enterprise Behavioral Anomaly Detection System
  (real Agent Sentinel README)
  >>>>>>> (branch unknown)

No merge conflict markers found in src/, components/, or services/.
README is the only conflicted file.

---

## Routes found

None confirmed running. Vite dev server is not started.
If dev server were running: React SPA at localhost (port inferred from vite.config.ts).
No backend API routes — Gemini API calls are made directly from frontend services.

---

## Tests found

2 test suites:
- src/components/__tests__/ErrorBoundary.test.tsx
- src/utils/__tests__/validation.test.ts

Both fail at module load time due to import.meta outside Jest module environment.
Root cause: jest.config.js does not transform or mock import.meta.env usage
in src/config/environment.ts. Not a logic failure — a config gap.

---

## Recommended truth_status

partial

Rationale:
- TypeScript compiles clean (tsc --noEmit PASS).
- App structure is implemented: components, hooks, services, types, Docker, nginx.
- Test suite broken — config gap, not absent tests.
- README has unresolved merge conflict.
- .env deleted — API key required to run, not present in repo.
- No STATUS.json, no deployment confirmed, no live URL.
- "partial" correctly labels: real implementation exists, not fully verified.

NOT working: test suite does not pass.
NOT draft: substantial TypeScript/React implementation exists and tsc passes.

---

## Recommended implementation_status

partial

---

## Remaining unverified items

- Test suite: 2 suites fail (import.meta/Jest config mismatch) — fixable but not fixed
- README: unresolved git merge conflict — must be resolved before any public use
- .env deleted: Gemini API key required to run dev server — not present
- Dev server not started: no runtime behavior confirmed this session
- No deployment, no live URL
- No STATUS.json
- No CRSP contract bound
- Docker/nginx config not tested
- pnpm-lock.yaml untracked (git status) — workspace config partially uncommitted
