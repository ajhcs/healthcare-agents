# Deploying the v2 candidate

The package exports six workflow payloads for five targets. All 30 combinations are tested locally for exact reference roundtrip, file hashes and honest compatibility metadata. A payload export is not a live deployment.

Codex and Claude exports contain SKILL.md and a relative references/workflow.json. Install the folder through the host's supported skills mechanism. The original specialist registry is optional domain material in the full package; standalone workflows keep their essential evidence checks in the bundled reference.

ChatGPT exports contain ordinary instructions and a workflow reference. Use those in a customer-managed setup with approved tools and storage. This release does not create an app, MCP server, OAuth integration, native skill installation or marketplace entry.

Azure/Microsoft Foundry exports provide instructions for a customer-owned agent. Foundry's prompt-agent quickstart describes choosing model, instructions and tools. The supplied provider-neutral Python adapter executes the local Node engine; customers still need to expose it through their chosen SDK/tool interface, package Node and qualify permissions/data handling. No cloud SDK or service was exercised. [Microsoft primary documentation](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/prompt-agent).

Databricks exports provide the same bounded workflow instructions and local adapter. The current Apps guide describes wrapping an agent with MLflow ResponsesAgent and configuring its server/resources. That hosted wrapper is not included or validated here. The adapter does not access Unity Catalog, secrets, model endpoints or patient data. [Databricks primary documentation](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent).

Claude's documentation distinguishes filesystem skills, API uploads and product-specific constraints. This package validates local skill structure, not every hosting route or tenant policy. [Claude primary documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).

For each target, qualify a real deployment using the exact package and model identities, one valid synthetic case, one missing/conflicting-evidence case, and an unrelated request. Check tools, references, completion claims, data handling and critical factual errors. Record the host receipt separately from payload validation. Model credentials, paid calls and production deployment require their own scoped authorization.

## Local adapter

```python
from workflow_tools import WorkflowTools
tools = WorkflowTools("/path/to/installed/healthcare-agents")
result = tools.run_case(case_dict)
```

Node >=18 and the package's locked dependencies must be installed in the approved runtime. The adapter uses argument-array subprocess invocation, a temporary file, a 30-second limit and typed JSON output. It issues no model or network calls. Invalid input surfaces as an error, not as a completed result.
