#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIXTURES="$ROOT/scripts/test-fixtures/references"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

reset_generated_dirs() {
  rm -rf \
    "$GEN_TMPDIR/references/examples/demo-agent" \
    "$GEN_TMPDIR/calibration/holdouts/demo-agent" \
    "$GEN_TMPDIR/calibration/seeds/demo-agent"
}

bash "$ROOT/scripts/lint-references.sh" "$FIXTURES/clinical-care-management-specialist-example.md" "$FIXTURES/clinical-care-management-specialist-holdout.md" >/dev/null
cp "$FIXTURES/clinical-care-management-specialist-example.md" "$TMPDIR/"
cp "$FIXTURES/clinical-care-management-specialist-holdout.md" "$TMPDIR/"
bash "$ROOT/scripts/lint-references.sh" "$TMPDIR" >/dev/null

python3 - "$TMPDIR/clinical-care-management-specialist-example.md" <<'PY'
from pathlib import Path
path = Path(__import__("sys").argv[1])
text = path.read_text(encoding="utf-8")
text = text.replace("## Goals & Interventions", "## Average Cycle Time Notes\nAverage cycle time improved after the research review.\n\n## Goals & Interventions", 1)
path.write_text(text, encoding="utf-8")
PY
bash "$ROOT/scripts/lint-references.sh" "$TMPDIR/clinical-care-management-specialist-example.md" >/dev/null

if bash "$ROOT/scripts/lint-references.sh" "$FIXTURES/clinical-care-management-specialist-stale-holdout.md" >/dev/null 2>&1; then
  echo "expected stale holdout to fail lint" >&2
  exit 1
fi

if bash "$ROOT/scripts/lint-references.sh" "$FIXTURES/clinical-care-management-specialist-invalid.md" >/dev/null 2>&1; then
  echo "expected invalid reference to fail lint" >&2
  exit 1
fi

# Regression: reference-bundle generation should recover from blank source_basis
# entries but still fail if nothing usable remains.
GEN_TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR" "$GEN_TMPDIR"' EXIT
mkdir -p "$GEN_TMPDIR/agents"
cat >"$GEN_TMPDIR/agents/demo-agent.md" <<'EOF'
---
name: Demo Agent
description: Demo agent for reference-bundle generation tests.
---

# Demo Agent

## 📋 Your Technical Deliverables

<!-- deliverable: Demo Deliverable -->
### Demo Deliverable

```markdown
# Demo Deliverable
```
EOF

cat >"$GEN_TMPDIR/registry.yaml" <<'EOF'
agents:
  - slug: demo-agent
    name: Demo Agent
    deliverables:
      - id: dem-d01
        title: Demo Deliverable
        prompt_section: "📋 Your Technical Deliverables"
    tool_opportunities:
      - capability_class: current_regulatory_policy
EOF

cat >"$GEN_TMPDIR/provider-ok.sh" <<'EOF'
#!/usr/bin/env bash
cat <<'YAML'
example_scenarios:
  - scenario_key: blank-source-example
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: routine
    scenario_summary: Demo example scenario with one noisy source entry.
    source_basis:
      - 42 CFR 482.43
      - ""
      - "   "
      - CMS MLN SE1345
    mcp_servers_relevant:
      - current_regulatory_policy
    body_markdown: |
      # Demo Deliverable

      - Reference note cites 42 CFR 482.43 and CMS MLN SE1345.
holdout_scenarios:
  - scenario_key: blank-source-holdout
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: moderate
    scenario_summary: Demo holdout scenario with one noisy source entry.
    source_basis:
      - OIG Work Plan 2025
      - " "
    expectations:
      - Mention OIG Work Plan 2025 in the evaluator context.
    required_facts:
      patient_population: Medicare
    intentionally_unknown: []
    red_flags:
      audit_risk: Recent audit focus area
    mcp_uncertainty_points: []
    body_markdown: |
      # Demo Deliverable

      - OIG Work Plan 2025 is a visible citation signal.
YAML
EOF
chmod +x "$GEN_TMPDIR/provider-ok.sh"

(
  cd "$GEN_TMPDIR"
  python3 "$ROOT/scripts/generate-reference-bundles.py" \
    --registry "$GEN_TMPDIR/registry.yaml" \
    --template "$ROOT/scripts/prompts/reference-bundles.md" \
    --style-guide "$ROOT/references/style-guide.md" \
    --provider-cmd "$GEN_TMPDIR/provider-ok.sh" \
    --model-label test-model \
    --count 1 \
    demo-agent >/dev/null
)

bash "$ROOT/scripts/lint-references.sh" \
  "$GEN_TMPDIR/references/examples/demo-agent/dem-d01-example-01-blank-source-example.md" \
  "$GEN_TMPDIR/calibration/holdouts/demo-agent/dem-d01-holdout-01-blank-source-holdout.md" >/dev/null

python3 - "$GEN_TMPDIR/references/examples/demo-agent/dem-d01-example-01-blank-source-example.md" "$GEN_TMPDIR/calibration/holdouts/demo-agent/dem-d01-holdout-01-blank-source-holdout.md" <<'PY'
from pathlib import Path
import sys
import yaml

def frontmatter(path: Path):
    text = path.read_text(encoding="utf-8")
    return yaml.safe_load(text.split("\n---\n", 1)[0].split("\n", 1)[1])

example = frontmatter(Path(sys.argv[1]))
holdout = frontmatter(Path(sys.argv[2]))
assert example["source_basis"] == ["42 CFR 482.43", "CMS MLN SE1345"], example["source_basis"]
assert holdout["source_basis"] == ["OIG Work Plan 2025"], holdout["source_basis"]
PY

reset_generated_dirs

cat >"$GEN_TMPDIR/provider-malformed-ok.sh" <<'EOF'
#!/usr/bin/env bash
cat <<'YAML'
Draft bundle output follows.

example_scenarios:
  - scenario_key: malformed-yaml-example
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: routine
    scenario_summary: Demo example scenario with recoverable malformed YAML.
    source_basis:
      - 42 CFR 482.43
    mcp_servers_relevant:
      - current_regulatory_policy
    body_markdown: |
      # Demo Deliverable

      - 42 CFR 482.43 remains the visible citation signal.
...
holdout_scenarios:
  - scenario_key: malformed-yaml-holdout
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: high
    scenario_summary: Demo holdout scenario with recoverable malformed YAML.
    source_basis:
      - CMS MLN SE1345
    expectations:
      - Mention CMS MLN SE1345 in the evaluator context.
    required_facts:
      patient_population: Medicare
    intentionally_unknown: []
    red_flags:
      audit_risk: Recent CMS focus area
    mcp_uncertainty_points: []
    body_markdown: |
      # Demo Deliverable

      - CMS MLN SE1345 remains the visible citation signal.
YAML
EOF
chmod +x "$GEN_TMPDIR/provider-malformed-ok.sh"

(
  cd "$GEN_TMPDIR"
  python3 "$ROOT/scripts/generate-reference-bundles.py" \
    --registry "$GEN_TMPDIR/registry.yaml" \
    --template "$ROOT/scripts/prompts/reference-bundles.md" \
    --style-guide "$ROOT/references/style-guide.md" \
    --provider-cmd "$GEN_TMPDIR/provider-malformed-ok.sh" \
    --model-label test-model \
    --count 1 \
    --overwrite \
    demo-agent >/dev/null
)

bash "$ROOT/scripts/lint-references.sh" \
  "$GEN_TMPDIR/references/examples/demo-agent/dem-d01-example-01-malformed-yaml-example.md" \
  "$GEN_TMPDIR/calibration/holdouts/demo-agent/dem-d01-holdout-01-malformed-yaml-holdout.md" >/dev/null

reset_generated_dirs

cat >"$GEN_TMPDIR/provider-extra-items.sh" <<'EOF'
#!/usr/bin/env bash
cat <<'YAML'
example_scenarios:
  - scenario_key: kept-example
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: routine
    scenario_summary: This first example should be kept when count is 1.
    source_basis:
      - 42 CFR 482.43
    mcp_servers_relevant:
      - current_regulatory_policy
    body_markdown: |
      # Demo Deliverable

      - Kept example.
  - scenario_key: ignored-example
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: moderate
    scenario_summary: This second example should be ignored when count is 1.
    source_basis:
      - CMS MLN SE1345
    mcp_servers_relevant:
      - current_regulatory_policy
    body_markdown: |
      # Demo Deliverable

      - Ignored example.
holdout_scenarios:
  - scenario_key: kept-holdout
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: routine
    scenario_summary: This first holdout should be kept when count is 1.
    source_basis:
      - OIG Work Plan 2025
    expectations:
      - Mention OIG Work Plan 2025 in the evaluator context.
    required_facts:
      program: Medicare
    intentionally_unknown: []
    red_flags:
      audit_risk: High
    mcp_uncertainty_points: []
    body_markdown: |
      # Demo Deliverable

      - Kept holdout.
  - scenario_key: ignored-holdout
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: high
    scenario_summary: This second holdout should be ignored when count is 1.
    source_basis:
      - CMS manual
    expectations:
      - Mention CMS manual in the evaluator context.
    required_facts:
      program: Medicaid
    intentionally_unknown: []
    red_flags:
      audit_risk: Medium
    mcp_uncertainty_points: []
    body_markdown: |
      # Demo Deliverable

      - Ignored holdout.
YAML
EOF
chmod +x "$GEN_TMPDIR/provider-extra-items.sh"

(
  cd "$GEN_TMPDIR"
  python3 "$ROOT/scripts/generate-reference-bundles.py" \
    --registry "$GEN_TMPDIR/registry.yaml" \
    --template "$ROOT/scripts/prompts/reference-bundles.md" \
    --style-guide "$ROOT/references/style-guide.md" \
    --provider-cmd "$GEN_TMPDIR/provider-extra-items.sh" \
    --model-label test-model \
    --count 1 \
    --overwrite \
    demo-agent >/dev/null
)

test -f "$GEN_TMPDIR/references/examples/demo-agent/dem-d01-example-01-kept-example.md"
test ! -f "$GEN_TMPDIR/references/examples/demo-agent/dem-d01-example-01-ignored-example.md"
test -f "$GEN_TMPDIR/calibration/holdouts/demo-agent/dem-d01-holdout-01-kept-holdout.md"
test ! -f "$GEN_TMPDIR/calibration/holdouts/demo-agent/dem-d01-holdout-01-ignored-holdout.md"

reset_generated_dirs

cat >"$GEN_TMPDIR/provider-flaky.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
STATE_FILE="${STATE_FILE:?}"
if [[ ! -f "$STATE_FILE" ]]; then
  touch "$STATE_FILE"
  cat <<'BAD'
not valid yaml yet
BAD
  exit 0
fi
cat <<'YAML'
example_scenarios:
  - scenario_key: flaky-example
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: routine
    scenario_summary: Flaky example succeeds on retry.
    source_basis:
      - 42 CFR 482.43
    mcp_servers_relevant:
      - current_regulatory_policy
    body_markdown: |
      # Demo Deliverable

      - Flaky example recovered on retry.
holdout_scenarios:
  - scenario_key: flaky-holdout
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: moderate
    scenario_summary: Flaky holdout succeeds on retry.
    source_basis:
      - CMS MLN SE1345
    expectations:
      - Mention CMS MLN SE1345 in the evaluator context.
    required_facts:
      program: Medicare
    intentionally_unknown: []
    red_flags:
      audit_risk: Moderate
    mcp_uncertainty_points: []
    body_markdown: |
      # Demo Deliverable

      - Flaky holdout recovered on retry.
YAML
EOF
chmod +x "$GEN_TMPDIR/provider-flaky.sh"

(
  cd "$GEN_TMPDIR"
  STATE_FILE="$GEN_TMPDIR/provider-flaky.state" \
  python3 "$ROOT/scripts/generate-reference-bundles.py" \
    --registry "$GEN_TMPDIR/registry.yaml" \
    --template "$ROOT/scripts/prompts/reference-bundles.md" \
    --style-guide "$ROOT/references/style-guide.md" \
    --provider-cmd "$GEN_TMPDIR/provider-flaky.sh" \
    --model-label test-model \
    --provider-attempts 2 \
    --count 1 \
    --overwrite \
    demo-agent >/dev/null
)

test -f "$GEN_TMPDIR/references/examples/demo-agent/dem-d01-example-01-flaky-example.md"
test -f "$GEN_TMPDIR/calibration/holdouts/demo-agent/dem-d01-holdout-01-flaky-holdout.md"

cat >"$GEN_TMPDIR/provider-bad.sh" <<'EOF'
#!/usr/bin/env bash
cat <<'YAML'
example_scenarios:
  - scenario_key: unusable-example
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: routine
    scenario_summary: Demo example scenario with no usable sources.
    source_basis:
      - ""
      - "   "
    mcp_servers_relevant:
      - current_regulatory_policy
    body_markdown: |
      # Demo Deliverable

      - Reference note cites 42 CFR 482.43.
holdout_scenarios:
  - scenario_key: unusable-holdout
    deliverable_id: dem-d01
    deliverable_title: Demo Deliverable
    complexity: routine
    scenario_summary: Demo holdout scenario with no usable sources.
    source_basis:
      - ""
    expectations:
      - Mention CMS guidance.
    required_facts:
      program: Medicare
    intentionally_unknown: []
    red_flags:
      audit_risk: High
    mcp_uncertainty_points: []
    body_markdown: |
      # Demo Deliverable

      - Reference note cites CMS guidance.
YAML
EOF
chmod +x "$GEN_TMPDIR/provider-bad.sh"

if (
  cd "$GEN_TMPDIR"
  python3 "$ROOT/scripts/generate-reference-bundles.py" \
    --registry "$GEN_TMPDIR/registry.yaml" \
    --template "$ROOT/scripts/prompts/reference-bundles.md" \
    --style-guide "$ROOT/references/style-guide.md" \
    --provider-cmd "$GEN_TMPDIR/provider-bad.sh" \
    --model-label test-model \
    --count 1 \
    demo-agent >/dev/null 2>&1
); then
  echo "expected reference-bundle generation with only blank source_basis values to fail" >&2
  exit 1
fi

echo "test-lint-references.sh: ok"
