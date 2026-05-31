#!/usr/bin/env node
const assert = require('assert');
const { createWorkupAsync } = require('../lib/workflows');
const {
  DATA_MODES,
  DEFAULT_DATA_MODE,
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
  createCaseDataProvider,
  getCaseDataForWorkflow,
  formatCaseDataMarkdown
} = require('../lib/operator-os/case-data-provider');

assert.strictEqual(DEFAULT_DATA_MODE, DATA_MODES.PROMPT_ONLY);
assert.strictEqual(normalizeDataMode(undefined), DATA_MODES.PROMPT_ONLY);
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
