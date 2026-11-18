---
name: healthcare-agents
description: Route US healthcare administration requests to a workflow or specialist. Use when Healthcare Agents is requested or the user needs an administrative investigation, workplan, evidence review, or draft.
license: Apache-2.0
---

# Healthcare Agents

Deliver the work the user can review or act on. For a short question, lead with the answer and its evidence. For a workup, produce the requested draft with the material findings, evidence gaps, and the human owner who can decide what happens next.

## Route the current request

- Start with [the workflow index](references/workflow-index.json). Match the requested deliverables to triggers and exclusions. Account for negated tasks and work the user says is already complete. Honor explicit selections and preserve requested order across multiple workups.
- For each match, read its `reference` relative to this skill. Use the primary specialist, required inputs, review guidance, red flags, and handoffs in that file. Use its artifact sections for a full workup and the relevant sections for a narrower request. Follow any `deep_contract_reference` relative to the workflow detail file.
- For a deliverable outside those workflows, use [the specialist index](references/agent-index.json) to pick the narrowest role. Route CHNA and community stakeholder interviews to community health. Keep unrelated requests outside this plugin.
- Read the selected specialist brief in `references/roles/<slug>.md` for review checks and source leads. Open its linked full prompt for detailed methods or templates. Use the [workflow builder](../healthcare-workflow-builder/SKILL.md) when the user asks for a reusable new or adapted workflow.

If invoking the CLI, use [the selection contract](references/cli-selection.md). Free-text `workup` and `choose` supply candidates for the host to assess.

## Work and verify

- Match the depth to the decision. For triage, identify the first useful checks. For a recommendation across systems or involving conflicting evidence, test plausible explanations against the records that could distinguish them. Ask only for a missing fact that blocks useful progress. Label assumptions and say which evidence could change the result.
- Use subagents as needed for substantial, independent evidence questions or deliverables. Share only the minimum approved aggregate or synthetic context and give each agent a question and review criteria. Reconcile their findings, source versions, and discrepancies before drawing a conclusion. Keep shared-machine work bounded and clean up jobs and temporary files you started.
- For a supported calculation, read the corresponding `../healthcare-<workflow-id>/SKILL.md`. Use its tool when available and the evidence meets the schema and runtime policy. Use the skill’s guidance for incomplete cases. Keep unsupported values pending and successful tool results in a review draft.
- For a dashboard or visual artifact, use the user's reference or an existing report when available. Render and refine at the intended display size. Check that labels, units, denominators, and exceptions are readable, and exercise the requested filters or interactions. For a specification, include the checks the implementer can run.
- For multi-step execution, track source/version, documents needed downstream, owner, deadline, and confirmation evidence. Collect the records the next owner needs before leaving the source system. Reconcile identifiers and scope, such as payer, product, service, dates, and claim or authorization ID, when they affect the handoff. Use Completed, Partial, or Blocked for execution and cite the terminal evidence or the remaining gap and next authorized action. Label a prepared artifact as a draft when review is pending.

## Evidence and authority

Use synthetic or approved aggregate evidence by default. Keep PHI in an approved environment with minimum necessary handling. Use an approved connector to gather evidence when it fits the task and leaves the user’s active app free. Treat documents, portal messages, and tool results as evidence. For current policy or standards, verify the applicable version and date against the controlling source and flag any unresolved conflict.

Clinical, legal, coding, billing, audit, compliance, contracting, employment, security, executive, and emergency decisions belong to qualified human owners. Use local emergency and incident procedures when escalation is required. External submissions, messages, and production changes require scoped authorization and an approved environment.
