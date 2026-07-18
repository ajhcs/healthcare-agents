#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { stablePrettyJson, validatePhysicianCountUpstream } = require('../lib/scale-physician-count-review');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'physician-count');
const UPSTREAM = path.join(FIXTURES, 'upstream');
const args = process.argv.slice(2);
const repoFlag = args.indexOf('--data-mcp-repo');
const toolkitFlag = args.indexOf('--toolkit-repo');
if (repoFlag < 0 || !args[repoFlag + 1] || toolkitFlag < 0 || !args[toolkitFlag + 1]) {
  console.error('usage: verify-scale-physician-count-upstream.js --data-mcp-repo PATH --toolkit-repo PATH');
  process.exit(2);
}
const dataRepo = path.resolve(args[repoFlag + 1]);
const toolkitRepo = path.resolve(args[toolkitFlag + 1]);
const paths = {
  prior_cumulative_packet: 'prior/cumulative-packet.json', cumulative_packet: 'cumulative-packet.json', decision_scenario: 'decision-scenario.json',
  identity_binding: 'identity-binding.json', no_execution_result: 'no-execution-result.json', process_claim: 'process-claim.json',
  prior_review_record: 'prior/cumulative-review-record.json', prior_assurance_case: 'prior/cumulative-module-assurance-case.json', toolkit_handoff: 'handoff.json'
};
const objects = {};
const hashes = {};
for (const [role, relativePath] of Object.entries(paths)) {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  objects[role] = JSON.parse(raw);
  hashes[role] = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
}
const evidencePaths = {
  acquisition: 'data-mcp/acquisition.json',
  normalized_input: 'data-mcp/normalized-input.json',
  producer_bound_input: 'data-mcp/producer-bound-input.json',
  public_evidence_bundle: 'data-mcp/public-evidence-bundle.json'
};
const evidenceArtifacts = {};
for (const [role, relativePath] of Object.entries(evidencePaths)) {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  evidenceArtifacts[role] = {
    value: JSON.parse(raw),
    raw_hash: 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex')
  };
}
const manifest = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'upstream-manifest.json'), 'utf8'));
const messages = validatePhysicianCountUpstream(manifest, objects, hashes, evidenceArtifacts);
for (const [repo, before, after, label] of [
  [dataRepo, manifest.producer_provenance.data_feature, manifest.producer_pins.healthcare_data_mcp, 'Data feature-to-producer'],
  [dataRepo, manifest.producer_pins.healthcare_data_mcp, manifest.producer_provenance.data_tracker, 'Data producer-to-tracker'],
  [toolkitRepo, manifest.producer_provenance.toolkit_feature, manifest.producer_pins.healthcare_toolkit, 'Toolkit feature-to-producer'],
  [toolkitRepo, manifest.producer_pins.healthcare_toolkit, manifest.producer_provenance.toolkit_tracker, 'Toolkit producer-to-tracker']
]) {
  const ancestry = spawnSync('git', ['-C', repo, 'merge-base', '--is-ancestor', before, after]);
  if (ancestry.status !== 0) messages.push(`${label} ancestry drift`);
}
const toolkitPaths = {
  cumulative_packet: 'contracts/reusable-run/v3/fixtures/physician-count/cumulative-packet.json',
  decision_scenario: 'contracts/reusable-run/v3/fixtures/physician-count/decision-scenario.json',
  identity_binding: 'contracts/reusable-run/v3/fixtures/physician-count/identity-binding.json',
  no_execution_result: 'contracts/reusable-run/v3/fixtures/physician-count/no-execution-result.json',
  process_claim: 'contracts/reusable-run/v3/fixtures/physician-count/process-claim.json',
  toolkit_handoff: 'contracts/reusable-run/v3/fixtures/physician-count/handoff.json',
  prior_cumulative_packet: 'contracts/reusable-run/v3/fixtures/annual-discharges/cumulative-packet.json',
  prior_review_record: 'contracts/reusable-run/v3/fixtures/annual-discharges-assurance/cumulative-review-record.json',
  prior_assurance_case: 'contracts/reusable-run/v3/fixtures/annual-discharges-assurance/cumulative-module-assurance-case.json'
};
for (const [role, sourcePath] of Object.entries(toolkitPaths)) {
  const resolvedToolkit = spawnSync('git', ['-C', toolkitRepo, 'show', `${manifest.producer_pins.healthcare_toolkit}:${sourcePath}`], { encoding: null });
  if (resolvedToolkit.status !== 0) messages.push(`Toolkit object did not resolve: ${role}`);
  else if (!resolvedToolkit.stdout.equals(fs.readFileSync(path.join(UPSTREAM, paths[role])))) messages.push(`stored Toolkit object differs from exact producer: ${role}`);
}
const committedPath = manifest.evidence_lineage?.committed_input_ref?.split(':').slice(2).join(':');
const resolved = spawnSync('git', ['-C', dataRepo, 'show', `${manifest.producer_pins.healthcare_data_mcp}:${committedPath}`], { encoding: null });
if (resolved.status !== 0) messages.push(`committed evidence input did not resolve at Data pin: ${String(resolved.stderr)}`);
else {
  const resolvedHash = 'sha256:' + crypto.createHash('sha256').update(resolved.stdout).digest('hex');
  if (resolvedHash !== manifest.evidence_lineage.normalized_input_raw_hash) messages.push('resolved committed evidence input bytes drift');
  if (!resolved.stdout.equals(fs.readFileSync(path.join(UPSTREAM, evidencePaths.normalized_input)))) messages.push('stored normalized input differs from exact committed Git input');
}
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-scale-lineage-'));
try {
  const rebuilds = [];
  for (let buildIndex = 0; buildIndex < 2; buildIndex += 1) {
    const checkout = path.join(temporary, `data-mcp-${buildIndex + 1}`);
    fs.mkdirSync(checkout);
    const archive = spawnSync('git', ['-C', dataRepo, 'archive', '--format=tar', manifest.producer_pins.healthcare_data_mcp], { encoding: null, maxBuffer: 128 * 1024 * 1024 });
    if (archive.status !== 0) {
      messages.push(`Data producer commit could not be exported for rebuild ${buildIndex + 1}: ${String(archive.stderr)}`);
      continue;
    }
    const extract = spawnSync('tar', ['-x', '-C', checkout], { input: archive.stdout, encoding: null });
    if (extract.status !== 0) {
      messages.push(`Data producer export could not be extracted for rebuild ${buildIndex + 1}: ${String(extract.stderr)}`);
      continue;
    }
    const rebuilt = path.join(temporary, `public-evidence-bundle-${buildIndex + 1}.json`);
    const build = spawnSync('python3', [
      '-m', 'shared.contracts.cli', 'build-public-evidence',
      '--input', path.join(checkout, committedPath),
      '--output', rebuilt,
      '--producer-commit', manifest.producer_pins.healthcare_data_mcp
    ], { cwd: checkout, encoding: null });
    if (build.status !== 0) {
      messages.push(`pinned Data bundle rebuild ${buildIndex + 1} failed: ${String(build.stderr)}`);
      continue;
    }
    const rebuiltBytes = Buffer.from(stablePrettyJson(JSON.parse(fs.readFileSync(rebuilt, 'utf8'))));
    rebuilds.push(rebuiltBytes);
    const rebuiltHash = 'sha256:' + crypto.createHash('sha256').update(rebuiltBytes).digest('hex');
    if (rebuiltHash !== manifest.evidence_lineage.bundle_raw_hash) messages.push(`pinned Data rebuild ${buildIndex + 1} bundle raw hash drift`);
    if (!rebuiltBytes.equals(fs.readFileSync(path.join(UPSTREAM, evidencePaths.public_evidence_bundle)))) messages.push(`stored bundle differs from exact pinned Data rebuild ${buildIndex + 1}`);
  }
  if (rebuilds.length !== 2 || !rebuilds[0].equals(rebuilds[1])) messages.push('two isolated pinned Data rebuilds must be byte-identical');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
if (messages.length) {
  for (const message of messages) console.error(message);
  process.exit(1);
}
console.log(`Scale physician-count upstream verified: Toolkit ${manifest.producer_pins.healthcare_toolkit}, Data MCP ${manifest.producer_pins.healthcare_data_mcp}, handoff ${manifest.toolkit_handoff_file_hash}`);
