# Repo Repair Report

## Repo
`sociotechnical-constitution-runtime`

## Repair Objective
Convert the uploaded scaffold from empty runtime files into a working Tier-1 local governance runtime with deterministic CLI checks, schema validation, policy evaluation, role authorization, evidence logging, and unit tests.

## Files Implemented

### Core runtime
- `src/core/contract-manager.js`
- `src/core/evidence-observatory.js`
- `src/core/policy-engine.js`
- `src/core/role-authorizer.js`

### CLI and adaptors
- `src/cli/tlc-cli.js`
- `src/adaptors/llm-gateway.js`
- `src/adaptors/git-hooks/pre-receive.js`
- `src/adaptors/ci-plugin/github-actions.yml`

### Contract Window data adapters
- `src/ui/contract-window/strip.jsx`
- `src/ui/contract-window/halt-matrix.jsx`
- `src/ui/contract-window/vnt-detail.jsx`
- `src/ui/contract-window/kanban-board.jsx`

### Tests
- `tests/unit/contract-manager.test.js`
- `tests/unit/policy-engine.test.js`
- `tests/unit/role-authorizer.test.js`
- `tests/unit/evidence-observatory.test.js`
- `tests/unit/cli.test.js`

### Package metadata
- `package.json` updated so Jest finds tests with `**/tests/**/*.test.js`.
- `verify` script added: `npm run validate && npm test -- --runInBand`.

## Commands Run

```bash
npm run validate
npm run status
npm run verify
```

## Verification Results

```text
npm run validate → PASS
npm run status   → PASS
npm run verify   → PASS
npm test          → 5 test suites passed, 9 tests passed
```

## What Works Now

- Active contract loads from `contracts/active/BUILD_CONTRACT.json`.
- Contract validates against local JSON schemas.
- CLI reports status with acceptance and halt summaries.
- Policy engine blocks unauthorized AI assistant deploy/merge/push/write-production actions.
- Role authorizer grants and denies permissions deterministically.
- Evidence Observatory appends JSONL records with SHA-256 integrity hashes.
- LLM gateway adapter evaluates and logs AI actions.
- Git pre-receive hook can block actions under policy.
- GitHub Actions workflow is present as a CI adaptor template.
- Unit tests verify the core runtime behavior.

## What Is Still Not Built

- Full React Contract Window UI.
- Constitutional Council Dashboard.
- Amendment Process UI.
- Break-glass approval workflow beyond schema/contract representation.
- Production auth.
- Portfolio/Lab workspace app.
- Smart capture.
- Kanban persistence.
- Daily briefing pipeline.
- GitHub repo inventory.

## Functional Status

`partial`

This is no longer an empty scaffold. It is a working Tier-1 local runtime core. It is not the complete TLC 2.0 workspace.
