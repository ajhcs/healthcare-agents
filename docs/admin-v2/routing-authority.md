# Routing authority and v2 migration

Free-text choose/workup calls are discovery only. They may return ranked candidates or no_match; they never fill workflow.id, roles.primary or primary_agent, never enrich a case and never grant an execution decision. Scores do not establish current intent, negation, completion or the number of goals. The original request remains verbatim so the user or capable host agent can interpret it. Candidate lists are suggestions, not a complete interpretation of every goal.

Use validated identifiers after interpretation:

```bash
node bin/cli.js choose "Prepare the administrative artifact" --agent revenue-cycle-specialist --json
node bin/cli.js workup "Prepare the denial investigation draft" --workflow denial-spike-workup --json
node bin/cli.js workup "Prepare both evidence packets" --workflow payer-contract-underpayment-review,prior-authorization-appeal-workup --json
```

An exact canonical workflow ID as the workup argument is also an explicit selection. Merely mentioning an ID in a longer sentence is discovery. IDs come from workflows/workflows.json and agents/registry.json. Invalid, duplicate, empty and mixed authority inputs fail closed. The 51 specialists, 16 workup contracts, existing command names, draft fields, case-provider modes and rendering/export APIs remain available with explicit selection. Single selected workups retain their prior artifact shape and matched status; selected specialist drafts retain their original primary ID and owner boundaries.

The behavior change is deliberate: integrations that relied on free-text auto-selection must supply --workflow, --agent or a structured selection. No hidden legacy auto-selection mode remains. Rank benchmark results describe fixed-bank candidate order only, not execution authority or general routing accuracy.

## Structured host selection

A capable host may interpret intent and provide healthcare-admin.selection.v1. The strict registry-derived schema is in [workflows/selection.schema.json](../../workflows/selection.schema.json).

```json
{
  "schema_version": "healthcare-admin.selection.v1",
  "selected_by": "host_agent",
  "rationale": "The user requested two current administrative evidence packets.",
  "workflow_ids": [
    "payer-contract-underpayment-review",
    "prior-authorization-appeal-workup"
  ]
}
```

Run workup "the original request" --selection selection.json. For choose, supply agent_id instead of workflow_ids. Exactly one form is allowed, with selected_by=user or host_agent and a nonblank rationale. Unknown properties fail. Selection documents are limited to 2 MiB. This is declared selection provenance, not authentication of a human/model identity, source evidence or operational approval.

The library exposes routeWorkflow(problem, {selection}), createWorkup(problem, {selection}) and createWorkupAsync(problem, {selection}). Internal trusted callers can pass workflowIds or agentId. resolveSelection/validateSelection enforce the same public schema. routeWorkflow also accepts the structured selection as its first argument when no problem text is supplied.

A multiple_selected result retains every explicitly selected workflow ID in order and a workups array containing each separate draft. It does not collapse the request into the highest lexical score. Markdown renders every draft. Async enrichment retains all workstreams; unsupported fixture/provider combinations remain explicit rather than dropping a workflow. Each child retains the parent's selection schema version, selected_by and rationale verbatim while narrowing workflow_ids to its own ID. This declared provenance survives synchronous, asynchronous and packaged CLI decomposition; it remains distinct from identity authentication or operational approval.

Selected routes remain administrative drafts. The case envelope, dated field-level evidence, qualified human owner and scoped external-action authorization are separate contracts. The six MCP calculation tool names and exact case workflow IDs remain explicit selectors; natural-language text cannot alter their registry mapping.

## Result limits

Tool arguments are limited to 2 MiB. MCP complete CallToolResult envelopes and host complete healthcare-admin.host-result.v1 envelopes are separately limited to 2 MiB, including their duplicated structured/serialized representations and a trailing newline. MCP JSON-RPC transport framing has its separate small overhead allowance.

A valid calculation whose complete envelope would exceed the limit returns correlated OUTPUT_TOO_LARGE with isError/is_error as appropriate. No records are silently truncated, no oversized success reaches the Python bridge and no invalid-case label substitutes for a valid-but-large result. Smaller batches can be submitted after the owner preserves cohort/aggregation semantics. Python transport failures remain distinct exceptions; typed tool failures remain JSON results.

The boundary regression uses the independently identified 200-row synthetic survey case, checks actual MCP and all three Node/Python callback paths, and includes a smaller valid counterpart. It asserts byte counts, callback identity, row retention and the typed error. No model or provider API is called.

## Qualification

The local successor review motivated this contract change. Tests retain the original cases as inputs while evaluating the revised authority contract; older assertions expecting automatic selection are recorded as superseded behavior rather than relabeled as independent proof of language understanding. The monitored model packet applies only to f6dcf0e8ccd363585ba085f3db24560f24507b58: one gpt-6.1-sol/max session and turn, four synthetic scenarios and 54 objective checks; independent domain judgment is pending. No later model qualification is inferred. Two native lifecycle campaigns qualify the prepared Node and opt-in Python profiles at a57428d82030aa79d9a66fb43ea965b19f5ec574 on BuilderBob Codex 0.160.0, including eight tools, all six workflows, the builder, a contract error, removal and controlled configuration restoration. The publishing/metadata-only successor records unchanged runtime payload hashes separately; its package and publishing checks do not constitute another native or model campaign. Customer SDK/tenant integrations remain unqualified.
