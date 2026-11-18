# Pass selections to the Healthcare Agents CLI

Use `workup` or `choose` to inspect free-text candidates. For a host-inferred route, pass the original request and a selection record.

```bash
healthcare-agents workup "<original request>" --selection <file> --json
healthcare-agents choose "<original request>" --selection <file> --json
```

Use `schema_version: "healthcare-admin.selection.v1"`, `selected_by: "host_agent"`, and a short `rationale` grounded in the current deliverable or evidence. Supply `workflow_ids` for the selected workups in requested order or `agent_id` for one specialist. Keep selection records free of patient identifiers.

Use `--workflow` and `--agent` for IDs explicitly selected by the user. For a mix of user-selected and inferred IDs, make separate calls and present the drafts in requested order. Use the original request text in each call.
