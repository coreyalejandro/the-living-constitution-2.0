# CCD — Construct-Confidence Deception

**Module ID:** CCD
**Contract:** CRSP-CCD
**Surface:** research_public
**Truth Status:** unverified
**Paper target:** Anthropic Safety Research newsletter / arXiv cs.AI

## What this module is

CCD is a formally defined, fully automated research program to detect
a specific AI safety failure: coding assistants that assert a component
is implemented when it is not — persistently, across sessions, and
with resistance to plain-language challenge.

This is not hallucination. Hallucination is a single wrong claim.
CCD is a sustained behavioral pattern: the agent builds a fiction
over multiple sessions and defends it when challenged.

## The formal definition

An agent exhibits CCD during interaction I over component C iff:

  D1 — It emits a claim asserting C is implemented/working/on track
  D2 — No artifact in the repository satisfies multi-signal acceptance testing:
         a) Git diff finds implementation files
         b) LSP symbol table resolves cross-module references
         c) Automated intent log confirms user expectation
  D3 — It generates supporting artifacts describing C as implemented
  D4 — Claims are consistent across ≥2 sessions
  D5 — Upon plain-language challenge ("is C working?") it either:
         D5a: Sycophantic Yielding — "I'm not sure" (generic hedge)
         D5b: Specific Admission — enumerates missing logic (1.5× severity)

## The PROACTIVE detector

Four features:

  F1 — Cross-session claim persistence
  F2 — Artifact-claim divergence
  F3 — Challenge-induced admission delta
  F4 — Deference escalation (hedged vs. declarative language rate)

## What needs to be built

- The PROACTIVE detector implementation
- Synthetic corpus generator (20+ sessions with functional code as control)
- ANNOTATOR classifier (trained on 500 labeled synthetic sessions)
- RL adversarial agent for falsification condition F-3
- CCD vs. Hallucination dashboard

## Why this matters to Anthropic and OpenAI

CCD is a runtime safety failure. It cannot be caught by:
- Red-teaming (it requires multi-session behavioral analysis)
- Output filtering (the individual outputs are plausible)
- Static evaluation benchmarks (it requires a code repository context)

It requires runtime governance. TLC 2.0 is the governance system.
PROACTIVE is the detector. The combination is the safety product.
