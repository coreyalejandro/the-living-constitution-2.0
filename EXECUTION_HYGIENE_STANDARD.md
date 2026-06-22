# C-RSP Execution Hygiene Standard

## 1. Core Mandate
All bash scripts, terminal commands, and physical actuation code generated under the C-RSP framework MUST adhere to this strict Execution Hygiene Standard. The default LLM "happy path" assumption is permanently deprecated. Code must be generated defensively to prevent environmental pollution, ghost dependencies, and silent failures.

## 2. The Execution Invariants
Any execution script that violates these invariants is considered a failure state and must be rejected via the Evidence Stream.

1. **Strict Fail-Fast:** Every bash script must begin with `set -euo pipefail`. This ensures the script halts immediately on any error, undefined variable, or failed piped command.
2. **Absolute Deterministic Pathing:** Scripts must explicitly define and enforce their target directory using absolute paths before executing localized commands.
3. **Non-Interactive Execution:** All installations, initializations, and prompts must include bypass flags (e.g., `--yes`, `-y`) to prevent the terminal from hanging.

## 3. The Reference Standard
Agents must structure execution blocks using this exact format.

### ❌ REJECTED (Fragile & Polluting)
```bash
mkdir -p src/components
npx create-next-app@latest my-app
npx shadcn@latest init
```

### ✅ REQUIRED (Hardened C-RSP Standard)
```bash
#!/usr/bin/env bash
set -euo pipefail

# 1. Enforce Absolute Pathing
TARGET_DIR="/absolute/path/to/project"
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# 2. Verify Directory State
test "$(pwd)" = "$TARGET_DIR"

# 3. Non-Interactive Execution
npx create-next-app@latest . --ts --tailwind --eslint --app --use-npm --yes
npx shadcn@latest init --yes -d
```
