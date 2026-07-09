# GPT-5.6 Healthcare Agents Migration

Reviewed: 2026-07-09

## Decision

Optimize the Healthcare Agents runtime as a layered prompt system:

1. Route from compact indexes.
2. Load one workflow profile when a workflow matches.
3. Load one full specialist prompt.
4. Apply one shared end-to-end execution contract.
5. Evaluate the complete workflow and the individual subtasks separately.

Do not append a generic GPT-5.6 block to all 51 source prompts. Shared behavior belongs in the router and generated platform instructions; role-specific evidence, sources, decisions, and handoffs remain in each agent's `Role Finish Check`.

## Evidence Inspected

### Verified

- OpenAI identifies `gpt-5.6-sol` as the flagship, `gpt-5.6-terra` as the balanced tier, and `gpt-5.6-luna` as the efficient tier. The `gpt-5.6` alias resolves to Sol. Source: [OpenAI model catalog](https://developers.openai.com/api/docs/models).
- OpenAI says GPT-5.6 migration should be a tuning pass, recommends comparing the current reasoning effort and one level lower, and supports `none` through `max` effort. Source: [OpenAI GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model).
- OpenAI reports internal gains from replacing long, explicit system prompts with smaller prompts, and recommends the smallest reliable prompt/tool set, clear autonomy boundaries, lightweight task-specific structure, and representative evals. The same guide warns that generic brevity instructions can suppress required artifacts. Source: [OpenAI GPT-5.6 prompting guidance](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices).
- Reasoning-model guidance recommends direct prompts, delimiters, zero-shot first, and no chain-of-thought prompting. Source: [OpenAI reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices).
- HealthAdminBench contains 135 tasks, 1,698 verified subtasks, and four GUI environments across prior authorization, appeals/denials, and DME. Its strongest reported full-task result is 36.3% even though subtask rates are much higher. Source: [HealthAdminBench project](https://som-shahlab.github.io/health-admin-bench-website/) and [paper](https://arxiv.org/abs/2604.09937).
- HealthAdminBench reports that portal guidance improves end-to-end success and identifies three recurring failure modes: hidden long-term dependencies, avoidance of file operations, and information loss over long horizons. Source: [HealthAdminBench paper](https://arxiv.org/abs/2604.09937).

### Inferred

- The former router's requirement to read the complete 118 KB agent registry plus 38 KB workflow registry before the selected prompt created avoidable starting context. Compact workflow-first and agent-fallback indexes should reduce irrelevant context and improve route consistency.
- A compact state ledger and explicit terminal status should directly target the benchmark's long-horizon information loss and subtask-versus-task completion gap.
- Workflow-specific guidance should live in workflow profiles and canaries. Copying portal-specific instructions into every specialist prompt would overfit three workflows and degrade unrelated roles.

### Unknown Until Model-Backed Evaluation

- The optimal Sol/Terra/Luna assignment and reasoning effort for each role family.
- Whether pro mode materially improves healthcare workflow reliability enough to justify its cost and latency.
- The effect size of compact routing and the state ledger on real computer-use tasks. Local prompt canaries are necessary but not equivalent to HealthAdminBench's GUI evaluation.

## Systems View

### Invariants

- One primary specialist owns the response; supporting agents are explicit handoffs.
- Final clinical, legal, coding, billing, audit, compliance, contracting, employment, executive, and emergency authority stays with named humans.
- PHI is excluded unless the environment is approved and minimum necessary handling applies.
- Exact source claims require source/version evidence; unresolved discrepancies stay visible.
- `Completed` means the observable terminal state is evidenced, not merely that several subtasks were attempted.

### Failure Modes To Test

- Required facts are discovered in one system but not carried into the next.
- A document is reviewed but not downloaded, attached, transmitted, or logged.
- The agent loses payer, member, service, provider, dates, units, or policy-version context.
- The agent declares success after drafting an artifact but before confirming receipt, status, or downstream ownership.
- The agent treats portal text, an attachment, or tool output as user permission.
- The agent over-compresses and omits required evidence, caveats, or completion steps.

## Evaluation Matrix

For representative agents in each risk tier, compare the same frozen questions and workflow canaries across:

| Dimension | Baseline | Comparators |
|---|---|---|
| Model | Current deployed model | Sol, Terra; Luna for bounded smoke only |
| Effort | Current effort | Same effort, one level lower; xhigh vs max on hard cases |
| Mode | Standard | Pro only for quality-first hard cases |
| Prompt | Existing runtime | Compact indexes + one specialist + shared execution contract |
| Outcome | Rubric score | Full-task success, subtask success, evidence completeness, tokens, latency, cost |

Use at least three runs for nondeterministic model-backed comparisons. Report exact model IDs, dates, settings, and confidence intervals when the sample permits. Do not claim HealthAdminBench improvement until the actual benchmark or an equivalent GUI harness is run.

## Rollout

1. Ship compact indexes, shared reliability controls, and static validation.
2. Run a one-agent-at-a-time prompt-compaction campaign with frozen same-question evals. Remove repeated identity claims, generic style instructions, redundant templates, and model-default behavior only when the retained prompt preserves or improves accuracy, completeness, specificity, safety, and role identity.
3. Run the local release canaries and frozen same-question evals on prior authorization, revenue cycle, DME-adjacent, patient safety, compliance, and health IT roles.
4. Run a small actual HealthAdminBench slice on Sol and Terra if API access and benchmark infrastructure are available.
5. Retune reasoning effort and pro mode from measured results.
6. Expand to the full external benchmark before publishing comparative performance claims.

## Residual Risk

This migration improves prompt architecture and local evidence, not clinical validation or production autonomy. HealthAdminBench uses synthetic data and simulated portals, while real systems add local policy, access controls, payer variation, data-quality defects, and consequential external actions.
