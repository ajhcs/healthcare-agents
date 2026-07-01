# Codex

Recommended plugin install:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
cd healthcare-agents
bash scripts/install-codex-plugin.sh
```

The script creates a local Codex marketplace wrapper at `~/.healthcare-agents-codex-marketplace`, symlinks it to this repo-root plugin, runs `codex plugin marketplace add`, and installs `healthcare-agents@healthcare-agents-local`.

The Codex plugin exposes one `healthcare-agents` router skill. The router reads `agents/registry.json`, selects one primary specialist, and then reads the full matching `agents/<slug>.md` source prompt before answering.

Use prompts like:

```text
Use Healthcare Agents for a prior authorization appeal workup.
Route a denial spike problem to the right healthcare specialist.
```

Legacy prompt-copy install:

```bash
npx --yes healthcare-agents install --codex
```

Install workflow skills separately with:

```bash
npx --yes healthcare-agents install --codex-skills
```

The installer preserves user content in `~/.codex/AGENTS.md` by using a managed block and follows Codex directory precedence rules.
