# The Instructional Integrity Constitution (II-*)

A constitution for **instructional systems design**, authored in TLC-SL and executed by the same
runtime as the TLC governance constitution. It exists both as a useful artifact (governing
AI-mediated instruction) and as the platform proof: a constitution in a domain with **no overlap**
with governance or the Eight Wonders relational economy.

It also serves the Quantic / human-centered-learning research line directly — these invariants
govern popup interventions, cognitive load, formative feedback, mastery, and neurodivergent
accessibility, with no retail content.

## Invariants

| ID | Theory | Rule (safety property) |
|---|---|---|
| **II-001** | Mastery Learning (Bloom) | A learner advances only after demonstrating mastery: `unit = advanced ⇒ mastery = demonstrated` |
| **II-002** | Gagné events 7–9 | Summative only after formative feedback: `summative = taken ⇒ formative = given` |
| **II-003** | Cognitive Load Theory (Sweller) | Over-ceiling load may be presented only if segmented (else a breach) |
| **II-004** | Scaffolding / dependency | Content presented only when prerequisites met: `content = presented ⇒ prereq = met` |
| **II-005** | Universal Design for Learning | Delivery only with an accessible rendering: `delivery = delivered ⇒ a11y = present` (ties to Article XVI) |
| **II-006** | Merrill activation (WARN) | New instruction begins only after activating prior knowledge: `instruction = started ⇒ activation = done` |

## Verify

```bash
npm run ii:check        # 6/6 invariants model-checked through the TLC-SL runtime
npm run constitutions:check   # both constitutions: tlc-governance 22/22 ; instructional-integrity 6/6
```

## Honest status

- **Verified:** all 6 invariants pass the exhaustive in-process checker (safety + guard-necessity);
  generated runtime/TLA+ targets are committed.
- **Not claimed:** these are *specifications* of instructional integrity rules, not an empirical
  finding that enforcing them improves learning outcomes — that is an experimental question
  (the kind the Quantic validation studies would answer). The constitution governs *whether the
  rules hold*, not *whether the rules are the right rules*.
