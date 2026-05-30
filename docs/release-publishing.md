# Release Publishing Runbook

Use this runbook after `main` is green and the package version has been reviewed.

## Preconditions

- `npm run release:check` passes locally and in GitHub Actions.
- `npm publish --dry-run --access public` shows the expected package contents.
- `node scripts/validate-public-version-sync.js` passes local metadata checks.
- The GitHub release tag, `package.json`, `VERSION`, and `install.sh` version agree.
- The npm maintainer has either configured npm trusted publishing for this repository workflow or added an `NPM_TOKEN` repository secret scoped to publish `healthcare-agents`.
- If neither is configured, the publish job fails with `ENEEDAUTH`; configure one of those auth paths and rerun the workflow.

## GitHub Actions Publish

1. Open Actions -> Publish npm Package.
2. Choose `Run workflow` on `main`.
3. Enter the expected version, for example `1.4.0`.
4. Approve the `npm-production` environment if GitHub requires review.
5. Confirm the workflow runs release readiness, package dry-run, `npm publish --access public --provenance`, and public version verification.

The workflow automatically uses `NPM_TOKEN` when the secret exists. If the secret is absent, it runs npm without `NODE_AUTH_TOKEN` so npm trusted publishing can use GitHub's OIDC token when the package is configured for trusted publishing.

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

Current evidence:

- Local `npm whoami` returns `E401 Unauthorized`.
- `npm view healthcare-agents version` returns `1.3.0`.
- `npm owner ls healthcare-agents` reports `ajhcs <215lyons@gmail.com>`.
- GitHub Actions publish run `26691215621` failed with `ENEEDAUTH` before the workflow split token and trusted-publishing modes.
- GitHub Actions publish run `26691265138` reached `Publish to npm with trusted publishing`, signed provenance, then npm rejected the package write with `E404 Not Found - PUT https://registry.npmjs.org/healthcare-agents`.

Maintainer action required:

1. In npm, configure trusted publishing for package `healthcare-agents` to allow repository `ajhcs/healthcare-agents`, workflow `.github/workflows/npm-publish.yml`, environment `npm-production`, and branch `main`; or add an `NPM_TOKEN` GitHub secret for an npm account with publish rights to `healthcare-agents`.
2. Rerun the `Publish npm Package` workflow on `main` with expected version `1.4.0`.
3. Confirm `node scripts/validate-public-version-sync.js --network` passes.
