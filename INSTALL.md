# Installation Guide

Every agent is a self-contained Markdown file with YAML frontmatter. If your tool supports custom instructions, system prompts, or persona files — these agents work.

## Claude Code

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
cp healthcare-agents/agents/*.md ~/.claude/agents/
```

Agents are available immediately. Reference by name in conversation:

> "Activate the 340B Program Manager and help me assess our contract pharmacy compliance"

## Self-Improvement Kit (Claude Code + Codex)

If you want a simple prompt-improvement loop instead of the deeper Python eval harness, install the lightweight kit into the project that already contains your `agents/*.md` files:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
bash healthcare-agents/scripts/install-self-improvement-kit.sh /path/to/your/project
```

Installed files:

- `.claude/commands/eval.md`
- `AGENTS.md` block for Codex discovery
- `eval/rubric.md`
- `eval/results.tsv`
- `eval/role-baselines/revenue-medical-coding-specialist.md`

Use `--force` if you want to overwrite the managed files:

```bash
bash healthcare-agents/scripts/install-self-improvement-kit.sh /path/to/your/project --force
```

### Running the Loop in Claude Code

Open Claude Code in the target project and run:

```text
/eval revenue-medical-coding-specialist
```

Claude reads `.claude/commands/eval.md` as the loop program.

### Running the Loop in Codex

Open Codex in the target project and ask:

```text
Run the healthcare self-improvement loop for revenue-medical-coding-specialist
```

Codex reads project instructions from `AGENTS.md`, so the installer adds a marked block there telling Codex to use the same `.claude/commands/eval.md` procedure as the source of truth.

When the runtime supports native subagents or model specialization, prefer:

- strongest available scorer/judge to generate questions, score, and produce an improvement brief
- faster editor model to patch only the target `agents/<slug>.md`
- parent orchestrator to own line-cap checks, `eval/results.tsv`, and commit/revert

Avoid recursively calling the CLI from inside itself when native subagents are available. The scorer should return weak areas plus preservation guidance so the editor improves the prompt without broadening it into generic healthcare-administration boilerplate.

## Codex CLI (OpenAI)

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p ~/.codex/agents
cp healthcare-agents/agents/*.md ~/.codex/agents/
```

Add to `~/.codex/AGENTS.md`:

```
Refer to agent files in ~/.codex/agents/ for healthcare administration expertise.
```

Or reference the agents directory in your project's `AGENTS.md`:

```markdown
# Healthcare Agents
Load agent personality files from ./agents/ for healthcare administration expertise.
Each file defines a specialist. Adopt the identity described in the file when asked.
```

## Gemini CLI

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p ~/.gemini/agents
cp healthcare-agents/agents/*.md ~/.gemini/agents/
```

Enable subagents in `~/.gemini/settings.json`:

```json
{
  "experimental": {
    "enableAgents": true
  }
}
```

Invoke agents with `@agent-name` or let Gemini auto-select based on task relevance.

## Cursor

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p .cursor/rules
cp healthcare-agents/agents/*.md .cursor/rules/
```

The existing YAML frontmatter (`name`, `description`) is recognized by Cursor. Optionally add `alwaysApply: false` to let Cursor intelligently select the right agent based on context.

## Windsurf

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p .windsurf/rules
cp healthcare-agents/agents/*.md .windsurf/rules/
```

Optionally add `trigger: model_decision` to the YAML frontmatter so Windsurf activates the right specialist automatically.

## GitHub Copilot

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p .github/instructions
cp healthcare-agents/agents/*.md .github/instructions/
```

Rename files to use the `.instructions.md` extension for path-specific activation:

```bash
for f in .github/instructions/*.md; do
  mv "$f" "${f%.md}.instructions.md"
done
```

Enable in VS Code settings: `github.copilot.chat.codeGeneration.useInstructionFiles: true`

## Cline

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p .clinerules
cp healthcare-agents/agents/*.md .clinerules/
```

## Amazon Q Developer

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p .amazonq/rules
cp healthcare-agents/agents/*.md .amazonq/rules/
```

Rules are automatically applied as context in all Amazon Q chat sessions.

## Aider

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
```

Add to `.aider.conf.yml`:

```yaml
read:
  - healthcare-agents/agents/revenue-340b-program-manager.md
  - healthcare-agents/agents/quality-compliance-officer.md
  # Add the specific agents you need
```

Or load in-session: `/read healthcare-agents/agents/revenue-340b-program-manager.md`

## OpenClaw

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p ~/.openclaw/skills/healthcare-agents

# Copy each agent as a skill
for f in healthcare-agents/agents/*.md; do
  name=$(basename "$f" .md)
  mkdir -p ~/.openclaw/skills/healthcare-agents/$name
  cp "$f" ~/.openclaw/skills/healthcare-agents/$name/SKILL.md
done
```

Or install at workspace scope by placing the skill directories in `./skills/` within your working directory.

## Claude Desktop (Cowork)

1. Open Claude Desktop and navigate to the **Cowork** tab
2. Go to **Settings > Cowork > Global Instructions**
3. Reference agents as domain knowledge, or create a plugin:

```
your-plugin/
  .claude-plugin/plugin.json
  skills/
    # Copy each .md agent file here as a skill
```

For manual use, paste agent content into project instructions or add agent files to a **Claude Context** folder.

## Claude Web (Projects)

1. Open [claude.ai](https://claude.ai) and create a new **Project**
2. Click **Set custom instructions**
3. Paste the content of any agent file into the project instructions
4. Upload additional agent `.md` files as project knowledge

Each project supports one primary persona — choose the agent that matches your workflow.

## Any Other Tool

Each agent is a self-contained Markdown file with YAML frontmatter:

```yaml
---
name: Agent Name
description: One-line specialty summary
color: "#hex"
emoji: emoji
vibe: One-sentence personality
---

# Agent Name

System prompt and domain knowledge...
```

Copy the `.md` file into wherever your tool reads custom instructions from, or paste the content directly into a system prompt field.
