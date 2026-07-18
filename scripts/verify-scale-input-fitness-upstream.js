#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { validateScalePacketUpstream } = require('../lib/scale-input-fitness-review');
const { verifyPinnedDataEvidence } = require('../lib/scale-input-fitness-upstream-verifier');

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
verifyPinnedDataEvidence({ repo: dataRepo, manifest, upstreamDir: UPSTREAM, evidencePaths, messages });
if (messages.length) {
  for (const message of messages) console.error(message);
  process.exit(1);
}
console.log(`Scale operating-revenue upstream verified: Toolkit ${manifest.producer_pins.healthcare_toolkit}, Data MCP ${manifest.producer_pins.healthcare_data_mcp}, handoff ${manifest.toolkit_handoff_file_hash}`);
