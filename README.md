# The Living Constitution 2.0

**One command. One terminal. AI governance that runs.**

```bash
node scripts/tlc.mjs
```

That is it. You are in.

---

## What is this?

TLC 2.0 is an AI governance system that you can actually run.

Not a framework document. Not a set of principles. A system with a terminal,
a registry, a deliberation engine, probes, an experiment loop, and a model it
trains from scratch — all governed by a written constitution with enforced rules.

Every other AI governance system asks you to trust it.
This one asks you to verify it.

---

## Who is this for?

**You if you are a researcher at Anthropic, OpenAI, DeepMind, or any lab**
that publishes principles but does not have running infrastructure to enforce them.

**You if you are an AI safety engineer** who wants a governance system that
produces evidence, not just documentation.

**You if you are Corey** — or anyone like him — who thinks in systems,
needs explicit structure, and needs every instruction to say exactly what to do
with zero ambiguity.

---

## Start in 60 seconds

**Step 1.** Make sure you have Node.js 18 or higher.

```bash
node --version
```

If it says v18 or higher, you are ready. If not, install Node from nodejs.org.

**Step 2.** Clone this repository.

```bash
git clone https://github.com/coreyalejandro/the-living-constitution-2.0
cd the-living-constitution-2.0
```

**Step 3.** Start the TLC terminal.

```bash
node scripts/tlc.mjs
```

A gold-themed terminal opens. Type `/help` to see everything you can do.
Type `/setup` to walk through first-time configuration.
Type `/quit` to exit.

That is the whole setup.

---

## What the terminal does

When you run `node scripts/tlc.mjs` you get a terminal that looks and
behaves like Claude or ChatGPT — same kind of interface, same feel —
except it is your governance system, running locally, with no internet
required for the core features.

Commands you will use most:

```
/help                    see all commands
/setup                   first-time walkthrough
/modules                 list all 24 governed modules
/status                  color-coded health of every module
/work MODULE-ID          start a governed session on a module
/done MODULE-ID          close the session and record evidence
/validate path/to/file   check a file for plain-language violations
/council YOUR QUESTION   ask the multi-model council a question
/probe                   run neural probe scores on the nanochat model
/autoresearch            see experiment results table
/health                  full system health check
/quit                    exit
```

---

## What TLC 2.0 actually does — five plain-language sentences

**1. It enforces rules on every file you write.**
The validator checks that instructions are unambiguous, spatial-reasoning-safe,
and do not use shell commands as natural language. Violations are named and blocked.

**2. It enforces rules on every git commit.**
The pre-commit hook checks that every module is registered, no quarantined
module is being edited, and no invariant is bypassed. A bad commit does not land.

**3. It deliberates on governance decisions.**
When you need to know whether a module is ready to advance, or whether a
constitutional change is sound, the council runs — multiple models answer
independently, review each other anonymously, and a Chairman synthesizes
the verdict.

**4. It measures governance in activation space.**
Eight neural probes — one per constitutional invariant — score every model
checkpoint. An experiment that improves language model performance but
degrades governance alignment is flagged before it lands.

**5. It trains a model under its own constitution.**
nanochat is the model TLC builds from scratch. Every training commit is
governed. Every checkpoint is probed. The training loop and the governance
system are the same system.

---

## The modules

TLC 2.0 has 24 registered modules. Here is every one of them, grouped by
what they do and whether they are ready to run right now.

### Running right now — no setup needed

| Module | What it does |
|---|---|
| CRSP-STC-RUNTIME-001 | The governance runtime itself. This is what you are running. |
| THE-LIVING-CONSTITUTION | The written constitution — Articles I through XVI. |

### Running — needs your OpenRouter API key

| Module | What it does | One-time setup |
|---|---|---|
| LLM-COUNCIL | Multi-model deliberation engine. 3-stage: independent → peer review → Chairman. | Add `OPENROUTER_API_KEY=sk-or-...` to a `.env` file in the repo root. Get a key at openrouter.ai. |

### Running — needs a GPU (Colab or cloud)

| Module | What it does | What you need |
|---|---|---|
| NANOCHAT | GPT model trained under TLC governance. | Google Colab GPU runtime. Open `modules/nanochat/INSTALL.ipynb` and press Run All. |
| GOVERNANCE-HARNESS | 8 neural probes measuring I1-I8 in activation space. | GPU to run probes on a checkpoint. |
| AUTORESEARCH | Autonomous experiment loop — val_bpb + governance scores per commit. | NVIDIA GPU (CUDA). Not runnable on Mac. |

### Active research — in progress

These modules have contracts and evidence records. Work is underway.

| Module | Status | What it needs to advance |
|---|---|---|
| AGENT-SENTINEL | partial | Evidence validation by council |
| COGNITIVE-GOVERNANCE-LAB | partial | Visual understanding layer + evidence |
| CONSENTCHAIN | partial | Technical implementation milestone |
| CONSENT-GATEWAY-AUTH0 | partial | Auth0 integration tested |
| COREYS-AGENTIC-PORTFOLIO | partial | Portfolio data export verified |
| HIDRS | partial | C1L4 complete. Next: C1L5 dataset |
| TLC-RESEARCH-PAPER-PRODUCT-TEMPLATE | partial | Paper packet complete |

### Planned — not started yet

| Module | What it will be |
|---|---|
| CONTRACT-WINDOW-EXHIBIT | Public-facing contract visualization |
| TLC-EVIDENCE-OBSERVATORY | Real-time evidence monitoring dashboard |
| MULTIAGENT-DEBATE | Structured multi-agent debate on governance claims |
| META-PROMPT-ARCHITECT | Prompt architecture for governance-safe LLM calls |
| MISALIGNMENT-EVIDENCE-LAB | Evidence lab for detecting misalignment patterns |
| PROACTIVE-AI-CONSTITUTION-TOOLKIT | Toolkit for deploying TLC in other organizations |
| AI-SAFETY-IDENTITY-STRATEGY | Identity and attribution framework for AI systems |
| ZERO-SHOT-BUILD-OS-DOCS | Zero-shot documentation builder for governed repos |
| PORTFOLIO-V2 | Portfolio v2 with full evidence integration |
| TLC-ARTIFACTS-RESTRUCTURE | Artifact registry restructure |

---

## The architecture in one diagram

```
YOUR TERMINAL
     │
     ▼
node scripts/tlc.mjs
     │
     ├─ /validate     → validate-instructions.mjs
     │                  Checks files for plain-language violations (Article XVI)
     │
     ├─ /work /done   → Session system
     │                  Starts and closes governed work sessions
     │                  Writes active-session.md for your AI assistant to read
     │
     ├─ /council      → modules/llm-council/backend/council.py
     │                  Stage 1: all models answer independently
     │                  Stage 2: anonymous peer review + ranking
     │                  Stage 3: Chairman synthesizes verdict
     │                  Requires: OPENROUTER_API_KEY in .env
     │
     ├─ /probe        → modules/governance-harness/probes/run_live.py
     │                  Scores a model checkpoint on I1-I8
     │                  Requires: GPU + nanochat checkpoint
     │
     ├─ /autoresearch → modules/autoresearch/results.tsv
     │                  Shows val_bpb + I1-I8 per experiment commit
     │                  Requires: GPU to populate
     │
     └─ /health       → scripts/tlc-health.mjs
                        Checks git status, registry, hash chain, hook install
```

---

## The constitution

The rules TLC enforces are written in `SOCIOTECHNICAL_CONSTITUTION.md`.
There are 16 Articles and 8 Invariants (I1 through I8).

The short version:

- **I1** Every module needs a contract before any work starts
- **I2** Claims need evidence — assertion is not evidence
- **I3** Work must stay inside the contract scope
- **I4** Invariants cannot be bypassed by reframing
- **I5** No unauthorized personal data
- **I6** Quarantined modules are read-only
- **I7** Status labels must reflect reality — no inflation
- **I8** Every project needs a visual understanding layer

Article XVI (the one you will notice most) says: every instruction in this
system must be explicit, unambiguous, and safe for someone with spatial
reasoning differences to follow without guessing. That is why the instructions
here say exactly what to type and exactly what to expect.

---

## For AI safety researchers

The full case for why TLC 2.0 matters to your lab is in `docs/WHY-TLC.md`.

Short version: every major AI lab has published principles. None of them have
running infrastructure that enforces those principles, produces empirical
evidence of compliance, and amends itself through governed deliberation.
TLC 2.0 is that infrastructure. It is open. It is reproducible. Every claim
maps to a file in this repository.

---

## Files to know

```
SOCIOTECHNICAL_CONSTITUTION.md    the rules
README.md                         this file
docs/HOW-TO-USE.md                step-by-step operator instructions
docs/WHY-TLC.md                   why every AI lab needs this
registry/modules.registry.json    all 24 modules, truth_status, contracts
scripts/tlc.mjs                   the terminal UI — start here
scripts/tlc-health.mjs            system health check
scripts/tlc-setup.mjs             first-time setup wizard
scripts/validate-instructions.mjs Article XVI validator
modules/governance-harness/       neural probes for I1-I8
modules/llm-council/              3-stage deliberation engine
modules/autoresearch/             autonomous experiment loop
modules/nanochat/                 GPT model trained under governance
evidence/                         all evidence records, indexed
```

---

## What this does not claim

- That any unverified module is production-ready
- That governance-harness probes are validated on real data (they are trained
  on synthetic data — see `evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md`)
- That nanochat training has been completed (it has not — INSTALL.ipynb is the
  installer, the training run requires a GPU)
- That llm-council verdicts are infallible
- That TLC 2.0 is a deployed product — it is research infrastructure

Every module's truth_status is honest. `unverified` means unverified.
`partial` means partial. Nothing here is inflated.

---

## Questions

Open an issue at github.com/coreyalejandro/the-living-constitution-2.0
or reach out directly through the contact in `docs/WHY-TLC.md`.
