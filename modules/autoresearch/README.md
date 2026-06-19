# AUTORESEARCH

**Module ID:** AUTORESEARCH
**Contract:** CRSP-AUTORESEARCH
**Surface:** private_lab
**Truth Status:** partial

## What This Module Is

autoresearch is TLC 2.0's autonomous experiment engine. An AI agent edits
train.py, runs a fixed 5-minute training budget, measures val_bpb (validation
bits per byte), keeps improvements, reverts failures, and loops. Every commit
in that loop is governed by TLC's pre-commit hook. Every checkpoint is scored
by governance-harness. The results.tsv is indexed in evidence.

## What Changes When TLC Governs the Loop

Standard autoresearch optimizes one metric: val_bpb.
TLC autoresearch optimizes two: val_bpb AND governance probe scores.

An experiment that improves val_bpb but degrades I1-I8 scores is flagged.
The agent cannot silently trade governance alignment for performance.
That constraint does not exist in the original autoresearch. TLC adds it.

## The Extended results.tsv Schema

Standard:
  commit  val_bpb  training_seconds  peak_vram_mb  status  description

TLC extended:
  commit  val_bpb  I1_Trust  I2_Auth  I3_Status  I4_Identity
          I5_Fidelity  I6_Quality  I7_Perf  I8_Narrative
          governance_mean  status  description

status values:
  KEEP              — val_bpb improved, governance scores stable or better
  REVERT            — val_bpb worse
  FLAGGED           — val_bpb improved, governance degraded (requires council review)
  BLOCKED           — pre-commit hook rejected the commit (invariant violation)

## Infrastructure Requirement

Requires NVIDIA GPU. train.py uses Flash Attention 3 (CUDA only).
Not runnable on Apple Silicon MPS without replacing fa3.flash_attn_func.
Colab A100/H100 runtime or cloud GPU instance required.

## Files

- train.py      — the mutable artifact (agent edits this)
- prepare.py    — fixed evaluation harness (do not modify)
- program.md    — Article XVI-validated agent instructions
- pyproject.toml
- CRSP_AUTORESEARCH.md
