# Healthcare Agents

Read `README.md`, `INSTALL.md`, and `CONTRIBUTING.md` for the current healthcare
administration toolkit and its supported platforms. `agents/` holds specialist
prompts; `workflows/` holds workflow and Operator OS contracts; `platforms/`
holds platform material; `bin/cli.js` and `lib/` implement the CLI. The Codex
router is `skills/healthcare-agents/SKILL.md`; read its contract before changing
routing or generated discovery content. `docs/` records usage and evidence.

Use Node >=18 and the committed npm lockfile. Choose checks from `package.json`
for the changed behavior: `npm run validate:registry`,
`npm run validate:workflows`, `npm run test:platform-snapshots`, or
`npm run test:cli`. `npm test` invokes the complete release check, so inspect
that scope before treating it as a routine local check. Validation results do
not establish model quality, clinical validity, or publication approval.

## Prompt evaluation contract

- Source prompts live in `agents/*.md`.
- The evaluation contract lives in `eval/rubric.md`; immutable baselines live
  in `eval/role-baselines/`; scores are appended to `eval/results.tsv`.
- The current evaluation procedure is documented in `.claude/commands/eval.md`.
- Preserve each prompt's domain role and terminology; do not flatten prompts
  into generic best-practice boilerplate.
- For an evaluation change, limit source edits to the requested
  `agents/<slug>.md`; write disposable run artifacts under `eval/run-logs/`.
