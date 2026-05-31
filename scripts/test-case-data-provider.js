#!/usr/bin/env node
const assert = require('assert');
const { createWorkupAsync } = require('../lib/workflows');
const {
  DATA_MODES,
  DEFAULT_DATA_MODE,
  VALID_DATA_MODE_VALUES,
  normalizeDataMode,
  isNetworkMode,
  requiresExplicitInput
} = require('../lib/operator-os/data-modes');
const {
  PROVENANCE_TYPES,
  assertAllFieldsProvenanced,
  summarizeProvenance,
  stripProvenance
} = require('../lib/operator-os/case-provenance');
const { buildSyntheticDenialSpikeCase } = require('../lib/operator-os/denial-spike-synthetic');
const {
  buildCleanClaimRateFixture,
  buildUnderpaymentVarianceFixture,
  buildPriorAuthorizationAppealFixture
} = require('../lib/operator-os/fixtures/revenue-cycle');
const { buildHipaaEvidenceBinderFixture } = require('../lib/operator-os/fixtures/compliance-quality');
const {
  buildInterfaceIncidentFixture,
  buildDashboardMetricFixture
} = require('../lib/operator-os/fixtures/operations-it');
const {
  createCaseDataProvider,
  getCaseDataForWorkflow,
  formatCaseDataMarkdown
} = require('../lib/operator-os/case-data-provider');

function assertNoPrivateFixturePayload(value) {
  const text = JSON.stringify(value) + '\n' + String(value || '');
  const forbidden = [
    /\bMRN\s*[:#]?\s*\d{4,}\b/i,
    /\bDOB\s*[:#]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i,
    /\bSSN\s*[:#]?\s*\d{3}-\d{2}-\d{4}\b/i,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/,
    /\b(?:MBI|Medicare Beneficiary Identifier|account|acct)\s*[:#]?\s*[A-Z0-9-]{5,}\b/i,
    /https?:\/\//i,
    /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
    /\b(?:token|secret|password|api[_-]?key)\s*[:=]\s*[A-Z0-9._-]{6,}\b/i,
    /payer portal export/i,
    /private contract text/i
  ];
  for (const pattern of forbidden) assert.doesNotMatch(text, pattern);
}

assert.strictEqual(DEFAULT_DATA_MODE, DATA_MODES.PROMPT_ONLY);
assert.strictEqual(normalizeDataMode(undefined), DATA_MODES.PROMPT_ONLY);
assert.ok(VALID_DATA_MODE_VALUES.includes(DATA_MODES.PUBLIC_EVIDENCE));
assert.strictEqual(normalizeDataMode('public-evidence'), DATA_MODES.PUBLIC_EVIDENCE);
assert.strictEqual(normalizeDataMode('hybrid-synthetic-public'), DATA_MODES.HYBRID_SYNTHETIC_PUBLIC);
assert.strictEqual(isNetworkMode(DATA_MODES.PUBLIC_SEARCH), true);
assert.strictEqual(requiresExplicitInput(DATA_MODES.INTERNAL_PRIVATE), true);
assert.throws(() => normalizeDataMode('bad_mode'), /unsupported data mode/);

const defaultProvider = createCaseDataProvider();
assert.strictEqual(defaultProvider.mode, DATA_MODES.PROMPT_ONLY);
assert.strictEqual(defaultProvider.getCaseData('denial-spike-workup', 'denials').status, 'not_requested');

const synthetic = buildSyntheticDenialSpikeCase({ prompt: 'Medicare Advantage denials spiked with CARC 197' });
assertAllFieldsProvenanced(synthetic);
const summary = summarizeProvenance(synthetic);
assert.strictEqual(synthetic.payer.provenance.type, PROVENANCE_TYPES.USER_SUPPLIED);
assert.strictEqual(synthetic.payer.provenance.source, 'cli.problem');
assert.strictEqual(synthetic.product.provenance.type, PROVENANCE_TYPES.USER_SUPPLIED);
assert.strictEqual(synthetic.dominant_carc_rarc.provenance.type, PROVENANCE_TYPES.USER_SUPPLIED);
assert.match(synthetic.dominant_carc_rarc.value, /CARC 197/);
assert.strictEqual(summary.counts[PROVENANCE_TYPES.USER_SUPPLIED], 3);
assert.strictEqual(summary.counts[PROVENANCE_TYPES.SYNTHETIC], Object.keys(synthetic).length - 3);
assert.strictEqual(stripProvenance(synthetic).payer, 'Medicare Advantage payer');

assert.throws(() => assertAllFieldsProvenanced({ payer: 'Commercial payer' }), /field lacks provenance/);

const publicSearch = getCaseDataForWorkflow('denial-spike-workup', 'denials', { dataMode: DATA_MODES.PUBLIC_SEARCH });
assert.strictEqual(publicSearch.status, 'unsupported');
assert.match(publicSearch.summary, /disabled by default/);

const internalPrivate = getCaseDataForWorkflow('denial-spike-workup', 'denials', { dataMode: DATA_MODES.INTERNAL_PRIVATE });
assert.strictEqual(internalPrivate.status, 'unsupported');
assert.match(internalPrivate.summary, /requires explicit local input/);

const syntheticResult = getCaseDataForWorkflow('denial-spike-workup', 'denials', { dataMode: DATA_MODES.SYNTHETIC_ONLY });
assert.strictEqual(syntheticResult.status, 'ok');
assertAllFieldsProvenanced(syntheticResult.case_data);
assert.match(formatCaseDataMarkdown(syntheticResult), /synthetic_only/);
assert.match(formatCaseDataMarkdown(syntheticResult), /\[provenance: synthetic; source: operator-os\.synthetic\.denial-spike\.v1\]/);
assert.match(formatCaseDataMarkdown(syntheticResult), /Provenance/);

const fixtureCases = [
  ['clean-claim-rate-decline', 'Medicare Advantage clean claim rate dropped', buildCleanClaimRateFixture],
  ['payer-contract-underpayment-review', 'Commercial underpayment variance', buildUnderpaymentVarianceFixture],
  ['prior-authorization-appeal-workup', 'Medicare Advantage imaging authorization appeal', buildPriorAuthorizationAppealFixture],
  ['hipaa-security-evidence-checklist', 'vendor HIPAA evidence review', buildHipaaEvidenceBinderFixture],
  ['hl7-fhir-interface-incident', 'FHIR interface errors', buildInterfaceIncidentFixture],
  ['clinical-dashboard-specification', 'quality dashboard metric definitions', buildDashboardMetricFixture]
];
for (const [workflowId, prompt, builder] of fixtureCases) {
  const direct = builder({ prompt });
  assertAllFieldsProvenanced(direct);
  assertNoPrivateFixturePayload(direct);
  const providerResult = getCaseDataForWorkflow(workflowId, prompt, { dataMode: DATA_MODES.SYNTHETIC_ONLY });
  assert.strictEqual(providerResult.status, 'ok');
  assertAllFieldsProvenanced(providerResult.case_data);
  assertNoPrivateFixturePayload(providerResult.case_data);
  assertNoPrivateFixturePayload(formatCaseDataMarkdown(providerResult));
  assert.ok(Object.keys(providerResult.case_data).length >= 7);
}

(async () => {
  const promptOnly = await createWorkupAsync('Commercial payer denial rate jumped');
  assert.strictEqual(promptOnly.case_data, undefined);

  const enriched = await createWorkupAsync('Commercial payer denial rate jumped', { dataMode: DATA_MODES.HYBRID_SYNTHETIC_PUBLIC });
  assert.strictEqual(enriched.workflow.id, 'denial-spike-workup');
  assert.strictEqual(enriched.case_data.status, 'ok');
  assert.ok(enriched.case_data.evidence_pack);

  console.log('case data provider ok: modes, provenance, fail-closed behavior, async workup');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
