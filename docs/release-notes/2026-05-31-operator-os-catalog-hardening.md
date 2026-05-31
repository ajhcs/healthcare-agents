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

## What Shipped

- `healthcare-agents operator-os coverage` reports the catalog status for all 16 workflows.
- `healthcare-agents evidence-pack list`, `show`, and `scaffold` expose the offline evidence-pack surface from the CLI.
- `workflows/operator-os-coverage.json` is the machine-readable coverage source of truth.
- `workflows/evidence-packs/operator-os-standard-packs.v1.json` adds standard packs for the 15 non-exemplar workflows.
- `workflows/evidence-packs/denial-spike-workup.operator-os.v1.json` remains the exemplar pack with the deepest Denial Spike treatment.
- `docs/operator-os/catalog.md` and `docs/operator-os/evidence-pack-authoring.md` document coverage status, citation-card semantics, provenance labels, and authoring rules.
- Release readiness now validates evidence packs, Operator OS coverage, CLI behavior, package contents, provenance fixtures, and scaffold behavior.

## Workflow Coverage

The v1.5.0 catalog covers revenue cycle, payer contracting, prior authorization, discharge barriers, HIPAA evidence, survey readiness, patient safety RCA2, ED boarding, ambulatory access, value-based care risk, HEDIS/Stars gap closure, HL7/FHIR incidents, dashboard specs, pharmacy contract scorecards, and emergency preparedness exercises.

Denial Spike is the first exemplar. The other workflows are standard packs: they have evidence metadata, citation cards, docs, and validation, but not workflow-specific golden-artifact scoring yet.

## Scope

This release remains healthcare administration decision support. Evidence packs
name source families, lookup paths, owners, and review checks; they are not
verified pinpoint citations, payer-contract interpretations, legal conclusions,
clinical decisions, billing authority, audit approval, accreditation guarantees,
or a PHI processing environment.

Normal CLI workup generation, evidence-pack display, scaffold generation, tests, package validation, and release readiness do not fetch live external resources. Live evidence refresh/search, payer portal connectors, private contract ingestion, PHI-bearing upload parsing, and MCP adapters remain future integration work.

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

Additional release-prep checks passed:

```bash
node scripts/verify-public-release.js
node scripts/validate-public-version-sync.js
node scripts/validate-npm-publish-workflow.js
node scripts/test-cli-regression.js
node scripts/test-case-data-provider.js
node scripts/validate-packlist.js
npm pack --json --dry-run
npm publish --dry-run --access public
```

## Publication Notes

The v1.5.0 branch is prepared for PR review and package publication. Publishing
still requires maintainer-controlled npm/GitHub release actions; local release
metadata checks are expected to pass before publication, while network checks
for `healthcare-agents@1.5.0` should be run after the public artifacts exist.

After the GitHub release is created and the npm package is published, verify:

```bash
node scripts/validate-public-version-sync.js --network
node scripts/verify-public-release.js --network
```
