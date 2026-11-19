# PhysicianBench pinned engineering review

Reviewed [`c7efa8fd5b1e4744ada50668efe4b7e84023cbb0`](https://github.com/HealthRex/PhysicianBench/tree/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0), commit dated August 13, 2026; reviewed October 20, 2026. Fork: [ajhcs/PhysicianBench](https://github.com/ajhcs/PhysicianBench). READY for source preparation; NOT READY for native execution or Luna Medium/Max comparison. No installation, image load, patient-data access or model call occurred.

## Fixtures, provenance and license

The read-only reviewer enumerated an untruncated public recursive Git tree:100 `tasks/v1/*/task.toml` files. Independently parsing [`scripts/checkpoint_taxonomy_v1.json`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/scripts/checkpoint_taxonomy_v1.json) yielded 100 tasks / 670 checkpoint entries (103 retrieval,356 clinical reasoning,112 action execution,99 documentation). These are capability categories, not deterministic/judge counts. An example `aortic_aneurysm_cad` has six checkpoints and produces `cardiology_assessment_note.txt`; task folders are insufficient without external FHIR patient state.

The code includes [Apache-2.0](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/LICENSE). Preserve license, attribution and applicable notices. [README](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/README.md) directs users to Stanford Redivis for `physicianbench-fhir-v1.tar.gz`; runner default is `fhir-full:v1`. Code licensing does not independently authorize record acquisition, redistribution or model-provider export.

The [paper](https://arxiv.org/html/2605.02240v1) identifies STARR-derived clinical records with perturbation/de-identification and describes HAPI FHIR JPA/H2. These are documented architecture/data-origin claims, not independent inspection of the image. The [Redivis landing page](https://stanford.redivis.com/datasets/a0ek-0ad8tjsw9) provided no readable agreement, export conditions, archive size or digest. Exact access terms remain UNKNOWN. No login/download/terms acceptance was attempted. Website [`Methodology.tsx`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/website/src/components/Methodology.tsx) calls records synthetic, inconsistent with README/paper. Do not use that wording to admit patient data as synthetic.

This is a clinical workflow benchmark. Even a valid result would not establish US healthcare administration competence across this project's specialist roles, nor clinical validity.

## Runtime, tools and reset

[`scripts/run_task.py`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/scripts/run_task.py) creates a named Docker FHIR container, waits on `/fhir/metadata`, runs the host Python agent, calls `run_eval.py`, and removes the container in `finally`. Outputs include `workspace/output`, trajectories/stdout/stderr, verifier output and metadata. Fresh containers reset image-backed FHIR state, not old job outputs; require unique job directories.

[`agent/tool_registry.py`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/agent/tool_registry.py) exposes 13 FHIR functions and `write_file`. Reads cover demographics, conditions, observations, procedures, medications, notes and requests. Writes include medication/service requests, communications, appointments and files. `MiniAgent` dispatches tool calls sequentially, including provider-proposed parallel batches. It truncates model-visible output to 10,000 characters, with repeated-error/call/batch aborts. Trajectory records the already truncated result despite a full-output comment; do not assume full tool-result recovery. [Agent loop](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/agent/mini_agent.py).

Reset/replay traps:

- `--skip-agent` starts fresh FHIR state, so regrading old outputs is not replaying their agent-created post-state.
- Resume checks metadata existence, not verified completion; its initial layout check can differ from `run_N` batches.
- Single-task step default 200 differs from batch 100. Set explicit budgets.
- Agent exceptions do not alone determine final runner success; `--skip-eval` can leave success true.
- Container-removal status is unchecked. Record exact owned container IDs and verify cleanup without host-wide pruning.

## Grading, baselines and scoring

Grading mixes trajectories, durable FHIR state, generated files and external LLM judgment. In the [example verifier](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/tasks/v1/aortic_aneurysm_cad/tests/test_outputs.py), four of six checkpoints can call `llm_judge` (lines141,183,233,352), despite a header claiming five deterministic/one nondeterministic. Classify graders from executable calls, not docstrings or taxonomy.

[`utils/eval_helpers.py`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/utils/eval_helpers.py) prefers OpenRouter then OpenAI; default judge is `openai/gpt-5` or `gpt-5`, Chat Completions, temperature 0, 4,000 completion tokens. Judge API/parse trouble becomes FAIL or missing extraction values. Preserve infrastructure reasons independently of substantive failure. Freeze judge backend, ID, rubric and budgets across both effort arms.

The integrator independently read [`scripts/score_jobs.py:80`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/scripts/score_jobs.py#L80): only directories starting `task_` are discovered, unlike current task slugs/runner output. Assert expected nonzero task/run/checkpoint counts and fix this before trusting summaries. `pass@3=1-(1-p)^3` is computed from observed pass rate; `pass^3` means every completed run succeeded, not necessarily exactly three planned runs. Keep metric definition, planned denominator and incomplete runs explicit.

Website leaderboard and two example HTML trajectories are upstream illustrative/derived artifacts. They do not include a complete baseline bundle with all jobs, exact image, locked dependencies and request receipts. No baseline was replayed.

## Containment, dependencies and resources

Runner uses `docker -p 18080:8080`, which omits loopback binding, image digest and CPU/memory/process limits. The agent runs on the host, so a FHIR container does not contain agent tools. [`write_file`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/tools/file_tools.py) accepts arbitrary paths. [FHIR functions](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/tools/fhir_api_functions.py) accept optional URL/auth and follow pagination links; dispatch lacks schema validation. Before execution, review confined output paths, permitted FHIR origins/pagination, disposable agent runtime, dedicated private networking and explicit limits. No firewall/security/service changes are authorized by this document.

[`pyproject.toml`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/pyproject.toml): Python >=3.10; openai, requests, python-dotenv, pytest>=8 and setuptools. No committed Python lock, Dockerfile/compose or image digest was found. `uv sync` would resolve mutable dependencies. Website Node tooling is not needed for benchmark execution.

Public-tree blob sizes total 13,495,399 bytes (including a 10.5 MB GIF), not clone/install size. External image architecture, HAPI/Java versions, archive/layer/H2 disk size, peak RAM and startup/task latency remain unknown. No native image batch is approval-ready. Reserve at most 2 GiB/one process/two CPU threads/2 GiB RAM/six minutes for a future harness-only smoke; these are proposed caps, not measured runtime needs. The native benchmark requires a new measured resource proposal after data/image terms are established.

All source, environments, cache, TMPDIR, logs and any later Docker data must stay on verified Samsung storage. Verify Docker data-root before image work; do not relocate shared infrastructure or use root fallback. Remove only exact newly approved owned containers/scratch after preserving evidence; never prune shared Docker state.

## Luna adapter and smallest smoke proposal

Integrator independently confirmed [`LLMClient.chat`](https://github.com/HealthRex/PhysicianBench/blob/c7efa8fd5b1e4744ada50668efe4b7e84023cbb0/agent/llm_client.py) uses `client.chat.completions.create` and `extra_body={reasoning:{effort:...}}`. Backend auto-selection prefers inherited OpenRouter, then Anthropic, then OpenAI keys. `run_task.py` accepts low/medium/high only; max is rejected. This is not valid direct OpenAI Luna reasoning/tool support.

A reviewed Responses adapter must preserve call IDs, tool outputs and reasoning items across turns, exact endpoint/model/effort, complete status/usage and no fallback. The [common Luna protocol](luna-protocol.md) specifies wire mapping and independent judge accounting.

No shipped synthetic end-to-end task was identified. A safe first fixture must be newly labeled as harness plumbing: fake model emits one `write_file` tool call then final text; entirely invented text only; assert one call/two model steps/trajectory and expected output path. Block outbound sockets and disable dotenv loading. Prove confinement separately by rejecting absolute paths, parent traversal and symlink escapes in the adapted tool. Add stubbed FHIR reads/writes separately. It requires no image, patient data, API key, network or judge, and does not yield PhysicianBench performance.

Later install-capture proposal, not executed: in a pinned task-owned checkout, select an existing inspected Python and existing qualified uv; set UV_CACHE_DIR, UV_PROJECT_ENVIRONMENT, TMPDIR under a fresh approved Samsung run root; set `UV_PYTHON_DOWNLOADS=never`. Run `timeout 120s uv lock --python <verified-interpreter>`, STOP for resolved graph/wheel/license/size review, then separately approved `timeout 180s uv sync --frozen --no-dev --python <verified-interpreter>`. Upstream package/build code execution requires that approval. A proposed future `timeout 20s <venv>/bin/python <runroot>/synthetic_smoke.py` is not executable until the missing synthetic script is implemented, hashed and reviewed. The lock phase can invoke metadata/build backends and needs approval for that execution as well as network resolution. An overall six-minute timer must cap the proposed 320 seconds of individual phase ceilings. No uv installation, image acquisition or runtime task is authorized here.

Outstanding: Redivis terms/image identity and size; runtime capacity; synthetic harness implementation; Responses/tool isolation; scorer repair; judge-failure classification; strict aggregate token/spend accounting. No benchmark has run here.
