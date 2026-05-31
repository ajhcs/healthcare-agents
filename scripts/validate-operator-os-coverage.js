#!/usr/bin/env node
const { fail } = require('./_release-utils');
const { loadWorkflows, loadAgentRegistry } = require('../lib/workflows');
const { listEvidencePacks } = require('../lib/evidence-packs');
const { listSyntheticFixtureWorkflowIds } = require('../lib/operator-os/case-data-provider');

const allowedStatuses = new Set(['exemplar', 'standard_pack', 'prompt_only', 'deferred']);
const allowedFixtureStatuses = new Set(['implemented', 'not_implemented', 'not_applicable']);
const goldenArtifactWorkflowIds = new Set(['denial-spike-workup']);

function validateOperatorOsCoverage(coverage, context = {}) {
  const workflows = context.workflows || loadWorkflows();
  const agents = context.agents || loadAgentRegistry().agents;
  const packs = context.packs || listEvidencePacks();
  const fixtureIds = new Set(context.fixtureWorkflowIds || listSyntheticFixtureWorkflowIds());
  const workflowById = new Map(workflows.map(workflow => [workflow.id, workflow]));
  const packById = new Map(packs.map(pack => [pack.id, pack]));
  const agentIds = new Set(agents.map(agent => agent.slug));
  const messages = [];

  if (coverage.schema_version !== 'operator-os.coverage.v1') {
    messages.push('coverage schema_version must be operator-os.coverage.v1');
  }
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(coverage.last_reviewed || ''))) {
    messages.push('coverage last_reviewed must be YYYY-MM-DD');
  }
  if (!Array.isArray(coverage.workflows)) {
    messages.push('coverage workflows must be an array');
    return messages;
  }

  const seen = new Set();
  const activePackByWorkflow = new Map();
  for (const pack of packs) {
    if (pack.status === 'active') activePackByWorkflow.set(pack.workflow_id, pack);
  }
  for (const entry of coverage.workflows) {
    const prefix = entry && entry.workflow_id ? entry.workflow_id : '<unknown>';
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      messages.push('coverage workflow entries must be objects');
      continue;
    }
    if (seen.has(entry.workflow_id)) messages.push(prefix + ': duplicate coverage entry');
    seen.add(entry.workflow_id);
    const workflow = workflowById.get(entry.workflow_id);
    if (!workflow) {
      messages.push(prefix + ': unknown workflow_id');
      continue;
    }
    if (!allowedStatuses.has(entry.operator_os_status)) messages.push(prefix + ': invalid operator_os_status');
    if (!allowedFixtureStatuses.has(entry.case_fixture_status)) messages.push(prefix + ': invalid case_fixture_status');
    if (!allowedFixtureStatuses.has(entry.golden_artifact_status)) messages.push(prefix + ': invalid golden_artifact_status');
    if (!Number.isInteger(entry.priority_wave) || entry.priority_wave < 0 || entry.priority_wave > 4) {
      messages.push(prefix + ': priority_wave must be an integer from 0 through 4');
    }

    const allowedReviewers = new Set([workflow.primary_agent, ...(workflow.handoff_agents || [])]);
    if (!agentIds.has(entry.domain_reviewer)) messages.push(prefix + ': domain_reviewer is not a registered agent');
    if (!allowedReviewers.has(entry.domain_reviewer)) messages.push(prefix + ': domain_reviewer must match workflow primary or handoff agent');

    const pack = entry.evidence_pack_id ? packById.get(entry.evidence_pack_id) : null;
    if (entry.operator_os_status === 'exemplar' || entry.operator_os_status === 'standard_pack') {
      if (!entry.evidence_pack_id) messages.push(prefix + ': pack-ready workflow must reference evidence_pack_id');
      if (!pack) messages.push(prefix + ': evidence_pack_id not found: ' + entry.evidence_pack_id);
      if (pack && pack.workflow_id !== entry.workflow_id) messages.push(prefix + ': evidence_pack_id belongs to ' + pack.workflow_id);
      if (pack && pack.status !== 'active') messages.push(prefix + ': evidence pack must be active');
      if (pack && pack.offline_first !== true) messages.push(prefix + ': evidence pack must be offline_first');
      if (pack && Boolean(pack.exemplar) !== (entry.operator_os_status === 'exemplar')) {
        messages.push(prefix + ': pack exemplar flag does not match operator_os_status');
      }
    }
    if (entry.operator_os_status === 'exemplar') {
      if (entry.case_fixture_status !== 'implemented') messages.push(prefix + ': exemplar case_fixture_status must be implemented');
      if (entry.golden_artifact_status !== 'implemented') messages.push(prefix + ': exemplar golden_artifact_status must be implemented');
    }
    if (entry.operator_os_status === 'prompt_only' && entry.evidence_pack_id) {
      messages.push(prefix + ': prompt_only workflows must not reference evidence_pack_id');
    }
    const activePack = activePackByWorkflow.get(entry.workflow_id);
    if (activePack) {
      if (!['exemplar', 'standard_pack'].includes(entry.operator_os_status)) {
        messages.push(prefix + ': active evidence pack requires exemplar or standard_pack coverage status');
      }
      if (entry.evidence_pack_id !== activePack.id) {
        messages.push(prefix + ': active evidence pack must be referenced by coverage entry');
      }
    }
    if (entry.case_fixture_status === 'implemented' && !fixtureIds.has(entry.workflow_id)) {
      messages.push(prefix + ': case_fixture_status is implemented but no synthetic fixture is registered');
    }
    if (entry.golden_artifact_status === 'implemented' && !goldenArtifactWorkflowIds.has(entry.workflow_id)) {
      messages.push(prefix + ': golden_artifact_status is implemented but no golden artifact assertion is registered');
    }
  }

  for (const workflow of workflows) {
    if (!seen.has(workflow.id)) messages.push(workflow.id + ': missing coverage entry');
  }
  for (const id of seen) {
    if (!workflowById.has(id)) messages.push(id + ': coverage entry has no workflow registry match');
  }
  return messages;
}

function main() {
  const coverage = require('../workflows/operator-os-coverage.json');
  const messages = validateOperatorOsCoverage(coverage);
  fail(messages);
  console.log('operator-os coverage ok: ' + coverage.workflows.length + ' workflows');
}

if (require.main === module) main();

module.exports = {
  validateOperatorOsCoverage
};
