# Codex POSIX package profile

The portable manifests keep their Node stdio launcher. On BuilderBob, Codex CLI 0.160.0 read-only execution rejects getsockname and shutdown on inherited socket stdio; the failure is independently reproduced outside Healthcare Agents. The standard-library Python bridge gives the unchanged Node MCP server anonymous pipes, without changing sandbox, approval or network policy.

## Prepare and activate the bridge profile

From this checked-out beta or its installed npm package:

    node scripts/stage-codex-plugin.js --stdio-bridge --output "$HOME/healthcare-agents-codex-posix"
    codex plugin marketplace add "$HOME/healthcare-agents-codex-posix"
    codex plugin add healthcare-agents@healthcare-agents-posix-local

Start a new Codex thread. The staged plugin owns the MCP registration and selects the bridge by default. No per-thread server override or installed cache-path lookup is required. These are local preparation and the official plugin-manager install commands; preparation does not write Codex home, enable a plugin or change global settings. Normal plugin activation is managed by Codex.

Use a new output directory with an existing parent. Existing directories and symlinks are refused. Do not move or rename the directory while installed: it holds the independent npm package, dependencies, local marketplace and staging receipt. Add --name for a distinct local marketplace name, --python /absolute/python for an existing interpreter, or --offline when the npm dependency cache is already populated. Preparation records the tarball hash, every staged package file and any deliberate profile changes. A failed dependency install leaves the new output directory for diagnosis; use another new directory for a retry.

Requires Node >=18.14.1, npm, and an existing POSIX Python >=3.8. Preparation verifies Python and pins Python, Node and the owned staged package path into this host's profile. It uses the staged root .mcp.json selected by the Codex manifest; no runtime placeholder expansion is needed. Both bridge and portable modes normalize their selected launcher, including when restaging an installed profile. It installs npm dependencies with lifecycle scripts disabled; it never installs Python, Pydantic or a cloud SDK. Restage on another machine rather than reusing host-specific interpreter paths. Native bridge acceptance is qualified only on Ubuntu/Python 3.12.3/Node 18.19.1/Codex CLI 0.160.0. Windows, other POSIX hosts and other clients need their own acceptance.

## Remove

    codex plugin remove healthcare-agents@healthcare-agents-posix-local
    codex plugin marketplace remove healthcare-agents-posix-local

After removal, the owner may delete only the output directory they created. The package does not recursively remove a guessed directory or modify unrelated plugins. Existing account/profile state is preserved; acceptance tests compare exact restoration after the owned test entry is removed.

## Portable alternative and host limitation

Omit --stdio-bridge to prepare an independent profile using the unchanged Node launcher, with no Python requirement. The portable profile is useful on hosts whose stdio runtime supports it; its automatic native startup still fails on the affected BuilderBob host. Keep the bridge an explicit POSIX opt-in for this beta rather than adding a Python dependency to all portable installs.

The upstream host/process stdio restriction remains for a Node-only install on this affected host. The bridge profile avoids it through a supported plugin manifest and standard pipes. No security-setting change is needed when the existing Python interpreter is available. When it is unavailable, preparation fails before creating a profile; installing Python requires the operator's ordinary dependency approval.

The earlier process-scoped integration remains available for an already installed package:

    codex -c 'mcp_servers.healthcare-admin.command="python3"' \
      -c 'mcp_servers.healthcare-admin.args=["-B","/absolute/plugin/bin/mcp-stdio-bridge.py"]' \
      -c 'mcp_servers.healthcare-admin.cwd="/absolute/plugin"'

That surface is a user-configured MCP service, with pluginId:null; it is different from the package-owned bridge profile. The bridge supports --node for a selected executable. Synthetic-only administration policy stays the default. --allow-aggregate is an explicitly authorized owner option and is never enabled by staging or receipt mapping.

The bridge uses bounded byte chunks, owns/reaps one child session, forwards termination, escalates after one second and gives output two seconds to drain. Forwarding/drain failure returns nonzero. Node retains all MCP frame, evidence, policy, worker and size contracts.

Run npm run test:codex-profile for clean staging, existing-path protection, dependency preflight, independent package bytes and actual declared SDK calls; run npm run test:stdio-bridge for byte/process regressions. Native install/activate/callbacks/remove and exact profile restoration are a separate acceptance campaign. Model quality of the reviewed f6dcf0e8 packet does not qualify later adapter or launcher changes.
