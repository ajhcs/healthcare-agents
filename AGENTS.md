# Healthcare Agents Repository Instructions

## Repository Map

- Agent prompts live in `agents/*.md`.
- The simple self-improvement kit lives in `.claude/commands/eval.md`, `eval/rubric.md`, `eval/results.tsv`, and `eval/role-baselines/`.
- The old Python eval harness has been removed. The active eval path is the simple self-improvement kit above.
- This repo uses `bd` as the active bead tracker. If external skills or copied
  prompts mention `br` or `bv`, translate to the equivalent `bd` workflow
  instead of abandoning tracker work. Useful local commands: `bd prime`,
  `bd show <id>`, `bd children <id>`, `bd ready -n 100`, `bd list --json`,
  `bd dep tree <id>`, `bd update <id> --claim`, and `bd close <id> --reason "..."`
  after current evidence proves the acceptance criteria.
- Use `bd-agent-sync pull` before creating, claiming, updating, or closing
  beads, and `bd-agent-sync push` after Beads changes. Do not create markdown
  TODO ledgers, scratch JSONL files, or parallel agent backlogs. `.beads/issues.jsonl`
  is the only supported JSONL bridge and must be managed by `bd import` and
  `bd export`, not hand-edited. `bd sync` is not available in bd 1.0.2 on
  Plumbob.

## Git Workflow

- Do not push directly to `main`.
- For requested edits, create a short-lived branch, commit there, push the branch, open a PR, and merge the PR with `gh pr merge`.
- Do not merge the feature branch into local `main` before opening or merging the PR. That creates duplicate local merge commits and makes `main` appear ahead/behind after GitHub merges the PR.
- After a PR is merged, run `git fetch origin --prune` and align local `main` to `origin/main` before continuing work.
- For docs-only or metadata-only changes, the streamlined path is: branch -> commit -> push branch -> `gh pr create` -> `gh pr merge --merge --delete-branch` -> sync local `main`.

## Self-Improvement Loop

- When asked to run the healthcare self-improvement loop for an agent, first read `.claude/commands/eval.md` and execute that procedure as a normal task, substituting `$ARGUMENTS` with the requested agent slug.
- Treat `.claude/commands/eval.md` as the canonical workflow for both Claude Code and Codex.
- If the runtime supports native subagents or model specialization, prefer a strongest scorer/judge plus a faster editor, with the parent agent owning git writes and `eval/results.tsv`.
- Avoid recursive CLI invocation when native subagents are available.
- Never modify `eval/rubric.md` or any file under `eval/role-baselines/`.
- Never modify `eval/results.tsv` except to append rows.
- Preserve the agent's distinctive role identity; do not flatten prompts into generic "best practices" boilerplate.
- During a normal eval run, only edit the requested `agents/<slug>.md`, append `eval/results.tsv`, and write local ignored artifacts under `eval/run-logs/`.
