#!/usr/bin/env node
const fs = require('fs');
const { targets } = require('./release-targets');
function workflowProblems(workflow) {
  const failures = [];
  const requireText = value => { if (!workflow.includes(value)) failures.push('missing ' + value); };
  requireText('workflow_dispatch:');
  requireText("ref: ${{ inputs.expected_commit }}");
  requireText('environment: npm-production');
  requireText("HAS_NPM_TOKEN: ${{ secrets.NPM_TOKEN != '' }}");
  requireText("node-version: '18.19.1'");
  requireText("node-version: '22.14.0'");
  requireText('npm install --global npm@11.5.1 --ignore-scripts --no-audit --no-fund');
  const permissions = workflow.match(/^permissions:\n([\s\S]*?)\njobs:/m)?.[1];
  if (permissions?.trim() !== 'contents: read\n  id-token: write') failures.push('publishing permissions changed');
  const input = workflow.split('\npermissions:')[0];
  for (const name of ['expected_version', 'expected_commit']) {
    const block = input.match(new RegExp('      ' + name + ':\\n([\\s\\S]*?)(?=\\n      \\w+:|$)'))?.[1];
    if (!block?.includes('required: true') || !block.includes('type: string')) failures.push(name + ' must be required');
  }
  if (/^\s+(push|pull_request|schedule):/m.test(input)) failures.push('only manual dispatch is allowed');
  const steps = workflow.split(/^      - name: /m).slice(1);
  const names = steps.map(step => step.split('\n')[0]);
  const order = ['Check out approved commit', 'Set up qualification runtime', 'Verify release targets',
    'Install locked dependencies', 'Run release readiness gate', 'Set up publishing runtime',
    'Pin npm trusted publishing client', 'Verify release tag and record npm latest',
    'Verify package contents with npm token', 'Verify package contents with trusted publishing',
    'Publish to npm with token', 'Publish to npm with trusted publishing',
    'Verify npm channel and unchanged latest', 'Verify public npm and GitHub release'];
  if (JSON.stringify(names) !== JSON.stringify(order)) failures.push('release step order/scope mismatch');
  for (const value of ['EXPECTED_VERSION: ${{ inputs.expected_version }}', 'EXPECTED_COMMIT: ${{ inputs.expected_commit }}',
    'run: node scripts/release-targets.js ci', 'run: npm ci --ignore-scripts --no-audit --no-fund',
    'run: npm run release:check', 'git fetch origin "refs/tags/$RELEASE_TAG:refs/tags/$RELEASE_TAG"',
    'test "$(git rev-parse "$RELEASE_TAG^{commit}")" = "$EXPECTED_COMMIT"',
    'node scripts/release-targets.js before "$RUNNER_TEMP/npm-before.json"',
    'node scripts/release-targets.js after "$RUNNER_TEMP/npm-before.json"',
    'node scripts/validate-public-version-sync.js --network', 'GH_TOKEN: ${{ github.token }}']) requireText(value);
  const publish = steps.filter(step => /^\s*run: npm publish /m.test(step));
  if (publish.length !== 4) failures.push('expected two dry runs and two mutually exclusive publish paths');
  for (const step of publish) {
    const line = step.match(/^\s*run: (npm publish .+)$/m)?.[1];
    const dry = step.startsWith('Verify package contents');
    const expected = 'npm publish ' + (dry ? '--dry-run ' : '') +
      '--ignore-scripts --access public ' + (dry ? '' : '--provenance ') +
      '--registry https://registry.npmjs.org --tag "$RELEASE_NPM_TAG"';
    if (line !== expected) failures.push('unsafe publish command in ' + step.split('\n')[0]);
    if (!step.includes('RELEASE_NPM_TAG: ${{ steps.targets.outputs.npm_tag }}')) failures.push('missing validated dist-tag binding');
    const token = step.split('\n')[0].endsWith('with token') || step.split('\n')[0].endsWith('with npm token');
    const condition = "if: ${{ env.HAS_NPM_TOKEN " + (token ? "== 'true'" : "!= 'true'") + " }}";
    if (!step.includes(condition)) failures.push('publish authentication branches must be mutually exclusive');
    if (token && !step.includes('NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}')) failures.push('existing token binding missing');
  }
  for (const step of steps) {
    const run = step.match(/^\s*run: ([\s\S]*?)(?=\n        env:|$)/m)?.[1] || '';
    if (run.includes('${{ inputs.')) failures.push('dispatch input interpolated directly into shell');
  }
  if (/npm dist-tag|gh release create/.test(workflow)) failures.push('workflow must not mutate tags or create GitHub releases');
  return failures;
}
function main() {
  const failures = workflowProblems(fs.readFileSync('.github/workflows/npm-publish.yml', 'utf8'));
  try { targets(JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch (error) { failures.push(error.message); }
  const runbook = fs.readFileSync('docs/release-publishing.md', 'utf8');
  for (const needle of ['Release Publishing Runbook', 'npm trusted publishing', 'NPM_TOKEN', 'expected version',
    'dist-tag', 'validate-public-version-sync.js --network', 'npm-before.json', 'expected_commit'])
    if (!runbook.includes(needle)) failures.push('runbook missing ' + needle);
  if (failures.length) { failures.forEach(f => console.error('npm publish workflow: ' + f)); process.exitCode = 1; }
  else console.log('npm publish workflow policy ok; beta channel is next, existing permission/environment scope retained');
}
if (require.main === module) main();
module.exports = { workflowProblems };
