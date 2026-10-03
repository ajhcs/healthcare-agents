# Release Publishing Runbook

This checkout proposes healthcare-agents@2.0.0-beta.1 on the npm next dist-tag and
the GitHub prerelease v2.0.0-beta.1 in ajhcs/healthcare-agents. The npm latest
channel remains unchanged. Publication requires separate explicit authorization;
local packaging or dry-run results do not grant it.

## Local preparation

Run the local release gate and inspect the exact package from the reviewed commit:

    npm ci --ignore-scripts --no-audit --no-fund
    npm run release:check
    node scripts/release-targets.js local
    npm pack --ignore-scripts --json
    npm publish --dry-run --ignore-scripts --access public --registry https://registry.npmjs.org --tag next

package.json publishConfig selects public access, the public npm registry and next.
Every workflow publish command additionally supplies the validated dist-tag explicitly.
Beta versions cannot use latest; stable promotion needs a new reviewed version and
publishConfig change. Package name, repository URL, homepage and channel are checked.
The expected version and expected_commit must match the exact full checked-out SHA.
The workflow ref must resolve to the same SHA. Dispatch inputs enter shell commands
through environment variables.

## Authorized public actions, in order

1. Push the reviewed branch to ajhcs/healthcare-agents and merge its PR through normal
   repository controls. If the release commit or payload changes, recheck and record
   that exact commit rather than reusing the candidate's qualification.
2. Point v2.0.0-beta.1 at that approved commit and create its GitHub release with the
   prerelease flag enabled. Do not mark it latest. The publishing workflow verifies
   that the remote tag resolves to expected_commit and that the release is published,
   has the exact tag and is a prerelease before it can publish to npm.
3. Manually dispatch .github/workflows/npm-publish.yml from the reviewed workflow ref,
   supplying expected_version=2.0.0-beta.1 and the full expected_commit. Preserve
   the existing npm-production environment approval and existing authentication.
4. Verify npm next points at 2.0.0-beta.1, npm latest equals the recorded pre-publish
   value, and the exact GitHub prerelease and package metadata agree. Run
   node scripts/validate-public-version-sync.js --network and
   node scripts/verify-public-release.js --network after publication.

The workflow runs qualification on Node 18.19.1 after installing locked dependencies,
then uses Node 22.14.0/npm 11.5.1 to publish. These versions meet the documented
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) minimum.
Cloud execution and authentication have not been exercised by local dry-run checks.
Permissions remain contents: read and id-token: write. The npm-production environment,
NPM_TOKEN secret reference and optional trusted-publisher path are unchanged.
No token, trusted publisher, environment policy or CI permission is created here.
A maintainer must use an already authorized publisher that permits direct npm publish;
if it is absent, stop and obtain separately scoped authority for that setup.

Immediately before publishing, the workflow checks version availability and records
the current latest in RUNNER_TEMP/npm-before.json. It fails closed on missing registry
or GitHub data, an occupied version, wrong commit or wrong prerelease state.
After publishing it detects a latest change without automatically changing any tag.
Concurrent independent latest releases can also trigger this stop; a maintainer reviews
the recorded state. npm versions cannot be reused once published.
Lifecycle scripts are disabled for dependency installation, packaging and publishing.

## Rollback limits

Before publication, discard the isolated candidate without touching the canonical
checkout. After publication, stop further distribution and issue a reviewed successor;
npm publication is not reversible version replacement. Any removal or dist-tag change
requires its own scoped authorization. For a local Codex installation, remove the
plugin and local marketplace with the official commands, then remove only its
owner-created preparation directory. Existing controlled native qualification records
byte/mode restoration; that receipt is not a promise about every customer's config.

No public push, tag push, npm publish, workflow dispatch, credential setup or marketplace
submission is performed by this preparation run.
