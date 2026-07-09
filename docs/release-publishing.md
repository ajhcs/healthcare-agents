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
3. Enter the expected version, for example `1.6.0`.
4. Approve the `npm-production` environment if GitHub requires review.
5. Confirm the workflow runs release readiness, package dry-run, `npm publish --access public --provenance`, and public version verification.

The workflow automatically uses `NPM_TOKEN` when the secret exists. If the secret is absent, it runs npm without `NODE_AUTH_TOKEN` so npm trusted publishing can use GitHub's OIDC token when the package is configured for trusted publishing.

## Local Publish Fallback

Use this only from a maintainer shell authenticated to npm:

```bash
npm whoami
npm run release:check
npm publish --dry-run --access public
npm publish --access public --otp=<one-time-password>
node scripts/validate-public-version-sync.js --network
```

## Current Publication Status

`healthcare-agents@1.5.0` is the latest published npm package at the start of the v1.6.0 release-prep branch. After v1.6.0 publication, the `latest` dist-tag and GitHub release should resolve to `1.6.0`.

Verification commands:

```bash
npm view healthcare-agents@latest version
node scripts/validate-public-version-sync.js --network
node scripts/verify-public-release.js --network
```

Expected result:

- npm latest reports `1.6.0`.
- Public version sync passes.
- Public npm and GitHub release artifacts verify for `v1.6.0`.

## Future Publish Auth Notes

GitHub Actions publishing should use one of the supported npm auth paths before the next release:

1. npm trusted publishing for package `healthcare-agents`, repository `ajhcs/healthcare-agents`, workflow `.github/workflows/npm-publish.yml`, environment `npm-production`, and branch `main`.
2. An npm automation token stored as the GitHub Actions secret `NPM_TOKEN`.

Classic or granular tokens that still require interactive 2FA will fail in CI with `EOTP`. For an emergency maintainer fallback, publish from a local authenticated shell with a live OTP, then run the network verification commands above.
