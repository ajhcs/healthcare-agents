#!/usr/bin/env node
const fs = require('fs');

const workflowPath = '.github/workflows/npm-publish.yml';
const runbookPath = 'docs/release-publishing.md';
const failures = [];

function requireFile(file) {
  if (!fs.existsSync(file)) {
    failures.push('missing file: ' + file);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

const workflow = requireFile(workflowPath);
const runbook = requireFile(runbookPath);

for (const needle of [
  'workflow_dispatch:',
  'environment: npm-production',
  'id-token: write',
  'npm run release:check',
  'npm publish --dry-run --access public',
  'npm publish --access public --provenance',
  'node scripts/validate-public-version-sync.js --network'
]) {
  if (!workflow.includes(needle)) failures.push(workflowPath + ' missing ' + needle);
}

for (const needle of [
  'Release Publishing Runbook',
  'npm trusted publishing',
  'NPM_TOKEN',
  'beads-mfb.4',
  'validate-public-version-sync.js --network'
]) {
  if (!runbook.includes(needle)) failures.push(runbookPath + ' missing ' + needle);
}

if (failures.length) {
  for (const failure of failures) console.error('npm publish workflow: ' + failure);
  process.exit(1);
}

console.log('npm publish workflow ok');
