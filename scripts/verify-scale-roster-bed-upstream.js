#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { sha256 } = require('../lib/review-protocols');
const { validateUpstreamManifest } = require('../lib/scale-roster-bed-review');

const ROOT = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'review-protocols', 'fixtures', 'scale-roster-bed-basis', 'upstream-manifest.json'), 'utf8'));
const toolkitRepo = process.env.HEALTHCARE_TOOLKIT_REPO;
const dataMcpRepo = process.env.HEALTHCARE_DATA_MCP_REPO;
if (!toolkitRepo || !dataMcpRepo) throw new Error('HEALTHCARE_TOOLKIT_REPO and HEALTHCARE_DATA_MCP_REPO are required');
assert.deepStrictEqual(validateUpstreamManifest(manifest), []);

function gitJson(repo, commit, filePath) {
  const result = spawnSync('git', ['show', `${commit}:${filePath}`], { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || `cannot resolve ${commit}:${filePath}`);
  return JSON.parse(result.stdout);
}

const hashFields = {
  decision_scenario: 'scenario_sha256',
  identity_binding: 'binding_sha256',
  computation_result: 'result_sha256',
  claim_candidate: 'claim_sha256'
};
for (const [role, object] of Object.entries(manifest.toolkit.objects)) {
  const value = gitJson(toolkitRepo, manifest.toolkit.merge_commit, object.path);
  const hashField = hashFields[role];
  assert.strictEqual(value[hashField], object.hash, `${role} embedded hash must match manifest`);
  delete value[hashField];
  assert.strictEqual(sha256(value), object.hash, `${role} canonical hash must match manifest`);
}

const toolkitHandoff = gitJson(toolkitRepo, manifest.toolkit.merge_commit, manifest.toolkit.handoff_path);
assert.strictEqual(toolkitHandoff.evidence.producer_commit, manifest.data_mcp.producer_commit);
assert.strictEqual(toolkitHandoff.evidence.bundle_hash, manifest.data_mcp.bundle_hash);
for (const object of toolkitHandoff.objects) {
  const role = object.role === 'computation_result' ? 'computation_result' : object.role;
  assert.strictEqual(object.content_hash, manifest.toolkit.objects[role].hash);
}

const dataInput = gitJson(dataMcpRepo, manifest.data_mcp.producer_commit, manifest.data_mcp.input_path);
assert.strictEqual(dataInput.producer.commit, '0000000000000000000000000000000000000000', 'checked-in Data MCP input must retain its deterministic producer placeholder');
dataInput.producer.commit = manifest.data_mcp.producer_commit;
const rebuiltBundleHash = sha256({ schema_version: 'ushso.public-evidence-bundle.v1', ...dataInput });
assert.strictEqual(rebuiltBundleHash, manifest.data_mcp.bundle_hash, 'rebuilt public evidence bundle hash must match manifest');
const upstreamStrings = new Set();
(function collect(value) {
  if (typeof value === 'string') upstreamStrings.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
})(dataInput);
const toolkitArtifactIds = new Set([
  'scenario:scale-v1:all-six-roster-bed-readiness:2026-07-16',
  'identity-binding:scale-v1:all-six-roster-bed:2026-07-16',
  'computation:scale-v1:all-six:no-score:2026-07-16'
]);
for (const evidenceId of manifest.evidence_identifiers) {
  if (!toolkitArtifactIds.has(evidenceId)) assert(upstreamStrings.has(evidenceId), `evidence id absent from pinned Data MCP input: ${evidenceId}`);
}

console.log(`upstream manifest verified at Toolkit ${manifest.toolkit.merge_commit} and Data MCP ${manifest.data_mcp.producer_commit}`);
