#!/usr/bin/env bash
# lint-agents.sh — Quality validation for healthcare-agents pack
# Mirrors agency-agents lint conventions with healthcare-specific checks

set -euo pipefail

AGENTS_DIR="${1:-agents}"
ERRORS=0

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

error() { echo -e "${RED}ERROR${NC}: $1"; ERRORS=$((ERRORS + 1)); }
ok() { echo -e "${GREEN}OK${NC}: $1"; }

echo "=== Healthcare Agents Lint ==="
echo "Scanning: $AGENTS_DIR/"
echo ""

FILE_COUNT=0

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

    for heading in \
        '## Review the Work' \
        '### Best Inputs' \
        '### Output Modes' \
        '### Role Finish Check' \
        '### Collaboration & Handoffs' \
        '## 🚨 Critical Rules You Must Follow' \
        '## Domain Reference' \
        '## Deliverable Templates'; do
        if ! grep -Fxq "$heading" "$file"; then
            error "$basename: Missing heading '$heading'"
        fi
    done
    if grep -Fxq "### Completion Criteria" "$file"; then
        error "$basename: Use the role-specific 'Role Finish Check' heading"
    fi

    body_lines=$(wc -l < "$file")
    ok "$basename ($body_lines lines)"
done

echo ""
echo "=== Results ==="
echo "Files scanned: $FILE_COUNT"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}FAILED${NC} — fix errors before merging"
    exit 1
else
    echo -e "${GREEN}PASSED${NC}"
    exit 0
fi
