# Lifecycle

## Artifact Roles

- `agents/*.md` are shipped specialist prompts.
- `references/examples/` are shipped exemplars.
- `calibration/` is maintainer-only and never shipped as product content.
- `registry.yaml` is repo-visible metadata used to derive tools and catalogs.

## Refresh Cadence

- Agent prompts refresh when calibration or regulation changes warrant it.
- Reference exemplars and holdouts refresh when their `regulatory_as_of` date becomes stale.
- Attack surfaces refresh at least annually.
- The registry refreshes when agents, deliverables, or utility exclusions change.

## Review Status

Allowed states are `draft`, `reviewed`, `stale`, and `retired`.

## Utility Prompt Rule

The `utility: true` frontmatter flag is authoritative for exclusion. `utility_agents` in `registry.yaml` is the generated mirror that downstream tooling reads.

## Release Rule

Maintainers should treat calibration and registry updates as separate from the simple `agents/*.md` install path. Basic users should not need maintainer tooling to use the repository.
