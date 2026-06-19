# C-RSP Build Contract — NANOCHAT

**Contract ID:** CRSP-NANOCHAT
**Module:** NANOCHAT
**Surface:** private_lab → research_public
**Created:** 2026-06-19
**Status:** active

---

## Objective

Train a GPT model from scratch under full TLC governance. Every commit in the
training pipeline is governed by TLC pre-commit invariants. Every checkpoint is
probed by governance-harness. Evidence is validated by llm-council before any
external claim is made.

## Scope

- nanochat pretrain on a TLC-governed prompt corpus
- nanochat SFT on identity_conversations.jsonl
- governance-harness probe scores on resulting checkpoints
- INSTALL.ipynb as the canonical, reproducible install and launch artifact

## Not Claimed

- That nanochat weights demonstrate safety at scale
- That probe scores on nanochat generalize to larger models
- Any production deployment without explicit safety review
- Performance comparison to commercial models

## Dependencies

- governance-harness (GOVERNANCE-HARNESS module — probes I1-I8)
- autoresearch (AUTORESEARCH module — experiment loop)
- llm-council (LLM-COUNCIL module — evidence validation)
- Google Colab GPU runtime or NVIDIA H100 (local)
- OpenRouter API key (for llm-council evidence validation only)

## Acceptance Criteria

- [ ] AC-001: INSTALL.ipynb completes on clean Colab GPU runtime, exit 0, INSTALL_STATUS all True
- [ ] AC-002: Pretrain run produces val_bpb < 2.0, recorded in evidence/NANOCHAT/results.tsv
- [ ] AC-003: SFT run completes without NaN loss, checkpoint saved
- [ ] AC-004: governance-harness probes run on pretrain checkpoint — I1-I8 scores all > 0.5
- [ ] AC-005: governance-harness probes run on SFT checkpoint — scores recorded alongside val_bpb
- [ ] AC-006: TLC-governed prompt corpus contains >= 1000 Article XVI-validated prompts
- [ ] AC-007: chat_web UI launches, public URL captured and indexed in evidence
- [ ] AC-008: llm-council council deliberation validates AC-001 through AC-007 evidence
- [ ] AC-009: Council Chairman verdict = PASS or PARTIAL with actionable gaps listed
- [ ] AC-010: VERIFICATION_AND_TRUTH.md written and committed before any public claim

## Halt Conditions

- HLT-001: NaN loss after step 10 — stop, revert, file evidence
- HLT-002: governance-harness probe score < 0.3 on any invariant — flag, do not advance status
- HLT-003: INSTALL.ipynb fails on clean runtime — treat as I16 violation, fix before proceeding
- HLT-004: Council verdict = REJECT — do not advance truth_status under any condition

## Truth Surface

- Evidence Required: Yes
- Reviewer Required: Yes (llm-council)
- Public Claim Allowed: No — until council verdict PASS and V&T committed
