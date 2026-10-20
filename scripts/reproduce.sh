#!/usr/bin/env bash
# One command to re-verify TLC 2.0 from a fresh clone (no npm install, no network, no API key):
# the same zero-dependency steps as the "verify" job in .github/workflows/governance-ci.yml.
# Research results are re-run separately (they clone other repositories): npm run tlc:reproduce-research
set -euo pipefail
cd "$(dirname "$0")/.."
step() { echo; echo "=== $1"; }
step "TLC-SL: model-check all invariants";            node tlc-sl/src/compile.mjs --target check
step "TLC-SL test suite";                             node --test tlc-sl/tests/*.test.mjs
step "Evidence-chain test suite (Ed25519 + Merkle)";  node --test src/core/evidence-chain.test.mjs
step "Probe-gate test suite (INV-PROBE-001)";         node --test probe-gate/tests/*.test.mjs
step "Cross-layer integration tests";                 node --test tests/integration/*.test.mjs
step "Two constitutions through one runtime";         node constitutions/check-platform.mjs
step "Signed TLC-SL evidence against its pinned key"
node src/core/evidence-chain.mjs verify evidence/TLC-SL/verification.signed.jsonl evidence/TLC-SL/evidence-public-key.pem 86830b85ea407ff97cdf2b888760142da9a27ad9e796eeff151ca36a5d285308
step "No drift: generated targets match the specs"
node tlc-sl/src/compile.mjs --target all --quiet
node tlc-sl/src/compile.mjs constitutions/instructional-integrity/spec --target all --out constitutions/instructional-integrity --quiet
git diff --quiet -- tlc-sl/generated constitutions/instructional-integrity/generated || { echo "Generated targets are out of date."; exit 1; }
echo; echo "Done. TLC 2.0 verified: invariants, 44 tests, platform check, signed evidence, no drift."
