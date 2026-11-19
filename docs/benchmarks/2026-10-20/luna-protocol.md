# Luna Medium versus Max protocol — proposed, no runs

This protocol is source-grounded preparation. It grants no API spending, credentials, installs, patient-data use or service exposure. The four adapters are not currently accepted for this comparison. A small smoke establishes readiness only; it cannot support a superiority claim.

## Official identity and request contract

Official OpenAI documentation fetched October 20, 2026 confirms exact `gpt-6-luna`, with `medium` and `max`. The model page lists only the alias, not a dated immutable weight snapshot; retain returned `response.model`, response/request IDs and timestamps, and do not claim weight immutability. Account entitlement, quota and actual request acceptance remain untested. [Model reference](https://developers.openai.com/api/docs/models/gpt-6-luna).

Use `POST https://api.openai.com/v1/responses`, explicit `model: "gpt-6-luna"`, `reasoning: {"effort":"medium","mode":"standard"}` or the identical object with effort `max`. Standard and pro are independent of effort; keep mode fixed. Map SDK `client.responses.create` to that wire request. A proposed first request uses `max_output_tokens: 4096`; this is a per-response ceiling, not a whole-episode budget. [Reasoning/mode documentation](https://developers.openai.com/api/docs/guides/reasoning).

For reasoning with tools, use Responses. Luna Chat Completions function calling supports effort none only. Remove temperature, top_p, top_logprobs, Chat logprobs and Responses logprobs include when reasoning is enabled. Do not silently drop effort, route through another provider or replace max with xhigh. These constraints require offline adapter boundary tests. [Deployment checklist](https://developers.openai.com/api/docs/guides/deployment-checklist).

The initial design selects standard processing, fixed global endpoint/residency, fixed reasoning mode, identical caching policy and no automatic provider/model fallback. Verify the current API/SDK representation of service tier during implementation and record effective returned tier; do not assume the word standard is itself a service_tier enum. No implementation or paid preflight was performed here.

## Adapter acceptance gates

| Benchmark | Pinned limitation | Required reviewed adaptation |
|---|---|---|
| K-NHIB | Old model allowlist; no explicit effort; text-input/scorer/replicate defects | Exact Luna allowlist plus Responses effort/mode/budgets; repair row identity and scorer; use verified pdf condition initially |
| PhysicianBench | Chat/OpenRouter extension; max rejected; host tools unconstrained | Responses tool loop preserving reasoning/tool items; explicit backend and confinement; max enum and full usage |
| CHI | Responses path exists; max excluded; mode/output/aggregate limits not exposed | Extend max explicitly; validate SDK/routing; explicit mode, ceilings and failure accounting |
| HAB | Effort constructor rejected; direct utility excludes Luna; Stanford defaults | Owned AgentSpec/Responses adapter preserving text-action contract, complete parser and budget metadata |

Mocks must assert exact endpoint/model/effort/mode, no sampling parameters, one capped response, multi-turn continuation/call IDs, robust collection of message output when reasoning precedes text, refusal/incomplete/timeout/error handling, accurate cached/reasoning usage and zero hidden retries/fallback. Validate wire serialization against the chosen pinned SDK. A fake transport proves request construction, not provider acceptance. A separately approved tiny synthetic API preflight is still required.

## Matched experiment design

Freeze benchmark runtime SHA, effective data SHA/hash, patches/lock/image/browser, task/gold/rubric hashes, tools and interface, prompt/skill delivery, judge and simulator providers/models/settings, viewport, dates, locale, budget, timeout and retry policy. Store private gold/rubrics separately from the agent-visible task. Do not place expected answers, solutions, hidden states or other-arm outputs in model context.

Unit of pairing: benchmark × base case × replicate, with both efforts. Block by domain/difficulty and counterbalance Medium/Max order. Concurrency one initially; never share mutable DB, container, browser profile, output root or port between episodes. Create fresh state, verify reset/initial checksums, then run. A failed reset is operationally invalid, never a task pass. CHI coupled tasks must preserve both-agent configuration and root-case lineage; treating their components as independent samples overstates precision.

Start with unbilled synthetic harness checks. Then a separately authorized single pair checks plumbing; three matched repeats per effort on selected cases can explore variance. An expanded sample/precision plan requires baseline variability; three repeats or one case cannot establish population superiority. Use paired task-level deltas, uncertainty intervals and resampling clustered by base case (not independent checkpoints/repeats). Report case selection and all exclusions.

Keep initial effort comparison at one fixed skill condition. A later skill/no-skill factorial uses the same task pairs and pins skill source/hash, exact loaded content and tool/discovery behavior; merely making a skill available does not establish equal exposure. HAB general-versus-skills changes guidance scope/delivery, and CHI's required handbook is not an optional healthcare skill. Report these distinctions.

## Budgets, costs and stopping

A controller must enforce aggregate episode limits across every continuation and tool round. Decrement remaining output allowance before each request and stop before the next call if remaining input/output/call/time/spend ceilings cannot admit it. Count repeated prompt/history tokens, reasoning output, retries, cache writes, images and all billable model calls; max_output_tokens alone is insufficient. Count simulator and grader limits separately. SDK retries must be explicit; first readiness pair uses zero automatic retry and retains uncertain billed outcomes. A timed-out request may still incur cost: classify usage UNKNOWN until reconciled, not zero, and never retry an uncertain side effect blindly.

Illustrative starting caps, pending per-task inspection/tokenization: 100,000 aggregate input tokens, 20,000 aggregate output tokens, at most 20 agent calls, 600 seconds/episode, no search/built-in paid tools, and a smaller per-call output ceiling bounded by remaining episode allowance. These are planning ceilings, not enforced code or measured task sufficiency. Cases needing more capacity require a revised proposal, not silent expansion. Judge/simulator request counts must be bounded before submission; if actual provider/token usage cannot be captured, reject cost-completeness claims.

Current [Standard pricing](https://developers.openai.com/api/docs/pricing), for short-context global processing: $0.10/M uncached input, $0.01/M cache read, $0.125/M 30-minute cache write, $0.50/M output. Reverify at approval. Requests above 272k input, regional processing, other tiers and longer cache retention have different rates. Use distinct billed categories without double-counting:

`agent dollars = (0.10 * uncached_input + 0.01 * cache_read + 0.125 * cache_write_30m + 0.50 * output) / 1,000,000`

Output includes billed reasoning. Add image/input accounting and all judge/simulator/tool charges under their actual pricing. Price cache writes at the selected retention; do not treat missing usage as cache-free. Preserve actual invoice/usage reconciliation where available.

| Proposed smoke | Logical episode count | Base uncached Luna token arithmetic at above aggregate caps | Other spend and limits |
|---|---:|---:|---|
| K-NHIB first cervical pos/neg/unk, one pair each | 6 | ≤$0.12 | PDF input tokens must be counted; no judge/search; adapter/selector absent |
| Same three cases, three paired replicates | 18 | ≤$0.36 | Exploratory only, not current approval |
| Physician invented harness, mocked client | 1 | $0 API spend | No patient/FHIR image; missing fixture must be implemented/reviewed |
| CHI placeholder/mocked harness | selected offline tests | $0 API spend | Install/network/resource scope still pending |
| HAB emr-easy-14, one pair | 2 | ≤$0.04 agent component | Six nominal judge completions, unknown full judge/input cost; not total bound |

The small dollar arithmetic assumes the caps are enforced and complete, no retry charges outside them, short requests, uncached input and no other billable categories. It is not a measured estimate. HAB's uncapped upstream per-call example is larger; use the controller ceilings for the proposed owned run. No whole-task CHI/native PhysicianBench spend estimate is defensible before fixture/image/access/adapter review. No full-suite run is proposed.

## Durable evidence and outcome contract

Use owned local JSON manifests, request/response receipts, trajectory/final-state bundles and a CSV episode table, with SHA256 inventory and sanitized provenance. Raw artifacts stay private if data/handbook terms require it; Git contains only approved public-source reports and synthetic templates. Keep this benchmark experiment independent of the project's role-prompt self-improvement scores; do not append unrun benchmark scores to eval/results.tsv.

Each planned episode gets an immutable row, even on timeout, failed reset, unavailable judge, refusal or abort. Minimum fields:

- identity: episode_id, pair_id, benchmark/version/source SHA, task/base case, fixture/effective-data hash, replicate/seed, effort, model requested/returned, provider/endpoint, SDK/adapter patch hash, timestamps;
- execution: prompt/skill hash and actual delivery, tools, mode/tier/cache policy, state-before/after hashes, steps/calls/retries, per-call and aggregate budgets, timeout/truncation/refusal/incomplete details;
- grading: expected/checkpoint/rubric version, raw upstream score, accepted operational validity and reason, strict task success, deterministic outcomes, judge votes and missingness, critical failures;
- resources: agent/judge/simulator input/output/reasoning/cache categories, billed/estimated/unknown cost and pricing date, request latency, episode wall time and startup/reset/grading latency separately;
- artifacts: paths/hashes for full sanitized receipts, traces, screenshots, outputs and final-state snapshot, cleanup IDs/status, accounting coverage.

Reasoning tokens are a usage count, not an obligation to retain private chain-of-thought text. Keep supported response/continuation artifacts securely without publishing internal reasoning. Record judges separately from agent outputs, and do not award task success from conversational completion alone.

Report durable outcomes and critical errors per benchmark, plus planned/completed/invalid/timeout counts, scoring/accounting coverage, paired effort deltas, cost per valid success and latency distributions. Do not pool clinical, Korean reimbursement and US administrative results into a single competence score without a declared weighting/scope argument.

## Portable evaluation ownership

Official [deprecations](https://developers.openai.com/api/docs/deprecations) mark Evals read-only October 31 and shutdown November 30, 2026; fine-tuning availability is separately restricted, with further January 2027 changes. Therefore keep evaluation artifacts/rubrics/analysis under our control rather than creating a dependency on legacy Evals. This protocol does not assume Astra or Luna fine-tuning availability, approve a training job, or make an acceptance/publication claim.
