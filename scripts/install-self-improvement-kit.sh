#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Install the healthcare self-improvement kit into a target project.

Usage:
  bash scripts/install-self-improvement-kit.sh [target_dir] [--force]

Examples:
  bash scripts/install-self-improvement-kit.sh
  bash scripts/install-self-improvement-kit.sh /path/to/project
  bash scripts/install-self-improvement-kit.sh /path/to/project --force

What gets installed:
  .claude/commands/eval.md
  AGENTS.md block for Codex
  eval/rubric.md
  eval/results.tsv
  eval/role-baselines/revenue-medical-coding-specialist.md
EOF
}

TARGET_DIR="."
FORCE=0

for arg in "$@"; do
  case "$arg" in
    -h|--help)
      usage
      exit 0
      ;;
    --force)
      FORCE=1
      ;;
    *)
      if [[ "$TARGET_DIR" != "." ]]; then
        echo "error: only one target directory may be provided" >&2
        usage >&2
        exit 1
      fi
      TARGET_DIR="$arg"
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
START_MARKER="<!-- healthcare-agents-eval:start -->"
END_MARKER="<!-- healthcare-agents-eval:end -->"

copy_managed_file() {
  local src="$1"
  local dest="$2"

  mkdir -p "$(dirname "$dest")"

  if [[ -e "$dest" && "$FORCE" -ne 1 ]]; then
    echo "skip  $dest (already exists; rerun with --force to overwrite)"
    return
  fi

  cp "$src" "$dest"
  echo "copy  $dest"
}

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "error: target directory does not exist: $TARGET_DIR" >&2
  exit 1
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

upsert_agents_block() {
  local agents_file="$TARGET_DIR/AGENTS.md"
  local tmp_file

  tmp_file="$(mktemp)"
  cat >"$tmp_file" <<EOF
$START_MARKER
## Healthcare agent self-improvement loop

- Agent prompts live in \`agents/*.md\`.
- If asked to run the healthcare self-improvement loop for an agent, first read \`.claude/commands/eval.md\` and execute that procedure as a normal task, replacing \`\$ARGUMENTS\` with the requested agent slug.
- Treat \`.claude/commands/eval.md\` as the canonical workflow for both Claude Code and Codex.
- If the runtime supports native subagents or model specialization, prefer a strongest scorer/judge plus a faster editor, with the parent agent owning git writes and \`eval/results.tsv\`.
- Avoid recursive CLI invocation when native subagents are available.
- Never modify \`eval/rubric.md\` or files under \`eval/role-baselines/\`.
- Never modify \`eval/results.tsv\` except to append rows.
- Preserve the agent's distinctive role identity; do not flatten prompts into generic "best practices" boilerplate.
- Only edit the requested \`agents/<slug>.md\` while running this loop.
$END_MARKER
EOF

  if [[ ! -f "$agents_file" ]]; then
    cp "$tmp_file" "$agents_file"
    echo "copy  $agents_file"
    rm -f "$tmp_file"
    return
  fi

  if grep -Fq "$START_MARKER" "$agents_file"; then
    awk -v start="$START_MARKER" -v end="$END_MARKER" -v replacement="$tmp_file" '
      $0 == start {
        while ((getline line < replacement) > 0) {
          print line
        }
        close(replacement)
        skip = 1
        next
      }
      $0 == end {
        skip = 0
        next
      }
      !skip { print }
    ' "$agents_file" >"$agents_file.tmp"
    mv "$agents_file.tmp" "$agents_file"
    echo "update $agents_file"
    rm -f "$tmp_file"
    return
  fi

  {
    printf '\n'
    cat "$tmp_file"
    printf '\n'
  } >>"$agents_file"
  echo "append $agents_file"
  rm -f "$tmp_file"
}

copy_managed_file "$REPO_ROOT/.claude/commands/eval.md" "$TARGET_DIR/.claude/commands/eval.md"
copy_managed_file "$REPO_ROOT/eval/rubric.md" "$TARGET_DIR/eval/rubric.md"
copy_managed_file "$REPO_ROOT/eval/results.tsv" "$TARGET_DIR/eval/results.tsv"
copy_managed_file \
  "$REPO_ROOT/eval/role-baselines/revenue-medical-coding-specialist.md" \
  "$TARGET_DIR/eval/role-baselines/revenue-medical-coding-specialist.md"
upsert_agents_block

cat <<EOF

Installed healthcare self-improvement kit into:
  $TARGET_DIR

Next steps:
  1. Make sure your project has agent files in agents/*.md
  2. In Claude Code, run: /eval your-agent-slug
  3. In Codex, ask: run the healthcare self-improvement loop for your-agent-slug

The /eval loop only edits agents/your-agent-slug.md and appends rows to eval/results.tsv.
EOF
