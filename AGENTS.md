# Healthcare Agents Repository Instructions

## Repository Map

- Agent prompts live in `agents/*.md`.
- The simple self-improvement kit lives in `.claude/commands/eval.md`, `eval/rubric.md`, `eval/results.tsv`, and `eval/role-baselines/`.
- The Python eval harness in `eval/harness/` is a separate, deeper system. Do not assume it is required when the task is just to run the simple self-improvement loop.

## Self-Improvement Loop

- When asked to run the healthcare self-improvement loop for an agent, first read `.claude/commands/eval.md` and execute that procedure as a normal task, substituting `$ARGUMENTS` with the requested agent slug.
- Treat `.claude/commands/eval.md` as the canonical workflow for both Claude Code and Codex.
- If the runtime supports native subagents or model specialization, prefer a strongest scorer/judge plus a faster editor, with the parent agent owning git writes and `eval/results.tsv`.
- Avoid recursive CLI invocation when native subagents are available.
- Never modify `eval/rubric.md` or any file under `eval/role-baselines/`.
- Never modify `eval/results.tsv` except to append rows.
- Preserve the agent's distinctive role identity; do not flatten prompts into generic "best practices" boilerplate.
- Only edit the requested `agents/<slug>.md` while running the loop.
