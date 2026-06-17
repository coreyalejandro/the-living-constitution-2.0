
# ─────────────────────────────────────────────────────────────────
# TLC 2.0 Workspace Integration
# Added by tlc-new installation — 2026-06-17
# Source: ~/Projects/the-living-constitution-2.0/scripts/
# ─────────────────────────────────────────────────────────────────

export TLC_ROOT="$HOME/Projects/the-living-constitution-2.0"
export TLC_SCRIPTS="$TLC_ROOT/scripts"
export WORKSPACE_ROOT="$HOME/Workspace"

# --- Aliases ---
alias tlc-work="node $TLC_SCRIPTS/tlc-work.mjs"
alias tlc-done="node $TLC_SCRIPTS/tlc-done.mjs"
alias tlc-new="node $TLC_SCRIPTS/tlc-new.mjs"
alias tlc-register="node $TLC_SCRIPTS/tlc-register.mjs"
alias tlc-dashboard="node $TLC_SCRIPTS/tlc-dashboard.mjs"
alias tlc-context="node $TLC_SCRIPTS/inject-ai-context.mjs"
alias tlc-validate="python3 $TLC_SCRIPTS/validate_repo.py"
alias tlc-report="node $TLC_SCRIPTS/tlc-report.mjs"
alias tlc-status="cd $TLC_ROOT && npm run status"
alias tlc-scan="cd $TLC_ROOT && npm run scan:projects"
alias tlc-copy="cat $TLC_ROOT/.ai-context/active-session.md | pbcopy && echo '[tlc] AI context copied to clipboard'"

# --- Auto-validate on cd into a project ---
function _tlc_cd_hook() {
  builtin cd "$@" || return
  if [[ -f "$TLC_SCRIPTS/validate-module-here.mjs" ]]; then
    node "$TLC_SCRIPTS/validate-module-here.mjs" --path "$(pwd)" 2>/dev/null
  fi
}
alias cd='_tlc_cd_hook'

# ─────────────────────────────────────────────────────────────────
