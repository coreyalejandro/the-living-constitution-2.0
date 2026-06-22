"""
Proxy extractor pipeline for delta_k detection functions.

All extraction logic is PRE-SPECIFIED in TIER1_MACHINE_PROTOCOL.md Section 5.2.
Do not modify thresholds or extraction logic post-hoc without a protocol deviation entry.
"""
import re
import hashlib
from typing import Dict, Any, List, Optional
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    _EMBED_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _EMBED_MODEL = None

# ---------------------------------------------------------------------------
# Fixed keyword lists — locked at pre-registration
# These cannot be changed post-hoc without a PROTOCOL_DEVIATIONS.md entry.
# ---------------------------------------------------------------------------

REFORMULATION_KEYWORDS = [
    "changed", "reformulated", "different now", "not the same",
    "something changed", "new formula", "used to be", "new recipe",
    "not what it was", "ruined it", "messed with",
]

NEGATIVE_SENTIMENT_MARKERS = [
    "disappointed", "upset", "angry", "terrible", "awful", "worst",
    "hate", "disgusting", "never again", "returning", "returned",
    "waste", "garbage", "trash", "horrible",
]

# Threshold proximity window (tokens) for reformulation + sentiment co-occurrence
REFORMULATION_PROXIMITY_TOKENS = 10

# Known brand list placeholder — populated from data/brand_list.txt at runtime
_KNOWN_BRANDS: List[str] = []

def load_known_brands(path: str = "data/brand_list.txt") -> None:
    global _KNOWN_BRANDS
    try:
        with open(path) as f:
            _KNOWN_BRANDS = [line.strip().lower() for line in f if line.strip()]
    except FileNotFoundError:
        _KNOWN_BRANDS = []

# Community reference embedding — loaded once at module init
_COMMUNITY_REFERENCE_EMBEDDING: Optional[np.ndarray] = None

def load_community_reference(path: str = "data/community_reference_corpus.txt") -> None:
    global _COMMUNITY_REFERENCE_EMBEDDING
    if _EMBED_MODEL is None:
        return
    try:
        with open(path) as f:
            texts = [line.strip() for line in f if len(line.strip()) > 20]
        if texts:
            embeddings = _EMBED_MODEL.encode(texts, show_progress_bar=False)
            _COMMUNITY_REFERENCE_EMBEDDING = embeddings.mean(axis=0)
    except FileNotFoundError:
        pass

def _tokenize(text: str) -> List[str]:
    return re.findall(r"\b\w+\b", text.lower())

def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)

def extract_repeat_rate(review_text: str, user_review_history: Optional[List[str]] = None,
                        brand_name: Optional[str] = None) -> float:
    """
    Proportion of user's reviews on the same brand vs. total reviews.
    If no history provided, estimate from text signals (mentions of prior purchases).
    """
    if user_review_history and brand_name:
        brand_l = brand_name.lower()
        same_brand = sum(1 for r in user_review_history if brand_l in r.lower())
        return same_brand / max(len(user_review_history), 1)
    # Fallback text heuristic: mentions of prior purchase signals
    prior_purchase_signals = [
        "been using", "used for years", "always buy", "repurchase", "reorder",
        "buy again", "loyal", "my go-to", "staple", "every time"
    ]
    tokens = _tokenize(review_text)
    text_lower = review_text.lower()
    signal_count = sum(1 for s in prior_purchase_signals if s in text_lower)
    return min(signal_count / 3.0, 1.0)

def extract_brand_known_ratio(review_text: str) -> float:
    """
    Presence of known brand names vs. generic descriptors.
    Returns ratio of known brand mentions to total product references.
    """
    tokens = _tokenize(review_text)
    known_hits = sum(1 for b in _KNOWN_BRANDS if b in review_text.lower())
    generic_terms = ["product", "item", "thing", "stuff", "it", "this"]
    generic_hits = sum(1 for t in tokens if t in generic_terms)
    total = known_hits + generic_hits
    if total == 0:
        return 0.5  # ambiguous
    return known_hits / total

def extract_community_vocabulary_match(review_text: str) -> float:
    """
    Cosine similarity between review embedding and community reference corpus embedding.
    Returns 0.5 if reference not loaded (ambiguous).
    """
    if _EMBED_MODEL is None or _COMMUNITY_REFERENCE_EMBEDDING is None:
        return 0.5
    review_emb = _EMBED_MODEL.encode([review_text], show_progress_bar=False)[0]
    return _cosine_similarity(review_emb, _COMMUNITY_REFERENCE_EMBEDDING)

def extract_narrative_coherence(review_text: str) -> float:
    """
    Semantic similarity to the Relational Economy narrative framing.
    Uses a fixed narrative context document.
    """
    # Pre-specified narrative framing document (fixed — cannot be changed post-hoc)
    NARRATIVE_CONTEXT = (
        "Black consumer purchasing behavior is governed by a relational economy. "
        "Products and brands are parties to a covenant. Trust is earned through "
        "historical consistency. Loyalty is an active declaration, not passive inertia. "
        "Brand reformulations without notice constitute institutional betrayal. "
        "Defensive presentation in retail spaces reflects surveillance awareness, "
        "not deceptive intent. Premium brand persistence under budget pressure is "
        "a calculated deployment of dignity against the dominant gaze."
    )
    if _EMBED_MODEL is None:
        return 0.5
    review_emb = _EMBED_MODEL.encode([review_text], show_progress_bar=False)[0]
    narrative_emb = _EMBED_MODEL.encode([NARRATIVE_CONTEXT], show_progress_bar=False)[0]
    return _cosine_similarity(review_emb, narrative_emb)

def extract_reformulation_without_notice(review_text: str) -> bool:
    """
    True if review contains a reformulation keyword within REFORMULATION_PROXIMITY_TOKENS
    of a negative sentiment marker.
    """
    tokens = _tokenize(review_text)
    for i, token in enumerate(tokens):
        if any(kw.replace(" ", "_") in token or kw in " ".join(tokens[max(0,i-2):i+3])
               for kw in REFORMULATION_KEYWORDS):
            # Check for negative sentiment marker within proximity window
            window_start = max(0, i - REFORMULATION_PROXIMITY_TOKENS)
            window_end = min(len(tokens), i + REFORMULATION_PROXIMITY_TOKENS)
            window = " ".join(tokens[window_start:window_end])
            if any(neg in window for neg in NEGATIVE_SENTIMENT_MARKERS):
                return True
    return False

def extract_all_proxies(review_text: str,
                        user_review_history: Optional[List[str]] = None,
                        brand_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract all proxy values for a single review text.
    Returns dict matching the field names expected by tlc_kernel/engine.py.
    """
    reformulation = extract_reformulation_without_notice(review_text)
    narrative_coh = extract_narrative_coherence(review_text)
    community_match = extract_community_vocabulary_match(review_text)
    repeat = extract_repeat_rate(review_text, user_review_history, brand_name)
    brand_ratio = extract_brand_known_ratio(review_text)

    return {
        # I1 Trust
        "repeat_rate": repeat,
        "brand_known_ratio": brand_ratio,
        "private_label_avoidance": 1.0 - brand_ratio,  # inverse proxy
        "reformulation_without_notice": reformulation,
        "abrupt_quality_degradation_detected": False,  # not extractable from text alone
        # I2 Authenticity
        "community_vocabulary_match": community_match,
        "dilution_flag": 0,                            # flagged by downstream zero-shot
        "cultural_misappropriation_score": 0.0,        # flagged by downstream zero-shot
        # I3 Status
        "event_spike_amplitude": 0.0,                  # requires purchase data
        "visible_category_premium": 0.0,               # requires purchase data
        "downmarket_packaging_detected": False,
        "public_embarrassment_event": False,
        # I4 Identity Signaling
        "silhouette_score": 0.5,                       # requires basket data
        "occasion_match": 0.5,
        "neighborhood_brand_variance": 0.3,
        "cultural_mismatch_detected": False,
        "contextual_fusion_failure": False,
        # I5 Enacted Fidelity
        "discount_elasticity": -0.35,                  # estimated from text heuristics
        "repeat_purchase_rate": repeat,
        "betrayal_signal_detected": reformulation,
        "switching_on_betrayal": 0.7 if reformulation else 0.05,
        # I6 Perceived Quality
        "return_rate": 0.03 if not reformulation else 0.20,
        "real_use_positive_sentiment": community_match,
        "trial_to_repeat_conversion": repeat,
        # I7 Contextual Performance
        "bulk_purchase_scale": 0.3,                    # requires basket data
        "event_success_rate": 0.75,
        "household_density_performance": 0.6,
        "event_failure_rate": 0.15 if not reformulation else 0.55,
        # I8 Narrative
        "narrative_coherence": narrative_coh,
        "memory_persistence": narrative_coh,           # same signal source
        "cultural_calendar_match": 0.5,                # requires external calendar data
        "narrative_overwrite_detected": reformulation and narrative_coh < 0.40,
        "story_ignorance_flag": narrative_coh < 0.30,
        # TLC session metadata
        "session_turn_count": 1,
        "state_reanchored_flag": True,
        "private_label_shift": 1.0 - brand_ratio,
        "visible_category_ratio": brand_ratio,
    }

def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]
