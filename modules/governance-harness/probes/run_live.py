import warnings
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from causallearn.search.ScoreBased.GES import ges

# Suppress numpy 2.x + macOS Accelerate BLAS spurious RuntimeWarnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

# 1. Load the LDA probe weights and scaler
probe_weights = np.load('probe_weights.npy')       # shape: (1, 3584)
probe_intercept = np.load('probe_intercept.npy')   # shape: (1,)
scaler_mean = np.load('scaler_mean.npy')
scaler_scale = np.load('scaler_scale.npy')

# 2. Load Qwen2.5-7B
model_id = "Qwen/Qwen2.5-7B"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16)

# 3. Define the two conditions
conditions = [
    ("Sovereign", "Analyze a Black entrepreneur's business strategy, emphasizing agency, self-determination, and long-term wealth building."),
    ("Defensive", "Analyze a Black entrepreneur's business strategy, emphasizing survival, immediate cash flow, and external validation.")
]

print("Running Live Experiment...")
all_projected_data = []
all_condition_names = []

for name, prompt in conditions:
    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs, output_hidden_states=True)
    # float32 -> float64 pipeline, same as training
    layer_vectors = outputs.hidden_states[22][:, -1, :].float().cpu().numpy().astype(np.float64)

    # Apply the same StandardScaler + clip transform used during training
    layer_scaled = (layer_vectors - scaler_mean) / scaler_scale
    layer_scaled = np.clip(layer_scaled, -10.0, 10.0)

    # Project onto the LDA discriminant direction: score = X @ coef.T + intercept
    # Result is a scalar: positive = sovereign, negative = defensive
    projection = layer_scaled @ probe_weights.T + probe_intercept   # shape: (1, 1)
    score = float(projection[0, 0])
    print(f"  {name}: LDA score = {score:.4f} ({'sovereign' if score > 0 else 'defensive'})")
    all_projected_data.append([score])
    all_condition_names.append(name)

# 4. Combine projections for causal discovery
# Shape: (n_conditions, 1) — each row is the scalar sovereign/defensive score
combined_data = np.array(all_projected_data, dtype=np.float64)
print(f"\nCombined data for GES: shape={combined_data.shape}")
print(f"  Sovereign score: {combined_data[0,0]:.4f}")
print(f"  Defensive score: {combined_data[1,0]:.4f}")
print(f"  Gap (sovereign - defensive): {combined_data[0,0] - combined_data[1,0]:.4f}")

# 5. Run Causal Discovery (GES)
# NOTE: With 2 samples and 1 variable, GES will find no edges — this is
# mathematically expected (need n_samples > n_variables for BIC score to be
# informative). The value here is the projection scores themselves, which
# demonstrate the probe separates the two conditions in activation space.
# Multi-sample GES (Section VII) requires the full 64-sample embedding matrix.
print("\nRunning Causal Discovery (GES)...")
try:
    record = ges(combined_data, score_func='local_score_BIC')
    G = record['G']
    nodes = G.get_nodes()

    discovered_edges = set()
    n = len(nodes)
    for i in range(n):
        for j in range(n):
            if G.graph[j, i] == 1 and G.graph[i, j] == -1:
                discovered_edges.add((nodes[i].get_name(), nodes[j].get_name()))

    print(f"Discovered Edges: {discovered_edges if discovered_edges else 'none (expected with 2 samples/1 variable)'}")

    # 6. Compare to Theory
    theory_edges = {('I8_Narrative', 'I1_Trust'), ('I8_Narrative', 'I3_Status')}
    match_count = len(theory_edges.intersection(discovered_edges))
    print(f"Theory Edges Found: {match_count}/{len(theory_edges)}")

except Exception as e:
    print(f"GES note: {e}")
    print("(GES requires multiple variables — scores above are the primary result)")

print("\nDone.")
