# C-RSP Build Contract — LLM-COUNCIL

**Contract ID:** CRSP-LLM-COUNCIL
**Module:** LLM-COUNCIL
**Surface:** private_lab → research_public
**Created:** 2026-06-19
**Status:** active

---

## Objective

Integrate llm-council as TLC 2.0's deliberation engine. Every governance
decision — constitutional amendments, truth_status advancements, evidence
validation — passes through a multi-model council with anonymous peer review
and Chairman synthesis before it takes effect.

## Scope

- 3-stage deliberation wired to TLC governance events
- /council command in TLC TUI
- Evidence validation gate: council verdict required before module status advances
- Constitutional amendment workflow: council produces canonical amendment text

## Not Claimed

- That council verdicts are infallible
- That multi-model deliberation eliminates bias
- Any production SLA — this is research infrastructure

## Dependencies

- OpenRouter API key (OPENROUTER_API_KEY in .env)
- Python >= 3.10, uv, Node.js >= 18
- fastapi, uvicorn, httpx, pydantic (see pyproject.toml)
- React + Vite (frontend, optional for TUI integration)

## Acceptance Criteria

- [ ] AC-001: Backend starts on port 8001, health check returns 200
- [ ] AC-002: Stage 1 queries all council members, responses collected
- [ ] AC-003: Stage 2 anonymous peer review produces aggregate rankings
- [ ] AC-004: Stage 3 Chairman synthesizes final verdict
- [ ] AC-005: /council command in TLC TUI triggers full 3-stage pipeline
- [ ] AC-006: Evidence validation gate wired — module status cannot advance without council verdict
- [ ] AC-007: Council verdict stored in evidence/LLM-COUNCIL/verdicts/
- [ ] AC-008: council members configurable via backend/config.py without code changes

## Halt Conditions

- HLT-001: OpenRouter API key missing — halt, surface clear error in TUI
- HLT-002: Stage 1 returns 0 successful responses — halt, do not proceed to Stage 2
- HLT-003: Chairman model unavailable — halt, do not produce verdict

## Truth Surface

- Evidence Required: Yes
- Reviewer Required: Self (council reviews its own output)
- Public Claim Allowed: No — until AC-001 through AC-007 complete
