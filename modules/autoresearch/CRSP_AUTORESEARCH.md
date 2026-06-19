# C-RSP Build Contract — AUTORESEARCH

**Contract ID:** CRSP-AUTORESEARCH
**Module:** AUTORESEARCH
**Surface:** private_lab
**Created:** 2026-06-19
**Status:** active

---

## Objective

Integrate autoresearch as TLC 2.0's autonomous experiment engine for nanochat.
Every commit in the experiment loop is governed by TLC pre-commit invariants.
Every checkpoint is scored by governance-harness. The extended results.tsv
records both val_bpb and I1-I8 governance probe scores per commit.

## Scope

- autoresearch experiment loop running inside TLC pre-commit governance
- Extended results.tsv schema: val_bpb + I1-I8 probe scores per experiment
- FLAGGED status for experiments that improve val_bpb but degrade governance
- /autoresearch command in TLC TUI to inspect current results.tsv

## Not Claimed

- That improved val_bpb implies safety
- That governance probe scores on small models generalize to frontier models
- Runnable on Apple Silicon — requires CUDA GPU

## Dependencies

- NANOCHAT module (train.py, prepare.py)
- GOVERNANCE-HARNESS module (probe scoring on checkpoints)
- NVIDIA GPU (H100 preferred, A100 minimum for Flash Attention 3)
- Python >= 3.10, uv, torch 2.9.1 + CUDA 12.8
- kernels, rustbpe, tiktoken (see pyproject.toml)

## Acceptance Criteria

- [ ] AC-001: prepare.py completes — tokenizer.pkl and token_bytes.pt written
- [ ] AC-002: train.py completes one 5-minute run — val_bpb recorded
- [ ] AC-003: TLC pre-commit hook fires on every experiment commit
- [ ] AC-004: governance-harness probes run on checkpoint after each train run
- [ ] AC-005: Extended results.tsv records val_bpb + I1-I8 per commit
- [ ] AC-006: FLAGGED status fires when val_bpb improves but governance_mean drops > 0.05
- [ ] AC-007: BLOCKED status fires when pre-commit hook rejects commit
- [ ] AC-008: /autoresearch command in TLC TUI shows live results.tsv

## Halt Conditions

- HLT-001: NaN loss after step 10 — stop, revert commit, write evidence
- HLT-002: governance_mean < 0.3 on any checkpoint — flag, require council review
- HLT-003: Flash Attention 3 unavailable — halt with clear infrastructure error

## Truth Surface

- Evidence Required: Yes
- Reviewer Required: Yes (llm-council validates experiment results)
- Public Claim Allowed: No — until council validates at least 3 completed experiment cycles
