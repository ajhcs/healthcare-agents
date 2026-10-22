# Development checks and integration details

Run only checks appropriate to the change and the approved environment. Installer and consumer checks write disposable test installations; release checks include deterministic routing tests and static security checks. These are software checks, separate from model evaluation.

### Run the repository checks

From a development checkout with dependencies installed:

```bash
npm run test:admin-v2
npm run test:admin-adapter
npm run test:admin-consumer
npm run test:admin-mcp
npm run test:plugin-consumer
npm run test:routing-intent
npm run test:result-boundary
npm run test:codex-profile
npm run test:stdio-bridge
npm test
# Optional receipt importer, with the pinned Python validator installed:
HAG_EVIDENCE_PYTHON=/path/to/python-with-pydantic npm run test:public-evidence
```

The suites cover independently specified arithmetic, source attribution, missing/contradictory inputs, routing abstention, CLI file generation and target/workflow payloads. The adapter exercises all six cases through Python and the Node CLI. A clean-consumer test installs the npm tarball offline into a disposable project and checks external cases, provenance failures, payload references, builder and routing. Release checks retain schema, safety, review, installer and package gates. Generated text and installation simulations do not prove acceptance by every live client.

## Integration developer reference

| Host | Available integration | Evidence boundary |
| --- | --- | --- |
| Codex | Skills, portable plugin manifests and local stdio MCP | Packaged-server tests plus bounded native qualification on the documented POSIX host |
| Claude | Skills and correlated Messages client-tool callback | Local callback/contract tests; live Claude pending |
| ChatGPT | Plugin manifests and local MCP transport | Local protocol/packaging tested; remote web connection pending |
| Azure / Microsoft Foundry | Instructions and Responses function callback | Local bridge tested; SDK/model/tenant deployment pending |
| Databricks | Instructions and Chat Completions callback | Local bridge tested; hosted ResponsesAgent and tenant deployment pending |

For integration developers:

```bash
node bin/cli.js admin export codex denial-spike-workup --output ./codex-denials
node bin/cli.js admin export azure denial-spike-workup --output ./azure-denials
node bin/mcp-server.js --stdio
node bin/host-tool-bridge.js --list azure
```

Eight read-only MCP tools expose catalog discovery, the six validated calculations and an in-memory workflow draft. Strict schemas, provenance, cancellation, deadlines and structured errors apply. The [MCP and callback guide](../platforms/admin-v2-mcp.md) covers plugin launchers, loopback-only HTTP and host requirements. The [Python bridge](../../adapters/python/host_tools.py) requires Node and installed dependencies. No cloud SDK, credentials or customer-host service is installed by this package.


[Installation profiles](../../INSTALL.md) · [Custom workflow integration brief](custom-workflow-integration-brief.md)
