#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
HOME_DIR="$TMP/home"
PROJECT_DIR="$TMP/project with spaces"
mkdir -p "$HOME_DIR" "$PROJECT_DIR"
export HOME="$HOME_DIR"
export NO_COLOR=1

run_install() {
  (cd "$PROJECT_DIR" && bash "$ROOT/install.sh" "$@")
}

assert_file() {
  [[ -f "$1" ]] || { echo "missing file: $1" >&2; exit 1; }
}

assert_missing() {
  [[ ! -e "$1" ]] || { echo "expected missing: $1" >&2; exit 1; }
}

assert_contains() {
  local file="$1" needle="$2"
  grep -Fq "$needle" "$file" || { echo "missing '$needle' in $file" >&2; exit 1; }
}

run_install --all --dry-run >"$TMP/dryrun.log"
grep -Fq "Dry run complete" "$TMP/dryrun.log"

run_install revenue-cycle-specialist --codex
CODEX_AGENT="$HOME_DIR/.codex/agents/revenue-cycle-specialist.md"
CODEX_AGENTS="$HOME_DIR/.codex/AGENTS.md"
assert_file "$CODEX_AGENT"
assert_file "$CODEX_AGENTS"
assert_contains "$CODEX_AGENTS" "<!-- healthcare-agents:start -->"
assert_contains "$CODEX_AGENTS" "approved environment"
assert_contains "$CODEX_AGENTS" "minimum necessary"

printf "sentinel\n" > "$CODEX_AGENT"
run_install revenue-cycle-specialist --codex >"$TMP/skip.log"
grep -Fq "exists" "$TMP/skip.log"
assert_contains "$CODEX_AGENT" "sentinel"
run_install revenue-cycle-specialist --codex --force
grep -Fq "RevenueCycleSpecialist" "$CODEX_AGENT"

run_install revenue-cycle-specialist --codex --uninstall
assert_missing "$CODEX_AGENT"
! grep -Fq "<!-- healthcare-agents:start -->" "$CODEX_AGENTS"

run_install quality-compliance-officer --agent-skills
SKILL="$HOME_DIR/.agents/skills/quality-compliance-officer/SKILL.md"
assert_file "$SKILL"
assert_contains "$SKILL" "name: quality-compliance-officer"
assert_contains "$SKILL" "approved environment"
assert_contains "$SKILL" "minimum necessary"
assert_contains "$SKILL" "## 🚨 Critical Rules You Must Follow"
run_install quality-compliance-officer --agent-skills --uninstall
assert_missing "$HOME_DIR/.agents/skills/quality-compliance-officer"

run_install --claude-workflow-skills
CLAUDE_WORKFLOW="$HOME_DIR/.claude/skills/healthcare-denial-spike-workup/SKILL.md"
assert_file "$CLAUDE_WORKFLOW"
assert_contains "$CLAUDE_WORKFLOW" "Revenue Cycle Denial Spike Workup"
assert_contains "$CLAUDE_WORKFLOW" "Safety Constraints"
assert_file "$HOME_DIR/.claude/skills/.healthcare-agents-manifest.json"
run_install --claude-workflow-skills --uninstall
assert_missing "$HOME_DIR/.claude/skills/healthcare-denial-spike-workup"

run_install --codex-skills
CODEX_WORKFLOW="$HOME_DIR/.codex/skills/healthcare-hipaa-security-evidence-checklist/SKILL.md"
assert_file "$CODEX_WORKFLOW"
assert_contains "$CODEX_WORKFLOW" "HIPAA Security Evidence Checklist"
assert_contains "$CODEX_WORKFLOW" "Read the primary specialist prompt"
run_install --codex-skills --uninstall
assert_missing "$HOME_DIR/.codex/skills/healthcare-hipaa-security-evidence-checklist"

CUSTOM="$TMP/custom prompts"
run_install revenue-contract-analyst --path "$CUSTOM"
assert_file "$CUSTOM/revenue-contract-analyst.md"
run_install revenue-contract-analyst --path "$CUSTOM" --uninstall
assert_missing "$CUSTOM/revenue-contract-analyst.md"

run_install revenue-cycle-specialist --aider
assert_file "$PROJECT_DIR/.aider.conf.yml"
assert_contains "$PROJECT_DIR/.aider.conf.yml" "# healthcare-agents start"
assert_contains "$PROJECT_DIR/.aider.conf.yml" "revenue-cycle-specialist.md"
run_install revenue-cycle-specialist --aider --force
[[ "$(grep -c '# healthcare-agents start' "$PROJECT_DIR/.aider.conf.yml")" == "1" ]]
run_install revenue-cycle-specialist --aider --uninstall
! grep -Fq "# healthcare-agents start" "$PROJECT_DIR/.aider.conf.yml"

run_install revenue-cycle-specialist --claude --gemini --cursor --windsurf --copilot --cline --amazonq --continue
assert_file "$HOME_DIR/.claude/agents/revenue-cycle-specialist.md"
assert_file "$HOME_DIR/.gemini/agents/revenue-cycle-specialist.md"
assert_file "$PROJECT_DIR/.cursor/rules/revenue-cycle-specialist.md"
assert_file "$PROJECT_DIR/.windsurf/rules/revenue-cycle-specialist.md"
assert_file "$PROJECT_DIR/.github/instructions/revenue-cycle-specialist.md"
assert_file "$PROJECT_DIR/.clinerules/revenue-cycle-specialist.md"
assert_file "$PROJECT_DIR/.amazonq/rules/revenue-cycle-specialist.md"
assert_file "$PROJECT_DIR/.continue/revenue-cycle-specialist.md"

run_install --copilot-all
assert_file "$PROJECT_DIR/.github/copilot-instructions.md"
assert_file "$PROJECT_DIR/.github/instructions/healthcare-revenue-cycle.instructions.md"
assert_file "$PROJECT_DIR/.github/agents/healthcare-workup-orchestrator-agent.agent.md"
assert_file "$PROJECT_DIR/.github/prompts/denial-spike-workup.prompt.md"
assert_file "$PROJECT_DIR/.github/ISSUE_TEMPLATE/healthcare-denial-spike-workup.yml"
assert_contains "$PROJECT_DIR/.github/copilot-instructions.md" "<!-- healthcare-agents:start -->"
assert_contains "$PROJECT_DIR/.github/prompts/denial-spike-workup.prompt.md" "Acceptance Criteria"
run_install --copilot-all --uninstall
assert_missing "$PROJECT_DIR/.github/instructions/healthcare-revenue-cycle.instructions.md"
assert_missing "$PROJECT_DIR/.github/agents/healthcare-workup-orchestrator-agent.agent.md"
assert_missing "$PROJECT_DIR/.github/prompts/denial-spike-workup.prompt.md"
assert_missing "$PROJECT_DIR/.github/ISSUE_TEMPLATE/healthcare-denial-spike-workup.yml"
! grep -Fq "<!-- healthcare-agents:start -->" "$PROJECT_DIR/.github/copilot-instructions.md"

run_install --doctor > "$TMP/doctor.txt"
grep -Fq "Healthcare Agents Doctor" "$TMP/doctor.txt"

if run_install "../bad-slug" --codex 2>"$TMP/bad-slug.err"; then
  echo "invalid slug unexpectedly succeeded" >&2
  exit 1
fi
grep -Fq "invalid agent slug" "$TMP/bad-slug.err"

echo "installer e2e ok: dry-run, real writes, force, uninstall, Codex/Aider blocks, skills, workflow skills, Copilot surfaces, custom paths, static slug safety"
