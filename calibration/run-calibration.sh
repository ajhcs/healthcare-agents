#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

usage() {
  cat <<'EOF'
Usage: calibration/run-calibration.sh [--agent-slug SLUG] [--seed-file PATH ...] [--manifest PATH] [--run-id ID] [--dry-run] [--resume]

Provider command contract:
  CALIBRATION_GENERATOR_CMD     reads rendered generate prompt from stdin and writes Markdown deliverable text to stdout
  CALIBRATION_JUDGE_CMD         reads rendered judge prompt from stdin and writes one YAML gap report to stdout
  CALIBRATION_SYNTHESIZER_CMD   reads rendered summarize prompt from stdin and writes one YAML synthesis summary to stdout

Non-zero exit, timeout, or schema-invalid stdout fails the run.
EOF
}

AGENT_SLUG=""
RUN_ID=""
MANIFEST_FILE=""
DRY_RUN=0
RESUME=0
SEED_FILES=()
TIMEOUT_SECS="${CALIBRATION_TIMEOUT_SECS:-600}"
GENERATOR_TIMEOUT_SECS="${CALIBRATION_GENERATOR_TIMEOUT_SECS:-$TIMEOUT_SECS}"
JUDGE_TIMEOUT_SECS="${CALIBRATION_JUDGE_TIMEOUT_SECS:-$TIMEOUT_SECS}"
SYNTH_TIMEOUT_SECS="${CALIBRATION_SYNTHESIZER_TIMEOUT_SECS:-$TIMEOUT_SECS}"
PROVIDER_ATTEMPTS="${CALIBRATION_PROVIDER_MAX_ATTEMPTS:-3}"
GENERATOR_ATTEMPTS="${CALIBRATION_GENERATOR_MAX_ATTEMPTS:-$PROVIDER_ATTEMPTS}"
JUDGE_ATTEMPTS="${CALIBRATION_JUDGE_MAX_ATTEMPTS:-$PROVIDER_ATTEMPTS}"
SYNTH_ATTEMPTS="${CALIBRATION_SYNTHESIZER_MAX_ATTEMPTS:-$PROVIDER_ATTEMPTS}"
PROVIDER_RETRY_SLEEP_SECS="${CALIBRATION_PROVIDER_RETRY_SLEEP_SECS:-2}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent-slug) AGENT_SLUG="$2"; shift 2 ;;
    --seed-file) SEED_FILES+=("$2"); shift 2 ;;
    --manifest) MANIFEST_FILE="$2"; shift 2 ;;
    --run-id) RUN_ID="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --resume) RESUME=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$RUN_ID" ]]; then
  RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
fi

if [[ ${#SEED_FILES[@]} -eq 0 && -z "$AGENT_SLUG" && -z "$MANIFEST_FILE" ]]; then
  echo "Specify --agent-slug, --seed-file, or --manifest" >&2
  exit 1
fi

if [[ "$DRY_RUN" -eq 0 ]]; then
  : "${CALIBRATION_GENERATOR_CMD:?Set CALIBRATION_GENERATOR_CMD or use --dry-run}"
  : "${CALIBRATION_JUDGE_CMD:?Set CALIBRATION_JUDGE_CMD or use --dry-run}"
  : "${CALIBRATION_SYNTHESIZER_CMD:?Set CALIBRATION_SYNTHESIZER_CMD or use --dry-run}"
fi

if [[ -n "$MANIFEST_FILE" ]]; then
  while IFS= read -r seed_path; do
    SEED_FILES+=("$seed_path")
  done < <(
    python3 - "$MANIFEST_FILE" <<'PY'
from pathlib import Path
import sys
import yaml

manifest = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
for slug in manifest.get("agents_tested", []):
    for path in sorted((Path("calibration/seeds") / slug).glob("*.yaml")):
        print(path)
PY
  )
fi

if [[ -n "$AGENT_SLUG" ]]; then
  while IFS= read -r seed_path; do
    SEED_FILES+=("$seed_path")
  done < <(find "calibration/seeds/$AGENT_SLUG" -maxdepth 1 -type f -name '*.yaml' | sort)
fi

if [[ ${#SEED_FILES[@]} -eq 0 ]]; then
  echo "No seed files resolved for this run" >&2
  exit 1
fi

mapfile -t UNIQUE_SEEDS < <(printf '%s\n' "${SEED_FILES[@]}" | awk '!seen[$0]++')

RUN_DIR="calibration/results/$RUN_ID"
LOCK_DIR="${RUN_DIR}.lock"

cleanup_run_lock() {
  if [[ -n "${LOCK_DIR:-}" && -d "$LOCK_DIR" ]]; then
    rm -rf "$LOCK_DIR"
  fi
}

acquire_run_lock() {
  local owner_file owner_pid owner_started_at owner_host
  while true; do
    if mkdir "$LOCK_DIR" 2>/dev/null; then
      cat > "$LOCK_DIR/owner" <<EOF
pid: $$
started_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
host: $(hostname)
EOF
      return 0
    fi

    owner_file="$LOCK_DIR/owner"
    owner_pid=""
    owner_started_at="unknown"
    owner_host="unknown"
    if [[ -f "$owner_file" ]]; then
      owner_pid="$(awk -F': ' '$1=="pid" {print $2}' "$owner_file" | tr -d '\r')"
      owner_started_at="$(awk -F': ' '$1=="started_at" {print $2}' "$owner_file" | tr -d '\r')"
      owner_host="$(awk -F': ' '$1=="host" {print $2}' "$owner_file" | tr -d '\r')"
    fi

    if [[ -n "$owner_pid" ]] && ! kill -0 "$owner_pid" 2>/dev/null; then
      rm -rf "$LOCK_DIR"
      continue
    fi

    echo "Run is locked by active process for $RUN_ID (pid=${owner_pid:-unknown}, host=$owner_host, started_at=$owner_started_at)" >&2
    exit 1
  done
}

mkdir -p "$(dirname "$RUN_DIR")"
trap cleanup_run_lock EXIT
acquire_run_lock

if [[ -d "$RUN_DIR" && "$RESUME" -eq 0 ]] && find "$RUN_DIR" -mindepth 1 -print -quit | grep -q .; then
  echo "Run directory already exists and is non-empty: $RUN_DIR (use --resume or choose a new --run-id)" >&2
  exit 1
fi
mkdir -p "$RUN_DIR"

GENERATOR_MODEL="${CALIBRATION_GENERATOR_MODEL:-unknown}"
JUDGE_MODEL="${CALIBRATION_JUDGE_MODEL:-unknown}"
SYNTH_MODEL="${CALIBRATION_SYNTHESIZER_MODEL:-unknown}"
ESTIMATED_COST="${CALIBRATION_ESTIMATED_COST_USD:-0}"
HUMAN_QA_SAMPLE="${CALIBRATION_HUMAN_QA_SAMPLE:-0}"
HUMAN_QA_CONCORDANCE="${CALIBRATION_HUMAN_QA_CONCORDANCE:-null}"

render_template() {
  local template="$1"
  local context_file="$2"
  python3 - "$template" "$context_file" <<'PY'
from pathlib import Path
import json
import sys

template = Path(sys.argv[1]).read_text(encoding="utf-8")
context = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
for key, value in context.items():
    template = template.replace("{{" + key + "}}", value)
print(template)
PY
}

stage_timeout() {
  case "$1" in
    generate) echo "$GENERATOR_TIMEOUT_SECS" ;;
    judge) echo "$JUDGE_TIMEOUT_SECS" ;;
    summarize) echo "$SYNTH_TIMEOUT_SECS" ;;
    *) echo "$TIMEOUT_SECS" ;;
  esac
}

stage_attempts() {
  case "$1" in
    generate) echo "$GENERATOR_ATTEMPTS" ;;
    judge) echo "$JUDGE_ATTEMPTS" ;;
    summarize) echo "$SYNTH_ATTEMPTS" ;;
    *) echo "$PROVIDER_ATTEMPTS" ;;
  esac
}

run_provider() {
  local stage="$1"
  local cmd="$2"
  local input_file="$3"
  local output_file="$4"
  local attempt max_attempts timeout_secs cmd_status
  local tmp_output
  local tmp_error
  max_attempts="$(stage_attempts "$stage")"
  timeout_secs="$(stage_timeout "$stage")"
  for ((attempt=1; attempt<=max_attempts; attempt++)); do
    tmp_output="$(mktemp)"
    tmp_error="$(mktemp)"
    if [[ -x "$cmd" ]]; then
      if timeout "$timeout_secs" "$cmd" < "$input_file" > "$tmp_output" 2>"$tmp_error"; then
        cmd_status=0
      else
        cmd_status=$?
      fi
    else
      if timeout "$timeout_secs" bash -lc "$cmd" < "$input_file" > "$tmp_output" 2>"$tmp_error"; then
        cmd_status=0
      else
        cmd_status=$?
      fi
    fi
    if [[ "$cmd_status" -eq 0 ]]; then
      if grep -q '[^[:space:]]' "$tmp_output"; then
        mv "$tmp_output" "$output_file"
        rm -f "$tmp_error"
        return 0
      fi
      echo "Provider command returned empty output for ${stage} on attempt $attempt/$max_attempts: $cmd" >&2
    else
      cat "$tmp_error" >&2
      echo "Provider command failed for ${stage} on attempt $attempt/$max_attempts: $cmd" >&2
    fi
    rm -f "$tmp_output" "$tmp_error"
    if (( attempt < max_attempts )); then
      sleep "$PROVIDER_RETRY_SLEEP_SECS"
    fi
  done
  echo "Provider command failed for ${stage} after $max_attempts attempts: $cmd" >&2
  exit 1
}

validate_artifact() {
  python3 scripts/validate-calibration-artifacts.py "$@"
}

json_field() {
  local json_file="$1"
  local field="$2"
  python3 - "$json_file" "$field" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
value = data
for part in sys.argv[2].split("."):
    value = value[part]
if value is None:
    print("")
elif isinstance(value, (dict, list)):
    print(json.dumps(value))
else:
    print(value)
PY
}

agent_prompt_version_for() {
  local agent_file="$1"
  git hash-object "$agent_file" | cut -c1-7
}

declare -A AGENT_PROMPT_VERSIONS=()
declare -A AGENT_SEED_COUNTS=()
declare -A AGENT_GAP_FILES=()

for seed_file in "${UNIQUE_SEEDS[@]}"; do
  if [[ ! -f "$seed_file" ]]; then
    echo "Missing seed file: $seed_file" >&2
    exit 1
  fi

  seed_json="$(mktemp)"
  python3 - "$seed_file" > "$seed_json" <<'PY'
from datetime import date, datetime
from pathlib import Path
import json
import sys
import yaml

seed = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))

def _default(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    raise TypeError(f"Object of type {value.__class__.__name__} is not JSON serializable")

print(json.dumps(seed, default=_default))
PY

  seed_id="$(json_field "$seed_json" "seed_id")"
  agent_slug="$(json_field "$seed_json" "agent_slug")"
  deliverable_title="$(json_field "$seed_json" "deliverable_title")"
  holdout_ref="$(json_field "$seed_json" "holdout_ref")"
  attempt_file="$RUN_DIR/${seed_id}.attempt.md"
  lint_file="$RUN_DIR/${seed_id}.lint.yaml"
  gap_file="$RUN_DIR/${seed_id}.gap.yaml"

  echo "Seed ${seed_id} (${agent_slug}): preparing ${deliverable_title}" >&2

  agent_file="agents/${agent_slug}.md"
  if [[ "$holdout_ref" == calibration/holdouts/* ]]; then
    holdout_file="$holdout_ref"
  else
    holdout_file="calibration/holdouts/${holdout_ref}"
  fi
  if [[ ! -f "$agent_file" ]]; then
    echo "Missing agent file for seed $seed_file: $agent_file" >&2
    exit 1
  fi
  if [[ ! -f "$holdout_file" ]]; then
    echo "Missing holdout file for seed $seed_file: $holdout_file" >&2
    exit 1
  fi

  validate_artifact --kind seed "$seed_file" >/dev/null

  AGENT_PROMPT_VERSIONS["$agent_slug"]="$(agent_prompt_version_for "$agent_file")"
  AGENT_SEED_COUNTS["$agent_slug"]=$(( ${AGENT_SEED_COUNTS["$agent_slug"]:-0} + 1 ))

  if [[ "$RESUME" -eq 1 && -f "$attempt_file" && -f "$lint_file" && -f "$gap_file" ]]; then
    if validate_artifact --kind lint_result "$lint_file" >/dev/null 2>&1 && validate_artifact --kind gap_report "$gap_file" >/dev/null 2>&1; then
      echo "Resuming seed ${seed_id}: reusing existing attempt/lint/gap artifacts"
      AGENT_GAP_FILES["$agent_slug"]="${AGENT_GAP_FILES["$agent_slug"]:-} $gap_file"
      continue
    fi
  fi

  holdout_json="$(mktemp)"
  python3 - "$holdout_file" > "$holdout_json" <<'PY'
from datetime import date, datetime
from pathlib import Path
import json
import sys
import yaml

text = Path(sys.argv[1]).read_text(encoding="utf-8")
if not text.lstrip().startswith("---\n"):
    raise SystemExit(f"{sys.argv[1]}: missing YAML frontmatter")
parts = text.split("\n---\n", 1)
if len(parts) != 2:
    raise SystemExit(f"{sys.argv[1]}: missing closing frontmatter delimiter")
frontmatter = yaml.safe_load(parts[0].split("\n", 1)[1])
if not isinstance(frontmatter, dict):
    raise SystemExit(f"{sys.argv[1]}: frontmatter must be a mapping")
holdout = frontmatter

def _default(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    raise TypeError(f"Object of type {value.__class__.__name__} is not JSON serializable")

print(json.dumps(holdout, default=_default))
PY

  seed_render_context="$(mktemp)"
  python3 - "$seed_json" "$agent_file" > "$seed_render_context" <<'PY'
from pathlib import Path
import json
import sys
seed = json.load(open(sys.argv[1], encoding="utf-8"))
agent_text = Path(sys.argv[2]).read_text(encoding="utf-8")
print(json.dumps({
    "agent_slug": seed["agent_slug"],
    "deliverable_title": seed["deliverable_title"],
    "seed_yaml": json.dumps(seed, indent=2),
    "agent_markdown": agent_text,
}))
PY

  generate_prompt="$RUN_DIR/${seed_id}.generate.prompt.md"
  render_template "calibration/prompts/generate.md" "$seed_render_context" > "$generate_prompt"

  echo "Seed ${seed_id}: generating attempt" >&2
  if [[ "$DRY_RUN" -eq 1 ]]; then
    python3 - "$holdout_file" "$attempt_file" <<'PY'
from pathlib import Path
import sys

text = Path(sys.argv[1]).read_text(encoding="utf-8")
if not text.lstrip().startswith("---\n"):
    raise SystemExit(f"{sys.argv[1]}: missing YAML frontmatter")
parts = text.split("\n---\n", 1)
if len(parts) != 2:
    raise SystemExit(f"{sys.argv[1]}: missing closing frontmatter delimiter")
body = parts[1].lstrip("\n")
Path(sys.argv[2]).write_text(body, encoding="utf-8")
PY
  else
    run_provider generate "$CALIBRATION_GENERATOR_CMD" "$generate_prompt" "$attempt_file"
  fi

  calibration/lint-attempt.sh --agent-file "$agent_file" --seed-file "$seed_file" --attempt-file "$attempt_file" --output "$lint_file"
  validate_artifact --kind lint_result "$lint_file" >/dev/null

  judge_context="$(mktemp)"
  python3 - "$seed_json" "$holdout_json" "$lint_file" "$attempt_file" "calibration/rubric.yaml" > "$judge_context" <<'PY'
from pathlib import Path
import json
import sys
import yaml

seed = json.load(open(sys.argv[1], encoding="utf-8"))
holdout = json.load(open(sys.argv[2], encoding="utf-8"))
lint_result = yaml.safe_load(Path(sys.argv[3]).read_text(encoding="utf-8"))
attempt = Path(sys.argv[4]).read_text(encoding="utf-8")
rubric = yaml.safe_load(Path(sys.argv[5]).read_text(encoding="utf-8"))
print(json.dumps({
    "rubric_yaml": yaml.safe_dump(rubric, sort_keys=False),
    "expectations_yaml": yaml.safe_dump(holdout.get("expectations", []), sort_keys=False),
    "lint_result_yaml": yaml.safe_dump(lint_result, sort_keys=False),
    "seed_yaml": yaml.safe_dump(seed, sort_keys=False),
    "attempt_markdown": attempt,
}))
PY

  judge_prompt="$RUN_DIR/${seed_id}.judge.prompt.md"
  render_template "calibration/prompts/judge.md" "$judge_context" > "$judge_prompt"

  echo "Seed ${seed_id}: judging against holdout" >&2
  if [[ "$DRY_RUN" -eq 1 ]]; then
    python3 - "$seed_json" "$lint_file" "$gap_file" "$GENERATOR_MODEL" "$JUDGE_MODEL" <<'PY'
from datetime import datetime, UTC
from pathlib import Path
import json
import sys
import yaml

seed = json.load(open(sys.argv[1], encoding="utf-8"))
lint_result = yaml.safe_load(Path(sys.argv[2]).read_text(encoding="utf-8"))
gap_report = {
    "seed_id": seed["seed_id"],
    "agent_slug": seed["agent_slug"],
    "deliverable_id": seed["deliverable_id"],
    "generated_by": sys.argv[4],
    "judged_by": sys.argv[5],
    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    "scores": {
        "structural_completeness": 0,
        "regulatory_precision": 0,
        "clinical_realism": 0,
        "actionability": 0,
        "mcp_awareness": None,
        "weighted_total": 0.0,
    },
    "expectation_checklist": [],
    "lint": lint_result,
    "gaps": [],
}
Path(sys.argv[3]).write_text(yaml.safe_dump(gap_report, sort_keys=False), encoding="utf-8")
PY
  else
    gap_success=0
    for ((gap_attempt=1; gap_attempt<=PROVIDER_ATTEMPTS; gap_attempt++)); do
      raw_gap_file="$RUN_DIR/${seed_id}.gap.raw.yaml"
      run_provider judge "$CALIBRATION_JUDGE_CMD" "$judge_prompt" "$raw_gap_file"
      if python3 scripts/normalize-calibration-output.py gap-report \
        --input "$raw_gap_file" \
        --output "$gap_file" \
        --seed-json "$seed_json" \
        --lint-file "$lint_file" \
        --generated-by "$GENERATOR_MODEL" \
        --judged-by "$JUDGE_MODEL"
      then
        gap_success=1
        break
      fi
      echo "Gap normalization failed on attempt $gap_attempt/$PROVIDER_ATTEMPTS for $seed_id" >&2
      if (( gap_attempt < PROVIDER_ATTEMPTS )); then
        sleep "$PROVIDER_RETRY_SLEEP_SECS"
      fi
    done
    if (( gap_success == 0 )); then
      echo "Gap normalization failed after $PROVIDER_ATTEMPTS attempts for $seed_id" >&2
      exit 1
    fi
  fi
  validate_artifact --kind gap_report "$gap_file" >/dev/null
  echo "Seed ${seed_id}: gap report ready" >&2
  AGENT_GAP_FILES["$agent_slug"]="${AGENT_GAP_FILES["$agent_slug"]:-} $gap_file"
done

for agent_slug in "${!AGENT_GAP_FILES[@]}"; do
  echo "Summary ${agent_slug}: synthesizing" >&2
  summary_context="$(mktemp)"
  python3 - "$RUN_ID" "$agent_slug" ${AGENT_GAP_FILES["$agent_slug"]} > "$summary_context" <<'PY'
from pathlib import Path
import json
import sys
import yaml

run_id = sys.argv[1]
agent_slug = sys.argv[2]
gap_reports = [yaml.safe_load(Path(path).read_text(encoding="utf-8")) for path in sys.argv[3:]]
print(json.dumps({
    "run_id": run_id,
    "agent_slug": agent_slug,
    "gap_reports_yaml": yaml.safe_dump(gap_reports, sort_keys=False),
}))
PY

  summarize_prompt="$RUN_DIR/${agent_slug}.summarize.prompt.md"
  render_template "calibration/prompts/summarize.md" "$summary_context" > "$summarize_prompt"

  summary_file="$RUN_DIR/${agent_slug}.summary.yaml"
  if [[ "$RESUME" -eq 1 && -f "$summary_file" ]] && validate_artifact --kind synthesis_summary "$summary_file" >/dev/null 2>&1; then
    echo "Resuming summary for ${agent_slug}: reusing existing synthesis artifact"
    continue
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    cat > "$summary_file" <<EOF
agent_slug: $agent_slug
calibration_run_id: $RUN_ID
date: $(date -u +%Y-%m-%d)
systematic_strengths: []
systematic_gaps: []
recommended_edits: []
EOF
  else
    summary_success=0
    for ((summary_attempt=1; summary_attempt<=PROVIDER_ATTEMPTS; summary_attempt++)); do
      raw_summary_file="$RUN_DIR/${agent_slug}.summary.raw.yaml"
      run_provider summarize "$CALIBRATION_SYNTHESIZER_CMD" "$summarize_prompt" "$raw_summary_file"
      if python3 scripts/normalize-calibration-output.py synthesis-summary \
        --input "$raw_summary_file" \
        --output "$summary_file" \
        --agent-slug "$agent_slug" \
        --run-id "$RUN_ID"
      then
        summary_success=1
        break
      fi
      echo "Summary normalization failed on attempt $summary_attempt/$PROVIDER_ATTEMPTS for $agent_slug" >&2
      if (( summary_attempt < PROVIDER_ATTEMPTS )); then
        sleep "$PROVIDER_RETRY_SLEEP_SECS"
      fi
    done
    if (( summary_success == 0 )); then
      echo "Summary normalization failed after $PROVIDER_ATTEMPTS attempts for $agent_slug" >&2
      exit 1
    fi
  fi
  validate_artifact --kind synthesis_summary "$summary_file" >/dev/null
  echo "Summary ${agent_slug}: ready" >&2
done

versions_json="$(mktemp)"
python3 - "$versions_json" <<'PY'
from pathlib import Path
import json
import sys

Path(sys.argv[1]).write_text("{}", encoding="utf-8")
PY
for agent_slug in "${!AGENT_PROMPT_VERSIONS[@]}"; do
  python3 - "$versions_json" "$agent_slug" "${AGENT_PROMPT_VERSIONS[$agent_slug]}" <<'PY'
from pathlib import Path
import json
import sys

path = Path(sys.argv[1])
data = json.loads(path.read_text(encoding="utf-8"))
data[sys.argv[2]] = sys.argv[3]
path.write_text(json.dumps(data), encoding="utf-8")
PY
done

manifest_file="calibration/run-manifests/${RUN_ID}.yaml"
python3 - "$manifest_file" "$RUN_ID" "$GENERATOR_MODEL" "$JUDGE_MODEL" "$ESTIMATED_COST" "$HUMAN_QA_SAMPLE" "$HUMAN_QA_CONCORDANCE" "$versions_json" <<'PY'
from pathlib import Path
from datetime import datetime, UTC
import sys
import yaml
import json

manifest_file = Path(sys.argv[1])
run_id = sys.argv[2]
generator_model = sys.argv[3]
judge_model = sys.argv[4]
estimated_cost = float(sys.argv[5])
human_qa_sample = int(sys.argv[6])
human_qa_concordance = None if sys.argv[7] == "null" else float(sys.argv[7])
agent_prompt_versions = json.loads(Path(sys.argv[8]).read_text(encoding="utf-8"))
run_dir = Path("calibration/results") / run_id

seed_files = list(run_dir.glob("*.attempt.md"))
gap_files = list(run_dir.glob("*.gap.yaml"))
lint_files = list(run_dir.glob("*.lint.yaml"))

lint_passes = 0
for path in lint_files:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    lint_passes += 1 if data.get("overall_pass") else 0

weighted_totals = []
for path in gap_files:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    scores = data.get("scores", {})
    value = scores.get("weighted_total")
    if isinstance(value, (int, float)):
        weighted_totals.append(float(value))

manifest = {
    "run_id": run_id,
    "date": datetime.now(UTC).strftime("%Y-%m-%d"),
    "agents_tested": sorted(agent_prompt_versions.keys()),
    "generator_model": generator_model,
    "judge_model": judge_model,
    "agent_prompt_versions": agent_prompt_versions,
    "seeds_used": len(seed_files),
    "holdouts_used": len(gap_files),
    "lint_pass_rate": (lint_passes / len(lint_files)) if lint_files else 0.0,
    "mean_calibration_score": (sum(weighted_totals) / len(weighted_totals)) if weighted_totals else 0.0,
    "estimated_cost_usd": estimated_cost,
    "human_qa_sample": human_qa_sample,
    "human_qa_concordance": human_qa_concordance,
}

manifest_file.write_text(yaml.safe_dump(manifest, sort_keys=False), encoding="utf-8")
PY

validate_artifact --kind run_manifest "$manifest_file" >/dev/null
echo "Calibration run complete: $RUN_ID" >&2
