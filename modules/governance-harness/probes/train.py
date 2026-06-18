"""
train_per_wonder.py  (v2 — single-pass extraction)

Runs all 256 prompts through Qwen2.5-7B ONCE, caching hidden states at all
designated layers. Then trains one LDA probe per Wonder and builds the
(256, 8) wonder_matrix_v2.npy for GES.

Layer assignments (0-indexed transformer blocks):
  I1_Trust           -> layer 4
  I2_Authenticity    -> layer 8
  I3_Status          -> layer 12
  I4_Identity        -> layer 14
  I5_EnactedFidelity -> layer 16
  I6_Quality         -> layer 18
  I7_ContextualPerf  -> layer 22
  I8_Narrative       -> layer 26
"""

import warnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

import csv
import os
import sys
import numpy as np
import torch
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from causallearn.search.ScoreBased.GES import ges

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

MODEL_ID     = "Qwen/Qwen2.5-7B"
CSV_PATH     = os.path.join(os.path.dirname(__file__), "real_prompts_v2.csv")
OUT_DIR      = os.path.dirname(__file__)
N_COMPONENTS = 50
BATCH_SIZE   = 2    # conservative for CPU/MPS

WONDER_ORDER = [
    "I1_Trust", "I2_Authenticity", "I3_Status", "I4_Identity",
    "I5_EnactedFidelity", "I6_Quality", "I7_ContextualPerf", "I8_Narrative",
]

WONDER_LAYERS = {
    "I1_Trust":           4,
    "I2_Authenticity":    8,
    "I3_Status":          12,
    "I4_Identity":        14,
    "I5_EnactedFidelity": 16,
    "I6_Quality":         18,
    "I7_ContextualPerf":  22,
    "I8_Narrative":       26,
}

LAYERS_NEEDED = sorted(set(WONDER_LAYERS.values()))

# ---------------------------------------------------------------------------
# STEP 1: Load CSV
# ---------------------------------------------------------------------------

print("STEP 1: LOADING DATA...")

rows = []
with open(CSV_PATH, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append({
            'prompt': row['prompt'].strip(),
            'label':  row['label'].strip(),
            'wonder': row['wonder'].strip(),
        })

print(f"  Loaded {len(rows)} prompts")

all_prompts = [r['prompt'] for r in rows]
all_labels  = [r['label']  for r in rows]
all_wonders = [r['wonder'] for r in rows]

# Per-wonder row indices
wonder_row_idx = {w: [i for i, r in enumerate(rows) if r['wonder'] == w]
                  for w in WONDER_ORDER}
wonder_labels  = {w: [1 if rows[i]['label'] == 'sovereign' else 0
                       for i in wonder_row_idx[w]]
                  for w in WONDER_ORDER}

for w in WONDER_ORDER:
    n = len(wonder_row_idx[w])
    n1 = sum(wonder_labels[w])
    print(f"  {w:26s}: {n} prompts ({n1} sov, {n-n1} def)")

# ---------------------------------------------------------------------------
# STEP 2: Load model
# ---------------------------------------------------------------------------

print("\nSTEP 2: LOADING MODEL...")

from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    output_hidden_states=True,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True,
)
model.eval()
device = next(model.parameters()).device
print(f"  Device: {device}  |  Layers: {model.config.num_hidden_layers}")

# ---------------------------------------------------------------------------
# STEP 3: Single-pass extraction — cache selected layers for all 256 prompts
# ---------------------------------------------------------------------------

print(f"\nSTEP 3: EXTRACTING HIDDEN STATES (1 pass, caching layers {LAYERS_NEEDED})...")

# layer_cache[layer_idx] -> list of numpy arrays (N, hidden)
layer_cache = {l: [] for l in LAYERS_NEEDED}

for start in range(0, len(all_prompts), BATCH_SIZE):
    batch = all_prompts[start:start + BATCH_SIZE]
    enc = tokenizer(
        batch,
        return_tensors='pt',
        padding=True,
        truncation=True,
        max_length=256,   # truncate long prompts to keep memory manageable
    )
    input_ids      = enc['input_ids'].to(device)
    attention_mask = enc['attention_mask'].to(device)

    with torch.no_grad():
        out = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            output_hidden_states=True,
        )

    mask_f = attention_mask.unsqueeze(-1).float()

    for layer_idx in LAYERS_NEEDED:
        h = out.hidden_states[layer_idx + 1]       # (batch, seq, hidden)
        pooled = (h * mask_f).sum(dim=1) / mask_f.sum(dim=1)   # (batch, hidden)
        layer_cache[layer_idx].append(pooled.float().cpu().numpy())

    del out, input_ids, attention_mask, enc, mask_f
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    if (start // BATCH_SIZE) % 10 == 0:
        print(f"  [{start+len(batch)}/{len(all_prompts)}] processed...")

# Concatenate into (256, hidden) arrays
for l in LAYERS_NEEDED:
    layer_cache[l] = np.vstack(layer_cache[l]).astype(np.float64)
    print(f"  Layer {l:2d}: shape {layer_cache[l].shape}")

print("  Extraction complete.")

# ---------------------------------------------------------------------------
# STEP 4: Train one LDA probe per Wonder
# ---------------------------------------------------------------------------

print("\nSTEP 4: TRAINING PER-WONDER LDA PROBES...")

wonder_probes = {}

for w in WONDER_ORDER:
    layer  = WONDER_LAYERS[w]
    idx    = wonder_row_idx[w]
    y      = np.array(wonder_labels[w], dtype=np.int32)
    H      = layer_cache[layer][idx]          # (32, hidden)

    # StandardScaler
    scaler = StandardScaler()
    scaler.fit(H)
    scaler.scale_[scaler.scale_ < 1e-6] = 1.0
    X = np.clip(scaler.transform(H), -10.0, 10.0).astype(np.float64)

    # PCA
    n_comp = min(N_COMPONENTS, X.shape[0] - 1, X.shape[1])
    pca = PCA(n_components=n_comp, svd_solver='full')
    X_pca = pca.fit_transform(X)
    var   = pca.explained_variance_ratio_.sum()

    # LDA
    lda = LinearDiscriminantAnalysis(solver='eigen', shrinkage='auto')
    lda.fit(X_pca, y)
    acc   = lda.score(X_pca, y)
    wnorm = np.linalg.norm(lda.coef_[0])

    print(f"  {w:26s} layer={layer:2d}  PCA={n_comp} (var={var:.3f})  "
          f"acc={acc:.3f}  lda_norm={wnorm:.4f}")

    wonder_probes[w] = (scaler, pca, lda)

    # Save per-wonder artifacts
    prefix = os.path.join(OUT_DIR, f"{w}_")
    np.save(prefix + "probe_weights.npy",   lda.coef_[0])
    np.save(prefix + "probe_intercept.npy", lda.intercept_)
    np.save(prefix + "scaler_mean.npy",     scaler.mean_)
    np.save(prefix + "scaler_scale.npy",    scaler.scale_)
    np.save(prefix + "pca_components.npy",  pca.components_)
    np.save(prefix + "pca_mean.npy",        pca.mean_)

print("  All probes trained and saved.")

# ---------------------------------------------------------------------------
# STEP 5: Build (256, 8) wonder_matrix_v2
#   matrix[i, j] = LDA_j.decision_function( probe_j.transform( prompt_i @ layer_j ) )
#   Each column = a genuinely different direction (different layer, different training set)
# ---------------------------------------------------------------------------

print("\nSTEP 5: BUILDING (256, 8) WONDER MATRIX...")

wonder_matrix = np.zeros((len(all_prompts), 8), dtype=np.float64)

for col_idx, w in enumerate(WONDER_ORDER):
    layer         = WONDER_LAYERS[w]
    scaler, pca, lda = wonder_probes[w]
    H_all         = layer_cache[layer]           # (256, hidden)

    X      = np.clip(scaler.transform(H_all.astype(np.float64)), -10.0, 10.0)
    X_pca  = pca.transform(X)
    scores = lda.decision_function(X_pca)        # (256,)
    wonder_matrix[:, col_idx] = scores

    print(f"  {w:26s}: min={scores.min():.3f}  max={scores.max():.3f}  "
          f"mean={scores.mean():.3f}  std={scores.std():.3f}")

# Save
np.save(os.path.join(OUT_DIR, "wonder_matrix_v2.npy"),  wonder_matrix)
np.save(os.path.join(OUT_DIR, "wonder_labels_v2.npy"),  np.array(all_labels))
with open(os.path.join(OUT_DIR, "wonder_columns_v2.txt"), 'w') as f:
    f.write('\n'.join(WONDER_ORDER))

print(f"\n  Matrix shape: {wonder_matrix.shape}")

# Correlation check
corr = np.corrcoef(wonder_matrix.T)
print("\n  Cross-Wonder Pearson correlation (off-diagonals should NOT all be 0.99):")
hdr = "           " + "".join(f"  {w.split('_')[0]:>6s}" for w in WONDER_ORDER)
print(hdr)
for i, wi in enumerate(WONDER_ORDER):
    row_s = f"  {wi.split('_')[0]:>8s}:  " + "  ".join(f"{corr[i,j]:6.3f}" for j in range(8))
    print(row_s)

# ---------------------------------------------------------------------------
# STEP 6: GES
# ---------------------------------------------------------------------------

print("\nSTEP 6: GES CAUSAL DISCOVERY...")

try:
    result = ges(wonder_matrix)
    adj    = result['G'].graph    # (8, 8)

    print("\n  GES edges:")
    n_edges = 0
    for i in range(8):
        for j in range(i+1, 8):
            a, b = adj[i, j], adj[j, i]
            if a == 0 and b == 0:
                continue
            wi, wj = WONDER_ORDER[i], WONDER_ORDER[j]
            if a == 1 and b == -1:
                print(f"    {wi} --> {wj}")
            elif a == -1 and b == 1:
                print(f"    {wj} --> {wi}")
            elif a == 1 and b == 1:
                print(f"    {wi} --- {wj}  (undirected)")
            n_edges += 1

    if n_edges == 0:
        print("  (no edges — matrix may be too sparse or columns uncorrelated)")

    print(f"\n  Total edges: {n_edges}")
    np.save(os.path.join(OUT_DIR, "ges_adjacency_v2.npy"), adj)
    print("  Saved: ges_adjacency_v2.npy")

except Exception as e:
    import traceback
    print(f"  GES error: {e}")
    traceback.print_exc()

print("\nDONE.")
