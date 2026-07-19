#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { stablePrettyJson, validateEssentialServiceDesignationCountUpstream } = require('../lib/scale-essential-service-designation-count-review');
const {
  verifyAncestryEdges,
  verifyPinnedDataEvidence,
  verifyPinnedGitObjects
} = require('../lib/scale-input-fitness-upstream-verifier');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'essential-service-designation-count');
const UPSTREAM = path.join(FIXTURES, 'upstream');
const args = process.argv.slice(2);
const repoFlag = args.indexOf('--data-mcp-repo');
const toolkitFlag = args.indexOf('--toolkit-repo');
if (repoFlag < 0 || !args[repoFlag + 1] || toolkitFlag < 0 || !args[toolkitFlag + 1]) {
  console.error('usage: verify-scale-essential-service-designation-count-upstream.js --data-mcp-repo PATH --toolkit-repo PATH');
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
const messages = validateEssentialServiceDesignationCountUpstream(manifest, objects, hashes, evidenceArtifacts);
verifyAncestryEdges([
  { repo: dataRepo, before: manifest.producer_provenance.data_feature, after: manifest.producer_pins.healthcare_data_mcp, label: 'Data feature-to-producer' },
  { repo: dataRepo, before: manifest.producer_pins.healthcare_data_mcp, after: manifest.producer_provenance.data_tracker, label: 'Data producer-to-tracker' },
  { repo: toolkitRepo, before: manifest.producer_provenance.toolkit_feature, after: manifest.producer_pins.healthcare_toolkit, label: 'Toolkit feature-to-producer' },
  { repo: toolkitRepo, before: manifest.producer_pins.healthcare_toolkit, after: manifest.producer_provenance.toolkit_tracker, label: 'Toolkit producer-to-tracker' }
], messages);
const toolkitPaths = {
  cumulative_packet: 'contracts/reusable-run/v3/fixtures/essential-service-designation-count/cumulative-packet.json',
  decision_scenario: 'contracts/reusable-run/v3/fixtures/essential-service-designation-count/decision-scenario.json',
  identity_binding: 'contracts/reusable-run/v3/fixtures/essential-service-designation-count/identity-binding.json',
  no_execution_result: 'contracts/reusable-run/v3/fixtures/essential-service-designation-count/no-execution-result.json',
  process_claim: 'contracts/reusable-run/v3/fixtures/essential-service-designation-count/process-claim.json',
  toolkit_handoff: 'contracts/reusable-run/v3/fixtures/essential-service-designation-count/handoff.json',
  prior_cumulative_packet: 'contracts/reusable-run/v3/fixtures/emergency-department-count/cumulative-packet.json',
  prior_review_record: 'contracts/reusable-run/v3/fixtures/emergency-department-count-assurance/cumulative-review-record.json',
  prior_assurance_case: 'contracts/reusable-run/v3/fixtures/emergency-department-count-assurance/cumulative-module-assurance-case.json'
};
verifyPinnedGitObjects({ repo: toolkitRepo, commit: manifest.producer_pins.healthcare_toolkit, paths: toolkitPaths, fixturePaths: paths, upstreamDir: UPSTREAM, messages });
verifyPinnedDataEvidence({
  repo: dataRepo,
  manifest,
  upstreamDir: UPSTREAM,
  evidencePaths,
  messages,
  canonicalizeBundle: value => Buffer.from(stablePrettyJson(JSON.parse(value.toString('utf8'))))
});
if (messages.length) {
  for (const message of messages) console.error(message);
  process.exit(1);
}
console.log(`Scale essential-service-designation-count upstream verified: Toolkit ${manifest.producer_pins.healthcare_toolkit}, Data MCP ${manifest.producer_pins.healthcare_data_mcp}, handoff ${manifest.toolkit_handoff_file_hash}`);
