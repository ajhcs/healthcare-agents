#!/usr/bin/env node
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { sha256 } = require('../lib/review-protocols');
const {
  createScaleInputFitnessKernel,
  rebuildEvidenceChain
} = require('../lib/scale-input-fitness-kernel');
const { validateScalePacketReviewRequest, validateScalePacketUpstream } = require('../lib/scale-input-fitness-review');
const { validateAnnualDischargesUpstream } = require('../lib/scale-annual-discharges-review');

const ROOT = path.join(__dirname, '..');

assert.throws(() => createScaleInputFitnessKernel({}), /missing activeFamily/);
assert.throws(() => createScaleInputFitnessKernel({
  activeFamily: 'x', familyLabel: 'x', conflictRefToken: ':x:', toolkitProducer: 't',
  dataProducer: 'd', toolkitHandoffFileHash: 'h', downstreamBead: 'b',
  objectArtifactRefs: { x: 'x' }, handoffRoleMap: {}, evidence: {}, expected: {},
  priorCounts: {}, reviewHashKeys: ['one'], reviewerRoles: [{}, {}]
}), /exactly two review lanes/);

function loadFamily(family, objectPaths, evidencePaths) {
  const fixtures = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', family);
  const upstream = path.join(fixtures, 'upstream');
  const objects = {};
  const artifactHashes = {};
  for (const [role, relativePath] of Object.entries(objectPaths)) {
    const raw = fs.readFileSync(path.join(upstream, relativePath));
    objects[role] = JSON.parse(raw);
    artifactHashes[role] = rawHash(raw);
  }
  const evidenceArtifacts = {};
  for (const [role, relativePath] of Object.entries(evidencePaths)) {
    const raw = fs.readFileSync(path.join(upstream, relativePath));
    evidenceArtifacts[role] = { value: JSON.parse(raw), raw_hash: rawHash(raw) };
  }
  return {
    manifest: JSON.parse(fs.readFileSync(path.join(fixtures, 'upstream-manifest.json'), 'utf8')),
    request: JSON.parse(fs.readFileSync(path.join(fixtures, 'methods-review-request.json'), 'utf8')),
    objects,
    artifactHashes,
    evidenceArtifacts
  };
}

const revenue = loadFamily('operating-revenue', {
  baseline_packet: 'baseline-packet.json', cumulative_packet: 'cumulative-packet.json',
  decision_scenario: 'decision-scenario.json', identity_binding: 'identity-binding.json',
  no_execution_result: 'no-execution-result.json', process_claim: 'process-claim.json',
  prior_review_record: 'prior/claim-review-record.json', prior_assurance_case: 'prior/module-assurance-case.json',
  toolkit_handoff: 'handoff.json'
}, {
  normalized_input: 'data-mcp/normalized-input.json', producer_bound_input: 'data-mcp/producer-bound-input.json',
  public_evidence_bundle: 'data-mcp/public-evidence-bundle.json'
});
const annual = loadFamily('annual-discharges', {
  prior_cumulative_packet: 'prior/cumulative-packet.json', cumulative_packet: 'cumulative-packet.json',
  decision_scenario: 'decision-scenario.json', identity_binding: 'identity-binding.json',
  no_execution_result: 'no-execution-result.json', process_claim: 'process-claim.json',
  prior_review_record: 'prior/cumulative-review-record.json', prior_assurance_case: 'prior/cumulative-module-assurance-case.json',
  toolkit_handoff: 'handoff.json'
}, {
  acquisition: 'data-mcp/acquisition.json', normalized_input: 'data-mcp/normalized-input.json',
  producer_bound_input: 'data-mcp/producer-bound-input.json', public_evidence_bundle: 'data-mcp/public-evidence-bundle.json'
});

assert.deepStrictEqual(validateScalePacketUpstream(revenue.manifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts), []);
assert.deepStrictEqual(validateAnnualDischargesUpstream(annual.manifest, annual.objects, annual.artifactHashes, annual.evidenceArtifacts), []);
assert(validateScalePacketUpstream(annual.manifest, annual.objects, annual.artifactHashes, annual.evidenceArtifacts).some(message => /active family|producer pin|closed family/.test(message)));
assert(validateAnnualDischargesUpstream(revenue.manifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).some(message => /canonical|active family|producer pin/.test(message)));

const extraManifest = clone(revenue.manifest);
extraManifest.fabricated_family_override = 'annual_discharges';
extraManifest.manifest_sha256 = sha256(Object.fromEntries(Object.entries(extraManifest).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateScalePacketUpstream(extraManifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).join('; '), /closed family manifest field set/);
for (const mutate of [
  value => { value.expected_counts.cumulative_open_conflicts = 10; },
  value => { value.evidence_identifiers.push('fabricated:cross-family-evidence'); },
  value => { value.review_input_hashes[0] = annual.manifest.evidence_bundle_hash; }
]) {
  const synchronizedManifest = clone(revenue.manifest);
  mutate(synchronizedManifest);
  synchronizedManifest.manifest_sha256 = sha256(Object.fromEntries(Object.entries(synchronizedManifest).filter(([key]) => key !== 'manifest_sha256')));
  assert(validateScalePacketUpstream(synchronizedManifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).length > 0);
}
const extraRequest = clone(revenue.request);
extraRequest.fabricated_authority = true;
assert.match(validateScalePacketReviewRequest(extraRequest, revenue.manifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).join('; '), /closed request field set/);
const rewrittenRequest = clone(revenue.request);
rewrittenRequest.candidate_review.criterion_results[0].rationale = 'fabricated but schema-valid rationale';
assert.match(validateScalePacketReviewRequest(rewrittenRequest, revenue.manifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).join('; '), /frozen canonical specialist request/);

const normalized = clone(revenue.evidenceArtifacts.normalized_input.value);
const before = clone(normalized);
const rebuilt = rebuildEvidenceChain(normalized, revenue.manifest.producer_pins.healthcare_data_mcp);
assert.deepStrictEqual(normalized, before, 'evidence rebuild must not mutate normalized input');
assert.strictEqual(rebuilt.producerBoundInput.producer.commit, revenue.manifest.producer_pins.healthcare_data_mcp);
assert.strictEqual(rebuilt.publicEvidenceBundle.bundle_sha256, revenue.manifest.evidence_bundle_hash);
assert.throws(() => rebuildEvidenceChain({ producer: null }, 'x'), /producer is malformed/);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rawHash(value) { return 'sha256:' + crypto.createHash('sha256').update(value).digest('hex'); }

console.log('Shared Scale input-fitness kernel configuration, family isolation, and deterministic rebuild gates validated.');
