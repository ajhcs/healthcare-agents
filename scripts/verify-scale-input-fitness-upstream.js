#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { validateScalePacketUpstream } = require('../lib/scale-input-fitness-review');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'operating-revenue');
const UPSTREAM = path.join(FIXTURES, 'upstream');
const args = process.argv.slice(2);
const repoFlag = args.indexOf('--data-mcp-repo');
if (repoFlag < 0 || !args[repoFlag + 1]) {
  console.error('usage: verify-scale-input-fitness-upstream.js --data-mcp-repo PATH');
  process.exit(2);
}
const dataRepo = path.resolve(args[repoFlag + 1]);
const paths = {
  baseline_packet: 'baseline-packet.json', cumulative_packet: 'cumulative-packet.json', decision_scenario: 'decision-scenario.json',
  identity_binding: 'identity-binding.json', no_execution_result: 'no-execution-result.json', process_claim: 'process-claim.json',
  prior_review_record: 'prior/claim-review-record.json', prior_assurance_case: 'prior/module-assurance-case.json', toolkit_handoff: 'handoff.json'
};
const objects = {};
const hashes = {};
for (const [role, relativePath] of Object.entries(paths)) {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  objects[role] = JSON.parse(raw);
  hashes[role] = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
}
const evidencePaths = {
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
const messages = validateScalePacketUpstream(manifest, objects, hashes, evidenceArtifacts);
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
  const checkout = path.join(temporary, 'data-mcp');
  fs.mkdirSync(checkout);
  const archive = spawnSync('git', ['-C', dataRepo, 'archive', '--format=tar', manifest.producer_pins.healthcare_data_mcp], { encoding: null, maxBuffer: 128 * 1024 * 1024 });
  if (archive.status !== 0) messages.push(`Data producer commit could not be exported: ${String(archive.stderr)}`);
  else {
    const extract = spawnSync('tar', ['-x', '-C', checkout], { input: archive.stdout, encoding: null });
    if (extract.status !== 0) messages.push(`Data producer export could not be extracted: ${String(extract.stderr)}`);
    else {
      const rebuilt = path.join(temporary, 'public-evidence-bundle.json');
      const build = spawnSync('python3', [
        '-m', 'shared.contracts.cli', 'build-public-evidence',
        '--input', path.join(checkout, committedPath),
        '--output', rebuilt,
        '--producer-commit', manifest.producer_pins.healthcare_data_mcp
      ], { cwd: checkout, encoding: null });
      if (build.status !== 0) messages.push(`pinned Data bundle rebuild failed: ${String(build.stderr)}`);
      else {
        const rebuiltBytes = fs.readFileSync(rebuilt);
        const rebuiltHash = 'sha256:' + crypto.createHash('sha256').update(rebuiltBytes).digest('hex');
        if (rebuiltHash !== manifest.evidence_lineage.bundle_raw_hash) messages.push('pinned Data rebuild bundle raw hash drift');
        if (!rebuiltBytes.equals(fs.readFileSync(path.join(UPSTREAM, evidencePaths.public_evidence_bundle)))) messages.push('stored bundle differs from exact pinned Data rebuild');
      }
    }
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
if (messages.length) {
  for (const message of messages) console.error(message);
  process.exit(1);
}
console.log(`Scale operating-revenue upstream verified: Toolkit ${manifest.producer_pins.healthcare_toolkit}, Data MCP ${manifest.producer_pins.healthcare_data_mcp}, handoff ${manifest.toolkit_handoff_file_hash}`);
