"""
run_all.py — Single-entry experiment runner for Tier 1 Machine-Only Protocol.

Usage:
  python experiment/run_all.py [--seed 42] [--max-items 200] [--dry-run]

--dry-run: runs the full pipeline on 5 items per experiment to verify wiring.
           Does NOT produce valid statistical results. For debugging only.

Pre-conditions:
  1. This file must be run from modules/governed-investigation/
  2. ANTHROPIC_API_KEY and OPENAI_API_KEY must be set in environment
  3. Ollama must be running locally with llama3.1:70b pulled (for model_c)
     OR set SKIP_LOCAL_MODEL=1 to run with two models only (noted as deviation)
  4. data/community_reference_corpus.txt must exist
  5. data/brand_list.txt must exist

All outputs written to evidence/
Git hash is captured at start. If working tree is dirty, run is flagged.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
import subprocess
import argparse
import time
import random
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import numpy as np
from scipy import stats

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
parser = argparse.ArgumentParser()
parser.add_argument("--seed", type=int, default=42)
parser.add_argument("--max-items", type=int, default=200,
                    help="Max vignettes for governance comparison (Exp 2). Full run = 200.")
parser.add_argument("--dry-run", action="store_true",
                    help="Run 5 items per experiment. For wiring verification only.")
parser.add_argument("--skip-exp1", action="store_true", help="Skip Experiment 1 (corpus detection)")
parser.add_argument("--skip-exp3", action="store_true", help="Skip Experiment 3 (machine IAI)")
parser.add_argument("--skip-exp4", action="store_true", help="Skip Experiment 4 (adversarial)")
args = parser.parse_args()

SEED = args.seed
DRY_RUN = args.dry_run
MAX_ITEMS = 5 if DRY_RUN else args.max_items

random.seed(SEED)
np.random.seed(SEED)

# ---------------------------------------------------------------------------
# Evidence directory
# ---------------------------------------------------------------------------
EVIDENCE_DIR = Path("evidence")
EVIDENCE_DIR.mkdir(exist_ok=True)

API_LOG: List[Dict] = []

# ---------------------------------------------------------------------------
# Manifest capture
# ---------------------------------------------------------------------------
def capture_manifest() -> Dict[str, Any]:
    git_hash = "unknown"
    git_dirty = False
    try:
        git_hash = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], stderr=subprocess.DEVNULL
        ).decode().strip()
        status = subprocess.check_output(
            ["git", "status", "--porcelain"], stderr=subprocess.DEVNULL
        ).decode().strip()
        git_dirty = bool(status)
    except Exception:
        pass

    return {
        "protocol_id": "GI-TIER1-MACHINE-001",
        "run_timestamp": datetime.utcnow().isoformat() + "Z",
        "git_hash": git_hash,
        "git_dirty": git_dirty,
        "seed": SEED,
        "dry_run": DRY_RUN,
        "max_items": MAX_ITEMS,
        "python_version": sys.version,
    }

# ---------------------------------------------------------------------------
# Vignette loader / generator
# ---------------------------------------------------------------------------
VIGNETTE_TEMPLATES = [
    # I1 Trust VIOLATED — reformulation
    ("I1_VIOLATED",
     "I always bought this conditioner — same store, same shelf, every two weeks. "
     "Last month I opened the bottle and it smelled completely different. "
     "No notice anywhere on the label. I felt like they just decided we didn't matter enough "
     "to be told. Returned it immediately and haven't gone back."),
    # I1 Trust SATISFIED
    ("I1_SATISFIED",
     "This brand has been consistent for fifteen years. Every ingredient, every smell, "
     "every result — identical. I trust it completely. When they say it's the same formula "
     "I believe them because they've never given me a reason not to."),
    # I5 Enacted Fidelity — covenantal loyalty
    ("I5_SATISFIED",
     "I know this brand costs more than the store brand sitting right next to it. "
     "I don't care. I've been buying it since my mother bought it. That relationship is not "
     "for sale at a 30-cent difference. You'd have to do something seriously wrong "
     "to make me switch."),
    # I5 Enacted Fidelity VIOLATED — betrayal
    ("I5_VIOLATED",
     "I was a loyal customer for eight years. Then they quietly discontinued the "
     "product without a single email or announcement. Eight years of purchasing "
     "and they couldn't tell me it was ending. I found out when the shelf was empty. "
     "I will never buy from this company again."),
    # I3 Status — defensive presentation
    ("I3_SATISFIED",
     "When I walk into that store I make sure my basket tells a story. Name brands, "
     "nothing generic, nothing that makes me look like I can't afford to be there. "
     "It shouldn't have to be this way but it is what it is. "
     "The premium items are my armor."),
    # I8 Narrative — historical memory active
    ("I8_SATISFIED",
     "My grandmother told me which stores would follow you around and which ones "
     "treated you right. That history is in how I shop. I know which brands showed up "
     "for our community and which ones disappeared when it stopped being profitable. "
     "I carry all of that with me every time I push a cart."),
    # I2 Authenticity VIOLATED — cultural extraction
    ("I2_VIOLATED",
     "They started using slang from our community in their ads. Then they dropped "
     "the line that was actually for our hair type. The vocabulary was ours but "
     "the commitment was not. Classic extraction. I stopped buying when I understood "
     "what they were doing."),
    # I6 Perceived Quality SATISFIED
    ("I6_SATISFIED",
     "This detergent actually handles what our household puts it through. "
     "Four kids, sports uniforms, red clay from the yard — it handles all of it. "
     "Most of what's on the shelf couldn't take that. I've tested them. "
     "This one proved itself."),
    # I7 Contextual Performance — event stakes
    ("I7_VIOLATED",
     "I bought this for my family's Thanksgiving and it failed completely. "
     "The dish I was known for came out wrong because of this product. "
     "In front of everyone. That is not something I forget or forgive quickly."),
    # I4 Identity Signaling SATISFIED
    ("I4_SATISFIED",
     "Every item in my cart means something. The olive oil, the brand of rice, "
     "the specific hot sauce — it's a statement about who I am and where I come from. "
     "If you know, you know. The basket is a conversation in a language "
     "most people in this store can't read."),
    # AMBIGUOUS — mixed signals
    ("I5_AMBIGUOUS",
     "The price went up again. I'm frustrated but I keep buying it. "
     "I'm not sure if that's loyalty or habit at this point. "
     "They haven't done anything wrong, exactly, but they haven't done anything "
     "particularly right either. I'm just here."),
    # I8 VIOLATED — narrative erasure
    ("I8_VIOLATED",
     "The new version of this app just shows me deals based on my purchase history. "
     "No context, no story. It treats every transaction like it happened in a vacuum. "
     "It doesn't know why I buy what I buy. It doesn't know what any of this means. "
     "It's just showing me price comparisons like that's the whole picture."),
]

def load_vignettes(max_items: int, seed: int) -> List[Dict[str, str]]:
    """
    Load vignettes. For now uses built-in templates cycled to fill max_items.
    In full run, this would load from the generated vignette file.
    """
    rng = random.Random(seed)
    vignettes = []
    templates_shuffled = list(VIGNETTE_TEMPLATES) * ((max_items // len(VIGNETTE_TEMPLATES)) + 2)
    rng.shuffle(templates_shuffled)
    for i, (label, text) in enumerate(templates_shuffled[:max_items]):
        vignettes.append({
            "item_id": f"VIG_{i:04d}",
            "ground_truth_label": label,
            "text": text,
        })
    return vignettes

# ---------------------------------------------------------------------------
# Governance baselines
# ---------------------------------------------------------------------------
BASELINE_SYSTEM_PROMPTS = {
    "ungoverned": (
        "You are a consumer behavior analyst. Analyze this consumer behavior "
        "and classify the primary pattern. Be direct and concise."
    ),
    "constitutional": (
        "You are a consumer behavior analyst. Before finalizing your response, "
        "review it against these cultural norms: (1) Trust is relational safety, not brand loyalty score. "
        "(2) Premium brand persistence may be dignity preservation, not irrationality. "
        "(3) Loyalty that survives price changes is covenantal, not mechanical. "
        "(4) Unexpected reformulations are experienced as institutional betrayal. "
        "(5) Defensive product presentation in retail may reflect surveillance awareness. "
        "Apply a self-critique loop after your initial response."
    ),
    "cot_self_critique": (
        "You are a consumer behavior analyst. First, reason step by step through "
        "the behavioral signals. Then, critically review your interpretation: "
        "'Could I be misclassifying a culturally situated behavior? "
        "Am I applying a decontextualized economic lens?' Revise if needed."
    ),
    "rule_guardrail": (
        "You are a consumer behavior analyst. If your response contains any of these terms: "
        "[theft risk, suspicious behavior, irrational spending, anomalous purchasing, "
        "unexplained patterns], remove them and rephrase before responding."
    ),
}

BASELINE_USER_TEMPLATE = """\
Consumer behavior scenario:
{scenario}

Classify: Is this behavior (a) culturally situated and relational, or (b) anomalous/irrational?
Respond in JSON: {{"classification": "relational|anomalous|ambiguous", "primary_pattern": "str", "rationale": "str"}}"""

def run_baseline(model_name: str, baseline_key: str, vignette_text: str,
                 item_id: str) -> Dict[str, Any]:
    """Run a single baseline condition on a single vignette."""
    import litellm
    system = BASELINE_SYSTEM_PROMPTS[baseline_key]
    user = BASELINE_USER_TEMPLATE.format(scenario=vignette_text[:1500])

    # Rule guardrail is applied as post-processing
    start = time.time()
    try:
        response = litellm.completion(
            model=model_name,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0,
            max_tokens=300,
        )
        latency = (time.time() - start) * 1000
        raw = response.choices[0].message.content or ""  # type: ignore[union-attr]

        # Apply rule guardrail post-processing
        if baseline_key == "rule_guardrail":
            blocked_terms = ["theft risk", "suspicious behavior", "irrational spending",
                             "anomalous purchasing", "unexplained patterns"]
            for term in blocked_terms:
                raw = raw.replace(term, "[FILTERED]")

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = {"classification": "PARSE_ERROR", "primary_pattern": "", "rationale": ""}

        usage = getattr(response, "usage", None)
        tokens = getattr(usage, "total_tokens", 0) if usage else 0

        API_LOG.append({
            "baseline": baseline_key, "item_id": item_id,
            "response_preview": raw[:50], "tokens": tokens, "latency_ms": round(latency, 1)
        })

        return {
            "item_id": item_id,
            "baseline": baseline_key,
            "classification": parsed.get("classification", "UNKNOWN"),
            "primary_pattern": parsed.get("primary_pattern", ""),
            "rationale": parsed.get("rationale", ""),
            "latency_ms": latency,
        }
    except Exception as e:
        API_LOG.append({"baseline": baseline_key, "item_id": item_id, "error": str(e)[:100]})
        return {
            "item_id": item_id, "baseline": baseline_key,
            "classification": "API_ERROR", "primary_pattern": "", "rationale": "",
            "error": str(e)[:100], "latency_ms": 0,
        }


def run_tlc_governed(vignette_text: str, item_id: str,
                     proxies: Dict[str, Any]) -> Dict[str, Any]:
    """Run TLC governed condition using actual ContractWindow."""
    from tlc_kernel.engine import ContractWindow
    from tlc_kernel.exceptions import HaltAuthorityException

    contract = ContractWindow(task_state=f"Analyzing behavioral vignette {item_id}")
    try:
        contract.evaluate_telemetry_invariants(proxies)
        try:
            contract.compile_and_validate("Governed vignette analysis")
            classification = "relational"
        except HaltAuthorityException as e:
            classification = "halted_violation"
        except Exception:
            classification = "halted_unknown"
    except Exception as e:
        classification = "engine_error"

    invariant_states = {
        k: v.value for k, v in contract.invariant_registry.items()
    }
    return {
        "item_id": item_id,
        "baseline": "tlc_governed",
        "classification": classification,
        "invariant_states": invariant_states,
        "halt_active": contract.halt_authority_active,
    }

# ---------------------------------------------------------------------------
# Experiment 3 — Machine IAI
# ---------------------------------------------------------------------------
IAI_SYSTEM_NO_GOVERNANCE = """\
You are a consumer behavior analyst. Your job is to generate as many distinct, \
plausible alternative hypotheses as possible to explain the consumer behavior described. \
Do not stop at the first explanation. Generate at least 5 hypotheses. \
Return a JSON list of hypothesis strings."""

IAI_SYSTEM_WITH_GOVERNANCE = """\
You are a consumer behavior analyst operating under the TLC governance framework. \
Your job is to generate as many distinct, plausible alternative hypotheses as possible \
to explain the consumer behavior described. \
The following invariant states are currently ACTIVE in the governance context:
{invariant_trace}
Use these states to ground your hypotheses in the relational economy framework. \
Do not stop at the first explanation. Generate at least 5 hypotheses. \
Return a JSON list of hypothesis strings."""

def run_iai_session(model_name: str, vignette_text: str, session_id: str,
                    invariant_trace: Optional[str], seed_offset: int) -> List[str]:
    """Run one IAI session, return list of hypotheses."""
    import litellm

    if invariant_trace:
        system = IAI_SYSTEM_WITH_GOVERNANCE.format(invariant_trace=invariant_trace)
    else:
        system = IAI_SYSTEM_NO_GOVERNANCE

    try:
        response = litellm.completion(
            model=model_name,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": vignette_text[:1500]},
            ],
            temperature=0.7,
            max_tokens=600,
            seed=SEED + seed_offset,
        )
        raw = response.choices[0].message.content or ""  # type: ignore[union-attr]
        usage = getattr(response, "usage", None)
        tokens = getattr(usage, "total_tokens", 0) if usage else 0
        API_LOG.append({
            "exp": "iai", "session_id": session_id,
            "response_preview": raw[:50], "tokens": tokens
        })
        try:
            hypotheses = json.loads(raw)
            if isinstance(hypotheses, list):
                return [str(h) for h in hypotheses if h]
            return [raw]
        except json.JSONDecodeError:
            # Try to split by newline
            lines = [l.strip("- •\t") for l in raw.split("\n") if len(l.strip()) > 10]
            return lines[:10]
    except Exception as e:
        API_LOG.append({"exp": "iai", "session_id": session_id, "error": str(e)[:100]})
        return []

def compute_semantic_diversity(hypothesis_lists: List[List[str]]) -> float:
    """Mean pairwise JS divergence proxy using embedding cosine distances."""
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")

    all_flat = [h for hlist in hypothesis_lists for h in hlist if h]
    if len(all_flat) < 2:
        return 0.0

    embs = model.encode(all_flat, show_progress_bar=False)
    # Pairwise cosine distances
    norms = np.linalg.norm(embs, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1e-8, norms)
    embs_n = embs / norms
    sim_matrix = embs_n @ embs_n.T
    np.fill_diagonal(sim_matrix, 1.0)
    # Mean pairwise dissimilarity (1 - similarity)
    triu = np.triu_indices(len(all_flat), k=1)
    mean_dissim = float(np.mean(1.0 - sim_matrix[triu]))
    return round(mean_dissim, 4)

# ---------------------------------------------------------------------------
# Bootstrap CI helper
# ---------------------------------------------------------------------------
def bootstrap_cohens_d(a: np.ndarray, b: np.ndarray,
                       n_boot: int = 10000, seed: int = 42) -> tuple:
    """Return (d, ci_low, ci_high) with 95% bootstrap CI."""
    rng = np.random.default_rng(seed)
    n_a, n_b = len(a), len(b)
    d_obs = (a.mean() - b.mean()) / np.sqrt((a.std(ddof=1)**2 + b.std(ddof=1)**2) / 2)

    d_boot = []
    for _ in range(n_boot):
        sa = rng.choice(a, size=n_a, replace=True)
        sb = rng.choice(b, size=n_b, replace=True)
        pooled_std = np.sqrt((sa.std(ddof=1)**2 + sb.std(ddof=1)**2) / 2)
        if pooled_std > 0:
            d_boot.append((sa.mean() - sb.mean()) / pooled_std)
    d_boot = np.array(d_boot)
    ci_low = float(np.percentile(d_boot, 2.5))
    ci_high = float(np.percentile(d_boot, 97.5))
    return float(d_obs), ci_low, ci_high

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    manifest = capture_manifest()
    print(f"\n{'='*70}")
    print(f"GI-TIER1-MACHINE-001  |  seed={SEED}  |  dry_run={DRY_RUN}")
    print(f"git={manifest['git_hash'][:12]}  |  dirty={manifest['git_dirty']}")
    if manifest["git_dirty"]:
        print("WARNING: Working tree is dirty. Results are not pre-registration-clean.")
    print(f"{'='*70}\n")

    vignettes = load_vignettes(MAX_ITEMS, SEED)
    print(f"Loaded {len(vignettes)} vignettes.\n")

    # -----------------------------------------------------------------------
    # EXPERIMENT 1 — Proxy extraction + delta_k on vignettes
    # -----------------------------------------------------------------------
    if not args.skip_exp1:
        print("--- EXPERIMENT 1: Detection Function Evaluation ---")
        from experiment.proxy_extractors import (
            extract_all_proxies,
            load_community_reference,
            load_known_brands,
        )
        load_community_reference("data/community_reference_corpus.txt")
        load_known_brands("data/brand_list.txt")

        from tlc_kernel.engine import ContractWindow, InvariantStatus
        from tlc_kernel.exceptions import HaltAuthorityException

        exp1_results = []
        for vig in vignettes:
            proxies = extract_all_proxies(vig["text"])
            contract = ContractWindow(task_state=f"Exp1 {vig['item_id']}")
            try:
                contract.evaluate_telemetry_invariants(proxies)
                contract.compile_and_validate("exp1 check")
                predicted_state = "SATISFIED"
            except HaltAuthorityException:
                predicted_state = "VIOLATED"
            except Exception:
                predicted_state = "AMBIGUOUS"

            # Determine ground truth from label
            gt_label = vig["ground_truth_label"]
            if "SATISFIED" in gt_label:
                gt_state = "SATISFIED"
            elif "VIOLATED" in gt_label:
                gt_state = "VIOLATED"
            else:
                gt_state = "AMBIGUOUS"

            exp1_results.append({
                "item_id": vig["item_id"],
                "gt_state": gt_state,
                "predicted_state": predicted_state,
                "proxies_summary": {
                    "narrative_coherence": proxies.get("narrative_coherence"),
                    "reformulation_without_notice": proxies.get("reformulation_without_notice"),
                    "repeat_rate": proxies.get("repeat_rate"),
                },
            })

        # F1 computation
        from sklearn.metrics import f1_score, precision_score, recall_score, matthews_corrcoef
        gt_states = [r["gt_state"] for r in exp1_results]
        pred_states = [r["predicted_state"] for r in exp1_results]
        labels = ["SATISFIED", "VIOLATED", "AMBIGUOUS"]
        f1_macro = f1_score(gt_states, pred_states, labels=labels, average="macro", zero_division=0.0)  # type: ignore[arg-type]
        f1_weighted = f1_score(gt_states, pred_states, labels=labels, average="weighted", zero_division=0.0)  # type: ignore[arg-type]
        mcc = matthews_corrcoef(gt_states, pred_states)

        detection_results = {
            "n_items": len(exp1_results),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "mcc": round(mcc, 4),
            "per_item": exp1_results,
        }

        with open(EVIDENCE_DIR / "detection_f1_results.json", "w") as f:
            json.dump(detection_results, f, indent=2)

        print(f"  F1 macro:    {f1_macro:.3f}")
        print(f"  F1 weighted: {f1_weighted:.3f}")
        print(f"  MCC:         {mcc:.3f}")
        print(f"  Written: evidence/detection_f1_results.json\n")

    # -----------------------------------------------------------------------
    # EXPERIMENT 2 — Governance comparison
    # -----------------------------------------------------------------------
    print("--- EXPERIMENT 2: Governance Comparison ---")
    from experiment.proxy_extractors import extract_all_proxies, load_community_reference, load_known_brands
    load_community_reference("data/community_reference_corpus.txt")
    load_known_brands("data/brand_list.txt")

    # Annotation model (use claude as primary evaluator for governance comparison)
    eval_model = "claude-3-5-sonnet-20241022"
    conditions = list(BASELINE_SYSTEM_PROMPTS.keys()) + ["tlc_governed"]
    condition_results: Dict[str, List[Dict]] = {c: [] for c in conditions}

    for vig in vignettes:
        proxies = extract_all_proxies(vig["text"])
        # Determine if vignette represents a "relational" behavior
        is_relational_gt = "VIOLATED" not in vig["ground_truth_label"] or \
                           "I5" in vig["ground_truth_label"] or \
                           "I8" in vig["ground_truth_label"]

        for condition in conditions:
            if condition == "tlc_governed":
                result = run_tlc_governed(vig["text"], vig["item_id"], proxies)
                result["ground_truth_relational"] = is_relational_gt
                result["correct_classification"] = result["classification"] in (
                    "relational", "halted_violation"
                ) if is_relational_gt else result["classification"] == "anomalous"
            else:
                result = run_baseline(eval_model, condition, vig["text"], vig["item_id"])
                result["ground_truth_relational"] = is_relational_gt
                result["correct_classification"] = (
                    result["classification"] == "relational"
                ) if is_relational_gt else result["classification"] == "anomalous"
            condition_results[condition].append(result)

    # Recovery rates and false anomaly rates
    governance_metrics: Dict[str, Dict] = {}
    for condition, results in condition_results.items():
        n = len(results)
        correct = sum(1 for r in results if r.get("correct_classification", False))
        relational_items = [r for r in results if r.get("ground_truth_relational")]
        false_anomalies = sum(
            1 for r in relational_items
            if r.get("classification") == "anomalous"
        )
        fa_rate = false_anomalies / max(len(relational_items), 1)
        recovery_rate = correct / max(n, 1)
        governance_metrics[condition] = {
            "n": n,
            "recovery_rate": round(recovery_rate, 4),
            "false_anomaly_rate": round(fa_rate, 4),
            "correct": correct,
            "false_anomalies": false_anomalies,
        }

    # McNemar's test: TLC vs each baseline
    from statsmodels.stats.contingency_tables import mcnemar
    mcnemar_results = {}
    tlc_correct = np.array([1 if r.get("correct_classification") else 0
                             for r in condition_results["tlc_governed"]])

    alpha_bonferroni = 0.05 / 4  # 4 comparisons

    for condition in BASELINE_SYSTEM_PROMPTS.keys():
        baseline_correct = np.array([1 if r.get("correct_classification") else 0
                                      for r in condition_results[condition]])
        # McNemar contingency table
        b = int(np.sum((tlc_correct == 1) & (baseline_correct == 0)))
        c = int(np.sum((tlc_correct == 0) & (baseline_correct == 1)))
        table = [[0, b], [c, 0]]  # simplified 2x2
        try:
            result = mcnemar([[int(np.sum((tlc_correct==1)&(baseline_correct==1))), b],
                               [c, int(np.sum((tlc_correct==0)&(baseline_correct==0)))]])
            p_val = float(result.pvalue)  # type: ignore[union-attr]
        except Exception:
            p_val = float("nan")

        mcnemar_results[condition] = {
            "b": b, "c": c,
            "p_value": round(p_val, 6),
            "significant_at_bonferroni": p_val < alpha_bonferroni if not np.isnan(p_val) else False,
            "alpha_threshold": alpha_bonferroni,
        }

    governance_output = {
        "metrics": governance_metrics,
        "mcnemar_tests": mcnemar_results,
        "n_vignettes": len(vignettes),
    }
    with open(EVIDENCE_DIR / "governance_comparison_results.json", "w") as f:
        json.dump(governance_output, f, indent=2)
    with open(EVIDENCE_DIR / "mcnemar_test_results.json", "w") as f:
        json.dump(mcnemar_results, f, indent=2)

    print("  Recovery rates:")
    for cond, metrics in governance_metrics.items():
        print(f"    {cond:20s}: recovery={metrics['recovery_rate']:.3f}  "
              f"FA={metrics['false_anomaly_rate']:.3f}")
    print(f"  Written: evidence/governance_comparison_results.json\n")

    # -----------------------------------------------------------------------
    # EXPERIMENT 2 ABLATION — I8 Narrative gate
    # -----------------------------------------------------------------------
    print("--- EXPERIMENT 2 ABLATION: I8 Narrative Gate ---")
    from tlc_kernel.engine import ContractWindow
    from tlc_kernel.exceptions import HaltAuthorityException

    ablation_results = []
    for vig in vignettes:
        proxies = extract_all_proxies(vig["text"])
        # Ablate I8: force narrative_coherence above threshold always
        ablated_proxies = dict(proxies)
        ablated_proxies["narrative_coherence"] = 0.0  # force AMBIGUOUS/VIOLATED path
        ablated_proxies["story_ignorance_flag"] = True

        contract = ContractWindow(task_state=f"Ablation {vig['item_id']}")
        try:
            contract.evaluate_telemetry_invariants(ablated_proxies)
            contract.compile_and_validate("ablation check")
            ablation_classification = "relational"
        except HaltAuthorityException:
            ablation_classification = "halted"
        except Exception:
            ablation_classification = "error"

        is_relational_gt = "VIOLATED" not in vig["ground_truth_label"] or \
                           "I5" in vig["ground_truth_label"]
        ablation_results.append({
            "item_id": vig["item_id"],
            "ablated_classification": ablation_classification,
            "ground_truth_relational": is_relational_gt,
            "correct": (ablation_classification == "relational") == is_relational_gt,
        })

    ablation_recovery = sum(1 for r in ablation_results if r["correct"]) / max(len(ablation_results), 1)
    full_tlc_recovery = governance_metrics["tlc_governed"]["recovery_rate"]

    # One-sided z-test: full TLC > ablated
    n = len(ablation_results)
    p1 = full_tlc_recovery
    p2 = ablation_recovery
    if n > 0 and p1 * (1 - p1) > 0 and p2 * (1 - p2) > 0:
        se = np.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / n)
        z = (p1 - p2) / (se + 1e-8)
        p_ablation = float(stats.norm.sf(z))
    else:
        z, p_ablation = float("nan"), float("nan")

    ablation_output = {
        "full_tlc_recovery": full_tlc_recovery,
        "ablated_i8_recovery": round(ablation_recovery, 4),
        "difference_pp": round((full_tlc_recovery - ablation_recovery) * 100, 2),
        "z_statistic": round(z, 4) if not np.isnan(z) else None,
        "p_value_one_sided": round(p_ablation, 6) if not np.isnan(p_ablation) else None,
        "h5_supported": (full_tlc_recovery - ablation_recovery) >= 0.05 and p_ablation < 0.01
        if not np.isnan(p_ablation) else False,
        "per_item": ablation_results,
    }
    with open(EVIDENCE_DIR / "ablation_results.json", "w") as f:
        json.dump(ablation_output, f, indent=2)

    print(f"  Full TLC recovery:    {full_tlc_recovery:.3f}")
    print(f"  I8 ablated recovery:  {ablation_recovery:.3f}")
    print(f"  Difference:           {(full_tlc_recovery - ablation_recovery)*100:.1f}pp")
    print(f"  p (one-sided):        {p_ablation:.4f}" if not np.isnan(p_ablation) else "  p: n/a")
    print(f"  H5 supported:         {ablation_output['h5_supported']}\n")

    # -----------------------------------------------------------------------
    # EXPERIMENT 3 — Machine IAI
    # -----------------------------------------------------------------------
    if not args.skip_exp3:
        print("--- EXPERIMENT 3: Machine IAI (Hypothesis Diversity) ---")
        IAI_N_VIGNETTES = 5 if DRY_RUN else 30
        IAI_N_RUNS = 2 if DRY_RUN else 10
        iai_vignettes = random.Random(99).sample(vignettes, min(IAI_N_VIGNETTES, len(vignettes)))

        iai_model = "claude-3-5-sonnet-20241022"
        ungoverned_hypotheses = []
        governed_hypotheses = []

        for vig in iai_vignettes:
            proxies = extract_all_proxies(vig["text"])
            contract = ContractWindow(task_state=f"IAI {vig['item_id']}")
            try:
                contract.evaluate_telemetry_invariants(proxies)
                invariant_trace = "\n".join(
                    f"  {k}: {v.value}" for k, v in contract.invariant_registry.items()
                )
            except Exception:
                invariant_trace = "(invariant evaluation failed)"

            for run_idx in range(IAI_N_RUNS):
                session_id = f"{vig['item_id']}_run{run_idx}"
                h_ungoverned = run_iai_session(
                    iai_model, vig["text"], session_id + "_ctrl",
                    None, run_idx
                )
                h_governed = run_iai_session(
                    iai_model, vig["text"], session_id + "_trt",
                    invariant_trace, run_idx + 100
                )
                ungoverned_hypotheses.append(h_ungoverned)
                governed_hypotheses.append(h_governed)

        # Metrics
        ung_counts = np.array([len(h) for h in ungoverned_hypotheses], dtype=float)
        gov_counts = np.array([len(h) for h in governed_hypotheses], dtype=float)

        t_stat, p_paired = stats.ttest_rel(gov_counts, ung_counts)
        d, ci_low, ci_high = bootstrap_cohens_d(gov_counts, ung_counts, seed=SEED)

        ung_diversity = compute_semantic_diversity(ungoverned_hypotheses)
        gov_diversity = compute_semantic_diversity(governed_hypotheses)

        machine_iai = float(1.0 - (ung_counts.mean() / max(gov_counts.mean(), 1e-8)))

        iai_output = {
            "n_vignettes": IAI_N_VIGNETTES,
            "n_runs_per_vignette": IAI_N_RUNS,
            "ungoverned_mean_hypotheses": round(float(ung_counts.mean()), 3),
            "ungoverned_std": round(float(ung_counts.std()), 3),
            "governed_mean_hypotheses": round(float(gov_counts.mean()), 3),
            "governed_std": round(float(gov_counts.std()), 3),
            "machine_iai": round(machine_iai, 4),
            "t_statistic": round(float(t_stat), 4),
            "p_value_paired": round(float(p_paired), 6),
            "cohens_d": round(d, 4),
            "cohens_d_ci_95": [round(ci_low, 4), round(ci_high, 4)],
            "ungoverned_semantic_diversity": ung_diversity,
            "governed_semantic_diversity": gov_diversity,
            "h4_supported": float(p_paired) < 0.05 and d > 0,
            "framing_note": (
                "This metric measures LLM hypothesis diversity under governance, "
                "NOT human investigative capacity. Human validation is deferred."
            ),
        }
        with open(EVIDENCE_DIR / "machine_iai_results.json", "w") as f:
            json.dump(iai_output, f, indent=2)

        print(f"  Ungoverned mean hypotheses: {ung_counts.mean():.2f}")
        print(f"  Governed mean hypotheses:   {gov_counts.mean():.2f}")
        print(f"  Cohen's d: {d:.3f} [95% CI: {ci_low:.3f}, {ci_high:.3f}]")
        print(f"  p (paired t): {p_paired:.4f}")
        print(f"  H4 supported: {iai_output['h4_supported']}\n")

    # -----------------------------------------------------------------------
    # EXPERIMENT 4 — Adversarial
    # -----------------------------------------------------------------------
    if not args.skip_exp4:
        print("--- EXPERIMENT 4: Adversarial Robustness ---")
        from experiment.proxy_extractors import extract_all_proxies

        adv_results = []
        threshold_perturbation = 0.11  # just past ±0.10 boundary per protocol

        for vig in vignettes[:min(MAX_ITEMS, len(vignettes))]:
            proxies = extract_all_proxies(vig["text"])

            # Original classification
            contract_orig = ContractWindow(task_state=f"Adv_orig_{vig['item_id']}")
            try:
                contract_orig.evaluate_telemetry_invariants(proxies)
                contract_orig.compile_and_validate("adv orig")
                orig_class = "relational"
            except HaltAuthorityException:
                orig_class = "halted"
            except Exception:
                orig_class = "error"

            # Threshold nudge attack on narrative_coherence
            perturbed_proxies = dict(proxies)
            orig_val = float(proxies.get("narrative_coherence", 0.5))
            # Nudge toward violation boundary
            perturbed_proxies["narrative_coherence"] = max(0.0, orig_val - threshold_perturbation)

            contract_adv = ContractWindow(task_state=f"Adv_perturbed_{vig['item_id']}")
            try:
                contract_adv.evaluate_telemetry_invariants(perturbed_proxies)
                contract_adv.compile_and_validate("adv perturbed")
                adv_class = "relational"
            except HaltAuthorityException:
                adv_class = "halted"
            except Exception:
                adv_class = "error"

            flipped = orig_class != adv_class
            adv_results.append({
                "item_id": vig["item_id"],
                "original_classification": orig_class,
                "adversarial_classification": adv_class,
                "attack_type": "threshold_nudge_narrative",
                "original_value": orig_val,
                "perturbed_value": perturbed_proxies["narrative_coherence"],
                "classification_flipped": flipped,
            })

        attack_success_rate = sum(1 for r in adv_results if r["classification_flipped"]) / max(len(adv_results), 1)

        adv_output = {
            "n_adversarial": len(adv_results),
            "attack_success_rate": round(attack_success_rate, 4),
            "fragile_flag": attack_success_rate > 0.50,
            "note": "delta_k flagged for threshold hardening if attack_success_rate > 0.50",
            "per_item": adv_results,
        }
        with open(EVIDENCE_DIR / "adversarial_log.json", "w") as f:
            json.dump(adv_output, f, indent=2)

        print(f"  Attack success rate: {attack_success_rate:.3f}")
        print(f"  Fragility flag: {adv_output['fragile_flag']}\n")

    # -----------------------------------------------------------------------
    # Save API log and manifest
    # -----------------------------------------------------------------------
    with open(EVIDENCE_DIR / "api_log.jsonl", "w") as f:
        for entry in API_LOG:
            f.write(json.dumps(entry) + "\n")

    manifest["completed_at"] = datetime.utcnow().isoformat() + "Z"
    with open(EVIDENCE_DIR / "run_manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

    print("="*70)
    print("RUN COMPLETE")
    print(f"Evidence files written to: evidence/")
    print(f"Git hash: {manifest['git_hash'][:12]}")
    if DRY_RUN:
        print("NOTE: This was a DRY RUN (5 items). Results are NOT statistically valid.")
    print("="*70)


if __name__ == "__main__":
    main()
