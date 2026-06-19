# LLM-COUNCIL

**Module ID:** LLM-COUNCIL
**Contract:** CRSP-LLM-COUNCIL
**Surface:** private_lab → research_public
**Truth Status:** partial

## What This Module Is

llm-council is TLC 2.0's deliberation engine. When TLC needs a governance
decision — a constitutional amendment, an evidence claim, a truth_status
advancement — the council convenes. Multiple models respond independently,
peer-review each other anonymously, and a Chairman synthesizes the verdict.

No single model governs TLC. The council does.

## The Three Stages

Stage 1 — Independent Opinions
  Every council member answers the governance question independently.
  Responses are collected in parallel. No model sees another's answer yet.

Stage 2 — Anonymous Peer Review
  Responses are shuffled and labeled A, B, C. Each model reviews all
  responses — including its own, without knowing which is which. Models
  rank by accuracy, evidence quality, and alignment with TLC invariants.
  Labels are de-anonymized after scoring to prevent favoritism.

Stage 3 — Chairman Synthesis
  The designated Chairman sees all responses and all rankings. It produces
  the final verdict: PASS, PARTIAL, or REJECT, with specific gaps listed.
  This verdict is the evidence record, not the individual opinions.

## TLC Governance Roles

1. Constitutional Amendment Review
   Proposed Article changes go to the council before merging.
   Chairman produces the canonical amendment text.

2. Evidence Validation Gate
   Before any module advances truth_status, its evidence goes to council.
   Chairman verdict is required. REJECT blocks advancement permanently
   until evidence is repaired and council re-convened.

3. /council command in TLC TUI
   Available from the terminal UI. Takes any governance question.
   Returns council verdict inline, no browser required.

## Setup

Requires OpenRouter API key in .env:
  OPENROUTER_API_KEY=sk-or-v1-...

Default council (configurable in backend/config.py):
  anthropic/claude-sonnet-4.5
  openai/gpt-4o
  google/gemini-2.0-flash
  x-ai/grok-3

Default Chairman: anthropic/claude-sonnet-4.5

## Files

- backend/council.py      — 3-stage deliberation logic
- backend/config.py       — council members + chairman (edit this)
- backend/main.py         — FastAPI app (port 8001)
- backend/openrouter.py   — multi-model async query layer
- backend/storage.py      — JSON conversation persistence
- start.sh                — launch backend + frontend together
- CRSP_LLM_COUNCIL.md     — active contract
