#!/usr/bin/env node
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { findReviewProtocol, sha256 } = require('../lib/review-protocols');
const {
  createScaleInputFitnessKernel,
  rebuildEvidenceChain
} = require('../lib/scale-input-fitness-kernel');
const { validateScalePacketReviewRequest, validateScalePacketUpstream } = require('../lib/scale-input-fitness-review');
const { validateAnnualDischargesUpstream } = require('../lib/scale-annual-discharges-review');
const { validatePhysicianCountUpstream } = require('../lib/scale-physician-count-review');

const ROOT = path.join(__dirname, '..');

const CONFIG_HASH = 'sha256:' + '1'.repeat(64);
function validKernelConfig() {
  return {
    activeFamily: 'test_family', familyLabel: 'test-family', concernLineageLabel: 'test concerns', conflictRefToken: ':test:',
    toolkitProducer: '1'.repeat(40), dataProducer: '2'.repeat(40), toolkitHandoffFileHash: CONFIG_HASH,
    downstreamBead: 'test-bead',
    expectedConflictRequestId: 'conflict-request:test-family:2026-07-19',
    expectedConflictOutputHash: CONFIG_HASH,
    expectedHandoffHash: CONFIG_HASH,
    objectArtifactRefs: {
      cumulative_packet: 'cumulative.json', decision_scenario: 'scenario.json', identity_binding: 'identity.json',
      no_execution_result: 'no-execution.json', process_claim: 'claim.json', prior_review_record: 'review.json',
      prior_assurance_case: 'assurance.json', toolkit_handoff: 'handoff.json'
    },
    handoffRoleMap: {
      cumulative: 'cumulative_packet', scenario: 'decision_scenario', identity: 'identity_binding',
      no_execution: 'no_execution_result', claim: 'process_claim', prior_review: 'prior_review_record',
      prior_assurance: 'prior_assurance_case'
    },
    evidence: {
      bundleRef: 'ushso-rebuild://test', bundleSemanticHash: CONFIG_HASH,
      committedInputRef: 'git:' + '2'.repeat(40) + ':input.json', normalizedRawHash: CONFIG_HASH,
      producerBoundRawHash: CONFIG_HASH, bundleRawHash: CONFIG_HASH,
      artifactRefs: {
        normalized_input_artifact_ref: 'normalized.json', producer_bound_input_artifact_ref: 'bound.json',
        bundle_artifact_ref: 'bundle.json'
      }
    },
    expected: {
      totalCells: 54, populatedCells: 0, blockedCells: 6, notResearchedCells: 48,
      familyCells: 6, familyConflicts: 6, cumulativeConflicts: 6,
      familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'six'
    },
    priorCounts: { discrepancies: 0 },
    expectedManifestCounts: {
      total_cells: 54, populated_cells: 0, blocked_cells: 6,
      not_yet_researched_cells: 48, cumulative_open_conflicts: 6, discrepancies: 0
    },
    expectedEvidenceIdentifiers: () => [], validatePrior: () => {},
    validateAdditionalUpstream: () => {}, expectedConcerns: () => [],
    manifestKeys: ['schema_version', 'active_family', 'producer_pins', 'objects', 'review_input_hashes', 'evidence_lineage', 'manifest_sha256'],
    requestKeys: ['schema_version', 'protocol', 'reviewer', 'frozen_inputs', 'decision_scenario', 'candidate_review'],
    handoffKeys: ['schema_version', 'active_family', 'review_hashes', 'first_assessment_hashes', 'conflict_output_hash', 'output_inventory', 'handoff_sha256'],
    requestRequiredTerms: ['blocked'], boundaryRequiredTerms: ['no averaging', 'no adjudication', 'human'],
    prohibitedUses: ['calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection', 'adjudication', 'strategic_recommendation', 'promotion', 'deployment'],
    canonicalRequestHashes: {
      'cso.evidence-methods-measurement.v1': CONFIG_HASH,
      'cso.healthcare-finance-capital.v1': CONFIG_HASH
    },
    reviewerRoles: [
      { protocolId: 'cso.evidence-methods-measurement.v1', protocolVersion: '1.0.0', agentSlug: 'healthit-clinical-data-analyst', competenceRole: 'evidence_methods_measurement_biostatistics', label: 'methods' },
      { protocolId: 'cso.healthcare-finance-capital.v1', protocolVersion: '1.0.0', agentSlug: 'revenue-finance-manager', competenceRole: 'healthcare_finance_capital', label: 'finance' }
    ],
    reviewHashKeys: ['methods', 'finance'],
    expectedReviewHashes: { methods: CONFIG_HASH, finance: CONFIG_HASH },
    expectedAssessmentHashes: { methods: CONFIG_HASH, finance: CONFIG_HASH },
    familyCellState: 'blocked_source_conflict', familyCellMessage: 'blocked and unpopulated',
    handoffFamilyCellCountField: 'test_blocked_count', handoffFamilyConflictCountField: 'test_conflict_count',
    handoffFamilyConflictRefsField: null, zeroInventoryObjectRoles: [],
    concernErrorMessage: 'concerns must remain exact',
    closedOutputInventory: true
  };
}

assert.doesNotThrow(() => createScaleInputFitnessKernel(validKernelConfig()));
const unavailableFamilyConfig = validKernelConfig();
unavailableFamilyConfig.familyCellState = 'unavailable_public';
unavailableFamilyConfig.familyCellMessage = 'unavailable, unapproved, and unpopulated';
unavailableFamilyConfig.handoffFamilyCellCountField = 'test_unavailable_count';
unavailableFamilyConfig.expected.blockedCells = 0;
unavailableFamilyConfig.expected.unavailableCells = 6;
unavailableFamilyConfig.expectedManifestCounts.blocked_cells = 0;
unavailableFamilyConfig.expectedManifestCounts.unavailable_public_cells = 6;
assert.doesNotThrow(() => createScaleInputFitnessKernel(unavailableFamilyConfig));
const stricterNoGoConfig = validKernelConfig();
stricterNoGoConfig.prohibitedUses.push('profile_population');
assert.doesNotThrow(() => createScaleInputFitnessKernel(stricterNoGoConfig));
for (const [label, mutator] of [
  ['unknown config', value => { value.fabricated = true; }],
  ['object locator', value => { delete value.objectArtifactRefs.cumulative_packet; }],
  ['evidence hash', value => { delete value.evidence.bundleRawHash; }],
  ['evidence artifact closure', value => { value.evidence.artifactRefs.fabricated = 'fabricated.json'; }],
  ['expected count', value => { delete value.expected.totalCells; }],
  ['invalid family state', value => { value.familyCellState = 'fabricated_zero'; }],
  ['missing family state', value => { delete value.familyCellState; }],
  ['legacy family message', value => {
    delete value.familyCellMessage;
    value.blockedCellMessage = 'legacy compatibility shim';
  }],
  ['legacy handoff count field', value => {
    delete value.handoffFamilyCellCountField;
    value.handoffFamilyBlockedField = 'legacy_blocked_count';
  }],
  ['dual family message fields', value => { value.blockedCellMessage = 'legacy compatibility shim'; }],
  ['dual handoff count fields', value => { value.handoffFamilyBlockedField = 'legacy_blocked_count'; }],
  ['invalid unavailable count', value => { value.expected.unavailableCells = -1; }],
  ['unavailable state count field', value => {
    value.familyCellState = 'unavailable_public';
    value.familyCellMessage = 'unavailable';
    value.handoffFamilyCellCountField = 'unavailable_count';
    value.expected.blockedCells = 0;
    value.expected.unavailableCells = 6;
    value.expectedManifestCounts.blocked_cells = 0;
    delete value.expectedManifestCounts.unavailable_public_cells;
  }],
  ['expected count consistency', value => { value.expectedManifestCounts.total_cells = 53; }],
  ['prior count', value => { value.priorCounts.discrepancies = -1; }],
  ['prior manifest consistency', value => { value.expectedManifestCounts.discrepancies = 1; }],
  ['callback', value => { delete value.validatePrior; }],
  ['additional callback', value => { delete value.validateAdditionalUpstream; }],
  ['canonical policy', value => { delete value.expectedEvidenceIdentifiers; }],
  ['required terms', value => { value.requestRequiredTerms = []; }],
  ['boundary closure', value => { value.boundaryRequiredTerms = ['human']; }],
  ['prohibited uses', value => { value.prohibitedUses = []; }],
  ['weakened prohibited uses', value => { value.prohibitedUses = value.prohibitedUses.filter(item => item !== 'projection'); }],
  ['inventory policy', value => { value.closedOutputInventory = false; }],
  ['inventory roles', value => { delete value.zeroInventoryObjectRoles; }],
  ['lane agent', value => { value.reviewerRoles[1].agentSlug = 'physician-executive'; }],
  ['lane competence', value => { value.reviewerRoles[1].competenceRole = 'cardiovascular_clinical_quality'; }],
  ['lane version', value => { value.reviewerRoles[1].protocolVersion = '9.9.9'; }],
  ['canonical request lane', value => { delete value.canonicalRequestHashes['cso.healthcare-finance-capital.v1']; }],
  ['review hash lane', value => { delete value.expectedReviewHashes.finance; }],
  ['assessment hash lane', value => { delete value.expectedAssessmentHashes.finance; }],
  ['conflict request identity pin', value => { delete value.expectedConflictRequestId; }],
  ['conflict output pin', value => { delete value.expectedConflictOutputHash; }],
  ['handoff pin', value => { delete value.expectedHandoffHash; }],
  ['manifest closure', value => { value.manifestKeys = value.manifestKeys.filter(item => item !== 'objects'); }],
  ['handoff closure', value => { value.handoffKeys = []; }],
  ['handoff conflict policy', value => { delete value.handoffFamilyConflictRefsField; }],
  ['family-cell message policy', value => { delete value.familyCellMessage; }],
  ['family-cell count policy', value => { delete value.handoffFamilyCellCountField; }],
  ['concern policy', value => { delete value.concernErrorMessage; }]
]) {
  const config = validKernelConfig();
  mutator(config);
  assert.throws(() => createScaleInputFitnessKernel(config), error => {
    assert(error instanceof Error, `${label} must throw Error`);
    assert.match(error.message, /^Scale input-fitness kernel config invalid:/, `${label} must fail deterministically`);
    assert.doesNotMatch(error.message, /TypeError/, `${label} must never leak TypeError`);
    return true;
  });
}

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
const physician = loadFamily('physician-count', {
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
assert.deepStrictEqual(validatePhysicianCountUpstream(physician.manifest, physician.objects, physician.artifactHashes, physician.evidenceArtifacts), []);
assert(validateScalePacketUpstream(annual.manifest, annual.objects, annual.artifactHashes, annual.evidenceArtifacts).some(message => /active family|producer pin|closed family/.test(message)));
assert(validateAnnualDischargesUpstream(revenue.manifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).some(message => /canonical|active family|producer pin/.test(message)));
assert(validatePhysicianCountUpstream(annual.manifest, annual.objects, annual.artifactHashes, annual.evidenceArtifacts).some(message => /canonical|active family|producer pin|closed family/.test(message)));
assert(validateAnnualDischargesUpstream(physician.manifest, physician.objects, physician.artifactHashes, physician.evidenceArtifacts).some(message => /canonical|active family|producer pin|closed family/.test(message)));
assert(validateScalePacketUpstream(physician.manifest, physician.objects, physician.artifactHashes, physician.evidenceArtifacts).some(message => /active family|producer pin|closed family/.test(message)));
assert(validatePhysicianCountUpstream(revenue.manifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).some(message => /canonical|active family|producer pin|closed family/.test(message)));

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
const cardiovascularExecutive = clone(revenue.request);
const cardiovascularProtocol = findReviewProtocol('cso.cardiovascular-clinical-quality.v1', '1.0.0');
cardiovascularExecutive.protocol = {
  protocol_id: cardiovascularProtocol.protocol_id,
  version: cardiovascularProtocol.version,
  protocol_hash: cardiovascularProtocol.protocol_hash
};
cardiovascularExecutive.reviewer.agent_slug = 'physician-executive';
cardiovascularExecutive.candidate_review.competence_role = 'cardiovascular_clinical_quality';
assert.match(
  validateScalePacketReviewRequest(cardiovascularExecutive, revenue.manifest, revenue.objects, revenue.artifactHashes, revenue.evidenceArtifacts).join('; '),
  /not routed|exact family specialist lane|absent from the frozen canonical request allowlist/
);

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
