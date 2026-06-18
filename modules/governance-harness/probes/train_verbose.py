import csv
import warnings
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.preprocessing import StandardScaler

# Suppress numpy 2.x + macOS Accelerate BLAS spurious divide-by-zero warnings.
# This is a known regression: numpy 2.2.x on Apple Silicon raises RuntimeWarning
# from Accelerate's BLAS even on valid matmul (e.g., ones @ ones = finite result).
# LDA's eigendecomposition path is the same BLAS, same issue.
# We suppress only RuntimeWarning; all other warnings still surface.
warnings.filterwarnings('ignore', category=RuntimeWarning)

print("STEP 1: LOADING DATA USING THE FIXED CSV MODULE...")
prompts = []
csv_labels = []

with open('real_prompts.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if row:
            prompts.append(row[0])
            csv_labels.append(row[1])

print("STEP 2: LOADING MODEL...")
model_id = "Qwen/Qwen2.5-7B"
tokenizer = AutoTokenizer.from_pretrained(model_id)
# Load in float16 for memory efficiency
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16)

print("STEP 3: EXTRACTING HIDDEN STATES...")
all_vectors = []
all_labels = []

for prompt, label_str in zip(prompts, csv_labels):
    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs, output_hidden_states=True)
    # Cast to float32 BEFORE numpy — float16 arrays produce overflow in any
    # downstream numerical computation.
    layer_vectors = outputs.hidden_states[22][:, -1, :].float().cpu().numpy()
    all_vectors.append(layer_vectors[0])

    if label_str.strip() == "sovereign":
        all_labels.append(1)
    else:
        all_labels.append(0)

X = np.array(all_vectors, dtype=np.float64)   # float64 throughout
y = np.array(all_labels)

print("STEP 4: TRAINING PROBE...")
print(f" -> Data Matrix Summary: Total={len(y)} | Class 1={sum(y)} | Class 0={len(y) - sum(y)}")
print(f" -> Feature matrix shape: {X.shape} (samples x hidden_dim)")

# StandardScaler: zero mean, unit variance per dimension.
# Clamp near-zero scale_ values so division never produces inf.
scaler = StandardScaler()
scaler.fit(X)
near_zero = scaler.scale_ < 1e-8
if near_zero.any():
    print(f" -> Clamping {near_zero.sum()} near-zero-variance dims")
    scaler.scale_[near_zero] = 1.0
    scaler.var_[near_zero] = 1.0
X_scaled = scaler.transform(X)
X_scaled = np.clip(X_scaled, -10.0, 10.0)
assert np.isfinite(X_scaled).all(), "Non-finite values after scaling"
print(f" -> Scaled OK. Value range: [{X_scaled.min():.2f}, {X_scaled.max():.2f}]")

# Save scaler parameters for run_live.py
np.save('scaler_mean.npy', scaler.mean_)
np.save('scaler_scale.npy', scaler.scale_)

# LinearDiscriminantAnalysis: finds the discriminant direction analytically
# via eigendecomposition — no iterative scipy optimizer, no BLAS matmul loop.
# This is the correct probe method: directly computes the axis in activation
# space that maximally separates sovereign from defensive representations.
# solver='eigen' uses direct eigendecomposition of the scatter matrices.
# With n_features >> n_samples we use n_components=1 (binary classification).
probe = LinearDiscriminantAnalysis(solver='eigen', n_components=1, shrinkage='auto')
probe.fit(X_scaled, y)

train_acc = probe.score(X_scaled, y)
print(f" -> LDA probe trained.")
print(f" -> Discriminant direction norm: {np.linalg.norm(probe.coef_):.4f}")
print(f" -> Training accuracy: {train_acc:.3f}")

# Save the LDA coef (1 x n_features) — same shape convention as LogisticRegression
print("STEP 5: SAVING PROBE...")
np.save('probe_weights.npy', probe.coef_)
np.save('probe_intercept.npy', probe.intercept_)
print("PROBE SAVED SUCCESSFULLY")
print(f" -> probe_weights.npy shape: {probe.coef_.shape}")
