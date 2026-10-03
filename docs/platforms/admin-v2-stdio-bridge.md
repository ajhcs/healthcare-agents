# Codex local package profile

The tested local profile prepares an independent npm install and registers its MCP server through the plugin manifest. Node is the default; Python is optional. Native acceptance is qualified on BuilderBob with Ubuntu 24.04, Node 18.19.1, npm and Codex CLI 0.160.0. Windows, other hosts, ChatGPT and other clients require their own acceptance.

## Prepare and activate

From this checked-out beta or its installed npm package:

    node scripts/stage-codex-plugin.js --output "$HOME/healthcare-agents-codex-local"
    codex plugin marketplace add "$HOME/healthcare-agents-codex-local"
    codex plugin add healthcare-agents@healthcare-agents-posix-local

Start a new Codex thread. This Node profile requires existing Node >=18.14.1 and npm on PATH; it does not require Python. Preparation installs the independent package dependencies with lifecycle scripts disabled, creates a local marketplace, and captures its owned package path in MCP arguments. The official plugin manager activates the package-owned registration. No per-thread MCP override, cache-path lookup, credential or security-setting change is required. Preparation itself does not write Codex home or activate a plugin.

Use a new output directory with an existing parent. Existing directories and symlinks are refused. Keep the directory at its original location while installed: it holds the independent npm package, dependencies, local marketplace and receipt. Add --name for a distinct marketplace name, or --offline when the npm dependency cache is populated. An offline cache miss fails without a success receipt. A failed dependency install leaves the newly created directory for diagnosis; use another new directory for a retry.

Preparation verifies the existing Node executable, validates the primary MCP manifest against the pinned official schema, and follows the [Agent Plugins 1.0 executable rules](https://agent-plugins.org/specification#stdio). Commands use bare executable names; configured absolute commands are invalid under that specification even when the JSON schema accepts a string. Both staged mcp.json and .mcp.json are normalized from an unchanged Node template. The source portable manifests stay unchanged. The staging receipt records resolved executable versions, tarball and lockfile hashes, resolved dependencies, every staged package file, and deliberate manifest changes. Captured package paths make this profile host-specific: restage on another machine.

## Optional POSIX Python bridge

To select the standard-library bridge instead, add --stdio-bridge to the preparation command and use a new directory:

    node scripts/stage-codex-plugin.js --stdio-bridge --output "$HOME/healthcare-agents-codex-bridge"

Use the same two plugin-manager commands above with that directory. Requires an existing POSIX Python >=3.8 on PATH; --python python3.12 selects a different existing bare executable name. Absolute interpreter names are rejected before output creation. Preparation never installs Python, Pydantic or a cloud SDK. The bridge records the verified Python executable and passes the verified Node executable through --node. Bridge native acceptance is qualified on the same BuilderBob host with Python 3.12.3.

Both profiles passed clean native install/activate, eight skill discovery, plugin-owned registration of eight tools, all six mapped synthetic workflows, the custom builder, typed invalid-input rejection, removal and exact prior profile restoration. This is model-free tool and deployment acceptance. It does not qualify model quality or other customer platforms.

## Remove

    codex plugin remove healthcare-agents@healthcare-agents-posix-local
    codex plugin marketplace remove healthcare-agents-posix-local

After removal, the owner may delete only the output directory they created. The package does not recursively remove a guessed directory or modify unrelated plugins. Native acceptance compares exact prior configuration bytes, mode, plugin rows, marketplace rows, HOME and CODEX_HOME after removing the owned test entry.

## Remaining host limitation

A separate minimal reproduction on this host shows that sandboxed Node child processes using inherited socket stdio cannot perform getsockname/shutdown and may exit without delivering data. The bridge gives the unchanged Node MCP server anonymous pipes. This restriction remains on that process surface; it does not block the tested package-owned Node profile above. Early profiles also had invalid absolute command/cwd fields and failed discovery; those failures do not establish a host stdio defect. The earlier portable native handshake failure remains a distinct observation; this profile avoids runtime package-path expansion and explicit cwd through a conformant configuration.

An already installed package can also use the earlier process-scoped bridge integration:

    codex -c 'mcp_servers.healthcare-admin.command="python3"' \
      -c 'mcp_servers.healthcare-admin.args=["-B","/absolute/plugin/bin/mcp-stdio-bridge.py"]' \
      -c 'mcp_servers.healthcare-admin.cwd="/absolute/plugin"'

That integration is a user-configured MCP service with pluginId:null. Prefer the tested package profile for a repeatable install. Synthetic-only administration policy stays the default. --allow-aggregate is an explicitly authorized owner option and is never enabled by staging or receipt mapping.

The bridge uses bounded byte chunks, owns and reaps one child session, forwards termination, escalates after one second and gives output two seconds to drain. Forwarding/drain failure returns nonzero. Node retains all MCP frame, evidence, policy, worker and size contracts.

Run npm run test:codex-profile for staging, path protection, dependency preflight, package identity and actual declared SDK calls; run npm run test:stdio-bridge for byte/process regressions. Native lifecycle is a separate exact-source acceptance campaign. Model quality of the reviewed f6dcf0e8 packet does not qualify later adapter or launcher changes.
