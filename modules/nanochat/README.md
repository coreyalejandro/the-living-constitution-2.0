# NANOCHAT

**Module ID:** NANOCHAT
**Contract:** CRSP-NANOCHAT
**Surface:** private_lab → research_public
**Truth Status:** unverified

## What This Module Is

nanochat is Karpathy's minimal from-scratch GPT-2 training stack. Inside TLC 2.0
it serves one role no other module can: it is the model TLC governs from the first
forward pass. Not a model TLC wraps. Not a model TLC probes after the fact. A model
whose entire training pipeline runs under TLC invariants from the moment weights
are initialized.

## The Loop This Closes

```
SOCIOTECHNICAL_CONSTITUTION.md
  → TLC-governed prompt corpus  (Article XVI validates every prompt)
  → nanochat pretrain + SFT     (autoresearch experiment loop)
  → checkpoint weights          (TLC owns them, no external dependency)
  → governance-harness probes   (I1-I8 scored on a model TLC trained)
  → probe results → evidence/   (indexed, auditable, publishable)
  → council deliberation        (llm-council validates evidence claims)
  → Constitution updated        (living, empirically grounded)
```

Every other AI safety governance framework governs documents or processes.
TLC 2.0 governs the model.

## Install

Open INSTALL.ipynb in Google Colab. Press Runtime → Run All.
Runtime with GPU required for training. CPU-only supported for inference.

## Files

- INSTALL.ipynb              — hardened Colab installer (Run All workflow)
- CRSP_NANOCHAT.md           — active contract
- evidence/                  — install logs, training results, probe scores

## Acceptance Criteria (from contract)

- [ ] AC-001: INSTALL.ipynb completes on clean Colab GPU runtime, exit 0
- [ ] AC-002: INSTALL_STATUS all True at notebook end
- [ ] AC-003: TLC-governed prompt corpus built (Article XVI validated)
- [ ] AC-004: Pretrain run completes, val_bpb recorded in results.tsv
- [ ] AC-005: SFT run completes on identity_conversations.jsonl
- [ ] AC-006: governance-harness probes run on checkpoint, I1-I8 scored
- [ ] AC-007: Probe results indexed in evidence/NANOCHAT/
- [ ] AC-008: llm-council validates evidence claims (council deliberation)
- [ ] AC-009: chat_web UI launches, accessible URL captured in evidence
- [ ] AC-010: truth_status advances to working via council verdict
