#!/usr/bin/env bash
# lint-agents.sh — Quality validation for healthcare-agents pack
# Mirrors agency-agents lint conventions with healthcare-specific checks

set -euo pipefail

AGENTS_DIR="agents"
REGISTRY_FILE="registry.yaml"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --registry)
            REGISTRY_FILE="${2:-}"
            if [[ -z "$REGISTRY_FILE" ]]; then
                echo "error: --registry requires a file path" >&2
                exit 1
            fi
            shift 2
            ;;
        --help|-h)
            echo "Usage: scripts/lint-agents.sh [--registry FILE] [AGENTS_DIR]" >&2
            exit 0
            ;;
        *)
            AGENTS_DIR="$1"
            shift
            ;;
    esac
done

ERRORS=0
WARNINGS=0

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

error() { echo -e "${RED}ERROR${NC}: $1"; ERRORS=$((ERRORS + 1)); }
warn() { echo -e "${YELLOW}WARN${NC}: $1"; WARNINGS=$((WARNINGS + 1)); }
ok() { echo -e "${GREEN}OK${NC}: $1"; }

echo "=== Healthcare Agents Lint ==="
echo "Scanning: $AGENTS_DIR/"
echo ""

FILE_COUNT=0
declare -A LINE_BUDGETS=()

has_literal() {
    local file="$1"
    local needle="$2"
    grep -Fq "$needle" "$file"
}

if [[ -f "$REGISTRY_FILE" ]]; then
    while IFS=$'\t' read -r slug budget; do
        [[ -n "$slug" ]] || continue
        LINE_BUDGETS["$slug"]="$budget"
    done < <(
        python3 - "$REGISTRY_FILE" <<'PY'
from pathlib import Path
import sys
import yaml

registry = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8")) or {}
for entry in registry.get("agents", []) or []:
    slug = entry.get("slug")
    budget = entry.get("line_budget")
    if isinstance(slug, str) and isinstance(budget, int):
        print(f"{slug}\t{budget}")
PY
    )
fi

is_utility_prompt() {
    local file="$1"
    local basename
    basename=$(basename "$file")

    if [ "$basename" = "eval-exam-architect.md" ]; then
        return 0
    fi

    if ! head -1 "$file" | grep -q "^---$"; then
        return 1
    fi

    local frontmatter
    frontmatter=$(sed -n '2,/^---$/p' "$file" | head -n -1)
    echo "$frontmatter" | grep -Eq '^[[:space:]]*utility:[[:space:]]*true([[:space:]]|$)'
}

is_orchestrator_prompt() {
    local file="$1"
    local basename
    basename=$(basename "$file")

    if [ "$basename" = "orchestrator.md" ]; then
        return 0
    fi

    if ! head -1 "$file" | grep -q "^---$"; then
        return 1
    fi

    local frontmatter
    frontmatter=$(sed -n '2,/^---$/p' "$file" | head -n -1)
    echo "$frontmatter" | grep -Eq '^[[:space:]]*agent_type:[[:space:]]*orchestrator([[:space:]]|$)'
}

for file in "$AGENTS_DIR"/*.md; do
    [ -f "$file" ] || continue
    FILE_COUNT=$((FILE_COUNT + 1))
    basename=$(basename "$file")

    if is_utility_prompt "$file"; then
        ok "$basename (special-purpose utility prompt; skipped canonical agent checks)"
        continue
    fi

    if is_orchestrator_prompt "$file"; then
        ok "$basename (special-purpose orchestrator prompt; skipped canonical specialist checks)"
        continue
    fi

    # Check frontmatter exists
    if ! head -1 "$file" | grep -q "^---$"; then
        error "$basename: Missing frontmatter (no opening ---)"
        continue
    fi

    # Extract frontmatter
    frontmatter=$(sed -n '2,/^---$/p' "$file" | head -n -1)

    # Required fields
    if ! echo "$frontmatter" | grep -q "^name:"; then
        error "$basename: Missing required field 'name'"
    fi
    if ! echo "$frontmatter" | grep -q "^description:"; then
        error "$basename: Missing required field 'description'"
    fi
    if ! echo "$frontmatter" | grep -q "^color:"; then
        error "$basename: Missing required field 'color'"
    fi

    # Check for key sections
    if ! has_literal "$file" "## 🧠 Your Identity & Memory"; then
        warn "$basename: Missing 'Identity & Memory' section"
    fi
    if ! has_literal "$file" "## 🎯 Your Core Mission"; then
        warn "$basename: Missing 'Core Mission' section"
    fi
    if ! has_literal "$file" "## 🚨 Critical Rules You Must Follow"; then
        warn "$basename: Missing 'Critical Rules' section"
    fi

    # Check body length
    body_lines=$(wc -l < "$file")
    if [ "$body_lines" -lt 100 ]; then
        warn "$basename: Body under 100 lines ($body_lines lines)"
    elif [ "$body_lines" -lt 350 ]; then
        warn "$basename: Body under 350 lines ($body_lines lines) — consider expanding Core Mission"
    fi

    slug="${basename%.md}"
    if [[ -n "${LINE_BUDGETS[$slug]:-}" ]]; then
        budget="${LINE_BUDGETS[$slug]}"
        if [ "$body_lines" -gt "$budget" ]; then
            error "$basename: Exceeds line_budget ($body_lines > $budget)"
        fi
    fi

    # Healthcare-specific: check for emoji section headers
    if ! has_literal "$file" "## 🧠 Your Identity & Memory"; then
        warn "$basename: Missing emoji prefix on Identity section header"
    fi
    if ! has_literal "$file" "## 🎯 Your Core Mission"; then
        warn "$basename: Missing emoji prefix on Core Mission section header"
    fi

    ok "$basename ($body_lines lines)"
done

echo ""
echo "=== Results ==="
echo "Files scanned: $FILE_COUNT"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}FAILED${NC} — fix errors before merging"
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}PASSED with warnings${NC}"
    exit 0
else
    echo -e "${GREEN}PASSED${NC}"
    exit 0
fi
