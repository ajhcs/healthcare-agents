# Eval Model Tuning

This is volatile operating guidance for healthcare-agent eval runs. The GPT-5.6 guidance below was reviewed on 2026-07-09 against the official [model guidance](https://developers.openai.com/api/docs/guides/latest-model), [model catalog](https://developers.openai.com/api/docs/models), and [reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices). Every run must still pin the exact deployed model ID and configuration.

GPT-5.6 is a tuning migration, not a slug replacement. Use smaller prompts, explicit authority and success criteria, lightweight task-specific structure, and representative same-question evals. Do not assume maximum reasoning, pro mode, or the longest prompt is best.

## Roles

| Role | Model class | Effort | Temperature | Tools and search | Contract |
|---|---|---:|---:|---|---|
| Parent orchestrator | GPT-5.6 Terra or reliable equivalent | Medium | 0-0.3 | Filesystem and git allowed | Owns preflight, fixed-question persistence, line caps, run manifests, result logging, commit/revert. |
| Scorer/judge | GPT-5.6 Sol or strongest available reasoning model | High, xhigh, or max after comparison | 0-0.2 | Read-only files; no web unless the run explicitly permits it | Generates questions, scores answers against `eval/rubric.md`, cites evidence from the answer, and produces an improvement brief. |
| Editor | GPT-5.6 Terra or fast strong equivalent | Low-medium | 0.2-0.5 | Edit only the assigned agent prompt | Implements the scorer brief without broadening the role or changing eval files. |
| Adjudicator | GPT-5.6 Sol or strong model from a different family than the scorer | High, xhigh, or max | 0-0.2 | Read-only | Resolves close, disputed, or suspicious scoring decisions. |
| Meta-eval judge | Strongest available model or mixed panel | High or max | 0-0.2 | Read-only | Checks scorer drift, bias, calibration cases, and overfitting risk. |
| Bounded smoke runner | GPT-5.6 Luna or efficient equivalent | Low-medium | 0-0.3 | Scenario-limited | Runs deterministic routing, format, refusal, and obvious-regression checks; never owns high-risk release scoring. |

## Model Selection

Choose by role capability, then pin the exact ID in the run manifest. For the OpenAI family, `gpt-5.6-sol` is the quality-first flagship (`gpt-5.6` aliases to Sol), `gpt-5.6-terra` balances intelligence and cost, and `gpt-5.6-luna` is the efficient high-volume tier.

- Parent orchestrator: start with Terra at medium. Use Sol when orchestration itself is complex or a lower tier misses file and state constraints.
- Scorer/judge: start with Sol at high or xhigh. Compare max only on the hardest quality-first cases; use pro mode only when a measured reliability gain justifies added latency and tokens.
- Editor: start with Terra at low or medium. It should implement targeted prompt changes, not judge its own work.
- Adjudicator: prefer a different model family or provider lineage than the scorer when available; otherwise use an independently prompted Sol run with calibration cases and no access to the first judge's rationale.
- Meta-eval judge: use the strongest available model or a small mixed panel when judge drift would materially affect a release decision.
- Luna: reserve for repeatable, low-risk smoke checks. Do not use Luna alone to grade coding, compliance, medication safety, patient safety, legal-risk, or payment-integrity prompts.

Do not treat a durable tier name or UI label as the exact deployment identity. Record the model ID, date, effort, mode, temperature, reasoning context, and role isolation that produced the result.

## Runtime Settings

- Preserve the prior model's reasoning effort as the first GPT-5.6 baseline, then compare one level lower. Measure task success, answer completeness, required evidence, tokens, latency, and cost.
- Scorer/judge: high or xhigh reasoning effort, low temperature, prioritized but evidence-complete output. Test max rather than assuming it wins.
- Editor: moderate effort, moderate temperature, bounded by the improvement brief and line cap.
- Parent: deterministic settings are preferred because it is making filesystem and git decisions.
- Adjudicator/meta-eval: high reasoning effort, low temperature, and explicit comparison against calibration expectations.
- Pro mode is an API execution setting, not a prompt instruction. Use the same outcome-focused prompt in standard and pro comparisons.
- For independent eval iterations, use current-turn reasoning context. Preserve reasoning across turns only when the goal, assumptions, and priorities remain stable; stale context can contaminate later scoring.
- Search: default off for normal `/eval` scoring because the rubric judges against the agent prompt, not external truth. Enable search only for a separately documented research or baseline-building run.
- Tools: scorer, adjudicator, and meta-eval roles should be read-only. The parent owns writes to `eval/results.tsv`, manifests, and git. The editor only touches the target agent file during a normal eval run.

## Prompting Style

GPT-5.6 needs clear contracts more than accumulated prompt mass.

- State file boundaries and role boundaries once, concretely.
- State the goal, relevant context, constraints, required evidence, observable success criteria, and the narrow output shape.
- Start with zero-shot instructions. Add examples only when a fixed eval demonstrates a specific gap.
- Ask judges to cite response evidence, not preference or external memory.
- Ask editors for targeted improvements tied to scored weaknesses.
- Avoid generic "make it better" instructions.
- Do not ask the model to think step by step or reveal chain of thought.
- Avoid global "be concise," "keep it short," or "minimal text" instructions. Tell the model what must survive compression: the conclusion, evidence, material caveat, and next action.
- Prefer a lightweight task outline over a universal response template.
- Keep only task-relevant tools and context. Do not load the full agent registry, full workflow registry, and multiple specialist prompts when one compact route and one specialist prompt suffice.
- Avoid excessive all-caps language except for frozen safety rules already present in canonical workflow files.

## Manifest Fields

When a run log exists, record at least:

- `agent_slug`
- `timestamp_utc`
- `git_branch`
- `git_commit_before`
- `git_commit_after` when available
- `target_file_hash_before`
- `target_file_hash_after`
- `rubric_hash`
- `role_baseline_hash` or `null`
- `question_source`: generated, train-bank, validation-bank, holdout-bank, or calibration
- `question_artifact`: path to the full preserved question set, usually `questions.md`
- `question_artifact_complete`: true only when all full prompts are present
- `parent_runtime`: Claude Code, Codex, or other runtime
- `parent_model_id`
- `parent_effort`
- `scorer_model_id`
- `scorer_effort`
- `scorer_temperature`
- `editor_model_id`
- `editor_effort`
- `editor_temperature`
- `adjudicator_model_id` or `null`
- `meta_eval_model_id` or `null`
- `search_enabled`
- `tool_permissions`
- `line_cap`
- `status`: improved, reverted, capped, calibration-only, or review-only
- `calibration_status`: not-run, passed, warning, or failed

Exact model IDs should be copied from the runtime or provider response, not inferred from UI labels. If only a UI label is available, record the label and mark `model_id_precision` as `ui-label-only`.

## When To Escalate

Use an adjudicator or meta-eval pass when:

- `score_post_edit - score_pre_edit` is small enough that judge noise could flip the decision.
- The scorer rewards a long answer that is vague or unsafe.
- The scorer gives high accuracy without citations required by the rubric.
- The edit improves the exam questions but weakens the agent's role identity.
- The target role is compliance, legal-risk, patient safety, coding, payment integrity, medication safety, or another high-risk domain.

## What Not To Do

- Do not reintroduce the retired Python harness.
- Do not add DSPy, GEPA, MIPRO, OpenRouter benchmark routing, or external benchmark automation to the normal loop.
- Do not let the editor choose the final score.
- Do not compare scores across different question sets as if they were interchangeable.
- Do not log secrets, API keys, PHI, patient data, or private operational credentials.
