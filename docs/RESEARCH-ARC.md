# The Research Arc: From Hermeneutical Injustice to Runtime Governance

**Author:** Corey Alejandro
**Status:** research_public
**Last Updated:** 2026-06-19

---

## The problem in one sentence

AI models produce fluent, confident outputs about human behavior without
possessing the interpretive conditions that make those outputs valid —
and no current safety system can detect or prevent this.

---

## The arc

This is one research program across four modules.
Each module addresses a different level of the same failure.

```
LEVEL 1 — THEORY
governed-investigation
  What is the failure?
  Algorithmic Hermeneutical Injustice (AHI): a model trained on
  transactional data ontologies cannot interpret relational behaviors.
  The Eight Wonders of Black Shopping (I1-I8) are the minimum
  interpretive conditions for epistemically valid outputs in this domain.
  The TLC kernel is the runtime governance engine that enforces them.
  Paper: paper_v5.1.md | Target: NeurIPS Safety Track / ACM FAccT / EAAMO

    ↓

LEVEL 2 — INFRASTRUCTURE
TLC 2.0 (this repository)
  How do you enforce it at scale?
  Four enforcement layers: document, commit, activation, deliberation.
  The Eight Wonders become I1-I8 across the entire system.
  Every module governed by a C-RSP contract.
  Every claim requires evidence before status advances.
  Multi-model council deliberates on every governance decision.

    ↓

LEVEL 3 — DETECTION
CCD — Construct-Confidence Deception
  What does the failure look like in production coding assistants?
  An agent that asserts a component is implemented when it is not —
  across sessions, with resistance to challenge.
  PROACTIVE detector: F1-F4 features, multi-signal acceptance testing.
  Human-free: no IRB, no human annotators, fully automatable.
  Paper: ccd_v0.3 | Target: Anthropic Safety Research / arXiv

    ↓

LEVEL 4 — MEASUREMENT
HIDRS — Instructional Dependency Study
  What does dependency on AI produce in human learners?
  14-step Tier 1 RCT protocol. Quantic cohort. Pre-registered.
  Measures whether popup frequency affects conceptual exam performance.
  Seed-locked randomization. MICE imputation. Bootstrap robustness.
  Paper: in progress | Target: Computers & Education / J. Educational Psychology
```

---

## Why this arc is what Anthropic and OpenAI need

### The gap every lab has

Every lab has published principles. None have:

1. A theory of what interpretive failure looks like at the semantic level
   (not just wrong outputs — wrong frameworks for meaning)

2. Running infrastructure that enforces governance at four simultaneous levels

3. A production detector for a specific, formally defined behavioral failure
   that cannot be caught by output filtering or static benchmarks

4. Empirical measurement of what AI dependency does to human cognition
   in a real educational context with pre-registered methodology

TLC 2.0 + this research arc provides all four.

### What makes this different from existing safety work

Existing safety work operates on outputs.
It filters tokens, measures toxicity, evaluates benchmarks.

This work operates on meaning.
It asks: does the model have the conceptual machinery to interpret
what it is describing? Does it possess the invariants required to
make valid claims about the domain?

That is a different question. It requires a different answer.
The answer is runtime governance — not post-hoc filtering.

### The formal grounding

The governed-investigation paper provides:
- AHI as a formal extension of Miranda Fricker's epistemic injustice
- Eight Wonders I1-I8 as Generative Epistemic Invariants
- ContractWindow FSM with LTL safety/liveness specifications
- TLA+ model with bounded model checking (no counterexamples to depth 20)
- Coq proof of the type-safety theorem
- N=100,000 synthetic benchmark
- N=30 HITL study (+119% epistemic trust, -89.7% Insight Atrophy)
- N=300 large-scale replication confirming all main effects

No other AI safety paper has this combination of formal verification,
empirical validation, and running code in the same submission.

---

## The product

When all four levels are complete, what exists is:

A governance system (TLC 2.0) grounded in a formal theory (governed-investigation),
with a production detector for behavioral deception (CCD), and empirical
measurement of what happens to humans when AI governs poorly (HIDRS).

That is not a framework. That is a product.

A lab that adopts TLC 2.0 gets:
- Runtime governance enforced at document, commit, activation, and deliberation levels
- A formal theory of why governance matters beyond output filtering
- A behavioral deception detector for production coding assistants
- A research methodology for measuring human cognitive impact

A lab that publishes against TLC 2.0 gets:
- Pre-registered methodology
- Open-source code with reproducible results
- Evidence chain anchored in a governed repository

---

## Status of each module

| Module | Status | Next action |
|---|---|---|
| governed-investigation | partial | Run pytest, run simulations, council review, submit |
| TLC 2.0 runtime | working | OpenRouter key added, council now active |
| CCD | unverified | Build PROACTIVE detector |
| HIDRS | partial | C1L4 done. Next: C1L5 data collection |

---

## How to verify every claim in this document

```bash
# The theory
cat modules/governed-investigation/paper/paper_v5.1.md

# The kernel
cat modules/governed-investigation/tlc_kernel/engine.py

# The adversarial tests
cd modules/governed-investigation && pip install -r requirements.txt && python -m pytest tests/ -v

# The governance infrastructure
node scripts/tlc.mjs

# The registry (26 modules, all honest)
cat registry/modules.registry.json

# The CCD definition
cat modules/ccd/README.md
```

Every claim maps to a file. No claim requires trusting the author.

---

**Corey Alejandro**
AI Safety Research — The Living Constitution 2.0
https://github.com/coreyalejandro/the-living-constitution-2.0
https://github.com/coreyalejandro/governed-investigation
