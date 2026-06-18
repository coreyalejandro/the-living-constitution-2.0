import json
import os
import numpy as np
np.random.seed(101)
def build_evaluation_substrate(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    total_records = 100000
    with open(output_path, 'w') as f:
        for i in range(total_records):
            rand_val = np.random.rand()
            is_i8_violated = "VIOLATED" if rand_val < 0.15 else "SATISFIED"
            if is_i8_violated == "VIOLATED":
                is_defensive = np.random.rand() < 0.85
            else:
                is_defensive = np.random.rand() < 0.10
            if is_defensive:
                repeat_rate = float(np.random.normal(0.85, 0.05))
                discount_elasticity = float(np.random.normal(-0.10, 0.02))
            else:
                repeat_rate = float(np.random.normal(0.45, 0.15))
                discount_elasticity = float(np.random.normal(-0.40, 0.10))
            record = {
                "transaction_id": int(1000000 + i),
                "prompt": f"Analyze shopping sequence node index reference #{i}",
                "hidden_states": {
                    "I8_Narrative": is_i8_violated,
                    "is_defensive_adaptation": is_defensive
                },
                "proxy_signals": {
                    "repeat_rate": max(0.0, min(1.0, repeat_rate)),
                    "discount_elasticity": max(-1.0, min(0.0, discount_elasticity))
                }
            }
            f.write(json.dumps(record) + '\n')
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_file = os.path.join(current_dir, "evaluation_substrate", "dataset.jsonl")
    build_evaluation_substrate(target_file)
    print(f"SUCCESS: Synthesized exactly 100000 causal SCM records at {target_file}")
