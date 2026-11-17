# Codex

For **2.0.0-beta.2**, start with [version and profile selection](../../INSTALL.md#choose-a-version-and-profile). The [package-owned local profile](admin-v2-stdio-bridge.md) documents the exact tested POSIX host, preparation, activation and removal. Follow its dependency preflight; host/client versions outside that record need separate acceptance.

The beta `healthcare-agents` router matches the request against a compact workflow index and opens each selected workflow’s detail file. If no workflow fits, it opens the selected specialist’s compact role brief, with the full prompt available when needed. Free-text CLI calls offer discovery candidates. Use `--selection` with a rationale for host-inferred IDs, preserving the order of all requested workups. Use `--workflow` or `--agent` when the user explicitly selected the ID. [Routing authority](../admin-v2/routing-authority.md)

Example requests after activation in a new thread:

```text
Use Healthcare Agents to prepare an administrative prior authorization appeal packet from the supplied evidence.
Use Healthcare Agents to investigate this denial-rate increase, keeping observations and hypotheses separate.
```

## Custom instruction packs

The [CHNA walkthrough](../usage/custom-workflow-walkthrough.md) uses explicit local-file loading in an existing approved workspace. Building a pack alone does not install a plugin, register a tool or prove automatic discovery. Record exactly which files the host read and review its output before operational use.

## Legacy prompt-copy profile

From the pinned source checkout described in the installation guide:

```bash
node bin/cli.js install --codex --dry-run
node bin/cli.js install --codex
```

This older profile writes specialist prompts and a managed block in `~/.codex/AGENTS.md`, preserving other user content. Its instructions to load a full prompt and choose a primary specialist belong to that legacy profile; they do not describe the beta router. Workflow skills can be copied separately with `node bin/cli.js install --codex-skills`.
