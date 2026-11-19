# Exact bounded action proposal — pending approval, not executed

The completed scope is source inspection, fork creation and this documentation PR. The next executable batch below is a single CHI synthetic plumbing installation/test proposal. It uses existing lock/tests and avoids the gated handbook, external fixture payload, image build, browser installation, API keys and model/judge/simulator calls. It is not CHI-Bench performance. The other reports provide later alternatives; they are not additions to this batch.

## Target, prerequisites and side effects

- Source: `ajhcs/chi-bench`, exact `4444a07fa68a4f1623f841a292a54e284fc8e7f7`, proposed new checkout `/workspace/repos/builderbob/chi-bench`. Recheck exact fork parent/HEAD and deduplicate source paths before creation; stop rather than overwrite a found path. Public source checkout is already within investigation scope, but none has yet been created.
- Scratch: one newly owned `/workspace/build/builderbob/healthcare-bench-smoke-20261020/chi`, plus only the source checkout's package-build outputs explicitly inventoried at admission. No canonical healthcare checkout changes.
- Existing tooling: `/workspace/cache/builderbob/runtimes/uv-0.12.17-x86_64-unknown-linux-gnu/uv` was found and `--version` returned 0.12.17. Python path `/usr/bin/python3` exists; verify exact version/ABI and compatibility against lock immediately before approval. Default system Python has no pip module; this does not authorize a global pip install. No uv/python download or toolchain upgrade is included.
- Limits proposed: one worker, two CPU cores, 4 GiB RAM, 8 GiB source/environment/cache/log/build allocation, 15-minute whole-batch wall time, no retries after failure. Require at least 150 GiB free Samsung capacity before and throughout work. These are ceilings, not measured sufficiency. External CPU/memory/disk/network enforcement has not been implemented or qualified; execution stays pending that gate. `timeout` alone does not enforce all these limits.
- Installation egress: only reviewed locked package/wheel sources plus pinned public GitHub source acquisition. Lock URLs/redirects/hash verification and build hooks must be reviewed first; do not approve an unspecified network allowlist. The install may execute dependency/project metadata/build/package code. It cannot start Docker, services, browsers, schedulers or external models. No package-baseline/security/daemon modification is included.
- Test phase: externally denied network, scrubbed provider credentials, no populated dotenv, no model/judge/simulator, no Docker build. Mock tests are still repository-code execution and need action-specific approval. An empty fixture layout is not acquired handbook access. No credential files are read/copied.

Fresh host `bob-admin workspace-status`, disk, ownership/nonsymlink checks, source clean status, lock identity, writer/maintenance/open-file and target scope checks must pass. No failed storage visibility check is bypassed: the documented read-only host check is the route, not mount repair. Preserve all existing service/storage/firmware/cleanup holds. The sandbox/approval layer remains a separate technical boundary.

## Commands to review after admission

The enclosing approved execution mechanism must set resource limits and test network denial. The code block is an exact command proposal, not permission to run it or proof it enforces those boundaries. Source checkout/root creation are separately admitted before these commands; no other path may be substituted without review.

```bash
set -eu
CHI_SOURCE=/workspace/repos/builderbob/chi-bench
CHI_RUN_ROOT=/workspace/build/builderbob/healthcare-bench-smoke-20261020/chi
CHI_UV=/workspace/cache/builderbob/runtimes/uv-0.12.17-x86_64-unknown-linux-gnu/uv
CHI_PYTHON=/usr/bin/python3

# Required existing, freshly admitted, task-owned source and empty run root.
test "$(realpath -e "$CHI_SOURCE")" = "$CHI_SOURCE"
test "$(realpath -e "$CHI_RUN_ROOT")" = "$CHI_RUN_ROOT"
test -O "$CHI_SOURCE"
test -O "$CHI_RUN_ROOT"
test -z "$(find "$CHI_RUN_ROOT" -mindepth 1 -maxdepth 1 -print -quit)"
cd "$CHI_SOURCE"
test "$(git rev-parse HEAD)" = 4444a07fa68a4f1623f841a292a54e284fc8e7f7
test -z "$(git status --porcelain=v1 --untracked-files=all)"
test ! -e .env
test ! -e .env.local

export UV_CACHE_DIR="$CHI_RUN_ROOT/uv-cache"
export UV_PROJECT_ENVIRONMENT="$CHI_RUN_ROOT/venv"
export UV_PYTHON_DOWNLOADS=never
export TMPDIR="$CHI_RUN_ROOT/tmp"
export PYTHONDONTWRITEBYTECODE=1
export PYTHONPYCACHEPREFIX="$CHI_RUN_ROOT/pycache"
export CHI_BENCH_SKIP_DOCKER_BUILD=1
mkdir -p "$UV_CACHE_DIR" "$TMPDIR"

# Install phase: reviewed lock sources/build hooks, no credentials inherited.
timeout 600s "$CHI_UV" sync --frozen --extra dev --extra openai-agents \
  --python "$CHI_PYTHON" --no-managed-python
# STOP on any nonzero result, limit/hold/permission change or lock drift.
# Test phase must start under approved external network denial.
timeout 180s "$CHI_UV" run --no-sync --offline pytest \
  tests/smoke/test_verify_data_layout.py \
  tests/unit/test_state_machines.py \
  tests/unit/test_docker_env.py \
  tests/unit/test_openai_agents_harness.py \
  tests/unit/test_openai_agents_runner_config.py \
  -q --basetemp "$CHI_RUN_ROOT/tmp/pytest" \
  -o "cache_dir=$CHI_RUN_ROOT/pytest-cache"
```

The environment must be created with an approved minimal allowlist, rather than merely unsetting three key names: there are multiple providers, gateway keys and dotenv paths. Keep native HOME/CODEX_HOME unchanged; assign every package/build/cache/temp path to admitted Samsung storage. If any dependency tries to write outside it, stop and revise the batch; do not substitute a root-disk fallback. Log exact source status/lock and artifact hashes, tool versions, phase durations, skips and network-denial evidence. Stop at 15 minutes overall even if an individual phase still has time remaining.

Acceptance is successful selected test execution with complete skip report, no external model calls, no image/browser/service starts, no outside-root writes, preserved source lock and no limit breaches. This would establish layout/mock plumbing only. Existing tests do not prove Luna Max/mode/budget acceptance; those require a later reviewed adapter patch and mocked wire assertions. Any new result must retain this limitation.

Rollback: terminate only recorded owned processes, preserve manifest/log/hash receipt, inventory changes under the exact new source/scratch roots, and remove them only under a separate exact cleanup decision. No `docker system prune`, global cache deletion, old-worktree removal, service restart or fork deletion. On denial, record exact action/target/reason and do not retry through another route. No denied mutation occurred during this investigation; earlier argument/raw-media failures were read/CLI compatibility failures, not approval denials.

## Paid run gates remain separate

No paid run command is approval-ready. Before requesting one, implement/test exact Luna adapter, inspect selected immutable fixture and graders, verify access/terms, choose provider key through the credential workflow, qualify isolation/reset/resource limits, tokenize full inputs and estimate/ceiling all agent+judge+simulator+retry costs. Submit the concrete command/config, task/adapter/data hashes, mode/effort pair, counts, aggregate budgets and maximum spend. Unknown pricing or failure-usage coverage is a blocker, not a zero. No credential provisioning or tiny billable preflight is authorized by this document.
