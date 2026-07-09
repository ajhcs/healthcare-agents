#!/usr/bin/env bash
set -euo pipefail

VERSION="1.5.0"
REPO="ajhcs/healthcare-agents"
REPO_URL="https://github.com/$REPO"
AGENTS_DIR=""
PACKAGE_ROOT=""
TARGETS=()
WORKFLOW_TARGETS=()
COPILOT_SURFACES=()
FORCE=false
DRY_RUN=false
UNINSTALL=false
DOCTOR=false
CUSTOM_PATH=""
ALL=false
EXPLICIT=false
TOTAL_INSTALLED=0
AGENT_SLUG=""

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
          --claude-workflow-skills --codex-skills
          --copilot-repo --copilot-instructions --copilot-agents
          --copilot-prompts --copilot-issue-templates --copilot-all
          --opencode --agent-skills --skills
          --all (force all)  --path DIR (custom directory)

Flags:    --force       Overwrite existing files
          --uninstall   Remove agents from detected paths
          --dry-run     Preview without changes
          --doctor      Report detected tools, paths, and existing installs
          --version     Print version
          -h, --help    Show this help

Single agent:
          install.sh revenue-cycle-specialist --codex
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
    --claude-workflow-skills)
                  WORKFLOW_TARGETS+=(claude-workflow-skills); EXPLICIT=true; shift ;;
    --codex-skills)
                  WORKFLOW_TARGETS+=(codex-skills); EXPLICIT=true; shift ;;
    --copilot-repo)
                  COPILOT_SURFACES+=(repo); EXPLICIT=true; shift ;;
    --copilot-instructions)
                  COPILOT_SURFACES+=(instructions); EXPLICIT=true; shift ;;
    --copilot-agents)
                  COPILOT_SURFACES+=(agents); EXPLICIT=true; shift ;;
    --copilot-prompts)
                  COPILOT_SURFACES+=(prompts); EXPLICIT=true; shift ;;
    --copilot-issue-templates|--copilot-issues)
                  COPILOT_SURFACES+=(issues); EXPLICIT=true; shift ;;
    --copilot-all)
                  COPILOT_SURFACES+=(repo instructions agents prompts issues); EXPLICIT=true; shift ;;
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
    --path)
                  if [[ $# -lt 2 || "$2" == --* ]]; then
                    err "--path requires a directory argument"
                    exit 2
                  fi
                  CUSTOM_PATH="$2"; EXPLICIT=true; shift 2 ;;
    --force)     FORCE=true; shift ;;
    --uninstall) UNINSTALL=true; shift ;;
    --dry-run)   DRY_RUN=true; shift ;;
    --doctor)    DOCTOR=true; shift ;;
    --version)   echo "healthcare-agents installer v$VERSION"; exit 0 ;;
    -h|--help)   usage ;;
    *)
      if [[ "$1" != --* && -z "$AGENT_SLUG" ]]; then
        AGENT_SLUG="$1"
        shift
      else
        err "unknown option: $1"; usage
      fi
      ;;
  esac
done

find_agents() {
  # Running via npx (HEALTHCARE_AGENTS_ROOT set by bin/cli.js)?
  if [[ -n "${HEALTHCARE_AGENTS_ROOT:-}" ]] && [[ -d "$HEALTHCARE_AGENTS_ROOT/agents" ]]; then
    PACKAGE_ROOT="$HEALTHCARE_AGENTS_ROOT"
    AGENTS_DIR="$HEALTHCARE_AGENTS_ROOT/agents"
    return 0
  fi
  # Running from cloned repo?
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [[ -d "$script_dir/agents" ]]; then
    PACKAGE_ROOT="$script_dir"
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
    PACKAGE_ROOT="$tmp/repo"
    AGENTS_DIR="$tmp/repo/agents"
  elif command -v curl &>/dev/null; then
    curl -fsSL "$REPO_URL/archive/refs/heads/main.tar.gz" | tar -xz -C "$tmp"
    PACKAGE_ROOT="$tmp/healthcare-agents-main"
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

suggest_agent_slugs() {
  local wanted="$1" stem slug count=0
  stem="${wanted%%-*}"
  for f in "$AGENTS_DIR"/*.md; do
    slug="$(basename "$f" .md)"
    if [[ "$slug" == *"$wanted"* || "$slug" == "$stem"* || "$wanted" == *"$slug"* ]]; then
      printf "  %s\n" "$slug"
      count=$((count + 1))
      [[ $count -ge 5 ]] && return
    fi
  done
  if [[ $count -eq 0 ]]; then
    for f in "$AGENTS_DIR"/*.md; do
      slug="$(basename "$f" .md)"
      printf "  %s\n" "$slug"
      count=$((count + 1))
      [[ $count -ge 5 ]] && return
    done
  fi
}

validate_agent_slug() {
  if [[ -z "$AGENT_SLUG" ]]; then return; fi
  if [[ ! "$AGENT_SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    err "invalid agent slug: $AGENT_SLUG"
    exit 1
  fi
  if [[ ! -f "$AGENTS_DIR/$AGENT_SLUG.md" ]]; then
    err "unknown agent: $AGENT_SLUG"
    printf "Close matches:\n" >&2
    suggest_agent_slugs "$AGENT_SLUG" >&2
    exit 1
  fi
}

agent_files() {
  if [[ -n "$AGENT_SLUG" ]]; then
    printf "%s\n" "$AGENTS_DIR/$AGENT_SLUG.md"
  else
    printf "%s\n" "$AGENTS_DIR"/*.md
  fi
}

agent_file_count() {
  agent_files | wc -l | tr -d ' '
}

plan_write() {
  local target="$1" source="$2"
  printf "  %s write %s <- %s\n" "${GREEN}->${RESET}" "$target" "$source"
}

plan_remove() {
  local target="$1"
  printf "  %s remove %s\n" "${RED}<-${RESET}" "$target"
}

installed_count_for_tool() {
  local tool="$1" path count=0 slug
  path="$(resolve_path "$tool")"
  while IFS= read -r f; do
    slug="$(basename "$f" .md)"
    if [[ "$tool" == "aider" ]]; then
      [[ -f "$path" ]] && grep -Fq "$slug.md" "$path" && count=$((count + 1))
    elif [[ "$tool" == "claude-skills" || "$tool" == "opencode" || "$tool" == "agent-skills" ]]; then
      [[ -f "$path/$slug/SKILL.md" ]] && count=$((count + 1))
    else
      [[ -f "$path/$slug.md" ]] && count=$((count + 1))
    fi
  done < <(agent_files)
  printf "%s" "$count"
}

doctor_report() {
  printf "\n${BOLD}Healthcare Agents Doctor${RESET}\n"
  printf "Agents source: %s\n" "$AGENTS_DIR"
  if [[ -n "$AGENT_SLUG" ]]; then
    printf "Selected agent: %s\n" "$AGENT_SLUG"
  else
    printf "Selected agents: %s\n" "$(agent_file_count)"
  fi
  printf "\nDetected tools and target paths:\n"
  local tool path disp installed detected
  for tool in "${TOOL_ORDER[@]}"; do
    path="$(resolve_path "$tool")"
    disp="${TOOL_DISPLAY[$tool]}"
    installed="$(installed_count_for_tool "$tool")"
    if tool_exists "$tool"; then detected="yes"; else detected="no"; fi
    printf "  %-24s detected=%-3s installed=%-3s path=%s\n" "$disp" "$detected" "$installed" "$path"
  done
  printf "\nRecommended next command:\n"
  if [[ -n "$AGENT_SLUG" ]]; then
    printf "  install.sh %s --codex --dry-run\n" "$AGENT_SLUG"
  else
    printf "  install.sh --all --dry-run\n"
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
  if ! $DRY_RUN; then mkdir -p "$dest"; fi
  while IFS= read -r f; do
    local base
    base="$(basename "$f")"
    local target="$dest/$base"
    if [[ -f "$target" ]] && ! $FORCE; then
      skip "$label: exists $target (use --force to update)"
      continue
    fi
    if $DRY_RUN; then
      plan_write "$target" "$f"
      count=$((count + 1))
      continue
    fi
    cp "$f" "$target"
    count=$((count + 1))
  done < <(agent_files)
  printf "  %s %s (%d files)\n" "${GREEN}->${RESET}" "$label" "$count"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
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
    printf 'Use this skill as the %s healthcare administration specialist. Preserve the role identity, regulatory boundaries, source hierarchy, deliverable style, and safety constraints below. For multi-step work, keep a compact ledger of verified facts and sources, documents, actions, owners, deadlines, discrepancies, and blockers; finish as Completed, Partial, or Blocked with terminal evidence and the next action. Use PHI only in an approved environment, apply minimum necessary data handling, and escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, or executive decisions to the named human owner.\n\n' "$display"
    sed '1,/^---$/d' "$src"
  } > "$dest_dir/$slug/SKILL.md"
}

workflow_ids() {
  node "$PACKAGE_ROOT/bin/cli.js" workflows --json | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>JSON.parse(d).workflows.forEach(w=>console.log(w.id)))'
}

render_surface() {
  local surface="$1" key="${2:-}"
  if [[ -n "$key" ]]; then
    node "$PACKAGE_ROOT/bin/cli.js" internal-render "$surface" "$key"
  else
    node "$PACKAGE_ROOT/bin/cli.js" internal-render "$surface"
  fi
}

write_generated_file() {
  local target="$1" surface="$2" key="$3" label="$4"
  if [[ -f "$target" && "$FORCE" != true ]]; then
    skip "$label: exists $target (use --force to update)"
    return
  fi
  if $DRY_RUN; then
    plan_write "$target" "$surface:$key"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
    return
  fi
  mkdir -p "$(dirname "$target")"
  render_surface "$surface" "$key" > "$target"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
}

write_manifest() {
  local dest="$1" target_name="$2"
  local manifest="$dest/.healthcare-agents-manifest.json"
  if $UNINSTALL; then
    if [[ -f "$manifest" ]]; then
      if $DRY_RUN; then plan_remove "$manifest"; else rm "$manifest"; fi
      TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
    fi
    return
  fi
  if $DRY_RUN; then
    plan_write "$manifest" "install manifest"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
    return
  fi
  mkdir -p "$dest"
  node -e 'const fs=require("fs"); const path=process.argv[1]; const data={package:"healthcare-agents",version:process.argv[2],target:process.argv[3],generated_at:new Date().toISOString(),source_commit:process.argv[4]}; fs.writeFileSync(path, JSON.stringify(data,null,2)+"\n");' "$manifest" "$VERSION" "$target_name" "$(git -C "$PACKAGE_ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
}

install_workflow_skills() {
  local dest="$1" label="$2" surface="$3"
  local count=0 id target
  if $UNINSTALL; then
    while IFS= read -r id; do
      target="$dest/healthcare-$id"
      if [[ -d "$target" ]]; then
        if $DRY_RUN; then plan_remove "$target"; else rm -rf "$target"; fi
        count=$((count + 1))
      fi
    done < <(workflow_ids)
    write_manifest "$dest" "$label"
    if [[ $count -gt 0 ]]; then
      printf "  %s %s (%d workflow skills removed)\n" "${RED}<-${RESET}" "$label" "$count"
      TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
    else
      skip "$label workflow skills (nothing to remove)"
    fi
    return
  fi
  while IFS= read -r id; do
    target="$dest/healthcare-$id/SKILL.md"
    write_generated_file "$target" "$surface" "$id" "$label"
    count=$((count + 1))
  done < <(workflow_ids)
  write_manifest "$dest" "$label"
  printf "  %s %s (%d workflow skills)\n" "${GREEN}->${RESET}" "$label" "$count"
}

install_skills_tree() {
  local dest="$1" label="$2"
  local count=0
  if ! $DRY_RUN; then mkdir -p "$dest"; fi
  while IFS= read -r f; do
    local slug target
    slug="$(basename "$f" .md)"
    target="$dest/$slug/SKILL.md"
    if [[ -f "$target" ]] && ! $FORCE; then
      skip "$label: exists $target (use --force to update)"
      continue
    fi
    if $DRY_RUN; then
      plan_write "$target" "$f"
    else
      write_skill_file "$f" "$dest"
    fi
    count=$((count + 1))
  done < <(agent_files)
  printf "  %s %s (%d skills)\n" "${GREEN}->${RESET}" "$label" "$count"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
}

uninstall_skills_tree() {
  local dest="$1" label="$2"
  local count=0
  while IFS= read -r f; do
    local slug target
    slug="$(basename "$f" .md)"
    target="$dest/$slug"
    if [[ -d "$target" ]]; then
      if $DRY_RUN; then plan_remove "$target"; else rm -rf "$target"; fi
      count=$((count + 1))
    fi
  done < <(agent_files)
  if [[ $count -gt 0 ]]; then
    printf "  %s %s (%d skills removed)\n" "${RED}<-${RESET}" "$label" "$count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
  else
    skip "$label (nothing to remove)"
  fi
}

upsert_block() {
  local file="$1" start="$2" end="$3" body="$4"
  if ! $DRY_RUN; then mkdir -p "$(dirname "$file")"; fi
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

remove_block() {
  local file="$1" start="$2" end="$3"
  if [[ ! -f "$file" ]] || ! grep -Fq "$start" "$file"; then
    return 1
  fi
  if ! $DRY_RUN; then
    awk -v start="$start" -v end="$end" '
      $0 == start { skip = 1; next }
      $0 == end { skip = 0; next }
      !skip { print }
    ' "$file" >"$file.tmp"
    mv "$file.tmp" "$file"
  fi
  return 0
}

install_codex() {
  local dest="$HOME/.codex/agents"
  if $UNINSTALL; then
    uninstall_from_dir "$dest" "Codex / Codex App ($dest)"
    if remove_block "$HOME/.codex/AGENTS.md" "<!-- healthcare-agents:start -->" "<!-- healthcare-agents:end -->"; then
      if $DRY_RUN; then plan_remove "$HOME/.codex/AGENTS.md managed block"; fi
      printf "  %s Codex instructions block (%s)\n" "${RED}<-${RESET}" "$HOME/.codex/AGENTS.md"
      TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
    else
      skip "Codex instructions block (nothing to remove)"
    fi
    return
  fi
  install_to_dir "$dest" "Codex / Codex App ($dest)"
  local body
  body="$(render_surface codex-agents)"
  upsert_block "$HOME/.codex/AGENTS.md" "<!-- healthcare-agents:start -->" "<!-- healthcare-agents:end -->" "$body"
  if $DRY_RUN; then
    plan_write "$HOME/.codex/AGENTS.md" "managed Codex instructions block"
  fi
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
  printf "  %s Codex instructions (%s)\n" "${GREEN}->${RESET}" "$HOME/.codex/AGENTS.md"
}

uninstall_from_dir() {
  local dest="$1" label="$2"
  local count=0
  while IFS= read -r f; do
    local base target
    base="$(basename "$f")"
    target="$dest/$base"
    if [[ -f "$target" ]]; then
      if $DRY_RUN; then plan_remove "$target"; else rm "$target"; fi
      count=$((count + 1))
    fi
  done < <(agent_files)
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
  agent_count="$(agent_file_count)"
  if $UNINSTALL; then
    if [[ -f "$conf" ]] && grep -q "# healthcare-agents" "$conf" 2>/dev/null; then
      if $DRY_RUN; then
        plan_remove "$conf"
      else
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
  while IFS= read -r f; do
    block+=$'\n'"  - $f"
  done < <(agent_files)
  block+=$'\n'"# healthcare-agents end"
  if $DRY_RUN; then
    plan_write "$conf" "managed Aider read block"
    printf "  %s Aider (.aider.conf.yml, %d read entries)\n" "${GREEN}->${RESET}" "$agent_count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
    return
  fi
  # Remove old block if --force, then append
  if [[ -f "$conf" ]] && grep -q "# healthcare-agents" "$conf" 2>/dev/null; then
    sed -i '/# healthcare-agents start/,/# healthcare-agents end/d' "$conf"
  fi
  echo "$block" >> "$conf"
  printf "  %s Aider (.aider.conf.yml, %d read entries)\n" "${GREEN}->${RESET}" "$agent_count"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
}

install_copilot_repo_instructions() {
  local file="${PWD}/.github/copilot-instructions.md"
  if $UNINSTALL; then
    if remove_block "$file" "<!-- healthcare-agents:start -->" "<!-- healthcare-agents:end -->"; then
      if $DRY_RUN; then plan_remove "$file managed block"; fi
      printf "  %s GitHub Copilot repository instructions (%s)\n" "${RED}<-${RESET}" "$file"
      TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
    else
      skip "GitHub Copilot repository instructions (nothing to remove)"
    fi
    return
  fi
  local body
  body="$(render_surface copilot-repo)"
  upsert_block "$file" "<!-- healthcare-agents:start -->" "<!-- healthcare-agents:end -->" "$body"
  if $DRY_RUN; then plan_write "$file" "managed Copilot instructions block"; fi
  printf "  %s GitHub Copilot repository instructions (%s)\n" "${GREEN}->${RESET}" "$file"
  TOTAL_INSTALLED=$((TOTAL_INSTALLED + 1))
}

install_copilot_path_instructions() {
  local dest="${PWD}/.github/instructions"
  local groups=(healthcare-revenue-cycle healthcare-compliance healthcare-quality-safety healthcare-analytics healthcare-operations)
  local group target count=0
  if $UNINSTALL; then
    for group in "${groups[@]}"; do
      target="$dest/$group.instructions.md"
      if [[ -f "$target" ]]; then
        if $DRY_RUN; then plan_remove "$target"; else rm "$target"; fi
        count=$((count + 1))
      fi
    done
    printf "  %s GitHub Copilot path instructions (%d removed)\n" "${RED}<-${RESET}" "$count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
    return
  fi
  for group in "${groups[@]}"; do
    target="$dest/$group.instructions.md"
    write_generated_file "$target" copilot-path "$group" "GitHub Copilot path instructions"
    count=$((count + 1))
  done
  printf "  %s GitHub Copilot path instructions (%d files)\n" "${GREEN}->${RESET}" "$count"
}

install_copilot_agents() {
  local dest="${PWD}/.github/agents"
  local agents=(healthcare-revenue-cycle-agent healthcare-compliance-agent healthcare-quality-safety-agent healthcare-operations-agent healthcare-data-analytics-agent healthcare-it-integration-agent healthcare-payer-contracting-agent healthcare-workup-orchestrator-agent)
  local agent target count=0
  if $UNINSTALL; then
    for agent in "${agents[@]}"; do
      target="$dest/$agent.agent.md"
      if [[ -f "$target" ]]; then
        if $DRY_RUN; then plan_remove "$target"; else rm "$target"; fi
        count=$((count + 1))
      fi
    done
    printf "  %s GitHub Copilot custom agents (%d removed)\n" "${RED}<-${RESET}" "$count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
    return
  fi
  for agent in "${agents[@]}"; do
    target="$dest/$agent.agent.md"
    write_generated_file "$target" copilot-agent "$agent" "GitHub Copilot custom agents"
    count=$((count + 1))
  done
  printf "  %s GitHub Copilot custom agents (%d files)\n" "${GREEN}->${RESET}" "$count"
}

install_copilot_prompts() {
  local dest="${PWD}/.github/prompts"
  local workflows=(denial-spike-workup discharge-barrier-workplan hipaa-security-evidence-checklist survey-readiness-gap-review hedis-stars-gap-closure-sprint clinical-dashboard-specification)
  local id target count=0
  if $UNINSTALL; then
    for id in "${workflows[@]}"; do
      target="$dest/$id.prompt.md"
      if [[ -f "$target" ]]; then
        if $DRY_RUN; then plan_remove "$target"; else rm "$target"; fi
        count=$((count + 1))
      fi
    done
    printf "  %s GitHub Copilot prompt files (%d removed)\n" "${RED}<-${RESET}" "$count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
    return
  fi
  for id in "${workflows[@]}"; do
    target="$dest/$id.prompt.md"
    write_generated_file "$target" copilot-prompt "$id" "GitHub Copilot prompt files"
    count=$((count + 1))
  done
  printf "  %s GitHub Copilot prompt files (%d files)\n" "${GREEN}->${RESET}" "$count"
}

install_copilot_issue_templates() {
  local dest="${PWD}/.github/ISSUE_TEMPLATE"
  local workflows=(denial-spike-workup clean-claim-rate-decline hipaa-security-evidence-checklist hedis-stars-gap-closure-sprint clinical-dashboard-specification)
  local id target count=0
  if $UNINSTALL; then
    for id in "${workflows[@]}"; do
      target="$dest/healthcare-$id.yml"
      if [[ -f "$target" ]]; then
        if $DRY_RUN; then plan_remove "$target"; else rm "$target"; fi
        count=$((count + 1))
      fi
    done
    printf "  %s GitHub issue templates (%d removed)\n" "${RED}<-${RESET}" "$count"
    TOTAL_INSTALLED=$((TOTAL_INSTALLED + count))
    return
  fi
  for id in "${workflows[@]}"; do
    target="$dest/healthcare-$id.yml"
    write_generated_file "$target" copilot-issue-template "$id" "GitHub issue templates"
    count=$((count + 1))
  done
  printf "  %s GitHub issue templates (%d files)\n" "${GREEN}->${RESET}" "$count"
}

printf "\n${BOLD}Healthcare Agents Installer v%s${RESET}\n" "$VERSION"

# Get agents
if ! find_agents; then
  download_agents
fi

validate_agent_slug
AGENT_COUNT="$(agent_file_count)"

if $DOCTOR; then
  doctor_report
  exit 0
fi

if $ALL; then TARGETS=("${TOOL_ORDER[@]}")
elif ! $EXPLICIT; then detect_targets; fi
[[ -n "$CUSTOM_PATH" ]] && TARGETS+=(custom)

if [[ ${#TARGETS[@]} -eq 0 && ${#WORKFLOW_TARGETS[@]} -eq 0 && ${#COPILOT_SURFACES[@]} -eq 0 ]]; then
  warn "no supported tools detected"
  printf "  Use --all to install everywhere, or target a specific tool (e.g. --claude)\n"
  exit 1
fi
if [[ ${#TARGETS[@]} -gt 0 ]]; then
  TARGETS=($(printf '%s\n' "${TARGETS[@]}" | sort -u))
fi
if [[ ${#WORKFLOW_TARGETS[@]} -gt 0 ]]; then
  WORKFLOW_TARGETS=($(printf '%s\n' "${WORKFLOW_TARGETS[@]}" | sort -u))
fi
if [[ ${#COPILOT_SURFACES[@]} -gt 0 ]]; then
  COPILOT_SURFACES=($(printf '%s\n' "${COPILOT_SURFACES[@]}" | sort -u))
fi

ACTION="Installing"
$UNINSTALL && ACTION="Uninstalling"
$DRY_RUN && ACTION="Would install"
$DRY_RUN && $UNINSTALL && ACTION="Would uninstall"
printf "%s %d agents to %d agent target(s), %d workflow target(s), and %d Copilot surface group(s)...\n\n" "$ACTION" "$AGENT_COUNT" "${#TARGETS[@]}" "${#WORKFLOW_TARGETS[@]}" "${#COPILOT_SURFACES[@]}"

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

for workflow_target in "${WORKFLOW_TARGETS[@]}"; do
  if [[ "$workflow_target" == "claude-workflow-skills" ]]; then
    install_workflow_skills "$HOME/.claude/skills" "Claude workflow skills ($HOME/.claude/skills)" claude-skill
  elif [[ "$workflow_target" == "codex-skills" ]]; then
    install_workflow_skills "$HOME/.codex/skills" "Codex workflow skills ($HOME/.codex/skills)" codex-skill
  fi
done

for surface in "${COPILOT_SURFACES[@]}"; do
  if [[ "$surface" == "repo" ]]; then install_copilot_repo_instructions; fi
  if [[ "$surface" == "instructions" ]]; then install_copilot_path_instructions; fi
  if [[ "$surface" == "agents" ]]; then install_copilot_agents; fi
  if [[ "$surface" == "prompts" ]]; then install_copilot_prompts; fi
  if [[ "$surface" == "issues" ]]; then install_copilot_issue_templates; fi
done

echo
if $DRY_RUN; then printf "${BOLD}Dry run complete.${RESET} %d files would be affected.\n" "$TOTAL_INSTALLED"
elif $UNINSTALL; then printf "${BOLD}Done!${RESET} %d files removed.\n" "$TOTAL_INSTALLED"
else printf "${BOLD}Done!${RESET} %d files installed.\n" "$TOTAL_INSTALLED"; fi
