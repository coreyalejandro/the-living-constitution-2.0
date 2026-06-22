"""
LLM Annotation Panel — three-model Delphi-inspired ground truth generation.

Pre-specified in TIER1_MACHINE_PROTOCOL.md Section 4.
Temperature = 0 for all annotation calls. Deterministic.
"""
import json
import os
import time
import hashlib
from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass, asdict

# ---------------------------------------------------------------------------
# Panel config — frozen at protocol lock
# ---------------------------------------------------------------------------
PANEL_MODELS = {
    "model_a": "claude-3-5-sonnet-20241022",
    "model_b": "gpt-4o-2024-08-06",
    "model_c": "ollama/llama3.1:70b",  # local via litellm ollama backend
}

ANNOTATION_SYSTEM_PROMPT = """\
You are annotating behavioral vignettes for a research study on culturally situated \
consumer behavior. Your role is to identify which of the Eight Wonders relational \
invariants is most salient in the text and classify its state.

The Eight Wonders are:
I1 Trust — relational safety and breach detection
I2 Authenticity — alignment between brand rhetoric and reality
I3 Status — dignified presentation management
I4 Identity Signaling — product coherence with community identity
I5 Enacted Fidelity — performed covenant loyalty (not mechanical inertia)
I6 Perceived Quality — experiential validation under real-life conditions
I7 Contextual Performance — execution during high-stakes community events
I8 Narrative — historical memory and interpretive framing (upstream gate)

Classification states: SATISFIED, VIOLATED, AMBIGUOUS, NOT_APPLICABLE

IMPORTANT: Do not infer demographic characteristics not stated in the text. \
Classify only on what the behavioral signals support. \
Do not add commentary beyond the JSON response."""

ANNOTATION_USER_TEMPLATE = """\
Item to annotate:

{item_text}

Respond in JSON only. No other text.
{{
  "primary_invariant": "<I1|I2|I3|I4|I5|I6|I7|I8>",
  "state": "<SATISFIED|VIOLATED|AMBIGUOUS|NOT_APPLICABLE>",
  "rationale": "<one sentence, max 30 words>"
}}"""


@dataclass
class AnnotationResult:
    model_id: str
    model_name: str
    item_id: str
    item_hash: str
    primary_invariant: str
    state: str
    rationale: str
    raw_response: str
    tokens_used: int
    latency_ms: float
    error: Optional[str] = None


def _call_model(model_id: str, model_name: str, item_text: str,
                item_id: str, api_log: List[Dict]) -> AnnotationResult:
    """
    Call a model for annotation. Logs to api_log list.
    Returns AnnotationResult (with error field set on failure).
    """
    import litellm
    from litellm import completion

    item_hash = hashlib.sha256(item_text.encode()).hexdigest()[:16]
    user_msg = ANNOTATION_USER_TEMPLATE.format(item_text=item_text[:2000])

    start = time.time()
    try:
        response = completion(
            model=model_name,
            messages=[
                {"role": "system", "content": ANNOTATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            temperature=0,
            max_tokens=200,
            response_format={"type": "json_object"} if "gpt" in model_name or "claude" in model_name else None,
        )
        latency = (time.time() - start) * 1000
        raw = response.choices[0].message.content or ""  # type: ignore[union-attr]
        usage = getattr(response, "usage", None)
        tokens = getattr(usage, "total_tokens", 0) if usage else 0

        # Parse JSON
        try:
            parsed = json.loads(raw)
            primary_invariant = parsed.get("primary_invariant", "UNKNOWN")
            state = parsed.get("state", "UNKNOWN")
            rationale = parsed.get("rationale", "")
            error = None
        except json.JSONDecodeError:
            primary_invariant = "PARSE_ERROR"
            state = "PARSE_ERROR"
            rationale = ""
            error = f"JSON parse failed: {raw[:100]}"

        # Log to api_log
        api_log.append({
            "model_id": model_id,
            "model_name": model_name,
            "item_id": item_id,
            "item_hash": item_hash,
            "response_preview": raw[:50],
            "tokens": tokens,
            "latency_ms": round(latency, 1),
            "error": error,
        })

        return AnnotationResult(
            model_id=model_id,
            model_name=model_name,
            item_id=item_id,
            item_hash=item_hash,
            primary_invariant=primary_invariant,
            state=state,
            rationale=rationale,
            raw_response=raw,
            tokens_used=tokens,
            latency_ms=latency,
            error=error,
        )

    except Exception as e:
        latency = (time.time() - start) * 1000
        api_log.append({
            "model_id": model_id,
            "model_name": model_name,
            "item_id": item_id,
            "error": str(e)[:200],
        })
        return AnnotationResult(
            model_id=model_id,
            model_name=model_name,
            item_id=item_id,
            item_hash=item_hash,
            primary_invariant="API_ERROR",
            state="API_ERROR",
            rationale="",
            raw_response="",
            tokens_used=0,
            latency_ms=latency,
            error=str(e)[:200],
        )


def annotate_item(item_text: str, item_id: str,
                  api_log: List[Dict],
                  retry_on_error: bool = True) -> Dict[str, AnnotationResult]:
    """
    Annotate a single item with all three panel models.
    Returns dict keyed by model_id.
    """
    results = {}
    for model_id, model_name in PANEL_MODELS.items():
        result = _call_model(model_id, model_name, item_text, item_id, api_log)
        if result.error and retry_on_error:
            time.sleep(2)
            result = _call_model(model_id, model_name, item_text, item_id, api_log)
        results[model_id] = result
    return results


def compute_krippendorff_alpha(annotations: List[Dict[str, AnnotationResult]],
                               dimension: str = "state") -> float:
    """
    Compute Krippendorff's alpha for a dimension across all items.
    Uses nominal scale (categorical labels).

    annotations: list of dicts {model_id -> AnnotationResult}, one per item.
    dimension: "state" or "primary_invariant"
    """
    from scipy.stats import chi2

    # Build reliability matrix: rows = models, cols = items
    models = list(PANEL_MODELS.keys())
    all_labels = set()

    matrix = []
    for model_id in models:
        row = []
        for ann_dict in annotations:
            result = ann_dict.get(model_id)
            if result and result.error is None:
                val = getattr(result, dimension)
            else:
                val = None  # missing
            row.append(val)
            if val:
                all_labels.add(val)
        matrix.append(row)

    label_list = sorted(all_labels)
    n_items = len(annotations)
    n_annotators = len(models)

    # Krippendorff's alpha (nominal) using coincidence matrix approach
    # See: Hayes & Krippendorff (2007)
    coincidence = {(v1, v2): 0.0 for v1 in label_list for v2 in label_list}
    n_pairs_total = 0

    for col_idx in range(n_items):
        col_values = [matrix[r][col_idx] for r in range(n_annotators)
                      if matrix[r][col_idx] is not None]
        if len(col_values) < 2:
            continue
        n_u = len(col_values)
        for i in range(n_u):
            for j in range(n_u):
                if i != j:
                    coincidence[(col_values[i], col_values[j])] += 1.0 / (n_u - 1)
                    n_pairs_total += 1.0 / (n_u - 1)

    if n_pairs_total == 0:
        return 0.0

    # Expected disagreement under null distribution
    label_marginals = {}
    for label in label_list:
        label_marginals[label] = sum(coincidence[(label, v)] for v in label_list)

    D_o = sum(coincidence[(v1, v2)] for v1 in label_list for v2 in label_list if v1 != v2)
    D_e = 0.0
    if n_pairs_total > 0:
        total_pairs = sum(label_marginals.values())
        for v1 in label_list:
            for v2 in label_list:
                if v1 != v2:
                    D_e += (label_marginals[v1] * label_marginals[v2]) / max(total_pairs - 1, 1)

    if D_e == 0:
        return 1.0

    alpha = 1.0 - (D_o / D_e)
    return round(alpha, 4)


def majority_vote(ann_dict: Dict[str, AnnotationResult],
                  dimension: str = "state") -> Tuple[str, int]:
    """
    Return majority vote label and count for a single item.
    Ties broken alphabetically (deterministic).
    """
    from collections import Counter
    votes = []
    for result in ann_dict.values():
        if result.error is None:
            votes.append(getattr(result, dimension))
    if not votes:
        return "UNKNOWN", 0
    counter = Counter(votes)
    majority_label = sorted(counter.keys(), key=lambda k: (-counter[k], k))[0]
    return majority_label, counter[majority_label]


def save_annotation_results(annotations: List[Dict[str, AnnotationResult]],
                             item_texts: List[str],
                             item_ids: List[str],
                             output_path: str) -> None:
    out = []
    for i, ann_dict in enumerate(annotations):
        item_id = item_ids[i]
        mv_state, mv_count = majority_vote(ann_dict, "state")
        mv_invariant, _ = majority_vote(ann_dict, "primary_invariant")
        out.append({
            "item_id": item_id,
            "item_preview": item_texts[i][:80],
            "majority_state": mv_state,
            "majority_invariant": mv_invariant,
            "vote_count": mv_count,
            "annotations": {
                mid: asdict(res) for mid, res in ann_dict.items()
            }
        })
    with open(output_path, "w") as f:
        json.dump(out, f, indent=2)
