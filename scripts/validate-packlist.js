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
  /^beads_compliance_audit\//,
  /(^|\/)\.DS_Store$/,
  /(^|\/)tmp\//,
  /(^|\/)temp\//
];
const required = [
  'bin/cli.js',
  'install.sh',
  'agents/registry.json',
  'README.md',
  'INSTALL.md',
  'docs/eval/scorecard.json',
  'docs/eval/routing-benchmark.json',
  'docs/trust-and-safety.md',
  'workflows/workflows.json',
  'workflows/schema.json',
  'platforms/platforms.json',
  'platforms/schema.json',
  'safety/snippets.json',
  'lib/workflows.js',
  'lib/renderers.js',
  'eval/results.tsv',
  'scripts/validate-packlist.js',
  'scripts/test-tarball-smoke.js',
  'scripts/validate-workflows.js',
  'scripts/validate-workup-canaries.js',
  'scripts/validate-platform-exports.js',
  'scripts/test-platform-render-snapshots.js',
  'scripts/validate-public-version-sync.js'
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
