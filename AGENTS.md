# Healthcare Agents

Use Node 18.14.1 or later and the committed npm lockfile. Read the relevant contract in `README.md`, `INSTALL.md`, and `CONTRIBUTING.md`. The Codex router is `skills/healthcare-agents/SKILL.md`. Regenerate router indexes after routing data changes and regenerate the beta role briefs and workflow skills after their source prompts or contracts change.

Run the affected checks from `package.json`. `npm test` runs the local release suite. It includes package and installer checks. Report model evaluation, domain review, and release evidence independently.

Keep specialist terminology and preserve the domain checks, source hierarchy, and deliverable templates that make each role useful. For an evaluation run, use `.claude/commands/eval.md` with the requested slug. Keep `eval/rubric.md` and `eval/role-baselines/` immutable. Append scores to `eval/results.tsv` and write disposable logs under `eval/run-logs/`. Only edit the requested source prompt during a role evaluation.

Use a feature branch and the PR workflow for changes going to GitHub. After merge, fetch and align local `main` to `origin/main`. Use `bd` for tracker updates, with `bd-agent-sync pull` before changes and `bd-agent-sync push` afterward. Use `bd import` and `bd export` for the Beads JSONL bridge.
