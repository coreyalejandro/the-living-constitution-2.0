# TLA+ Model Check Results

## Spec: EvidenceChain.tla

**Status:** SPEC WRITTEN — model check PENDING (TLC not installed on this machine)

## How to run

1. Download tla2tools.jar from https://github.com/tlaplus/tlaplus/releases
2. Place in src/evidence-chain/spec/
3. Run:

   java -jar tla2tools.jar -deadlock src/evidence-chain/spec/EvidenceChain.tla

   Or with TLC model checker:

   java -cp tla2tools.jar tlc2.TLC EvidenceChain \
     -config EvidenceChain.cfg \
     -workers auto \
     2>&1 | tee tlc-output.txt

## Model scope

Constants:
  Claims   = {"c1", "c2"}
  Operators = {"op1", "op2"}

State space: small (2 claims x 7 states x 2 operators) — exhaustive check expected < 1s

## Invariants checked by spec

  TypeOK          — all variables remain correctly typed
  StateIsReachable — every claim state is in TruthStates
  ChainMonotone    — chain length is >= 1 and non-decreasing
  TerminalIsAbsorbing — terminal states never exit (temporal)

## Expected outcome

No violations of TypeOK, StateIsReachable, or ChainMonotone.
TerminalIsAbsorbing: TRUE — ValidTransitions for DEPLOYED and RETRACTED are empty sets.
No deadlock: claims can always be Retracted from any non-terminal state.

## Property not model-checked (liveness)

EventuallyTerminal requires a fair-scheduling assumption (WF) and a finite
action sequence. Not included in this spec to keep the model finite and safe
for the TLC safety checker. Liveness is guaranteed by the engine implementation
(every non-terminal claim has at least RETRACTED available).

## Verification path for CI

Add to .github/workflows/ci.yml:

  - name: TLA+ model check
    run: |
      curl -sL https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar \
        -o tla2tools.jar
      java -cp tla2tools.jar tlc2.TLC EvidenceChain \
        -config src/evidence-chain/spec/EvidenceChain.cfg \
        -workers 2 2>&1 | tee tlc-output.txt
      grep -q "No errors" tlc-output.txt
