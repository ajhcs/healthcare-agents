# Installation Guide

Healthcare Agents ships prompts, skills and workflow surfaces:

- `agents/*.md`: full specialist prompts for subagent/rules/custom-instruction systems.
- generated `SKILL.md` folders: portable skill packages for Claude Skills, OpenCode, and tools that follow the open agent-skills layout.
- workflow skills, Copilot repository surfaces, and Microsoft enterprise export templates generated from `workflows/workflows.json`.

The installed prompts provide healthcare administration decision support only.
They do not make final clinical, legal, coding, billing, audit, compliance,
contracting, employment, or executive decisions, and they do not make a runtime
safe for PHI without an approved environment and minimum necessary controls.

## Choose a version and profile

This checkout describes **2.0.0-beta.1**, an unpublished source candidate. The public npm channel does not yet deliver this candidate; an unversioned `npx healthcare-agents` is not a reproducible beta install. Publication and customer cloud-host acceptance remain pending in [candidate status](docs/admin-v2/release-status.json).

The commands below use a pinned source baseline with existing Node ≥18.14.1 and npm. No global installation is needed to validate or build a custom workflow:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
cd healthcare-agents
git checkout --detach 7b536b5ba707a74cc3b9208b658606f36c9a92c8
npm ci --ignore-scripts
node bin/cli.js doctor
node bin/cli.js admin validate workflows/admin-v2/custom-example.json
```

That baseline precedes this documentation revision. Record the exact source commit you actually use, together with package version and profile. For a published release, separately verify the exact registry version and payload identity using the [release guide](docs/release-publishing.md); do not assume registry and repository channels match.

| Need | Profile | Qualification boundary |
| --- | --- | --- |
| Build a custom instruction pack | Local source CLI and [walkthrough](docs/usage/custom-workflow-walkthrough.md) | Schema and generated files; host use requires explicit loading and review |
| Activate the beta in Codex | [Package-owned local Codex profile](docs/platforms/admin-v2-stdio-bridge.md) | Exact documented POSIX host; other versions and hosts need separate acceptance |
| Copy specialist prompts or skills | Target commands below, from this source checkout | File generation; does not establish live-client acceptance |
| Use a published npm release | Verify exact published version first | Separate release channel; no beta equivalence claim |

Inspect writes before installing:

```bash
node bin/cli.js install --all --dry-run
node bin/cli.js doctor
```

Install only the target needed for your approved host. The local shell installer is also available as `bash install.sh --all --dry-run`; review its proposed writes before running without `--dry-run`. Use `--force` only when you intend to replace an existing managed installation.

## Targets

| Target | Command | Writes |
|---|---|---|
| Codex plugin | `bash scripts/install-codex-plugin.sh` | Local Codex marketplace wrapper and Codex plugin cache from repo-root `.codex-plugin/plugin.json` and `skills/healthcare-agents/SKILL.md` |
| Claude Code | `node bin/cli.js install --claude` | `~/.claude/agents/*.md` |
| Claude Skills | `node bin/cli.js install --claude-skills` | `~/.claude/skills/<slug>/SKILL.md` |
| Claude Desktop | `node bin/cli.js install --claude-desktop` | `~/.claude/skills/<slug>/SKILL.md` |
| Claude Cowork | `node bin/cli.js install --claude-cowork` | `~/.claude/skills/<slug>/SKILL.md` |
| Codex CLI / App | `node bin/cli.js install --codex` | `~/.codex/agents/*.md`, `~/.codex/AGENTS.md` |
| OpenCode | `node bin/cli.js install --opencode` | `~/.config/opencode/skills/<slug>/SKILL.md` |
| Open Agent Skills | `node bin/cli.js install --agent-skills` | `~/.agents/skills/<slug>/SKILL.md` |
| Cursor | `node bin/cli.js install --cursor` | `.cursor/rules/*.md` |
| Windsurf | `node bin/cli.js install --windsurf` | `.windsurf/rules/*.md` |
| GitHub Copilot | `node bin/cli.js install --copilot` | `.github/instructions/*.md` |
| Claude workflow skills | `node bin/cli.js install --claude-workflow-skills` | `~/.claude/skills/healthcare-*/SKILL.md` |
| Codex workflow skills | `node bin/cli.js install --codex-skills` | `~/.codex/skills/healthcare-*/SKILL.md` |
| GitHub Copilot repo setup | `node bin/cli.js install --copilot-all` | `.github/copilot-instructions.md`, `.github/instructions`, `.github/agents`, `.github/prompts`, `.github/ISSUE_TEMPLATE` |
| Gemini CLI | `node bin/cli.js install --gemini` | `~/.gemini/agents/*.md` |
| Cline | `node bin/cli.js install --cline` | `.clinerules/*.md` |
| Amazon Q Developer | `node bin/cli.js install --amazonq` | `.amazonq/rules/*.md` |
| Continue.dev | `node bin/cli.js install --continue` | `.continue/*.md` |
| Aider | `node bin/cli.js install --aider` | managed `.aider.conf.yml` `read:` block |
| Common skill locations | `node bin/cli.js install --skills` | Claude, OpenCode, and `.agents` skill folders |

## Claude Code

Claude Code subagents live in:

- project: `.claude/agents/*.md`
- user: `~/.claude/agents/*.md`

Install globally:

```bash
node bin/cli.js install --claude
```

Invoke naturally:

```text
Use the revenue-cycle-specialist agent to diagnose denial trends.
```

The `name` frontmatter field matches the filename slug, as expected by Claude Code. The human-readable name is retained in `display_name`.

## Claude Skills, Desktop, and Cowork

Generate SKILL.md folders:

```bash
node bin/cli.js install --claude-skills
```

Aliases:

```bash
node bin/cli.js install --claude-desktop
node bin/cli.js install --claude-cowork
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

For this unpublished v2 beta on the tested BuilderBob Codex host, prepare a package-owned local profile with existing Node/npm:

```bash
node scripts/stage-codex-plugin.js --output "$HOME/healthcare-agents-codex-local"
codex plugin marketplace add "$HOME/healthcare-agents-codex-local"
codex plugin add healthcare-agents@healthcare-agents-posix-local
```

Start a new thread. Python is optional: add --stdio-bridge during preparation to select the tested POSIX bridge. The [profile guide](docs/platforms/admin-v2-stdio-bridge.md) gives dependency preflight, removal and exact tested-host limits. No per-thread MCP override is needed. The public registry does not yet contain this candidate.

For a host that supports the portable Node launcher, the existing local plugin installer remains available:

```bash
bash scripts/install-codex-plugin.sh
```

Use the plugin when you want Codex to invoke Healthcare Agents through one model-visible router. Example prompts:

```text
Use the Healthcare Agents plugin for a prior authorization appeal.
Use Healthcare Agents in the revenue cycle area for a denial spike.
Use the quality department for a survey readiness checklist.
```

The plugin keeps `agents/*.md`, `workflows/workflows.json`, and `agents/registry.json` as canonical sources. Generated indexes under `skills/healthcare-agents/references/` reduce model context but are freshness-checked against those sources. The beta router loads a selected workflow or compact role brief; full prompts are available when needed. Free-text commands offer candidates, and the user or host resolves intent, negation and multiple goals before supplying validated IDs. Explicit multi-selections retain every workstream. See [routing authority](docs/admin-v2/routing-authority.md).

Legacy prompt-copy install:

Install:

```bash
node bin/cli.js install --codex
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
node bin/cli.js install --opencode
```

This writes:

```text
~/.config/opencode/skills/<agent-slug>/SKILL.md
```

OpenCode also discovers Claude-compatible and open-agent-compatible skill paths, so `--skills` is a good portable default:

```bash
node bin/cli.js install --skills
```

## Cursor, Windsurf, Copilot, and Rules-Based Tools

Install into project rule folders:

```bash
node bin/cli.js install --cursor
node bin/cli.js install --windsurf
node bin/cli.js install --copilot
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
node bin/cli.js install --aider
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
node bin/cli.js install --path ./vendor/healthcare-agents
```

## Single-Agent Install

Install one prompt when a full pack is unnecessary:

```bash
node bin/cli.js install revenue-cycle-specialist --codex
node bin/cli.js install quality-compliance-officer --claude-skills --dry-run
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

From this source checkout use `node bin/cli.js` in place of the installed `healthcare-agents` executable below. Discovery offers candidates; explicit workflow IDs select the structured workup:

```bash
healthcare-agents workflows
healthcare-agents workflow denial-spike-workup
healthcare-agents workup "Commercial payer denial rate jumped 18 percent after a policy change" --workflow denial-spike-workup --target codex
healthcare-agents workup "Prepare a HIPAA evidence checklist for a vendor security review" --workflow hipaa-security-evidence-checklist --target copilot --json
```

Install workflow-level runtime support:

```bash
node bin/cli.js install --claude-workflow-skills
node bin/cli.js install --codex-skills
node bin/cli.js install --copilot-all
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
node bin/cli.js uninstall --claude
node bin/cli.js uninstall --opencode
node bin/cli.js uninstall --all
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
