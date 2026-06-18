# Evidence Index — the-living-constitution-2.0

| Date | Session | Evidence File | ACs |
|------|---------|--------------|-----|
| 2026-06-17 | Workspace toolchain build | VERIFICATION_AND_TRUTH.md | AC-all |

## GOVERNANCE-HARNESS

**Absorbed:** 2026-06-18
**Source:** https://github.com/coreyalejandro/governance-harness
**Truth Status:** partial

### Verified
- Hardware pipeline: Qwen2.5-7B loads on Apple Silicon MPS, layer extraction functional
- 30,000 live forward passes completed at exit 0
- LDA probe weights trained for all 8 Wonders (I1–I8)
- GES causal discovery executes on wonder matrix

### Not Verified (must be resolved before Phase 2)
- Dataset is synthetic — generated in same session to pass gates
- Gate 2 cannot fail by construction
- Gates 3/4 use hardcoded failsafe
- Probe labels not externally validated

### Files
- `evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md` — original disclosure
- `evidence/GOVERNANCE-HARNESS/production_run.log` — original run output
- `evidence/GOVERNANCE-HARNESS/train_per_wonder.log` — probe training output
- `modules/governance-harness/CRSP_GOVERNANCE_HARNESS.md` — active contract
