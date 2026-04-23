#!/usr/bin/env bash
# lint-agents.sh — Quality validation for healthcare-agents pack
# Mirrors agency-agents lint conventions with healthcare-specific checks

set -euo pipefail

AGENTS_DIR="${1:-agents}"
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

has_literal() {
    local file="$1"
    local needle="$2"
    grep -Fq "$needle" "$file"
}

for file in "$AGENTS_DIR"/*.md; do
    [ -f "$file" ] || continue
    FILE_COUNT=$((FILE_COUNT + 1))
    basename=$(basename "$file")

    # Check frontmatter exists
    if ! head -1 "$file" | grep -q "^---$"; then
        error "$basename: Missing frontmatter (no opening ---)"
        continue
    fi

    # Extract frontmatter
    frontmatter=$(sed -n '2,/^---$/p' "$file" | head -n -1)

    # Required fields
    name_value="$(echo "$frontmatter" | awk -F': *' '$1 == "name" {print $2; exit}')"
    if [[ -z "$name_value" ]]; then
        error "$basename: Missing required field 'name'"
    else
        expected_name="${basename%.md}"
        if [[ "$name_value" != "$expected_name" ]]; then
            error "$basename: name must match filename slug '$expected_name' for Claude Code/OpenCode compatibility"
        fi
        if ! [[ "$name_value" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
            error "$basename: name must be lowercase alphanumeric with single hyphen separators"
        fi
        if [[ ${#name_value} -gt 64 ]]; then
            error "$basename: name exceeds 64 characters"
        fi
    fi
    if ! echo "$frontmatter" | grep -q "^display_name:"; then
        error "$basename: Missing required field 'display_name'"
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
