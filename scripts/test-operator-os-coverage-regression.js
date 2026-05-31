#!/usr/bin/env node
const assert = require('assert');
const coverage = require('../workflows/operator-os-coverage.json');
const { loadWorkflows, loadAgentRegistry } = require('../lib/workflows');
const { listEvidencePacks } = require('../lib/evidence-packs');
const { listSyntheticFixtureWorkflowIds } = require('../lib/operator-os/case-data-provider');
const { validateOperatorOsCoverage } = require('./validate-operator-os-coverage');

const context = {
  workflows: loadWorkflows(),
  agents: loadAgentRegistry().agents,
  packs: listEvidencePacks(),
  fixtureWorkflowIds: listSyntheticFixtureWorkflowIds()
};

function messages(mutator) {
  const cloned = JSON.parse(JSON.stringify(coverage));
  mutator(cloned);
  return validateOperatorOsCoverage(cloned, context).join('\n');
}

assert.strictEqual(validateOperatorOsCoverage(coverage, context).length, 0);
assert.match(messages(cloned => {
  const clean = cloned.workflows.find(item => item.workflow_id === 'clean-claim-rate-decline');
  clean.evidence_pack_id = 'payer-contract-underpayment-review-operator-os-v1';
}), /belongs to payer-contract-underpayment-review/);
assert.match(messages(cloned => {
  const clean = cloned.workflows.find(item => item.workflow_id === 'clean-claim-rate-decline');
  clean.operator_os_status = 'exemplar';
}), /pack exemplar flag|exemplar golden_artifact_status/);
assert.match(messages(cloned => {
  const survey = cloned.workflows.find(item => item.workflow_id === 'survey-readiness-gap-review');
  survey.case_fixture_status = 'implemented';
}), /no synthetic fixture/);
assert.match(messages(cloned => {
  const clean = cloned.workflows.find(item => item.workflow_id === 'clean-claim-rate-decline');
  clean.operator_os_status = 'prompt_only';
  delete clean.evidence_pack_id;
}), /active evidence pack requires exemplar or standard_pack/);
assert.match(messages(cloned => {
  const clean = cloned.workflows.find(item => item.workflow_id === 'clean-claim-rate-decline');
  clean.golden_artifact_status = 'implemented';
}), /no golden artifact assertion/);

console.log('operator-os coverage regression ok: negative coverage gates');
