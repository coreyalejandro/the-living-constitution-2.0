# GOVERNED-INVESTIGATION

**Module ID:** GOVERNED-INVESTIGATION
**Contract:** CRSP-GOVERNED-INVESTIGATION
**Surface:** research_public
**Truth Status:** partial
**Paper target:** NeurIPS Safety Track / ACM FAccT / EAAMO

## What this module is

This is the theoretical foundation of TLC 2.0.

The paper introduces two things that are not found anywhere else in AI safety:

**Algorithmic Hermeneutical Injustice (AHI)** — what happens when a model
produces fluent, confident answers about human behavior without possessing the
interpretive conditions that make those answers valid. This is not hallucination.
The model is not wrong about facts. It is wrong about meaning. It has no
framework for the relational economy it is describing.

**The Eight Wonders of Black Shopping** — eight Generative Epistemic Invariants
that define the minimum interpretive conditions for any model output about Black
consumer behavior to be epistemically valid:

    I1 — Trust
    I2 — Authenticity
    I3 — Status
    I4 — Identity Signaling
    I5 — Enacted Fidelity
    I6 — Perceived Quality
    I7 — Contextual Performance
    I8 — Narrative

These are the same I1-I8 that TLC 2.0 enforces at the document, commit,
and activation level. The governance-harness probes were built to measure these.
The connection is not metaphorical — it is structural.

## What is in this module

```
tlc_kernel/
  engine.py       ContractWindow FSM — the runtime governance engine
  review.py       BicameralReview — Chamber A (relational) + Chamber B (contestability)
  exceptions.py   HaltAuthorityException — what fires when governance fails

simulation/
  benchmark.py    N=100,000 synthetic benchmark (Table 3 from paper)
  hitl_harness.py N=30 HITL evaluation (Table 5 from paper)

tests/
  test_semantic_drift.py    adversarial: euphemism injection → HALTED
  test_memory_bloat.py      adversarial: 40+ turn context corruption → AMBIGUOUS
  test_signal_conflict.py   adversarial: contradictory telemetry deadlock → HALTED
  test_escape_sabotage.py   adversarial: human fatigue + claim overload

paper/
  paper_v5.1.md   Full 1,021-line manuscript, all sections, no placeholders
```

## How to run the tests

```bash
cd modules/governed-investigation
pip install -r requirements.txt
python -m pytest tests/ -v
```

## How to run the benchmark

```bash
python simulation/benchmark.py    # N=100,000 agents, all conditions
python simulation/hitl_harness.py # N=30 HITL cohort
```

## Its role in TLC 2.0

The tlc_kernel here is the ancestor of TLC 2.0's governance engine.
ContractWindow → C-RSP contracts.
BicameralReview → llm-council 3-stage deliberation.
HaltAuthorityException → pre-commit hook halt conditions.
Eight Wonders I1-I8 → governance-harness probes.

The paper is the published claim. The kernel is the running proof.
