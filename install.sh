#!/bin/bash
# install.sh
# TLC 2.0 Workspace — One-Shot Bootstrap
#
# Installs the TLC 2.0 workspace on a fresh machine.
# Idempotent — safe to run multiple times.
#
# Usage:
#   bash install.sh
#   bash install.sh --skip-zshrc    # don't touch ~/.zshrc
#   bash install.sh --dry-run       # show what would happen
#
# Requires:
#   - Node.js >= 18
#   - Python 3
#   - git

set -euo pipefail

TLC_REPO="$HOME/Projects/the-living-constitution-2.0"
WORKSPACE="$HOME/Workspace"
DRY_RUN=false
SKIP_ZSHRC=false

for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --skip-zshrc) SKIP_ZSHRC=true ;;
  esac
done

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
info() { echo -e "  ${DIM}· $1${NC}"; }
die()  { echo -e "${RED}ERROR: $1${NC}"; exit 1; }
dry()  { echo -e "  ${CYAN}[DRY] $1${NC}"; }

run() {
  if $DRY_RUN; then dry "$*"; else eval "$*"; fi
}

echo ""
echo -e "${BOLD}TLC 2.0 — Workspace Bootstrap${NC}"
echo -e "${DIM}Target: $TLC_REPO${NC}"
echo -e "${DIM}Workspace: $WORKSPACE${NC}"
$DRY_RUN && echo -e "${YELLOW}DRY RUN — no changes will be made${NC}"
echo ""

# --- 1. Verify repo exists ---
echo "[1] Checking TLC repo..."
if [ ! -d "$TLC_REPO" ]; then
  warn "TLC repo not found at $TLC_REPO"
  echo ""
  echo "  Clone it first:"
  echo "    git clone https://github.com/coreyalejandro/the-living-constitution-2.0.git $TLC_REPO"
  exit 1
fi
ok "TLC repo found at $TLC_REPO"

# --- 2. Check Node.js ---
echo ""
echo "[2] Checking Node.js..."
if ! command -v node &>/dev/null; then
  die "Node.js not found. Install Node.js >= 18 from https://nodejs.org"
fi
NODE_VER=$(node --version)
MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d. -f1)
if [ "$MAJOR" -lt 18 ]; then
  die "Node.js $NODE_VER found but >= 18 required."
fi
ok "Node.js $NODE_VER"

# --- 3. Check Python 3 ---
echo ""
echo "[3] Checking Python 3..."
if ! command -v python3 &>/dev/null; then
  warn "python3 not found. validate_repo.py will not work."
else
  PYVER=$(python3 --version)
  ok "$PYVER"
fi

# --- 4. Create Workspace structure ---
echo ""
echo "[4] Creating workspace structure..."
run "mkdir -p $WORKSPACE/projects"
ok "~/Workspace/projects/ ready"

if [ ! -L "$WORKSPACE/tlc-2.0" ]; then
  run "ln -sf $TLC_REPO $WORKSPACE/tlc-2.0"
  ok "Symlink: ~/Workspace/tlc-2.0 → $TLC_REPO"
else
  info "Symlink ~/Workspace/tlc-2.0 already exists"
fi

# --- 5. Symlink existing Projects ---
echo ""
echo "[5] Symlinking ~/Projects/* into ~/Workspace/projects/..."
if [ -d "$HOME/Projects" ]; then
  for proj in "$HOME/Projects"/*/; do
    projname=$(basename "$proj")
    linkpath="$WORKSPACE/projects/$projname"
    if [ ! -e "$linkpath" ] && [ ! -L "$linkpath" ]; then
      run "ln -sf $proj $linkpath"
    fi
  done
  LINKED=$(ls "$WORKSPACE/projects/" 2>/dev/null | wc -l | tr -d ' ')
  ok "$LINKED project symlinks in ~/Workspace/projects/"
else
  warn "~/Projects not found — skipping project symlinks"
fi

# --- 6. Make scripts executable ---
echo ""
echo "[6] Setting permissions..."
run "chmod +x $TLC_REPO/scripts/*.mjs $TLC_REPO/scripts/*.py 2>/dev/null || true"
run "chmod +x $TLC_REPO/src/git-hooks/pre-commit.mjs 2>/dev/null || true"
ok "Scripts marked executable"

# --- 7. npm install ---
echo ""
echo "[7] Installing npm dependencies..."
if [ -f "$TLC_REPO/package.json" ]; then
  run "cd $TLC_REPO && npm install --silent"
  ok "npm dependencies installed"
else
  warn "No package.json found — skipping npm install"
fi

# --- 8. Shell integration ---
echo ""
echo "[8] Shell integration..."
SHELL_FILE="$TLC_REPO/shell-integration.zsh"
if [ ! -f "$SHELL_FILE" ]; then
  warn "shell-integration.zsh not found at $SHELL_FILE — skipping"
elif $SKIP_ZSHRC; then
  warn "--skip-zshrc set — not touching ~/.zshrc"
  info "To add manually: cat $SHELL_FILE >> ~/.zshrc"
elif grep -q 'TLC 2.0 Workspace Integration' ~/.zshrc 2>/dev/null; then
  info "TLC shell integration already in ~/.zshrc"
else
  run "cat $SHELL_FILE >> ~/.zshrc"
  ok "Shell integration appended to ~/.zshrc"
  info "Run: source ~/.zshrc"
fi

# --- 9. Path portability audit (Article XIV.3) ---
echo ""
echo "[9] Path portability audit (Article XIV.3)..."
HARDCODED=$(grep -r "/Users/[a-zA-Z0-9_-]*/Projects" \
  "$TLC_REPO/scripts" \
  "$TLC_REPO/src" \
  "$TLC_REPO/shell-integration.zsh" \
  2>/dev/null | grep -v '.git' | grep -v 'node_modules' | head -5 || true)

if [ -n "$HARDCODED" ]; then
  fail "Hardcoded operator paths detected in shared scripts — violates Article XIV.3"
  echo "$HARDCODED"
  exit 1
else
  ok "No hardcoded operator paths in shared scripts"
fi

# --- 10. Validate TLC root scaffold ---
echo ""
echo "[10] Validating TLC repo scaffold..."
if command -v python3 &>/dev/null; then
  python3 "$TLC_REPO/scripts/validate_repo.py" --path "$TLC_REPO" 2>&1 | grep -E 'PASS|FAIL|WARN|SUMMARY|Result' || true
else
  warn "python3 not available — skipping scaffold validation"
fi

# --- 10. Run npm test ---
echo ""
echo "[10] Running TLC test suite..."
if $DRY_RUN; then
  dry "cd $TLC_REPO && npm test"
else
  (cd "$TLC_REPO" && npm test 2>&1 | tail -10) || warn "Tests did not pass cleanly — check output above"
fi

# --- Done ---
echo ""
echo -e "${BOLD}${GREEN}Bootstrap complete.${NC}"
echo ""
echo -e "  ${CYAN}Next steps:${NC}"
echo "  1. source ~/.zshrc  (activate shell aliases)"
echo "  2. tlc-dashboard    (view all modules)"
echo "  3. tlc-work --module CRSP-STC-RUNTIME-001  (start a governed session)"
echo ""
