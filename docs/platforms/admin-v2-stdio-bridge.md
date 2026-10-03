# POSIX stdio bridge for native Codex

The portable manifests keep their Node stdio launcher. An optional standard-library Python bridge is available for POSIX hosts whose native sandbox rejects socket operations on inherited stdio. On BuilderBob, Codex CLI 0.160.0 read-only execution denies getsockname on socket descriptors and shutdown; Node pipe-based children can close without an initialization response. This is independently reproduced outside Healthcare Agents. The bridge gives the unchanged Node MCP server anonymous pipes and relays bytes to the host. It opens no network connection and changes no sandbox or network policy.

Requires Node >=18.14.1 and an existing Python 3 on a POSIX host. The tested host is Ubuntu/Python 3.12.3; Windows and other POSIX hosts are not qualified by this test. Pydantic is not required for this stdio bridge. The receipt importer has its separate Python/Pydantic requirements.

For an operator-selected native configuration, use the actual installed plugin path, preserving your existing account, profile and unrelated servers. These are process-scoped settings, with no profile write:

    codex -c 'mcp_servers.healthcare-admin.command="python3"' \
      -c 'mcp_servers.healthcare-admin.args=["-B","/absolute/plugin/bin/mcp-stdio-bridge.py"]' \
      -c 'mcp_servers.healthcare-admin.cwd="/absolute/plugin"'

The bridge supports --node for an operator-selected executable. Synthetic-only administration policy remains the default. --allow-aggregate is an explicit owner-controlled option and requires its own authorized deployment; mapping a receipt never enables it.

The bridge forwards opaque stdin, stdout and stderr separately in bounded chunks. It owns one child process session, forwards termination, escalates after one second if needed, and reaps that child. Output gets two seconds to drain after child exit; forwarding or drain failures return a nonzero exit rather than silently claiming success with truncated output. The original MCP frame, worker, evidence, size and policy contracts remain in the Node server.

Run python3 -B scripts/test_stdio_bridge.py for byte custody, EOF, child error, signal escalation and stalled/broken output regressions. This suite includes a Linux-specific small-pipe test. Native install/skill loading, actual MCP calls and restored profile state are separate acceptance evidence; direct SDK tests alone do not establish native plugin acceptance. Model quality of the reviewed f6dcf0e8 packet does not qualify later adapter or launcher changes.
