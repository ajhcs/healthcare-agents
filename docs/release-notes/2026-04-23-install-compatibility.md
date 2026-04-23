# Healthcare Agents v1.1.1 Release Notes

Released: 2026-04-23

This patch release focuses on installability and cross-tool compatibility after the v1.1.0 agent-stack optimization release.

## Highlights

- Agent frontmatter now uses lowercase hyphen `name` values that match filenames, with human-readable labels preserved in `display_name`.
- The installer now supports Codex App aliases, Claude Desktop/Cowork aliases, OpenCode skills, Claude Skills, and portable `.agents/skills` output.
- Codex installs now add a managed `~/.codex/AGENTS.md` block so Codex knows how to select and read the installed healthcare specialists.
- The README and installation guide now reflect the v1.1.x eval status and current cross-tool file layouts.
- The self-improvement kit installer now copies all 51 role baselines.

## Validation

- `bash scripts/lint-agents.sh`
- `bash -n install.sh`
- `bash install.sh --all --dry-run`
- Temp-home install test for Claude agents, Codex agents/instructions, Claude skills, OpenCode skills, and `.agents/skills`
