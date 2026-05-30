# Release Publishing Runbook

Use this runbook after `main` is green and the package version has been reviewed.

## Preconditions

- `npm run release:check` passes locally and in GitHub Actions.
- `npm publish --dry-run --access public` shows the expected package contents.
- `node scripts/validate-public-version-sync.js` passes local metadata checks.
- The GitHub release tag, `package.json`, `VERSION`, and `install.sh` version agree.
- The npm maintainer has either configured npm trusted publishing for this repository workflow or added an `NPM_TOKEN` repository secret scoped to publish `healthcare-agents`.

## GitHub Actions Publish

1. Open Actions -> Publish npm Package.
2. Choose `Run workflow` on `main`.
3. Enter the expected version, for example `1.4.0`.
4. Approve the `npm-production` environment if GitHub requires review.
5. Confirm the workflow runs release readiness, package dry-run, `npm publish --access public --provenance`, and public version verification.

## Local Publish Fallback

Use this only from a maintainer shell authenticated to npm:

```bash
npm whoami
npm run release:check
npm publish --dry-run --access public
npm publish --access public --provenance
node scripts/validate-public-version-sync.js --network
```

## Current Known Gap

At the time the Healthcare Admin Workup Engine landed, GitHub and repository metadata were at `1.4.0`, but npm latest still reported `1.3.0`. Publishing `healthcare-agents@1.4.0` requires authenticated npm maintainer credentials and is tracked in Beads as `beads-mfb.4` until `node scripts/validate-public-version-sync.js --network` passes.
