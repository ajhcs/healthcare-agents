# Healthcare Agents v1.5.0 Release Notes

Released: 2026-05-31

## Summary

Version 1.5.0 hardens Operator OS from a first exemplar into a full catalog
surface. All 16 healthcare administration workflows now have coverage metadata,
offline-first evidence packs, scaffoldable citation-card templates, routed
workup support, and release-gated validation.

## Highlights

- Operator OS coverage now reports all 16 workflows with exemplar or
  standard-pack status.
- Every workflow has an evidence pack with source families, required evidence,
  human review owners, common failure modes, PHI/compliance notes, and citation
  card verification status.
- `healthcare-agents evidence-pack scaffold <workflow-id>` generates a
  workflow-specific starter pack for local governance review.
- `healthcare-agents workup ... --data-mode public-evidence` attaches
  offline evidence-pack metadata without network access or private data.
- CLI data-mode handling now accepts hyphenated aliases such as
  `public-evidence` and documents the valid modes in `--help`.

## Scope

This release remains healthcare administration decision support. Evidence packs
name source families, lookup paths, owners, and review checks; they are not
verified pinpoint citations, payer-contract interpretations, legal conclusions,
clinical decisions, billing authority, audit approval, accreditation guarantees,
or a PHI processing environment.

## Validation

Release readiness passed locally with:

```bash
npm test
```

The release-prep dogfood pass exercised all 16 workflows through:

```bash
healthcare-agents operator-os coverage --json
healthcare-agents evidence-pack show <workflow-id> --json
healthcare-agents evidence-pack scaffold <workflow-id>
healthcare-agents workup "<workflow canary prompt>" --target codex --data-mode public-evidence --json
```

The dogfood pass verified that each workflow is present in coverage, each
evidence pack resolves by workflow id, each scaffold returns the matching
workflow id with citation cards, and each canary prompt routes back to the
expected workflow with public evidence metadata attached.

## Publication Notes

The v1.5.0 branch is prepared for PR review and package publication. Publishing
still requires maintainer-controlled npm/GitHub release actions; local release
metadata checks are expected to pass before publication, while network checks
for `healthcare-agents@1.5.0` should be run after the public artifacts exist.
