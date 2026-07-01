#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKETPLACE_ROOT="${HEALTHCARE_AGENTS_CODEX_MARKETPLACE:-$HOME/.healthcare-agents-codex-marketplace}"
PLUGIN_DIR="$MARKETPLACE_ROOT/plugins"
PLUGIN_LINK="$PLUGIN_DIR/healthcare-agents"
MARKETPLACE_DIR="$MARKETPLACE_ROOT/.agents/plugins"
MARKETPLACE_JSON="$MARKETPLACE_DIR/marketplace.json"

if ! command -v codex >/dev/null 2>&1; then
  echo "error: codex CLI is required to install the Healthcare Agents plugin" >&2
  exit 1
fi

mkdir -p "$PLUGIN_DIR" "$MARKETPLACE_DIR"

if [[ -e "$PLUGIN_LINK" && ! -L "$PLUGIN_LINK" ]]; then
  echo "error: $PLUGIN_LINK exists and is not a symlink" >&2
  echo "Remove it or set HEALTHCARE_AGENTS_CODEX_MARKETPLACE to another directory." >&2
  exit 1
fi

ln -sfn "$ROOT" "$PLUGIN_LINK"

cat > "$MARKETPLACE_JSON" <<JSON
{
  "name": "healthcare-agents-local",
  "interface": {
    "displayName": "Healthcare Agents Local"
  },
  "plugins": [
    {
      "name": "healthcare-agents",
      "source": {
        "source": "local",
        "path": "./plugins/healthcare-agents"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
JSON

codex plugin marketplace add "$MARKETPLACE_ROOT"
codex plugin add healthcare-agents@healthcare-agents-local

cat <<EOF

Healthcare Agents Codex plugin installed.
Start a new Codex thread so the healthcare-agents router skill is loaded.
EOF
