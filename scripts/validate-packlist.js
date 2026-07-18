#!/usr/bin/env node
const { fail, runRequired } = require('./_release-utils');

const result = runRequired('npm', ['pack', '--json', '--dry-run']);
const pack = JSON.parse(result.stdout)[0];
const files = pack.files.map(file => file.path).sort();
const messages = [];
const forbidden = [
  /__pycache__\//,
  /\.py[cod]$/,
  /\.pytest_cache\//,
  /\.mypy_cache\//,
  /\.ruff_cache\//,
  /^eval\/run-logs\/(?!README\.md$)/,
  /^docs\/extracted\//,
  /^workflows\/evidence-packs\/(cache|downloads|private|tmp)\//,
  /^workflows\/evidence-packs\/.*(payer-contract|private-payer|portal-export|downloaded-source|phi).*\.(pdf|docx|xlsx|csv|json)$/i,
  /^workflows\/evidence-packs\/.*\.(pdf|docx|xlsx|csv|png|jpg|jpeg|gif|webp|zip)$/i,
  /^beads_compliance_audit\//,
  /(^|\/)\.DS_Store$/,
  /(^|\/)tmp\//,
  /(^|\/)temp\//
];
const required = [
  '.codex-plugin/plugin.json',
  'bin/cli.js',
  'install.sh',
  'agents/registry.json',
  'README.md',
  'INSTALL.md',
  'docs/eval/scorecard.json',
  'docs/eval/routing-benchmark.json',
  'docs/trust-and-safety.md',
  'docs/operator-os/catalog.md',
  'docs/operator-os/evidence-pack-authoring.md',
  'docs/release-notes/2026-05-31-operator-os-catalog-hardening.md',
  'docs/release-publishing.md',
  'workflows/workflows.json',
  'workflows/schema.json',
  'platforms/platforms.json',
  'platforms/schema.json',
  'safety/snippets.json',
  'lib/workflows.js',
  'lib/renderers.js',
  'lib/evidence-packs.js',
  'lib/scale-roster-bed-review.js',
  'lib/scale-input-fitness-review.js',
  'lib/scale-annual-discharges-review.js',
  'lib/operator-os/data-modes.js',
  'lib/operator-os/case-provenance.js',
  'lib/operator-os/case-data-provider.js',
  'lib/operator-os/denial-spike-synthetic.js',
  'lib/operator-os/golden-artifacts.js',
  'lib/operator-os/workflow-profiles.js',
  'lib/operator-os/fixtures/revenue-cycle.js',
  'lib/operator-os/fixtures/compliance-quality.js',
  'lib/operator-os/fixtures/operations-it.js',
  'workflows/operator-os-coverage.json',
  'workflows/evidence-packs/schema.json',
  'workflows/evidence-packs/denial-spike-workup.operator-os.v1.json',
  'workflows/evidence-packs/operator-os-standard-packs.v1.json',
  'eval/results.tsv',
  'scripts/validate-packlist.js',
  'scripts/validate-evidence-packs.js',
  'scripts/validate-operator-os-coverage.js',
  'scripts/scaffold-evidence-pack.js',
  'scripts/test-evidence-pack-regression.js',
  'scripts/generate-scale-roster-bed-review.js',
  'scripts/verify-scale-roster-bed-upstream.js',
  'scripts/test-scale-roster-bed-review.js',
  'scripts/generate-scale-input-fitness-review.js',
  'scripts/verify-scale-input-fitness-upstream.js',
  'scripts/test-scale-input-fitness-review.js',
  'scripts/generate-scale-annual-discharges-review.js',
  'scripts/verify-scale-annual-discharges-upstream.js',
  'scripts/test-scale-annual-discharges-review.js',
  'review-protocols/fixtures/scale-roster-bed-basis/upstream-manifest.json',
  'review-protocols/fixtures/scale-roster-bed-basis/adversarial-cases.json',
  'review-protocols/fixtures/scale-roster-bed-basis/handoff.json',
  'review-protocols/fixtures/scale-input-packets/operating-revenue/upstream-manifest.json',
  'review-protocols/fixtures/scale-input-packets/operating-revenue/upstream/handoff.json',
  'review-protocols/fixtures/scale-input-packets/operating-revenue/upstream/data-mcp/normalized-input.json',
  'review-protocols/fixtures/scale-input-packets/operating-revenue/upstream/data-mcp/producer-bound-input.json',
  'review-protocols/fixtures/scale-input-packets/operating-revenue/upstream/data-mcp/public-evidence-bundle.json',
  'review-protocols/fixtures/scale-input-packets/operating-revenue/handoff.json',
  'review-protocols/fixtures/scale-input-packets/annual-discharges/upstream-manifest.json',
  'review-protocols/fixtures/scale-input-packets/annual-discharges/upstream/handoff.json',
  'review-protocols/fixtures/scale-input-packets/annual-discharges/upstream/data-mcp/acquisition.json',
  'review-protocols/fixtures/scale-input-packets/annual-discharges/upstream/data-mcp/normalized-input.json',
  'review-protocols/fixtures/scale-input-packets/annual-discharges/upstream/data-mcp/producer-bound-input.json',
  'review-protocols/fixtures/scale-input-packets/annual-discharges/upstream/data-mcp/public-evidence-bundle.json',
  'review-protocols/fixtures/scale-input-packets/annual-discharges/handoff.json',
  'scripts/test-case-data-provider.js',
  'scripts/test-denial-spike-golden-artifact.js',
  'scripts/test-operator-os-coverage-regression.js',
  'scripts/test-tarball-smoke.js',
  'scripts/validate-workflows.js',
  'scripts/validate-workup-canaries.js',
  'scripts/validate-platform-exports.js',
  'scripts/test-platform-render-snapshots.js',
  'scripts/validate-public-version-sync.js',
  'scripts/validate-npm-publish-workflow.js',
  'scripts/install-codex-plugin.sh',
  'skills/healthcare-agents/SKILL.md'
];

for (const file of files) {
  for (const pattern of forbidden) {
    if (pattern.test(file)) messages.push(`forbidden package file: ${file}`);
  }
}
for (const file of required) {
  if (!files.includes(file)) messages.push(`required package file missing: ${file}`);
}

fail(messages);
console.log(`packlist ok: ${files.length} files, ${pack.filename}, unpacked ${pack.unpackedSize} bytes`);
