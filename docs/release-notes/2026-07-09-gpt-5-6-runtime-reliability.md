# Healthcare Agents v1.6.0 Release Notes

Released: 2026-07-09

## Summary

Version 1.6.0 upgrades Healthcare Agents for the GPT-5.6 model family and
strengthens end-to-end workflow reliability across all generated runtime
surfaces. The release reduces irrelevant routing context, makes long-horizon
state and terminal completion explicit, and adds benchmark-derived failure
probes without claiming external benchmark performance that was not measured.

## Highlights

- Workflow-first routing now starts from a 25.7 KB generated index instead of
  loading the 157.6 KB canonical workflow and agent registries together.
- The workflow and fallback agent indexes total 51.5 KB, 67% smaller than the
  canonical routing sources, and are freshness-checked during release gates.
- Router, CLI, Codex/Claude workflow skills, generated specialist skills,
  GitHub Copilot surfaces, Microsoft 365 exports, and Azure Foundry specs now
  share a compact state-ledger and terminal-completion contract.
- Multi-step outputs distinguish `Completed`, `Partial`, and `Blocked` using
  terminal evidence instead of treating subtask progress as full completion.
- Eval guidance assigns GPT-5.6 Sol, Terra, and Luna by role and requires
  measured effort/pro-mode comparisons rather than assuming maximum reasoning
  is always best.
- Three synthetic HealthAdminBench-derived canaries cover prior authorization,
  denial appeals, and closed-loop DME processing.
- Prompt-quality guidance now rewards prompt economy and tightens growth caps
  instead of using a 500-line target as a quality proxy.

## Research Basis

The migration follows current OpenAI GPT-5.6 model and prompting guidance:

- <https://developers.openai.com/api/docs/guides/latest-model>
- <https://developers.openai.com/api/docs/models>
- <https://developers.openai.com/api/docs/guides/reasoning-best-practices>

The reliability controls and canaries draw from the published HealthAdminBench
task taxonomy and failure analysis:

- <https://som-shahlab.github.io/health-admin-bench-website/>
- <https://arxiv.org/abs/2604.09937>

## Scope

This is a prompt architecture, evaluation, and portable-runtime release. It
does not fine-tune model weights, validate clinical decisions, authorize PHI
processing, or establish production autonomy. The local reliability canaries
are prompt-level synthetic checks; they are not a substitute for running the
actual HealthAdminBench GUI environments.

Final clinical, legal, coding, billing, audit, compliance, contracting,
employment, executive, and emergency decisions remain with qualified human
owners in approved environments.

## Validation

Release readiness passed with:

```bash
npm test
npm publish --dry-run --access public
node scripts/validate-public-version-sync.js
node scripts/verify-public-release.js
```

The release gate covers all 51 agent prompts, all 16 workflows, all 13 release
canaries, generated router-index freshness and size, platform render snapshots,
installer behavior, package contents, tarball smoke tests, safety boundaries,
and public metadata consistency.

GitHub Actions also validated the feature PR before it was merged to `main`.

## Publication Verification

After npm and GitHub publication, verify:

```bash
npm view healthcare-agents@latest version
node scripts/validate-public-version-sync.js --network
node scripts/verify-public-release.js --network
```
