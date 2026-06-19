# The Living Constitution 2.0 — Why Every AI Lab Needs This

**Author:** Corey Alejandro
**Status:** research_public
**Last Updated:** 2026-06-19

---

## The Problem Every AI Lab Has and Cannot Solve Internally

Every major AI lab has published a set of principles.
Anthropic has the Constitutional AI framework.
OpenAI has the Model Spec.
Google DeepMind has the Frontier Safety Framework.
xAI has the Grok Charter.

None of them have a governance system.

A principle is a statement. A governance system is a structure that
enforces the principle, detects when it is violated, records the
violation as evidence, and routes the violation through a deliberation
process that produces a binding decision.

The gap between "we have principles" and "we have governance" is the
gap between a mission statement and a constitution. Every AI lab is
living in that gap right now. TLC 2.0 closes it.

---

## What TLC 2.0 Is

TLC 2.0 is the first AI governance system that:

1. Governs a model it trains — not a model it wraps
2. Enforces invariants at four levels simultaneously:
   document, commit, activation, and deliberation
3. Produces empirical evidence of governance compliance —
   not assertions, not audits, not red-team reports
4. Amends itself through multi-model deliberation with
   anonymous peer review and Chairman synthesis
5. Is reproducible — any reviewer can clone it, run it,
   and verify every claim from first principles

---

## The Four Enforcement Layers

### Layer 1: Document (validate-instructions.mjs)

Every file in the system passes through a validator that enforces
Article XVI — the plain language requirement. No ambiguous instructions.
No spatial reasoning demands. No unanchored stops. No shell tools used
as natural language. This is not style guidance. Violations block the
pipeline.

### Layer 2: Commit (pre-commit hook)

Every git commit is inspected before it lands. Unregistered modules
cannot commit. Quarantined modules are read-only. I1-I6 invariants are
checked structurally. A commit that violates the constitution does not
enter the chain.

### Layer 3: Activation (governance-harness)

Eight neural probes — one per TLC invariant I1 through I8 — run on
every model checkpoint. Probe scores are recorded alongside val_bpb in
results.tsv. An experiment that improves language model performance but
degrades governance probe scores is flagged and routed to council review.
You cannot silently trade alignment for capability.

### Layer 4: Deliberation (llm-council)

No single model governs TLC. The council does. Before any module
advances truth_status, before any constitutional amendment merges,
before any public claim is made — the council convenes. Models respond
independently, peer-review each other anonymously, and a Chairman
synthesizes the verdict. The verdict is the evidence record.

---

## The Autonomous Research Loop

autoresearch runs inside TLC governance. An AI agent edits train.py,
runs a 5-minute training budget, measures val_bpb, keeps improvements,
reverts failures, and loops. Every commit is governed. Every checkpoint
is probed. Every experiment cycle produces two metrics: language model
performance and governance alignment. The system researches itself under
its own constitution.

This is the first time a governance framework and a research framework
have been unified into a single loop. The constitution governs the
research. The research updates the constitution. The loop is auditable,
reproducible, and owned — not rented from an API.

---

## What Anthropic Gets

Anthropic's Constitutional AI framework specifies principles.
TLC 2.0 is the enforcement infrastructure those principles require.

Specifically:
- The pre-commit hook is a Constitutional AI gate at the code level
- The governance-harness probes are empirical measurements of whether
  a model's internal representations align with constitutional principles
- The llm-council is the deliberation mechanism Constitutional AI
  describes but does not implement at the infrastructure level
- The autoresearch loop is the research process that can discover which
  constitutional principles are actually learnable by a model and which
  are only asserted

TLC 2.0 is what Constitutional AI looks like as running infrastructure
rather than a research paper.

---

## What OpenAI Gets

OpenAI's Model Spec defines desired behaviors.
TLC 2.0 is the verification system that tests whether a model actually
exhibits those behaviors — not in evaluation benchmarks, but in
activation space during training.

Specifically:
- governance-harness probes can be retrained on OpenAI's behavioral
  categories using the same LDA + GES causal discovery pipeline
- The evidence chain is the audit trail OpenAI's safety team needs
  to demonstrate to regulators that governance claims are empirical,
  not marketing
- The council deliberation is the review mechanism that prevents any
  single team from advancing a capability claim without independent
  multi-model scrutiny

TLC 2.0 gives OpenAI's safety team something to point to when asked:
"Where is the evidence that your governance process works?"

---

## What Every Other Lab Gets

The same thing: a governance system that runs, produces evidence,
and is reproducible. Not a framework document. Not a set of evaluations.
A constitutional infrastructure that any lab can fork, configure, and run
under their own invariants.

The SOCIOTECHNICAL_CONSTITUTION.md is the seed. The invariants are
configurable. The council models are configurable. The probe targets are
retargetable. The autoresearch loop runs on any training setup.

A lab that adopts TLC 2.0 can say, for the first time: "Our governance
claims are falsifiable. Here is the evidence chain. Here is the audit log.
Here is the council verdict. Run it yourself."

---

## The Honest State Right Now

TLC 2.0 is research infrastructure in active development.

What is working:
- Document validation (Article XVI, I1-I6 structural checks)
- Commit governance (pre-commit hook, registry enforcement)
- Module registry with truth_status tracking
- Terminal UI (Hermes-style, gold theme, full command set)
- governance-harness absorbed — probes exist for I1-I8
- llm-council absorbed — 3-stage deliberation engine ready
- autoresearch absorbed — experiment loop ready
- nanochat absorbed — INSTALL.ipynb ready for Colab

What requires a GPU to complete:
- nanochat training (Flash Attention 3, CUDA required)
- autoresearch experiment loop (H100 preferred)
- governance-harness probes retrained on real data

What requires an OpenRouter key to complete:
- llm-council evidence validation gate
- Constitutional amendment deliberation

The first researcher to run this end-to-end on a GPU instance will
produce the first empirical evidence that governance and capability
can be measured in the same experiment loop, on a model you own,
under a constitution you control.

---

## How to Verify Every Claim in This Document

```bash
git clone https://github.com/coreyalejandro/the-living-constitution-2.0
cd the-living-constitution-2.0

# See the invariants
cat SOCIOTECHNICAL_CONSTITUTION.md

# Run the document validator
node scripts/validate-instructions.mjs docs/HOW-TO-USE.md

# See the module registry
cat registry/modules.registry.json

# Start the TLC terminal UI
node scripts/tlc.mjs

# See the governance-harness probes
ls modules/governance-harness/probes/

# See the experiment loop
cat modules/autoresearch/program.md

# See the deliberation engine
cat modules/llm-council/backend/council.py
```

Every claim in this document maps to a file in this repository.
No claim requires you to trust the author.
That is the point.

---

## Contact

Corey Alejandro
AI Safety Research
The Living Constitution 2.0
https://github.com/coreyalejandro/the-living-constitution-2.0
