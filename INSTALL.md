# Installation Guide

Healthcare Agents ships in two compatible formats:

- `agents/*.md`: full specialist prompts for subagent/rules/custom-instruction systems.
- generated `SKILL.md` folders: portable skill packages for Claude Skills, OpenCode, and tools that follow the open agent-skills layout.
- workflow skills, Copilot repository surfaces, and Microsoft enterprise export templates generated from `workflows/workflows.json`.

The installed prompts provide healthcare administration decision support only.
They do not make final clinical, legal, coding, billing, audit, compliance,
contracting, employment, or executive decisions, and they do not make a runtime
safe for PHI without an approved environment and minimum necessary controls.

## Fast Install

Codex plugin install from a clone:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
cd healthcare-agents
bash scripts/install-codex-plugin.sh
```

For local development from this checkout:

```bash
bash scripts/install-codex-plugin.sh
```

The script creates a local Codex marketplace wrapper at `~/.healthcare-agents-codex-marketplace`, symlinks it to this repo-root plugin, runs `codex plugin marketplace add`, and installs `healthcare-agents@healthcare-agents-local`.

Start a new Codex thread after installing or updating the plugin. The plugin exposes one self-directing router, `healthcare-agents`, which checks the compact generated workflow index first, reads the compact agent index only when needed, chooses one workflow or specialist route, then reads the full matching source prompt in `agents/*.md`.

```bash
npx --yes healthcare-agents install
```

GitHub-backed fallback:

```bash
npx --yes github:ajhcs/healthcare-agents install
```

Shell installer fallback:

```bash
curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh | bash
```

Use `--dry-run` before writing files:

```bash
npx --yes healthcare-agents install --all --dry-run
```

Run doctor to inspect detected tools, target paths, collisions, and existing installed files:

```bash
npx --yes healthcare-agents doctor
```

Use `--force` to update an existing install:

```bash
npx --yes healthcare-agents install --all --force
```

## Targets

| Target | Command | Writes |
|---|---|---|
| Codex plugin | `bash scripts/install-codex-plugin.sh` | Local Codex marketplace wrapper and Codex plugin cache from repo-root `.codex-plugin/plugin.json` and `skills/healthcare-agents/SKILL.md` |
| Claude Code | `npx --yes healthcare-agents install --claude` | `~/.claude/agents/*.md` |
| Claude Skills | `npx --yes healthcare-agents install --claude-skills` | `~/.claude/skills/<slug>/SKILL.md` |
| Claude Desktop | `npx --yes healthcare-agents install --claude-desktop` | `~/.claude/skills/<slug>/SKILL.md` |
| Claude Cowork | `npx --yes healthcare-agents install --claude-cowork` | `~/.claude/skills/<slug>/SKILL.md` |
| Codex CLI / App | `npx --yes healthcare-agents install --codex` | `~/.codex/agents/*.md`, `~/.codex/AGENTS.md` |
| OpenCode | `npx --yes healthcare-agents install --opencode` | `~/.config/opencode/skills/<slug>/SKILL.md` |
| Open Agent Skills | `npx --yes healthcare-agents install --agent-skills` | `~/.agents/skills/<slug>/SKILL.md` |
| Cursor | `npx --yes healthcare-agents install --cursor` | `.cursor/rules/*.md` |
| Windsurf | `npx --yes healthcare-agents install --windsurf` | `.windsurf/rules/*.md` |
| GitHub Copilot | `npx --yes healthcare-agents install --copilot` | `.github/instructions/*.md` |
| Claude workflow skills | `npx --yes healthcare-agents install --claude-workflow-skills` | `~/.claude/skills/healthcare-*/SKILL.md` |
| Codex workflow skills | `npx --yes healthcare-agents install --codex-skills` | `~/.codex/skills/healthcare-*/SKILL.md` |
| GitHub Copilot repo setup | `npx --yes healthcare-agents install --copilot-all` | `.github/copilot-instructions.md`, `.github/instructions`, `.github/agents`, `.github/prompts`, `.github/ISSUE_TEMPLATE` |
| Gemini CLI | `npx --yes healthcare-agents install --gemini` | `~/.gemini/agents/*.md` |
| Cline | `npx --yes healthcare-agents install --cline` | `.clinerules/*.md` |
| Amazon Q Developer | `npx --yes healthcare-agents install --amazonq` | `.amazonq/rules/*.md` |
| Continue.dev | `npx --yes healthcare-agents install --continue` | `.continue/*.md` |
| Aider | `npx --yes healthcare-agents install --aider` | managed `.aider.conf.yml` `read:` block |
| Common skill locations | `npx --yes healthcare-agents install --skills` | Claude, OpenCode, and `.agents` skill folders |

## Claude Code

Claude Code subagents live in:

- project: `.claude/agents/*.md`
- user: `~/.claude/agents/*.md`

Install globally:

```bash
npx --yes healthcare-agents install --claude
```

Invoke naturally:

```text
Use the revenue-cycle-specialist agent to diagnose denial trends.
```

The `name` frontmatter field matches the filename slug, as expected by Claude Code. The human-readable name is retained in `display_name`.

## Claude Skills, Desktop, and Cowork

Generate SKILL.md folders:

```bash
npx --yes healthcare-agents install --claude-skills
```

Aliases:

```bash
npx --yes healthcare-agents install --claude-desktop
npx --yes healthcare-agents install --claude-cowork
```

Each skill is written to:

```text
~/.claude/skills/<agent-slug>/SKILL.md
```

Each generated `SKILL.md` has:

```yaml
---
name: revenue-cycle-specialist
description: >-
  Healthcare administration specialist...
license: Apache-2.0
compatibility: claude-code, claude-desktop, claude-cowork, opencode, codex
---
```

## Codex CLI and Codex App

Recommended plugin install:

```bash
bash scripts/install-codex-plugin.sh
```

Use the plugin when you want Codex to invoke Healthcare Agents through one model-visible router. Example prompts:

```text
Use the Healthcare Agents plugin for a prior authorization appeal.
Use Healthcare Agents in the revenue cycle area for a denial spike.
Use the quality department for a survey readiness checklist.
```

The plugin keeps `agents/*.md`, `workflows/workflows.json`, and `agents/registry.json` as canonical sources. Generated indexes under `skills/healthcare-agents/references/` reduce model context but are freshness-checked against those sources. The router checks workflow triggers first, uses department/area hints when needed, selects one primary specialist, and reads the full matching prompt before answering.

Legacy prompt-copy install:

Install:

```bash
npx --yes healthcare-agents install --codex
```

This writes:

```text
~/.codex/agents/*.md
~/.codex/AGENTS.md
```

The managed `AGENTS.md` block tells Codex to read the matching specialist prompt before answering healthcare administration requests.
It also tells Codex to choose one primary specialist, use the agent's `Best Inputs` section when details are missing, respect `quick triage`, `workplan`, `audit/checklist`, and `artifact/template` modes, and name cross-agent handoffs when work spans roles.

For a repo-local Codex App setup, copy the prompts into the repo and add a local `AGENTS.md` note:

```bash
mkdir -p agents
cp healthcare-agents/agents/*.md agents/
```

```markdown
## Healthcare Agents

When healthcare administration expertise is needed, read the matching file in `agents/*.md` before answering. Choose one primary specialist, use its Best Inputs section when details are missing, respect `quick triage`, `workplan`, `audit/checklist`, and `artifact/template` output modes, and name handoffs when work spans roles. Preserve the selected specialist's role, source hierarchy, compliance boundaries, and deliverable style.
```

## OpenCode

Install OpenCode skills:

```bash
npx --yes healthcare-agents install --opencode
```

This writes:

```text
~/.config/opencode/skills/<agent-slug>/SKILL.md
```

OpenCode also discovers Claude-compatible and open-agent-compatible skill paths, so `--skills` is a good portable default:

```bash
npx --yes healthcare-agents install --skills
```

## Cursor, Windsurf, Copilot, and Rules-Based Tools

Install into project rule folders:

```bash
npx --yes healthcare-agents install --cursor
npx --yes healthcare-agents install --windsurf
npx --yes healthcare-agents install --copilot
```

For GitHub Copilot, some setups prefer the `.instructions.md` extension:

```bash
for f in .github/instructions/*.md; do
  mv "$f" "${f%.md}.instructions.md"
done
```

## Aider

Install:

```bash
npx --yes healthcare-agents install --aider
```

This adds a managed block to `.aider.conf.yml`:

```yaml
# healthcare-agents start
read:
  - /path/to/agents/revenue-cycle-specialist.md
  - /path/to/agents/quality-compliance-officer.md
# healthcare-agents end
```

## Custom Directory

Copy the source agent files to any directory:

```bash
npx --yes healthcare-agents install --path ./vendor/healthcare-agents
```

## Single-Agent Install

Install one prompt when a full pack is unnecessary:

```bash
npx --yes healthcare-agents install revenue-cycle-specialist --codex
npx --yes healthcare-agents install quality-compliance-officer --claude-skills --dry-run
```

Slugs are validated against `agents/registry.json`; invalid slugs return close-match suggestions.

## CLI Discovery

The package includes registry-backed discovery commands:

```bash
healthcare-agents list [--domain revenue] [--json]
healthcare-agents show revenue-cycle-specialist [--json]
healthcare-agents choose "prior authorization denials are rising" [--json]
healthcare-agents prompt revenue-cycle-specialist --mode "quick triage"
```

## Workflow Engine

Workflow commands route a plain-language healthcare administration problem to a structured workup packet:

```bash
healthcare-agents workflows
healthcare-agents workflow denial-spike-workup
healthcare-agents workup "Commercial payer denial rate jumped 18 percent after a policy change" --target codex
healthcare-agents workup "Prepare a HIPAA evidence checklist for a vendor security review" --target copilot --json
```

Install workflow-level runtime support:

```bash
npx --yes healthcare-agents install --claude-workflow-skills
npx --yes healthcare-agents install --codex-skills
npx --yes healthcare-agents install --copilot-all
```

Microsoft enterprise paths are exported for governed review instead of installed directly into a tenant:

```bash
healthcare-agents export m365-declarative-agent denial-spike-workup
healthcare-agents export copilot-studio hipaa-security-evidence-checklist
healthcare-agents export azure-foundry survey-readiness-gap-review
```

These exports include instructions, starter prompts or trigger phrases, knowledge-source guidance, action placeholders, safety boundaries, test cases, and admin review checklists.

## Uninstall

```bash
npx --yes healthcare-agents uninstall --claude
npx --yes healthcare-agents uninstall --opencode
npx --yes healthcare-agents uninstall --all
```

## Self-Improvement Kit

Install the eval loop into another project that already has `agents/*.md`:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
bash healthcare-agents/scripts/install-self-improvement-kit.sh /path/to/project
```

Installed files:

- `.claude/commands/eval.md`
- managed `AGENTS.md` block for Codex discovery
- `eval/rubric.md`
- `eval/results.tsv`
- `eval/role-baselines/*.md`

## Maintainer Release Check

Before publishing or updating release claims, run the same no-network gate used
by CI:

```bash
npm run release:check
```

Use the optional networked artifact check only when verifying an already
published npm/GitHub release:

```bash
npm run verify:public-release:network
```

Run in Claude Code:

```text
/eval revenue-medical-coding-specialist
```

Run in Codex:

```text
Run the healthcare self-improvement loop for revenue-medical-coding-specialist.
```

## Verify

From the repository:

```bash
bash scripts/lint-agents.sh
bash install.sh --all --dry-run
```
