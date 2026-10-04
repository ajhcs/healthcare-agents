# Pull Request

## Summary

<!-- What does this change and why? Link the related issue if one exists. -->

## Type of change

- [ ] New agent (`agents/*.md` + registry sync)
- [ ] Agent improvement (existing `agents/*.md`)
- [ ] CLI / Workup Engine / Operator OS code (`bin/`, `lib/`)
- [ ] Workflows or evidence packs (`workflows/`)
- [ ] Docs only
- [ ] Release / tooling / CI

## Checklist

- [ ] `npm run release:check` passes locally (the same gate CI runs).
- [ ] No PHI, real patient data, or proprietary payer data anywhere in the diff — synthetic examples only.
- [ ] Claims cite specific named sources (CMS, OIG, HRSA, NCQA, HL7, X12, ...), not "industry standard".

### If this touches `agents/*.md`

- [ ] Filename follows `{division-prefix}-{kebab-case-role-name}.md` and matches the `name` frontmatter.
- [ ] The agent stays a narrow specialist — no clinical advice, legal conclusions, or jack-of-all-trades scope (see [CONTRIBUTING.md](../CONTRIBUTING.md)).
- [ ] Registry and docs are in sync (`npm run validate:registry`).

### If this touches eval files

- [ ] `eval/rubric.md` and `eval/role-baselines/` are unmodified (they are frozen).
- [ ] `eval/results.tsv` changes are append-only.
