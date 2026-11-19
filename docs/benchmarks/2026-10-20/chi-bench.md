# CHI-Bench pinned engineering review

Reviewed [`4444a07fa68a4f1623f841a292a54e284fc8e7f7`](https://github.com/actava-ai/chi-bench/tree/4444a07fa68a4f1623f841a292a54e284fc8e7f7), reviewed October 20, 2026; commit dated October 15, 2026. Fork: [ajhcs/chi-bench](https://github.com/ajhcs/chi-bench). READY for source preparation; NOT READY for a valid Luna comparison. No research execution, install, build, terms acceptance or billed API call occurred.

## Versions, fixtures and access limits

[`pyproject.toml`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/pyproject.toml) identifies runtime 1.1.0/Python >=3.12. Recommended dataset tag remains `chi-bench-v1.0.0`: runtime and data versions must be recorded independently. [`cli.py:data_verify`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/cli.py) expects 25 provider PA+25 payer UM+25 CM=75 base tasks,23 coupled E2E and3 marathon directories. The [public fixture card](https://huggingface.co/datasets/actava/chi-bench) agrees. Harbor's 78 single-agent count includes the three marathons; coupled E2E requires the repository two-agent harness.

These counts were corroborated in runtime validation and publisher metadata, not by enumerating an immutable downloaded payload. Tasks are outside GitHub and include `instruction.md`, `task.toml`, fixture manifests/expectations, solutions/tests and shared worlds. Tagged HF API/raw/task URLs were inaccessible through the review web tool, and one unauthenticated Python revision GET failed DNS; no bypass or terms acceptance followed. Exact dataset commit, task enumeration, gold files, checksums and selected-task limits remain UNVERIFIED. The dataset tag is not represented as a resolved SHA.

Code [LICENSE](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/LICENSE) and fixture card identify Apache-2.0 code/fixtures, with separate handbook rights. The [handbook gate](https://huggingface.co/datasets/actava/managed-care-operations-handbook) states non-commercial research only, no redistribution, and confidentiality for data/derived outputs absent written consent. Normal tasks require the handbook. Forking does not grant it; none was obtained. Keep later handbook-derived outputs private pending actual intended-use/terms review. Preserve source notices/citation and modified-file attribution.

## Simulator, interfaces and state

[`experiment/runner.py`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/experiment/runner.py) builds Harbor `trials start` for a single task or `jobs start` for directories. `ChiBenchDockerEnvironment.start` creates a fresh single-image container; [`docker/entrypoint.sh`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/docker/entrypoint.sh) selects leaf task ID, seeds simulator and starts the agent.

One container hosts FastAPI on 8023, provider MCP on 8020, payer MCP on 8100 and CM MCP on 8200. Services include chart/coverage/intake/review/determination/letters/appeals/peer-to-peer/outreach/assessments/care plans. MCP and CLI ablations expose shared service logic with different interfaces. The OpenAI Agents harness also offers filesystem/Bash/Python/sleep/completion tools, so containment and task/gold visibility matter. `codex` is Harbor built-in; `codex-cli` is an in-tree mcporter subclass; they are different treatments, never interchangeable within an effort pair. [Architecture](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/docs/architecture.md).

[`core/store.py:WorldStore`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/core/store.py) owns `provider_world.sqlite`, `payer_hidden.sqlite`, `audit.sqlite`, initialization fingerprint and file lock. Matching fingerprint initialization preserves existing state; `reset_and_initialize_from_scenario` forcibly reseeds. Require fresh containers, roots and verified initial-state hashes for every arm; serving a scenario again is not a reset.

CM dialogue uses an LLM patient simulator default `claude-sonnet-5`, 1024 output tokens; peer-to-peer dialogue defaults same model, 512 output tokens. Pin simulator models/settings/seeds where applicable and capture usage independently. These are additional sources of cost/stochasticity beyond Luna. [Patient simulator](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/conversation/patient_simulator.py), [P2P](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/services/p2p.py).

## Grading, failure classification and artifacts

[`verifier/task_runtime.py`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/verifier/task_runtime.py) combines deterministic stage checks and LLM rubrics. `WorkspaceJudge` builds a workspace of canonical records, policies, agent outputs and audit logs, then uses Claude Code with Read/Glob/Grep/Write/Edit; default judge `claude-opus-4-7`,900-second timeout, optional repeated votes. [Judge implementation](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/verifier/judge/workspace_judge.py).

The integrator independently confirmed degraded/missing judge rubrics become `not_applicable`; `build_scorecard` excludes NA and can award binary 1 when remaining checks pass. Preserve upstream score, but classify any missing required rubric or degradation (including unexpected `judge_unavailable_reason`) as INCOMPLETE/INVALID for accepted outcomes. A documented legitimate E2E no_submit branch can also populate judge_unavailable_reason; exclude such intentional skips from the invalid rule. Genuine scenario-specific NA must be distinguished from unavailable judging. Never treat an upstream binary reward alone as an operationally valid success.

Retain Harbor `result.json`, verifier `reward.json`, `scorecard.json`, `exported_state.json`, `verifier_context.json`, judge metadata/debug and trajectory. Fractional reward is diagnostic; binary pass is the published axis. Stored workspaces can be rejudged without rerunning agents. No complete baseline result/fixture/handbook replay was performed; example frontier configs are settings, not current Luna results. [Judge protocol](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/docs/judge.md).

## Luna compatibility

Best source-auditable candidate: in-tree `openai-agents`, direct Responses. [`openai_agents_harness.py`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/experiment/agents/openai_agents_harness.py) strips `openai/` for direct routing unless `OPENAI_BASE_URL` overrides it. Assert endpoint/model; do not inherit an unintended gateway. The integrator independently verified the effort enum excludes max (none/minimal/low/medium/high/xhigh). Max requires a reviewed patch, not substitution to xhigh.

[`openai_agents_runner.py`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/src/chi_bench/experiment/agents/openai_agents_runner.py) defaults to Responses and passes reasoning effort through ModelSettings without temperature/top-p. Exact SDK acceptance of current Luna, mode, max effort, output/aggregate token budget and no fallback remains untested. `max_turns`/retry flags do not provide a strict total spend limit. On exceptions, initialized zero usage may survive if `Runner.run` fails before extracting its result: usage is UNKNOWN, not zero-cost. Existing frontier examples name `gpt-5.6-luna`/high; that does not establish `gpt-6-luna`/medium/max compatibility.

## Dependencies, build coupling and containment

[`uv.lock`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/uv.lock) resolves Harbor 0.20.0, Anthropic 0.101.0, OpenAI 2.36.0, Agents 0.13.6, Playwright 1.59.0, Modal 1.4.2. Preserve lock hash and use frozen resolution; this does not pin the external fixture payload or image build.

[`Dockerfile`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/docker/Dockerfile) installs OS packages, Node 20, Chromium/system dependencies, Claude Code `@latest`, tag-based base image and all fixture families/handbook. Repair/regeneration scripts render PDFs on the host before the Docker build copies them. Pin base digest, CLI/browser versions and effective image ID before reproducibility claims. Runtime 1.1.0 requires local `pa_t035` coverage/denial repairs plus regenerated payer PDFs; preserve pristine/effective hashes and repair diff. Legacy `healthverse` fixture references depend on compatibility shims. [Repair](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/scripts/repair_pa_t035.py), [PDF generation](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/scripts/regenerate_payer_request_forms.py).

Docker argv publishes no host ports; `EXPOSE` alone does not publish. Non-public network policy uses `--network none`; API runs require separately approved egress. No CPU/memory/PID limits are supplied. No local GPU requirement is declared. RAM/image/dependency/storage consumption is unmeasured. Proposed first harness-only cap: one worker, two CPUs, 4 GiB RAM, 8 GiB total scratch, 15 minutes; native image/resources require a new measured proposal. Verify Docker data-root on Samsung before image actions; do not relocate it as setup.

Code avoids a `/fixtures` symlink but assets remain under `/opt/chi-bench`; OS-enforced gold/hidden-state confidentiality against local Bash/filesystem tools has not been established. Verify effective permissions before interpreting contamination resistance. Secrets can be forwarded in Harbor/Docker arguments; do not dump raw command lines, environment or docker inspect. No security change is authorized.

## Proposed bounded synthetic batch

A handbook-free plumbing check exists: [`tests/smoke/test_verify_data_layout.py`](https://github.com/actava-ai/chi-bench/blob/4444a07fa68a4f1623f841a292a54e284fc8e7f7/tests/smoke/test_verify_data_layout.py) creates placeholder25/25/25+23+3 directories and a fake handbook marker. It checks shallow layout only. It is not a benchmark, an acquired handbook, a no-skill result or a stand-in for real fixture access.

After action-specific approval and tool/environment qualification, the exact candidate test set is:

```bash
# Run only from an approved pinned source checkout; every path below is task-owned.
# Existing qualified uv/Python required; do not install them implicitly.
export UV_PYTHON_DOWNLOADS=never
export PYTHONDONTWRITEBYTECODE=1
export CHI_BENCH_SKIP_DOCKER_BUILD=1
# The action-specific batch must assign and admit these exact absolute paths.
: "${CHI_SOURCE:?approved absolute source path required}"
: "${CHI_RUN_ROOT:?approved fresh absolute run root required}"
case "$(realpath -e "$CHI_SOURCE")" in /workspace/*) ;; *) exit 1 ;; esac
case "$(realpath -e "$CHI_RUN_ROOT")" in /workspace/*) ;; *) exit 1 ;; esac
cd "$CHI_SOURCE"
test "$(git rev-parse HEAD)" = 4444a07fa68a4f1623f841a292a54e284fc8e7f7
export UV_CACHE_DIR="$CHI_RUN_ROOT/uv-cache"
export UV_PROJECT_ENVIRONMENT="$CHI_RUN_ROOT/venv"
export TMPDIR="$CHI_RUN_ROOT/tmp"
mkdir -p "$UV_CACHE_DIR" "$TMPDIR"
timeout 600s uv sync --frozen --extra dev --extra openai-agents
# STOP if dependency review or storage cap fails. Test phase: no keys/.env/network.
timeout 180s uv run --no-sync --offline pytest \
  tests/smoke/test_verify_data_layout.py \
  tests/unit/test_state_machines.py \
  tests/unit/test_docker_env.py \
  tests/unit/test_openai_agents_harness.py \
  tests/unit/test_openai_agents_runner_config.py \
  -q --basetemp "$CHI_RUN_ROOT/tmp/pytest" \
  -o "cache_dir=$CHI_RUN_ROOT/pytest-cache"
```

Install machinery and these tests execute repository/package code, so none ran under investigation authorization. `--offline` is dependency resolution behavior, not a socket sandbox: enforce network denial externally. Scrub all provider keys and ensure source has no populated dotenv. No Docker build/browser download/handbook/dataset access is in this candidate batch. Add mocked assertions for bare Luna ID, direct Responses, medium/max, fixed mode, budget, failure usage and unsupported efforts after the adapter patch.

A later real task candidate is `pa_t008_t008_o002_p01_mdreview_payer` or configured frontier task `pa_t034_t034_o002_p01_intake_payer`. Neither is verified as smallest or simulator-free because payload reads failed. Inspect/hash actual task TOML, gold, expectations and world before selecting. Avoid CM/P2P initially if the selected valid task can do so. Publisher judge estimate $0.05–$0.30/trial is guidance, not a measured cap; total spend is currently UNKNOWN.

Rollback stops/removes only recorded owned trial containers and preserves manifests/locks/results; shared caches, services, old worktrees and storage holds remain. Remaining gates: immutable fixture review, handbook intended-use/access, repaired-data hashes, image/isolation/resource audit, Luna adapter and full billing budget. No CHI-Bench task has run here.

The proposed CPU, RAM and disk ceilings are unenforced by these shell commands. Execution remains pending an approved resource/network enforcement mechanism; timeout bounds elapsed time only. Reject dirty source or a preexisting/non-owned run root at admission.
