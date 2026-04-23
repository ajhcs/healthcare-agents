# Python Eval Harness Cleanup Plan

**Date**: 2026-04-23  
**Status**: Cleanup plan executed  
**Scope**: Remove obsolete Python eval harness files and stale references.

## Goal

Clean the repository so the active eval story is clear:

- Use `.claude/commands/eval.md` for prompt self-improvement.
- Keep `eval/rubric.md`, `eval/results.tsv`, and role baselines.
- Remove the superseded Python harness, schema, tests, generated caches, and stale docs.
- Stop shipping retired utility prompts as if they were among the 51 healthcare agents.

## Current Working Tree Caveat

At planning time:

- branch is `main`
- `.beads/` is untracked
- `calibration/` is untracked
- `bd ready` reports no beads database

Cleanup should happen on a branch and should not stage untracked `.beads/` or `calibration/` blindly.

## Keep

| Path | Disposition |
|---|---|
| `.claude/commands/eval.md` | Keep. Canonical self-improvement workflow. |
| `AGENTS.md` | Keep, with wording updated after cleanup. |
| `eval/rubric.md` | Keep frozen. Do not rewrite. |
| `eval/results.tsv` | Keep append-only. |
| `eval/role-baselines/revenue-medical-coding-specialist.md` | Keep. First frozen baseline. |
| `scripts/install-self-improvement-kit.sh` | Keep. Installs the lightweight kit. |
| `scripts/lint-agents.sh` | Keep. It should scan exactly the 51 installable agents. |
| `scripts/audit-agents.py` | Keep. It should audit exactly the 51 installable agents. |

## Removed Old Python Harness

Deleted:

```text
eval/harness/
eval/schema/
eval/rubrics/
eval/requirements.txt
eval/conftest.py
eval/__init__.py
scripts/run-eval.sh
```

Rationale:

- Not used by `.claude/commands/eval.md`.
- Pulls the repo toward a contradictory "deep Python harness" story.
- Contains Anthropic-only invocation and DSPy/GEPA assumptions that do not match the chosen lightweight workflow.
- Includes tests and caches for code that is no longer active.

## Generated Caches and Local Artifacts

Remove generated caches:

```text
eval/**/__pycache__/
scripts/__pycache__/
.pytest_cache/
```

Do not automatically delete or stage:

```text
calibration/
eval/items/
.beads/
```

Recommended disposition:

- Add `calibration/` to `.gitignore` if it is local generated output.
- Delete `eval/items/` only after confirming no curated item bank needs to be preserved.
- Fix or reinitialize beads separately if issue tracking is still desired.

## Utility Prompt Disposition

Decision: delete `agents/eval-exam-architect.md`; git history is enough if the old prompt needs to be recovered.

Follow-up:

1. Remove special-case exclusions from `scripts/lint-agents.sh`.
2. Remove utility-file handling from `scripts/audit-agents.py`.
3. Confirm `find agents -maxdepth 1 -name '*.md' | wc -l` returns 51.

Reason:

- `package.json` ships `agents/`.
- End users should receive only healthcare specialist agents.
- A utility prompt should not be installed as a healthcare role.

## Documentation Updates

Updated:

- `README.md`: removed wording implying an active calibration implementation.
- `INSTALL.md`: removed comparison against the retired harness.
- `AGENTS.md`: update repository map to say the Python harness was removed.

Add superseded banners:

- `docs/superpowers/specs/2026-03-20-exam-architect-eval-loop-design.md`
- `docs/superpowers/plans/2026-03-20-exam-architect-eval-loop.md`

Keep:

- `docs/superpowers/specs/2026-03-21-karpathy-eval-loop-design.md`
- `docs/superpowers/plans/2026-03-27-karpathy-eval-loop.md`
- `docs/superpowers/specs/2026-04-09-native-subagent-eval-loop-refinement.md`
- `docs/release-notes/2026-04-09-eval-loop-milestone.md`
- `CHANGELOG.md`

## Sequence

1. Create branch:

   ```bash
   git switch -c cleanup/remove-python-eval-harness
   ```

2. Snapshot state:

   ```bash
   git status --short
   git ls-files --others --exclude-standard
   ```

3. Remove tracked harness/schema/rubric-template files. Done.
4. Delete `agents/eval-exam-architect.md`. Done.
5. Update lint/audit scripts. Done.
6. Rewrite README/INSTALL/AGENTS references. Done.
7. Add superseded banners to historical docs. Done.
8. Clean generated caches. Done for removed harness paths; leave untracked local artifacts alone.
9. Run validation.
10. Review diff before commit.

## Validation

```bash
git status --short
rg -n "eval\\.harness|scripts/run-eval|eval/schema|eval/rubrics|eval-exam-architect|Python eval harness|calibration pipeline"
bash scripts/lint-agents.sh
python3 scripts/audit-agents.py --top 5
node bin/cli.js --help
npm pack --dry-run
git diff --check
```

Expected outcomes:

- No active docs point users to the Python harness.
- `agents/` contains exactly 51 installable agents.
- The package dry-run does not include utility eval prompts.
- The self-improvement kit still installs successfully.

## Risks

- Removing retired utility prompts requires script updates or lint counts may change.
- `calibration/` may contain useful local research artifacts; do not delete without explicit confirmation.
- Historical docs should be marked superseded, not silently rewritten, to preserve why the current loop exists.
- `bd` is currently unavailable; do not rely on issue-tracker commands until the bead database is repaired.

## Open Questions

- Should `calibration/` be ignored, archived outside the repo, or summarized into a curated doc?
- Should `eval/items/` be deleted now or reserved for the future MHA-Skills benchmark item bank?
