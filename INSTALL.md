# Installation Guide

Healthcare Agents ships in two compatible formats:

- `agents/*.md`: full specialist prompts for subagent/rules/custom-instruction systems.
- generated `SKILL.md` folders: portable skill packages for Claude Skills, OpenCode, and tools that follow the open agent-skills layout.

## Fast Install

```bash
curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh | bash
```

Or:

```bash
npx healthcare-agents install
```

Use `--dry-run` before writing files:

```bash
npx healthcare-agents install --all --dry-run
```

Use `--force` to update an existing install:

```bash
npx healthcare-agents install --all --force
```

## Targets

| Target | Command | Writes |
|---|---|---|
| Claude Code | `npx healthcare-agents install --claude` | `~/.claude/agents/*.md` |
| Claude Skills | `npx healthcare-agents install --claude-skills` | `~/.claude/skills/<slug>/SKILL.md` |
| Claude Desktop | `npx healthcare-agents install --claude-desktop` | `~/.claude/skills/<slug>/SKILL.md` |
| Claude Cowork | `npx healthcare-agents install --claude-cowork` | `~/.claude/skills/<slug>/SKILL.md` |
| Codex CLI / App | `npx healthcare-agents install --codex` | `~/.codex/agents/*.md`, `~/.codex/AGENTS.md` |
| OpenCode | `npx healthcare-agents install --opencode` | `~/.config/opencode/skills/<slug>/SKILL.md` |
| Open Agent Skills | `npx healthcare-agents install --agent-skills` | `~/.agents/skills/<slug>/SKILL.md` |
| Cursor | `npx healthcare-agents install --cursor` | `.cursor/rules/*.md` |
| Windsurf | `npx healthcare-agents install --windsurf` | `.windsurf/rules/*.md` |
| GitHub Copilot | `npx healthcare-agents install --copilot` | `.github/instructions/*.md` |
| Gemini CLI | `npx healthcare-agents install --gemini` | `~/.gemini/agents/*.md` |
| Cline | `npx healthcare-agents install --cline` | `.clinerules/*.md` |
| Amazon Q Developer | `npx healthcare-agents install --amazonq` | `.amazonq/rules/*.md` |
| Continue.dev | `npx healthcare-agents install --continue` | `.continue/*.md` |
| Aider | `npx healthcare-agents install --aider` | managed `.aider.conf.yml` `read:` block |
| Common skill locations | `npx healthcare-agents install --skills` | Claude, OpenCode, and `.agents` skill folders |

## Claude Code

Claude Code subagents live in:

- project: `.claude/agents/*.md`
- user: `~/.claude/agents/*.md`

Install globally:

```bash
npx healthcare-agents install --claude
```

Invoke naturally:

```text
Use the revenue-cycle-specialist agent to diagnose denial trends.
```

The `name` frontmatter field matches the filename slug, as expected by Claude Code. The human-readable name is retained in `display_name`.

## Claude Skills, Desktop, and Cowork

Generate SKILL.md folders:

```bash
npx healthcare-agents install --claude-skills
```

Aliases:

```bash
npx healthcare-agents install --claude-desktop
npx healthcare-agents install --claude-cowork
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

Install:

```bash
npx healthcare-agents install --codex
```

This writes:

```text
~/.codex/agents/*.md
~/.codex/AGENTS.md
```

The managed `AGENTS.md` block tells Codex to read the matching specialist prompt before answering healthcare administration requests.

For a repo-local Codex App setup, copy the prompts into the repo and add a local `AGENTS.md` note:

```bash
mkdir -p agents
cp healthcare-agents/agents/*.md agents/
```

```markdown
## Healthcare Agents

When healthcare administration expertise is needed, read the matching file in `agents/*.md` before answering. Preserve the selected specialist's role, source hierarchy, compliance boundaries, and deliverable style.
```

## OpenCode

Install OpenCode skills:

```bash
npx healthcare-agents install --opencode
```

This writes:

```text
~/.config/opencode/skills/<agent-slug>/SKILL.md
```

OpenCode also discovers Claude-compatible and open-agent-compatible skill paths, so `--skills` is a good portable default:

```bash
npx healthcare-agents install --skills
```

## Cursor, Windsurf, Copilot, and Rules-Based Tools

Install into project rule folders:

```bash
npx healthcare-agents install --cursor
npx healthcare-agents install --windsurf
npx healthcare-agents install --copilot
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
npx healthcare-agents install --aider
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
npx healthcare-agents install --path ./vendor/healthcare-agents
```

## Uninstall

```bash
npx healthcare-agents uninstall --claude
npx healthcare-agents uninstall --opencode
npx healthcare-agents uninstall --all
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
