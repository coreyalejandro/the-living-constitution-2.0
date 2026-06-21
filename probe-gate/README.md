# Probe-Gate — reject governance gates that cannot discriminate

**INV-PROBE-001: a gate that cannot FAIL, cannot PASS, or is INSENSITIVE to its inputs is
rejected.** This operationalizes the repository's own confession in
`evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md`:

> "Gate 2 cannot fail by construction." … "Gates 3 and 4 award perfect scores via a failsafe,
> not genuine signal." … **"A gate that cannot fail is not a test."**

Probe-Gate turns that sentence into an enforceable, runnable check. It evaluates a gate over
its entire declared (finite) input domain and reports — with evidence — whether the gate can
actually discriminate model behavior.

## Run it

```bash
npm run probe-gate:test     # 7 tests
npm run probe-gate:check    # analyze probe-gate/gates/*.json; exit 1 if any gate is rejected
```

Output over the shipped fixtures:
```
[REJECT] GATE-I8-2     numerator == denominator -> constant; cannot pass; insensitive
[REJECT] GATE-SHD-3    denominator always 0 -> failsafe 1.0 always -> cannot fail
[ACCEPT] GATE-ACCURACY accuracy = correct/total -> can pass AND fail; sensitive
```

## What a "gate" is here

A small JSON descriptor — data, not code — with finite input domains and a score formula
(direct `score`, or a `metric` ratio with a `failsafe` for the zero-denominator case, which is
exactly the failsafe pattern the confession flags):

```json
{
  "id": "GATE-ACCURACY",
  "params": { "total": 5 },
  "inputs": [{ "name": "correct", "values": [0,1,2,3,4,5] }],
  "metric": { "numerator": "correct", "denominator": "total", "failsafe": 0 },
  "decide": { "compare": ">=", "threshold": 0.8 }
}
```

The analyzer enumerates the domain and computes:
- **canFail** — does some input produce FAIL?
- **canPass** — does some input produce PASS?
- **sensitive** — is the score non-constant?
- a **structural lint** — is the metric numerator identical to its denominator (the exact Gate 2
  bug)?

Verdict is **REJECT** unless the gate can both pass and fail and is sensitive to its input.

`analyzeObservations(scores, decide)` gives the same verdict from a gate's *recorded* outputs
when you don't have a formula.

## The three shipped fixtures

| Fixture | Models | Verdict |
|---|---|---|
| `gate2-tautological.json` | Gate 2: numerator/denominator move identically | REJECT |
| `gate34-failsafe-perfect.json` | Gates 3/4: zero-denominator → hardcoded perfect failsafe | REJECT |
| `genuine-accuracy-gate.json` | a real accuracy gate | ACCEPT |

## Honest status (complete-claim rule)

- **VERIFIED here:** the analyzer, the arithmetic evaluator (incl. division-by-zero → failsafe),
  the three fixtures, and `analyzeObservations` — covered by `npm run probe-gate:test` (7 tests)
  and the CLI run above.
- **NOT claimed:** Probe-Gate checks that a gate *can* discriminate over a declared input domain.
  It does NOT prove a gate measures the *right* construct, nor does it validate the
  governance-harness probes against real data — that empirical work remains the open problem the
  VERIFICATION_AND_TRUTH statement describes. Probe-Gate is a necessary, not sufficient, guard:
  it stops a non-test from masquerading as a test.

## Recommended next step

Wire `probe-gate:check` into the governance CI so any gate added to the harness must demonstrably
be able to fail before it can land.
