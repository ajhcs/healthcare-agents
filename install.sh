#!/usr/bin/env bash
set -euo pipefail

VERSION="1.1.1"
REPO="ajhcs/healthcare-agents"
REPO_URL="https://github.com/$REPO"
AGENTS_DIR=""
TARGETS=()
FORCE=false
DRY_RUN=false
UNINSTALL=false
CUSTOM_PATH=""
ALL=false
EXPLICIT=false
TOTAL_INSTALLED=0

if [[ -z "${NO_COLOR:-}" ]] && [[ -t 1 ]]; then
  GREEN=$'\033[32m' RED=$'\033[31m' YELLOW=$'\033[33m'
  BOLD=$'\033[1m' DIM=$'\033[2m' RESET=$'\033[0m'
else
  GREEN="" RED="" YELLOW="" BOLD="" DIM="" RESET=""
fi

ok()   { printf "  ${GREEN}%s${RESET} %s\n" "+" "$1"; }
skip() { printf "  ${DIM}%s${RESET} %s\n" "-" "$1"; }
err()  { printf "${RED}error:${RESET} %s\n" "$1" >&2; }
warn() { printf "${YELLOW}warn:${RESET} %s\n" "$1" >&2; }

usage() {
  cat <<EOF
${BOLD}Healthcare Agents Installer v$VERSION${RESET}
Usage: install.sh [OPTIONS]

Targets:  --claude --claude-code --codex --codex-app --gemini
          --cursor --windsurf --copilot --cline --amazonq
          --aider --continue
          --claude-skills --claude-desktop --claude-cowork
          --opencode --agent-skills --skills
          --all (force all)  --path DIR (custom directory)

Flags:    --force       Overwrite existing files
          --uninstall   Remove agents from detected paths
          --dry-run     Preview without changes
          --version     Print version
          -h, --help    Show this help
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --claude|--claude-code) TARGETS+=(claude); EXPLICIT=true; shift ;;
    --codex|--codex-app)    TARGETS+=(codex);  EXPLICIT=true; shift ;;
    --gemini)    TARGETS+=(gemini);    EXPLICIT=true; shift ;;
    --cursor)    TARGETS+=(cursor);    EXPLICIT=true; shift ;;
    --windsurf)  TARGETS+=(windsurf);  EXPLICIT=true; shift ;;
    --copilot)   TARGETS+=(copilot);   EXPLICIT=true; shift ;;
    --cline)     TARGETS+=(cline);     EXPLICIT=true; shift ;;
    --amazonq)   TARGETS+=(amazonq);   EXPLICIT=true; shift ;;
    --aider)     TARGETS+=(aider);     EXPLICIT=true; shift ;;
    --continue)  TARGETS+=(continue);  EXPLICIT=true; shift ;;
    --claude-skills|--claude-desktop|--claude-cowork|--cowork)
                  TARGETS+=(claude-skills); EXPLICIT=true; shift ;;
    --opencode)  TARGETS+=(opencode);  EXPLICIT=true; shift ;;
    --agent-skills|--agents-skills)
                  TARGETS+=(agent-skills); EXPLICIT=true; shift ;;
    --skills)    TARGETS+=(claude-skills opencode agent-skills); EXPLICIT=true; shift ;;
    --all)       ALL=true; shift ;;
    --path)      CUSTOM_PATH="$2"; EXPLICIT=true; shift 2 ;;
    --force)     FORCE=true; shift ;;
    --uninstall) UNINSTALL=true; shift ;;
    --dry-run)   DRY_RUN=true; shift ;;
    --version)   echo "healthcare-agents installer v$VERSION"; exit 0 ;;
    -h|--help)   usage ;;
    *)           err "unknown option: $1"; usage ;;
  esac
done

find_agents() {
  # Running via npx (HEALTHCARE_AGENTS_ROOT set by bin/cli.js)?
  if [[ -n "${HEALTHCARE_AGENTS_ROOT:-}" ]] && [[ -d "$HEALTHCARE_AGENTS_ROOT/agents" ]]; then
    AGENTS_DIR="$HEALTHCARE_AGENTS_ROOT/agents"
    return 0
  fi
  # Running from cloned repo?
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [[ -d "$script_dir/agents" ]]; then
    AGENTS_DIR="$script_dir/agents"
    return 0
  fi
  # Running via curl pipe -- need to download
  return 1
}

download_agents() {
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT

  printf "%s\n" "Downloading agents from $REPO..."
  if command -v git &>/dev/null; then
    git clone --depth 1 --quiet "$REPO_URL.git" "$tmp/repo"
    AGENTS_DIR="$tmp/repo/agents"
  elif command -v curl &>/dev/null; then
    curl -fsSL "$REPO_URL/archive/refs/heads/main.tar.gz" | tar -xz -C "$tmp"
    AGENTS_DIR="$tmp/healthcare-agents-main/agents"
  else
    err "need git or curl to download agents"; exit 1
  fi

  if [[ ! -d "$AGENTS_DIR" ]]; then
    err "download failed -- agents/ not found"; exit 1
  fi
}

declare -A TOOL_DISPLAY TOOL_PATH TOOL_HOME
reg() { TOOL_DISPLAY[$1]="$2"; TOOL_PATH[$1]="$3"; TOOL_HOME[$1]="$4"; }
reg claude   "Claude Code"     .claude/agents          1
reg codex    "Codex / Codex App" .codex/agents          1
reg gemini   "Gemini CLI"      .gemini/agents           1
reg cursor   "Cursor"          .cursor/rules            0
reg windsurf "Windsurf"        .windsurf/rules          0
reg copilot  "GitHub Copilot"  .github/instructions     0
reg cline    "Cline"           .clinerules              0
reg amazonq  "Amazon Q"        .amazonq/rules           0
reg aider    "Aider"           .aider.conf.yml          0
reg continue "Continue.dev"    .continue                0
reg claude-skills "Claude Skills" .claude/skills         1
reg opencode "OpenCode Skills" .config/opencode/skills   1
reg agent-skills "Open Agent Skills" .agents/skills      1
TOOL_ORDER=(claude codex claude-skills opencode agent-skills gemini cursor windsurf copilot cline amazonq aider continue)

resolve_path() {
  local tool="$1"
  if [[ "${TOOL_HOME[$tool]}" == "1" ]]; then
    echo "$HOME/${TOOL_PATH[$tool]}"
  else
    echo "${PWD}/${TOOL_PATH[$tool]}"
  fi
}

tool_exists() {
  local tool="$1" path
  path="$(resolve_path "$tool")"
  if [[ "$tool" == "aider" ]]; then
    [[ -f "$path" ]] || command -v aider &>/dev/null
  elif [[ "$tool" == "opencode" ]]; then
    [[ -d "$path" ]] || command -v opencode &>/dev/null
  else
    [[ -d "$path" ]] || [[ -d "$(dirname "$path")" && "$tool" == "continue" ]]
  fi
}

detect_targets() {
  printf "\n${BOLD}Detected tools:${RESET}\n"
  for tool in "${TOOL_ORDER[@]}"; do
    local path disp
    path="$(resolve_path "$tool")"
    disp="${TOOL_DISPLAY[$tool]}"
    if tool_exists "$tool"; then
      ok "$disp ($path)"
      TARGETS+=("$tool")
    else
      skip "$disp (not found)"
    fi
  done
  echo
}

install_to_dir() {
  local dest="$1" label="$2"
  local count=0
  mkdir -p "$dest"
  for f in "$AGENTS_DIR"/*.md; do
    local base
    base="$(basename "$f")"
    local target="$dest/$base"
    if [[ -f "$target" ]] && ! $FORCE; then
      if [[ $count -eq 0 ]]; then
        warn "$label: files exist (use --force to update)"
      fi
      return 0
    fi
    if $DRY_RUN; then
      count=$((count + 1))
      continue
    fi
    cp "$f" "$target"
    count=$((count + 1))
  done
  local agent_count
  agent_count="$(ls "$AGENTS_DIR"/*.md 2>/dev/null | wc -l)"
  printf "  %s %s (%d files)\n" "${GREEN}->${RESET}" "$label" "$agent_count"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + agent_count))
}

field_value() {
  local file="$1" field="$2"
  awk -v key="$field:" '
    $0 == "---" { seen++; next }
    seen == 1 && index($0, key) == 1 {
      sub("^[^:]+:[[:space:]]*", "", $0)
      gsub(/^"|"$/, "", $0)
      print
      exit
    }
  ' "$file"
}

write_skill_file() {
  local src="$1" dest_dir="$2"
  local slug display desc
  slug="$(basename "$src" .md)"
  display="$(field_value "$src" display_name)"
  [[ -n "$display" ]] || display="$slug"
  desc="$(field_value "$src" description)"

  mkdir -p "$dest_dir/$slug"
  {
    printf '%s\n' '---'
    printf 'name: %s\n' "$slug"
    printf '%s\n' 'description: >-'
    printf '  Healthcare administration specialist: %s Use when the user asks for the %s role, related healthcare operations expertise, or a concrete deliverable in this specialty.\n' "$desc" "$display"
    printf 'license: Apache-2.0\n'
    printf 'compatibility: claude-code, claude-desktop, claude-cowork, opencode, codex\n'
    printf '%s\n\n' '---'
    printf 'Use this skill as the %s healthcare administration specialist. Preserve the role identity, regulatory boundaries, source hierarchy, deliverable style, and safety constraints below.\n\n' "$display"
    sed '1,/^---$/d' "$src"
  } > "$dest_dir/$slug/SKILL.md"
}

install_skills_tree() {
  local dest="$1" label="$2"
  local count=0
  mkdir -p "$dest"
  for f in "$AGENTS_DIR"/*.md; do
    local slug target
    slug="$(basename "$f" .md)"
    target="$dest/$slug/SKILL.md"
    if [[ -f "$target" ]] && ! $FORCE; then
      if [[ $count -eq 0 ]]; then
        warn "$label: skill files exist (use --force to update)"
      fi
      return 0
    fi
    if ! $DRY_RUN; then write_skill_file "$f" "$dest"; fi
    count=$((count + 1))
  done
  printf "  %s %s (%d skills)\n" "${GREEN}->${RESET}" "$label" "$count"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
}

uninstall_skills_tree() {
  local dest="$1" label="$2"
  local count=0
  for f in "$AGENTS_DIR"/*.md; do
    local slug target
    slug="$(basename "$f" .md)"
    target="$dest/$slug"
    if [[ -d "$target" ]]; then
      if ! $DRY_RUN; then rm -rf "$target"; fi
      count=$((count + 1))
    fi
  done
  if [[ $count -gt 0 ]]; then
    printf "  %s %s (%d skills removed)\n" "${RED}<-${RESET}" "$label" "$count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
  else
    skip "$label (nothing to remove)"
  fi
}

upsert_block() {
  local file="$1" start="$2" end="$3" body="$4"
  mkdir -p "$(dirname "$file")"
  local tmp
  tmp="$(mktemp)"
  printf '%s\n%s\n%s\n' "$start" "$body" "$end" > "$tmp"
  if [[ ! -f "$file" ]]; then
    if ! $DRY_RUN; then cp "$tmp" "$file"; fi
    rm -f "$tmp"
    return
  fi
  if grep -Fq "$start" "$file"; then
    if ! $DRY_RUN; then
      awk -v start="$start" -v end="$end" -v replacement="$tmp" '
        $0 == start {
          while ((getline line < replacement) > 0) print line
          close(replacement)
          skip = 1
          next
        }
        $0 == end { skip = 0; next }
        !skip { print }
      ' "$file" >"$file.tmp"
      mv "$file.tmp" "$file"
    fi
  else
    if ! $DRY_RUN; then
      {
        printf '\n'
        cat "$tmp"
        printf '\n'
      } >> "$file"
    fi
  fi
  rm -f "$tmp"
}

install_codex() {
  local dest="$HOME/.codex/agents"
  if $UNINSTALL; then
    uninstall_from_dir "$dest" "Codex / Codex App ($dest)"
    return
  fi
  install_to_dir "$dest" "Codex / Codex App ($dest)"
  local body
  body='## Healthcare Agents

When the user asks for healthcare administration expertise, choose the matching specialist prompt from `~/.codex/agents/*.md` and read it before answering. Agent file names and frontmatter `name` fields use lowercase hyphen slugs such as `revenue-cycle-specialist`; `display_name` is the human label. Preserve the selected agent role, compliance boundaries, source hierarchy, and deliverable style. Do not treat the agents as clinical, legal, or PHI-handling authority.'
  upsert_block "$HOME/.codex/AGENTS.md" "<!-- healthcare-agents:start -->" "<!-- healthcare-agents:end -->" "$body"
  printf "  %s Codex instructions (%s)\n" "${GREEN}->${RESET}" "$HOME/.codex/AGENTS.md"
}

uninstall_from_dir() {
  local dest="$1" label="$2"
  local count=0
  for f in "$AGENTS_DIR"/*.md; do
    local base target
    base="$(basename "$f")"
    target="$dest/$base"
    if [[ -f "$target" ]]; then
      if ! $DRY_RUN; then rm "$target"; fi
      count=$((count + 1))
    fi
  done
  if [[ $count -gt 0 ]]; then
    printf "  %s %s (%d files removed)\n" "${RED}<-${RESET}" "$label" "$count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
  else
    skip "$label (nothing to remove)"
  fi
}

install_aider() {
  local conf="${PWD}/.aider.conf.yml"
  local agent_count
  agent_count="$(ls "$AGENTS_DIR"/*.md 2>/dev/null | wc -l)"
  if $UNINSTALL; then
    if [[ -f "$conf" ]] && grep -q "# healthcare-agents" "$conf" 2>/dev/null; then
      if ! $DRY_RUN; then
        sed -i '/# healthcare-agents start/,/# healthcare-agents end/d' "$conf"
      fi
      printf "  %s Aider (.aider.conf.yml block removed)\n" "${RED}<-${RESET}"
      TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
    else
      skip "Aider (no managed block found)"
    fi
    return
  fi
  if [[ -f "$conf" ]] && grep -q "# healthcare-agents" "$conf" 2>/dev/null && ! $FORCE; then
    warn "Aider: config block exists (use --force to update)"; return
  fi
  local block="# healthcare-agents start"$'\n'"read:"
  for f in "$AGENTS_DIR"/*.md; do
    block+=$'\n'"  - $f"
  done
  block+=$'\n'"# healthcare-agents end"
  if $DRY_RUN; then
    printf "  %s Aider (.aider.conf.yml, %d read entries)\n" "${GREEN}->${RESET}" "$agent_count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + agent_count))
    return
  fi
  # Remove old block if --force, then append
  if [[ -f "$conf" ]] && grep -q "# healthcare-agents" "$conf" 2>/dev/null; then
    sed -i '/# healthcare-agents start/,/# healthcare-agents end/d' "$conf"
  fi
  echo "$block" >> "$conf"
  printf "  %s Aider (.aider.conf.yml, %d read entries)\n" "${GREEN}->${RESET}" "$agent_count"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + agent_count))
}

printf "\n${BOLD}Healthcare Agents Installer v%s${RESET}\n" "$VERSION"

# Get agents
if ! find_agents; then
  download_agents
fi

AGENT_COUNT="$(ls "$AGENTS_DIR"/*.md 2>/dev/null | wc -l)"

if $ALL; then TARGETS=("${TOOL_ORDER[@]}")
elif ! $EXPLICIT; then detect_targets; fi
[[ -n "$CUSTOM_PATH" ]] && TARGETS+=(custom)

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  warn "no supported tools detected"
  printf "  Use --all to install everywhere, or target a specific tool (e.g. --claude)\n"
  exit 1
fi
TARGETS=($(printf '%s\n' "${TARGETS[@]}" | sort -u))

ACTION="Installing"
$UNINSTALL && ACTION="Uninstalling"
$DRY_RUN && ACTION="Would install"
$DRY_RUN && $UNINSTALL && ACTION="Would uninstall"
printf "%s %d agents to %d target(s)...\n\n" "$ACTION" "$AGENT_COUNT" "${#TARGETS[@]}"

for tool in "${TARGETS[@]}"; do
  if [[ "$tool" == "custom" ]]; then
    if $UNINSTALL; then uninstall_from_dir "$CUSTOM_PATH" "$CUSTOM_PATH"
    else install_to_dir "$CUSTOM_PATH" "$CUSTOM_PATH"; fi
    continue
  fi
  local_path="$(resolve_path "$tool")"
  if [[ "$tool" == "aider" ]]; then install_aider; continue; fi
  if [[ "$tool" == "codex" ]]; then install_codex; continue; fi
  if [[ "$tool" == "claude-skills" || "$tool" == "opencode" || "$tool" == "agent-skills" ]]; then
    if $UNINSTALL; then uninstall_skills_tree "$local_path" "${TOOL_DISPLAY[$tool]} ($local_path)"
    else install_skills_tree "$local_path" "${TOOL_DISPLAY[$tool]} ($local_path)"; fi
    continue
  fi
  if $UNINSTALL; then uninstall_from_dir "$local_path" "${TOOL_DISPLAY[$tool]} ($local_path)"
  else install_to_dir "$local_path" "${TOOL_DISPLAY[$tool]} ($local_path)"; fi
done

echo
if $DRY_RUN; then printf "${BOLD}Dry run complete.${RESET} %d files would be affected.\n" "$TOTAL_INSTALLED"
elif $UNINSTALL; then printf "${BOLD}Done!${RESET} %d files removed.\n" "$TOTAL_INSTALLED"
else printf "${BOLD}Done!${RESET} %d files installed.\n" "$TOTAL_INSTALLED"; fi
