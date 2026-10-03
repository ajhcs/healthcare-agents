# MCP tools and customer host callbacks

The candidate includes an official-SDK MCP server, eight read-only administration tools, portable plugin manifests and local callback adapters. All tools reuse the six case contracts and the custom builder. They return review drafts and declared provenance; they do not submit claims, contact people, write generated workflow files or change operational systems.

## Start locally

Install dependencies before starting the server. Node >=18.14.1 is the declared minimum; this slice was exercised on BuilderBob Node 18.19.1. The MCP SDK is pinned to 1.31.0. The Node HTTP adapter is pinned to 1.19.11 as a direct dependency and source override to avoid its newer Node 20 requirement.

```bash
npm ci --ignore-scripts
node bin/mcp-server.js --stdio
# A separate terminal/client can connect to this loopback endpoint:
node bin/mcp-server.js --http --port 3000
```

Stdio emits protocol messages on stdout and generic diagnostics on stderr. Streamable HTTP binds only 127.0.0.1 at /mcp, validates Host and browser Origin, and rejects other paths. It has eight sessions, a five-minute idle expiry, a ten-second request limit and a bounded body. DELETE ends a session. HTTP disconnect alone is not MCP cancellation; send the cancellation notification through the client.

The server defaults to synthetic-only input. An accountable operator may select --allow-aggregate at process launch after qualifying the environment and data handling. Model arguments cannot enable that policy. Declared aggregate origin is not source authentication or PHI detection. The loopback HTTP service has no authentication and is only a local test surface; do not expose it through a proxy, public bind or shared tenant.

## Tool contract

| Tool | Arguments | Result |
| --- | --- | --- |
| get_admin_workflows | {} | Six workflow contracts, evidence fields and completion gates |
| investigate_denial_spike | {case: healthcare-admin.case.v2} | Rates, percentage points, relative change; recovery remains null |
| model_access_capacity | {case: healthcare-admin.case.v2} | Net weekly capacity and bounded backlog scenario |
| review_survey_evidence | {case: healthcare-admin.case.v2} | All findings/owners plus missing-evidence gaps |
| prepare_appeal_evidence | {case: healthcare-admin.case.v2} | Supplied calendar window and document gaps |
| review_payment_variance | {case: healthcare-admin.case.v2} | Signed and positive-only USD variances |
| summarize_discharge_barriers | {case: healthcare-admin.case.v2} | Aggregate counts and reported days; no discharge decision |
| draft_custom_workflow | {specification, specification_provenance} | Three file contents and SHA256 hashes, returned in memory |

Each calculation tool requires its exact workflow ID, a human owner and dated field-level evidence. Schemas reject unknown properties, impossible counts and invalid dates. Specification provenance requires origin, as_of and description. A synthetic runtime requires synthetic provenance. Custom steps/acceptance are shape-validated prose; a qualified owner still reviews their meaning and authorization.

Every output has either {ok:true,result} or {ok:false,error:{code,message,retryable}} in structuredContent, plus the same serialized JSON as text. isError identifies failure. Tool errors are CONTRACT_INVALID, MODE_NOT_ALLOWED, INPUT_TOO_LARGE, OUTPUT_TOO_LARGE, CANCELLED, TIMEOUT, BUSY and INTERNAL_ERROR. Unknown tools fail at the MCP protocol layer. Errors do not echo supplied records.

The runtime allows four simultaneous worker calculations, each with a five-second deadline and a 96 MiB old-generation worker limit. Tool arguments are bounded at 2 MiB. Complete MCP tool-result and host callback envelopes, including both structured and serialized representations plus a newline, are bounded at 2 MiB. Oversized valid results return typed OUTPUT_TOO_LARGE; protocol frames retain a separate small overhead allowance. BUSY and TIMEOUT are retryable. MCP cancellation terminates a worker and frees capacity; shutdown cancels remaining jobs. Capacity is bounded rather than queued. All annotations are readOnlyHint=true, destructiveHint=false, idempotentHint=true and openWorldHint=false, matching the absence of local writes and external calls.

## Plugin packaging and Codex

Root plugin.json and mcp.json follow the pinned Agent Plugins 1.0.0 schemas. The OpenAI fallback .codex-plugin/plugin.json points to .mcp.json. Both launch Node using the host's PLUGIN_ROOT macro and require installed dependencies. The clean-consumer test validates the official schemas, expands the launcher macro and starts the actual packaged server from a path with spaces. Macro expansion in that test is a local launcher-contract test; it is not native plugin activation.

The candidate contains eight filesystem skills. It does not advertise the draft MCP skills-import extension, create an app registration ID or add a marketplace. No marketplace submission or public registration has occurred.

For an owner-qualified Codex configuration, the local server can be registered without changing the plugin manifest:

```toml
[mcp_servers.healthcare_admin]
command = "node"
args = ["/absolute/path/to/healthcare-agents/bin/mcp-server.js", "--stdio"]
startup_timeout_sec = 20
tool_timeout_sec = 20
```

The included-allowance evaluation uses per-invocation configuration, read-only sandboxing and the existing ChatGPT-authenticated launcher. See the separate model campaign receipt for the actual version, model, task outcomes and limits. Native marketplace/plugin installation is a different acceptance gate.

## ChatGPT

The same tools can be used by a customer-operated remote MCP service, but the provided HTTP transport is loopback-only. A web ChatGPT connection requires an approved reachable transport, registration/connect flow, authentication where needed, governance and tenant qualification. This slice creates none of those resources. A local SDK client success does not establish a live ChatGPT web deployment.

## Claude, Azure and Databricks callbacks

The adapters generate eight shallow provider schemas and correlate callback IDs. Each tool takes payload_json, the serialized full local tool arguments. Keeping one wire property avoids relying on provider support for nested patterns/compositions. The full strict schema remains enforced locally; a model-generated string does not bypass it. Only normalized fields shown below are accepted. Extract those fields from the SDK object rather than forwarding extra metadata.

```bash
node bin/host-tool-bridge.js --list claude
node bin/host-tool-bridge.js --list azure
node bin/host-tool-bridge.js --list databricks
```

adapters/hosts/contracts.js exports definitionsFor(target) and dispatch(target, call, runtime, signal). Caller-owned AbortSignal and the central deadline apply. bin/host-tool-bridge.js accepts one bounded {target,call} JSON envelope on stdin and returns healthcare-admin.host-result.v1. Its stdin deadline is ten seconds. The callback result carries both the provider-shaped tool_result and structured_content.

| Target | Normalized input | Correlated output | Customer binding |
| --- | --- | --- | --- |
| claude | tool_use: type,id,name,input.payload_json | tool_result with tool_use_id, content, is_error | Append result to the client-tool user message; preserve message ordering |
| azure | function_call: type,call_id,name,arguments | function_call_output with call_id and output | Microsoft Foundry/OpenAI Responses callback loop; retain caller-owned conversation |
| databricks | Chat Completions call: id,type=function,function.name,function.arguments | role=tool, tool_call_id, content | Foundation Model API callback loop; qualify model-specific schema/turn constraints |

The Databricks adapter uses the documented Chat Completions shape, not an implemented MLflow ResponsesAgent deployment. Databricks recommends ResponsesAgent for hosted agents; customers must wrap and qualify that lifecycle separately. Model-serving documentation describes a JSON Schema subset and model-specific limitations. These shallow schemas avoid patterns/composition and contain one parameter; live acceptance remains untested.

A standard-library Python bridge is provided for customer Python hosts:

```python
from host_tools import tool_definitions, run_host_call
tools = tool_definitions("azure", package_root="/path/to/healthcare-agents")
normalized = {
    "type": "function_call", "call_id": "customer-call-id",
    "name": "get_admin_workflows", "arguments": '{"payload_json":"{}"}'
}
result = run_host_call("azure", normalized, package_root="/path/to/healthcare-agents")
# Submit result["tool_result"] through the customer-owned SDK loop.
```

Python invokes Node with an argument array, a bounded input/output and a 15-second subprocess deadline. No cloud SDK, credentials, model API call, Unity Catalog access, tenant resource or trace sink is installed here. Customers own SDK/model pinning, Node packaging, approved storage, permissions, request cancellation and the decision about which fields may enter provider traces. The local tests prove callback shape, ID correlation, calculation, contract errors and cancellation; they do not prove cloud tenant compatibility.

## Sources and acceptance

Documentation reviewed for this slice:

- [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins) and [MCP server guidance](https://developers.openai.com/plugins/build/mcp-server).
- [Codex MCP configuration](https://developers.openai.com/codex/mcp).
- [MCP tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), [transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) and [cancellation](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation).
- [Claude client tool handling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls).
- [Microsoft Foundry function calling](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/function-calling).
- [Databricks function calling](https://docs.databricks.com/aws/en/machine-learning/model-serving/function-calling) and [agent authoring](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent).

Run test:admin-mcp, test:host-contracts, test:result-boundary, test:plugin-consumer and test:routing-intent, then npm test. The plugin schema snapshots include source URLs and byte hashes under docs/admin-v2/plugin-schemas. Qualify each actual customer host with a valid synthetic case, a missing/conflicting-evidence case and an unrelated request; record the exact host/model/package identities and remaining external-action gates.

Free-text discovery and explicit host selections follow the [routing authority contract](../admin-v2/routing-authority.md). The prior model campaign is historical snapshot evidence, not a new campaign for this repair.

## Receipt preprocessing

Operators can use the [Data MCP receipt importer](../admin-v2/data-mcp-import.md) before submitting a case. The full evidence sidecar must accompany human review. This does not add a ninth MCP tool or grant aggregate execution to customer callbacks. Python/Pydantic is an optional importer dependency; the existing callback bridge remains Node-based.
