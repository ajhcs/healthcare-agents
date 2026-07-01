# Codex

Recommended plugin install:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
cd healthcare-agents
bash scripts/install-codex-plugin.sh
```

The script creates a local Codex marketplace wrapper at `~/.healthcare-agents-codex-marketplace`, symlinks it to this repo-root plugin, runs `codex plugin marketplace add`, and installs `healthcare-agents@healthcare-agents-local`.

The Codex plugin exposes one self-directing `healthcare-agents` router. The router reads `workflows/workflows.json` and `agents/registry.json`, chooses a workflow, department/area, or specialist route, and then reads the full matching `agents/<slug>.md` source prompt before answering.

Use prompts like:

```text
Use the Healthcare Agents plugin for a prior authorization appeal.
Use Healthcare Agents in the revenue cycle area for a denial spike.
Use the quality department for a survey readiness checklist.
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
