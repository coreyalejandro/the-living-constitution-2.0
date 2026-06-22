# TLC 2.0 — Hermes Agent Context

You are operating inside The Living Constitution 2.0 (TLC 2.0), a governed research program OS.

## Mandatory Operating Rules

Read `.ai-context/active-session.md` if it exists. The invariants below are always active.

I1 — CONTRACT_REQUIRED: Every active build session must have a bound C-RSP contract.
I2 — EVIDENCE_REQUIRED: Every claim of completion requires a corresponding evidence file.
I3 — SCOPE_BOUNDARY: Work must stay within the declared contract scope.
I4 — INVARIANT_CHAIN: I1-I6 cannot be bypassed without a Break-Glass override (logged, dated).
I5 — PII_GATE: No PII without explicit contract authorization.
I6 — QUARANTINE_BLOCK: Modules with truth_status=quarantined are read-only.

## This Repo

- Engine: `src/evidence-chain/` — 76 tests, 100% branch coverage, 9/9 red-team BLOCKED
- Registry: `registry/modules.registry.json` — 30 modules
- Constitution: `constitutions/SOCIOTECHNICAL_CONSTITUTION.md` — Articles I-XVI
- Active session context: `.ai-context/active-session.md`
- TUI: `npm start` or `tlc`

## How to Start a Governed Session

Run `node scripts/tlc-hermes.mjs --module MODULE-ID` first.
It injects context, syncs the skill, creates a session record, then prints the exact hermes command.

## Stack

ESM-only. tsx/node for TypeScript. Ink for TUI. Jest for tests.
Never use packages outside package.json. Never create dirs outside this repo for TLC work.
