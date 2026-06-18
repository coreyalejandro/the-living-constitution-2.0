# GOVERNANCE-HARNESS

**Module ID:** GOVERNANCE-HARNESS
**Surface:** private_lab
**Contract:** CRSP-GOVERNANCE-HARNESS
**Truth Status:** partial

## What This Module Is

governance-harness is the Empirical Validation Layer for TLC 2.0.

TLC enforces governance invariants at the document and commit level.
This module asks the next question: can violations of those same invariants
be detected in a model's neural activations before they surface as behavior?

It trains one linear probe per TLC invariant (I1–I8) against Qwen2.5-7B's
hidden states, then uses causal discovery (GES) to map relationships between
invariants in activation space.

## Wonder-to-Invariant Mapping

| Probe (Wonder)         | TLC Invariant                         | Layer |
|------------------------|---------------------------------------|-------|
| I1_Trust               | I1 — Contract Required                | 4     |
| I2_Authenticity        | I2 — Evidence Required for Claims     | 8     |
| I3_Status              | I3 — Scope Boundary Enforcement       | 12    |
| I4_Identity            | I4 — Invariants Are Not Bypassable    | 14    |
| I5_EnactedFidelity     | I5 — No Unauthorized PII              | 16    |
| I6_Quality             | I6 — Quarantined Modules Read-Only    | 18    |
| I7_ContextualPerf      | I7 — Status Inflation Prohibited      | 22    |
| I8_Narrative           | I8 — Visual Understanding Required    | 26    |

## What Works (Verified)

- Qwen2.5-7B loads on Apple Silicon MPS
- Layer extraction at all 8 designated layers
- LDA probe training pipeline (StandardScaler → PCA → LDA)
- GES causal discovery executes on wonder matrix
- Bootstrap loop with confidence intervals
- 30,000 live forward passes complete at exit 0
- Trained .npy weights exist for all 8 Wonders

## What Does Not Work (Must Be Fixed Before `working` Status)

See CRSP-GOVERNANCE-HARNESS acceptance criteria and
evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md for full disclosure.

1. Dataset is synthetic (generated to pass gates — not real data)
2. Probe labels assigned by naming convention, not validated alignment
3. Gate 2 cannot fail by construction (code bug — t2_violations logic)
4. Gates 3 and 4 use hardcoded failsafe when SHD denominator <= 0

## Quick Start

```bash
cd modules/governance-harness
pip install -r requirements.txt
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python run_harness.py
```

## File Layout

```
modules/governance-harness/
  run_harness.py            Main bootstrap harness (Gates 1-4)
  requirements.txt          Python dependencies
  data/
    dataset.jsonl           Synthetic evaluation substrate (FLAGGED)
    prompts_v2.csv          256-prompt probe training set
    generate_mock.py        Synthetic data generator (reference only)
  probes/
    train.py                Train all 8 Wonder probes (single-pass extraction)
    train_single.py         Train a single probe
    train_verbose.py        Verbose training with diagnostics
    run_live.py             Run trained probe on live conditions
    build_expanded_csv.py   Expand prompt CSV for multi-variable training
    extract_multi_variable.py  Extract multi-layer activation matrix
    weights/                Trained .npy probe weights (I1-I8)
  tests/
    test_hardware.py        Hardware hook verification
```
