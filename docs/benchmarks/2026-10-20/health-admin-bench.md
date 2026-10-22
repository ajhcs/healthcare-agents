# HealthAdminBench pinned engineering review

Reviewed [`b88844c8c3e42af717742d795b2c100e646b9b2b`](https://github.com/som-shahlab/health-admin-bench/tree/b88844c8c3e42af717742d795b2c100e646b9b2b), reviewed October 20, 2026; commit dated October 17, 2026. Fork: [ajhcs/health-admin-bench](https://github.com/ajhcs/health-admin-bench). READY for source preparation; NOT READY for a Luna Medium/Max run. No benchmark, installation, browser launch, judge call or service action occurred.

## Fixture audit and version traps

Reviewer fetched and parsed all 135 expected naming-grid files in each of v2 and v3 through GitHub `fetch_file` at the full SHA,270 files total, without importing research code. Grid: prior_auth/emr-{easy,medium,hard}-{1..20}; appeals_denials/denial-{easy,medium,hard}-{1..20}; dme/fax-{easy,medium,hard}-{1..5}.

| Version path | Inspected files | JMESPath | LLM judge | Total checks |
|---|---:|---:|---:|---:|
| benchmark/v2/tasks | 135 | 1177 | 521 | 1698 |
| benchmark/v3/tasks | 135 | 1177 | 517 | 1694 |

`denial-hard-8` and `denial-hard-9` each change 12→10 checks, retaining six deterministic and four judge checks in v3. The integrator independently inspected the v3 `denial-hard-8` JSON and [`scripts/prereg_counts.py`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/scripts/prereg_counts.py): the script targets v2 and expects 1698; it does not validate v3. The README 135/1698 claim must therefore not be repeated as the v3 payload count. Recursive tree enumeration was unavailable to the reviewer; unexpected extra filenames outside this documented grid remain unverified. V3 fixture JSON still says `version:'v2'`; select by pinned path and hash, not internal field.

[`run_benchmark.py`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/run_benchmark.py) resolves bare prefixes under v2, grid defaults under v3, and `hab run` is v2 only. Prefix `emr-easy-1` can select1 plus10..19. Use full `benchmark/v3/tasks/prior_auth/emr-easy-14.json`, including extension. Mixed versions are rejected. The default v2 URL is remote `https://emrportal.vercel.app`; v3 is local3002. Connectivity checks do not establish served version. Record actual local build SHA/task hash and explicit URL. Defaults zero_shot/axtree_only differ from paper general/screenshot_only; set prompt/observation/action/viewport explicitly.

## Runtime and reset

The synthetic portals are same-origin `/emr`, `/payer-a`, `/payer-b`, `/fax-portal`. [`clientRunState.ts`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/benchmark/v3/portals/app/lib/clientRunState.ts) persists unified version1 `{emr,payerA,payerB,fax}` in localStorage; there is no real EHR backend/database. `get_final_state` extracts unified state, portal aliases and legacy signals. Actions not saved into scored durable state do not prove task completion.

[`EpicEnvironment.reset`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/harness/environment.py) generates an eight-character run ID, clears bare `portals_state` and namespaced `portals_state:*`, and launches Chromium/context only when no browser exists. Repeated reset on a live environment reuses that context; the benchmark runner constructs a new environment/context for each attempt. Locale en-US/timezone America/Los_Angeles belong to benchmark semantics, independent of operator timezone. Benchmark clock is frozen at2026-02-25T09:00:00-08:00 with module sequence counter. Preserve frozen date and verify fresh state/context per episode; never use a personal browser profile.

Text actions support DOM test IDs/AX bids or coordinates, click/fill/select/navigation/scroll/press/download/upload/done. Screenshot-only skips AX tree. Built-in text-action viewport defaults 1280×720; set actual `HARNESS_BROWSER_VIEWPORT_WIDTH/HEIGHT` or constructor and assert screenshot dimensions. README display settings may concern CUA; do not assume 1920×1080 applies to text-action mode.

## Grading and baseline artifacts

[`JMESPathEvaluator`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/harness/evaluators/jmespath_evaluator.py) compares final-state query output to expected/contains values, with limited coercions/digits mode. [`evaluate_episode`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/harness/evaluation.py) awards configured points on passes; default passing threshold 1.0, despite an older 70% docstring.

[`LLMJudge.grade`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/harness/evaluators/llm_judge.py) defaults to three calls per rubric, binary majority vote, retaining individual outputs/debug averages. Changing `HARNESS_LLM_JUDGE_NUM_RUNS_OVERRIDE` changes the protocol. Every inspected v3 task has a judge check: a random-agent task run can still bill. One full v3 run implies 1551 nominal judge completions (517×3), before retries; v2 implies 1563. Default judge alias `gpt-5.4` can route differently by inherited keys. Freeze actual judge provider/model and prompt, not alias alone. Infrastructure failure, task failure and not-implemented are distinct.

[`harness/reproducibility.py`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/harness/reproducibility.py) records seed/run identity/inference config/settings, harness commit/dirty state, trajectories/screenshots, final/evaluation state, statistics and aborted attempts. Seed is 42 + run index and controls local Python/numpy, not remote model determinism. Default failure policy EXCLUDE with three retries can remove infrastructure failures from the denominator: preserve planned/completed/failed/excluded attempts and count unreplaced invalid episodes explicitly.

Outputs/figures and process-subevaluation analyses are derived baseline evidence. The latter depends on W&B artifact `health-portals/third_v2_benchmark/wandb-export-v2-trajs-with-usage:latest` plus local CSV and changes v2 metrics when process checks are removed. Mutable `latest` is not an immutable bundled oracle; no baseline was replayed. Disable inherited upload behavior with `WANDB_ENABLED=false`, no W&B credentials and no archive upload.

## Luna adapter blocker

Registry contains Luna but defaults to Stanford routing. [`OpenAIAgent`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/harness/agents/openai_agent.py) has no reasoning_effort constructor argument; runner passes it as a kwarg and registry bind validation rejects it. The direct OpenAI utility accepts selected GPT5 names and rejects Luna; gateway Chat Completions sends no effort. Its Responses branch also lacks an output cap and assumes first output item is text, unsafe if reasoning precedes messages. Generic openai-compatible is another chat protocol, not a proven fix. See [`harness/utils/openai_utils.py:OpenAIClient.call_api_with_retry`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/harness/utils/openai_utils.py#L9), direct Luna rejection at line 127 and parsing at line 213.

HAB's text-action syntax does not require native function calling; the demonstrated blockers are missing effort mapping and direct-Luna support. Proposed owned `--agent-module` AgentSpec preserves HAB prompt/history/action parser/traces while using direct Responses and exact Luna ID, medium/max, capped output, fixed standard mode/tier, robust message collection and no fallback. Include endpoint, response status/model/usage, reasoning/cache accounting, latency and truncation/incomplete state. Expose reasoning_effort for existing run_identity metadata. Mock the wire contract before billing. No adapter was implemented here.

## Dependencies, ports and resources

Python >=3.10; pins include Playwright 1.48.0, OpenAI 1.109.1, Anthropic 0.105.2, jmespath 1.0.1, numpy 2.2.6, pydantic 2.10.4; other graph members are unconstrained. `uv.lock` is absent and ignored. A generated lock/resolution/hashes must be captured and reviewed before a reproducible run claim. Python >=3.11 also selects tinker/transformers dependencies; installation can be substantial.

V3 portal package-lock pins Next 16.1.6 (declared package range ^16.1.1; Node >=20.9.0), React 18.3.1, TypeScript 5.9.3. Use existing verified Node 22 process-locally and `npm ci`. `hab install` additionally runs npm install for an unnecessary CUA sidecar even with skip-browser; do not invoke it for a Luna text-action setup. Check existing browser caches before any Chromium-only download; no `--with-deps`, apt, sudo or browser baseline changes.

Next startup script uses port 3002 without explicit host restriction. Later use a separately admitted free loopback port and foreground command `timeout 180s ./node_modules/.bin/next start --hostname 127.0.0.1 --port <approved-port>`. Do not claim/kill an existing 3002 listener. Browser navigation allows arbitrary URLs; environment is not a network sandbox. Download uses `tempfile.gettempdir()/suggested_filename`; assign unique Samsung TMPDIR per run. Disable CDP for text-action mode. Keep uv/npm/browser caches, venv, TMPDIR and output under owned `/workspace` roots, including browser subprocess scratch.

No GPU/image requirement was found for local Next+Chromium/hosted model. Repository metadata size 31,447 KB excludes environments/build/browser. Peak CPU/RAM/install bytes are unmeasured. Proposed initial planning ceilings: one worker, two CPUs, 4 GiB RAM, 8 GiB disk, 30-minute install-capture batch; stop if cap/hold/free-space admission fails. These ceilings are not verified sufficiency.

## Proposed install and smoke, pending approval

With existing qualified uv/Python, Node >=20.9, pinned task-owned checkout and all cache paths set:

1. `timeout 900s uv sync --no-managed-python` captures ignored lock (upstream has none); archive/hash and STOP for resolved graph/size/license review before further execution.
2. After compatible-cache review only, optional `timeout 300s uv run --no-sync python -m playwright install chromium`; skip if an existing compatible binary is qualified. No system dependencies/root changes.
3. In `benchmark/v3/portals`, `timeout 600s npm ci --no-audit --no-fund`, then `timeout 600s npm run build`, with `NEXT_TELEMETRY_DISABLED=1`.
4. Under network denial/no provider keys/no populated dotenv, `timeout 120s uv run --no-sync pytest tests/test_agent_registry.py tests/test_environment_state.py tests/test_judge_provider.py tests/test_truncation_policy.py -q` and `timeout 60s uv run --no-sync python scripts/check_tasks.py`. Inspect skips; conftest clears only one gateway key and browser tests can skip. These execute source code and have not run.

A new owned browser-state smoke must still be implemented and reviewed: launch local v3 build, capture title/screenshot, insert an invented unique sentinel state, invoke reset/clear, assert sentinel cleared in reused context, and separately a new context across independently constructed episodes, stop only owned PIDs. Do not call evaluate_episode (judge can bill). This is local plumbing, not benchmark success. Review aggregate duration against the30-minute cap; timeouts are individual ceilings and the global timer must stop the batch earlier if needed.

Later billed candidate: [`emr-easy-14.json`](https://github.com/som-shahlab/health-admin-bench/blob/b88844c8c3e42af717742d795b2c100e646b9b2b/benchmark/v3/tasks/prior_auth/emr-easy-14.json), missing referring provider REF-2025-507. Three checks: auth note added, referral not cleared, judge confirms note explains missing provider. No payer-auth/fax/download needed. Set general/screenshot_only/coordinate with fixed viewport,20 steps,600-second episode,one action/step; this is a reduced smoke versus paper easy40-step setting. One pair yields up to40 agent calls plus six judge completions (one rubric×three votes×two episodes), before retries. Output-only8192-token/call ceiling is327,680 tokens, about$0.164 at the documented Luna output rate; it excludes all inputs/images, judges, retries/tools and is not a total spend estimate or authorization.

One pair is connectivity evidence; three paired repeats are exploratory, not a superiority result. General vs skills also changes breadth/delivery of guidance, so it is not automatically a clean skill-only effect. Keep that experiment separate. Rollback closes exact owned browser/server PIDs, retains evidence/locks and removes only separately approved scratch; no service registration or cleanup of unrelated work. Outstanding: adapter, dependency lock, browser/network containment, actual resource measurements and full agent/judge spend approval.

Public source and synthetic fixtures are Apache-2.0 according to the pinned root LICENSE/README. Retain upstream copyright, license, notices and citation; no patient or gated handbook content is copied into this report.
