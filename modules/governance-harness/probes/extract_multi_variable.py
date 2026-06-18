"""
extract_multi_variable.py

Builds the (64, 8) matrix needed for GES causal discovery.

Each of the 64 prompts (32 sovereign, 32 defensive) is run through
Qwen2.5-7B. For each prompt we extract one scalar per Wonder (I1-I8)
by projecting the final-token hidden state at the Wonder's designated
layer onto the LDA discriminant direction, producing a score that
measures how strongly the model's representation at that layer encodes
the sovereign vs defensive framing for that construct.

Wonder-to-layer mapping (Qwen2.5-7B, 28 layers):
  I1 Trust               -> layer 4   (early: basic relational priors)
  I2 Authenticity        -> layer 8   (early-mid: cultural signal encoding)
  I3 Status              -> layer 12  (mid: social cognition)
  I4 Identity Signaling  -> layer 14  (mid: self-concept integration)
  I5 Enacted Fidelity    -> layer 16  (mid-late: temporal/behavioral binding)
  I6 Perceived Quality   -> layer 18  (mid-late: evaluation/judgment)
  I7 Contextual Perf     -> layer 22  (late: contextual reasoning, same as probe)
  I8 Narrative           -> layer 26  (near-final: meta-narrative integration)

The probe direction (probe_weights.npy, trained at layer 22) is re-used
as the projection vector for all layers after scaler-normalizing each
layer's activations independently. This keeps the projection semantically
consistent (sovereign vs defensive axis) across layers.

Output:
  wonder_matrix.npy   shape (64, 8), float64
  wonder_labels.npy   shape (64,),   int (1=sovereign, 0=defensive)
  wonder_columns.txt  column names for GES node_names

Then runs GES on the full matrix and prints the resulting adjacency.
"""

import csv
import warnings
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from sklearn.preprocessing import StandardScaler
from causallearn.search.ScoreBased.GES import ges

# Suppress numpy 2.x + macOS Accelerate BLAS spurious RuntimeWarning
warnings.filterwarnings('ignore', category=RuntimeWarning)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MODEL_ID = "Qwen/Qwen2.5-7B"
CSV_PATH = "real_prompts.csv"

# Wonder index -> (name, layer)
WONDERS = [
    ("I1_Trust",            4),
    ("I2_Authenticity",     8),
    ("I3_Status",          12),
    ("I4_Identity",        14),
    ("I5_EnactedFidelity", 16),
    ("I6_Quality",         18),
    ("I7_ContextualPerf",  22),
    ("I8_Narrative",       26),
]

WONDER_NAMES  = [w[0] for w in WONDERS]
WONDER_LAYERS = [w[1] for w in WONDERS]

# ---------------------------------------------------------------------------
# STEP 1: Load data
# ---------------------------------------------------------------------------
print("STEP 1: Loading data...")
prompts, labels = [], []
with open(CSV_PATH, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # skip header
    for row in reader:
        if row:
            prompts.append(row[0])
            labels.append(1 if row[1].strip() == "sovereign" else 0)

n_samples = len(prompts)
print(f"  Loaded {n_samples} prompts | sovereign={sum(labels)} | defensive={n_samples - sum(labels)}")

# ---------------------------------------------------------------------------
# STEP 2: Load probe direction (trained at layer 22)
# ---------------------------------------------------------------------------
print("STEP 2: Loading LDA probe direction...")
probe_weights = np.load('probe_weights.npy')           # shape (1, 3584)
probe_direction = probe_weights[0].astype(np.float64)  # shape (3584,)
probe_norm = np.linalg.norm(probe_direction)
if probe_norm > 0:
    probe_direction_unit = probe_direction / probe_norm
else:
    raise ValueError("Probe direction has zero norm — retrain the probe first.")
print(f"  Probe direction norm: {probe_norm:.4f} | unit vector ready")

# ---------------------------------------------------------------------------
# STEP 3: Load model
# ---------------------------------------------------------------------------
print("STEP 3: Loading model (this takes ~30s)...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(MODEL_ID, torch_dtype=torch.float16)
model.eval()
print("  Model loaded.")

# ---------------------------------------------------------------------------
# STEP 4: Extract hidden states at all Wonder layers for all prompts
# ---------------------------------------------------------------------------
print("STEP 4: Extracting hidden states at 8 layers for 64 prompts...")
print("  (This processes each prompt once, collecting all layers simultaneously)")

# raw_activations[layer_idx][sample_idx] = float32 numpy vector (3584,)
raw_activations = [[] for _ in range(len(WONDERS))]

for i, prompt in enumerate(prompts):
    if (i + 1) % 8 == 0 or i == 0:
        print(f"  Processing prompt {i+1}/{n_samples}...")
    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs, output_hidden_states=True)
    # outputs.hidden_states is a tuple of (n_layers+1) tensors
    # hidden_states[0] = embedding layer, hidden_states[k] = after layer k
    # So layer L = hidden_states[L], index goes 0..28
    for w_idx, layer_num in enumerate(WONDER_LAYERS):
        # final token, cast to float32, off GPU
        vec = outputs.hidden_states[layer_num][:, -1, :].float().cpu().numpy()[0]
        raw_activations[w_idx].append(vec.astype(np.float64))

print("  Extraction complete.")

# ---------------------------------------------------------------------------
# STEP 5: Per-layer scaler + projection -> one score per Wonder per prompt
# ---------------------------------------------------------------------------
print("STEP 5: Scaling and projecting each layer...")
wonder_matrix = np.zeros((n_samples, len(WONDERS)), dtype=np.float64)

for w_idx, (wonder_name, layer_num) in enumerate(WONDERS):
    layer_matrix = np.stack(raw_activations[w_idx], axis=0)  # (64, 3584)

    # StandardScaler, clamp near-zero dims
    scaler = StandardScaler()
    scaler.fit(layer_matrix)
    nz = scaler.scale_ < 1e-8
    if nz.any():
        scaler.scale_[nz] = 1.0
        scaler.var_[nz] = 1.0

    layer_scaled = scaler.transform(layer_matrix)
    layer_scaled = np.clip(layer_scaled, -10.0, 10.0)
    assert np.isfinite(layer_scaled).all(), f"Non-finite after scaling layer {layer_num}"

    # Project onto the unit probe direction -> scalar score per sample
    scores = layer_scaled @ probe_direction_unit  # (64,)
    wonder_matrix[:, w_idx] = scores

    mean_sov = scores[np.array(labels) == 1].mean()
    mean_def = scores[np.array(labels) == 0].mean()
    print(f"  {wonder_name} (layer {layer_num:2d}): "
          f"sovereign_mean={mean_sov:.3f} | defensive_mean={mean_def:.3f} | "
          f"gap={mean_sov - mean_def:.3f}")

print(f"\n  Wonder matrix shape: {wonder_matrix.shape}")
print(f"  Value range: [{wonder_matrix.min():.3f}, {wonder_matrix.max():.3f}]")
assert np.isfinite(wonder_matrix).all(), "Non-finite values in wonder matrix"

# ---------------------------------------------------------------------------
# STEP 6: Save matrix + labels + column names
# ---------------------------------------------------------------------------
print("\nSTEP 6: Saving wonder matrix...")
np.save('wonder_matrix.npy', wonder_matrix)
np.save('wonder_labels.npy', np.array(labels))
with open('wonder_columns.txt', 'w') as f:
    f.write('\n'.join(WONDER_NAMES) + '\n')
print("  Saved: wonder_matrix.npy, wonder_labels.npy, wonder_columns.txt")

# ---------------------------------------------------------------------------
# STEP 7: Run GES on the full (64, 8) matrix
# ---------------------------------------------------------------------------
print("\nSTEP 7: Running GES causal discovery on (64, 8) matrix...")
print("  node_names:", WONDER_NAMES)

ges_result = ges(
    wonder_matrix,
    score_func='local_score_BIC',
    node_names=WONDER_NAMES,
)

G = ges_result['G']
adj = G.graph  # (8, 8) numpy array
print("\n  GES adjacency matrix (rows=tail, cols=head):")
print("  Convention: adj[i,j]= 1 and adj[j,i]=-1 => i -> j (directed edge)")
print("              adj[i,j]= 1 and adj[j,i]= 1  => i -- j (undirected edge)")
print()

header = f"{'':22s}" + "  ".join(f"{n:>8s}" for n in WONDER_NAMES)
print("  " + header)
for i, row_name in enumerate(WONDER_NAMES):
    row_str = "  ".join(f"{int(adj[i, j]):>8d}" for j in range(len(WONDER_NAMES)))
    print(f"  {row_name:22s}{row_str}")

# Human-readable edge list
print("\n  Directed edges (i -> j):")
found_edges = False
for i in range(len(WONDER_NAMES)):
    for j in range(len(WONDER_NAMES)):
        if i != j and adj[i, j] == 1 and adj[j, i] == -1:
            print(f"    {WONDER_NAMES[i]} -> {WONDER_NAMES[j]}")
            found_edges = True

print("\n  Undirected edges (i -- j):")
found_undirected = False
for i in range(len(WONDER_NAMES)):
    for j in range(i+1, len(WONDER_NAMES)):
        if adj[i, j] == 1 and adj[j, i] == 1:
            print(f"    {WONDER_NAMES[i]} -- {WONDER_NAMES[j]}")
            found_undirected = True

if not found_edges:
    print("    (none)")
if not found_undirected:
    print("    (none)")

print("\nDone. wonder_matrix.npy is ready for further analysis.")
