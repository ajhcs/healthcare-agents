#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { ROOT, prepareLockedConsumer } = require('./_release-utils');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-consumer-v2-'));
const records = [];
function execute(command, args, cwd) {
  const r = spawnSync(command, args, { cwd, env: { ...process.env, NO_COLOR: '1', PYTHONDONTWRITEBYTECODE: '1' }, encoding: 'utf8', shell: false, timeout: 120000, maxBuffer: 2000000 });
  if (r.status !== 0) throw new Error(command + ' failed: ' + r.stderr + r.stdout);
  return r.stdout;
}
function verify(name, run) { run(); records.push(name); console.log('PASS ' + name); }
const scenarios = [
  ['denial-spike-workup', { baseline_claims: 200, baseline_denied: 30, current_claims: 400, current_denied: 40, denied_dollars: 3000 },
    r => { assert.equal(r.baseline_rate, .15); assert.equal(r.current_rate, .10); assert.equal(r.percentage_point_change, -5); assert.equal(r.relative_change, -.3333333333); assert.equal(r.recoverable_dollars, null); }],
  ['ambulatory-access-backlog', { weekly_requests: 97, weekly_slots: 95, backlog: 57, additional_weekly_slots: 12 },
    r => { assert.equal(r.weekly_shortfall, 2); assert.equal(r.proposed_net_weekly_capacity, 10); assert.equal(r.weeks_to_clear_backlog, 6); }],
  ['survey-readiness-gap-review', { findings: [
    { id: 'T1', standard_ref: 'Synthetic requirement 1', evidence_present: true, owner: 'Facilities', due_date: '2026-10-20' },
    { id: 'T2', standard_ref: 'Synthetic requirement 2', evidence_present: false, owner: 'Nursing', due_date: '2026-10-22' },
    { id: 'T3', standard_ref: 'Synthetic requirement 3', evidence_present: false, owner: 'Accreditation', due_date: '2026-10-25' }] },
    r => { assert.equal(r.findings, 3); assert.equal(r.missing_evidence, 2); assert.equal(r.finding_records[0].owner, 'Facilities'); assert.deepEqual(r.gaps.map(f => f.id), ['T2', 'T3']); assert.equal(Object.hasOwn(r, 'compliant'), false); }],
  ['prior-authorization-appeal-workup', { decision_date: '2026-12-29', appeal_deadline: '2027-01-04', rule_reference: 'Synthetic notice with explicitly supplied dates', available_documents: ['notice'], required_documents: ['notice', 'clinical review'] },
    r => { assert.equal(r.supplied_calendar_day_window, 6); assert.deepEqual(r.missing_documents, ['clinical review']); }],
  ['payer-contract-underpayment-review', { lines: [
    { id: 'V1', expected: 3.03, paid: 1.01, currency: 'USD', contract_ref: 'Synthetic contract' },
    { id: 'V2', expected: 2.02, paid: 4.04, currency: 'USD', contract_ref: 'Synthetic contract' }] },
    r => { assert.equal(r.net_variance, 0); assert.equal(r.positive_variance, 2.02); assert.equal(r.lines[1].variance, -2.02); }],
  ['discharge-barrier-workplan', { barriers: [
    { category: 'transport', cases: 0, avoidable_days: 0, owner: 'Transport' },
    { category: 'placement', cases: 3, avoidable_days: 8, owner: 'Case management' }] },
    r => { assert.equal(r.barrier_counts, 3); assert.equal(r.reported_avoidable_days, 8); assert.equal(r.barriers[0].cases, 0); assert.equal(Object.hasOwn(r, 'discharge_approved'), false); }]
];
try {
  const packed = JSON.parse(execute('npm', ['pack', '--json', '--pack-destination', tmp], ROOT))[0];
  const consumer = path.join(tmp, 'clean consumer with spaces'); fs.mkdirSync(consumer);
  prepareLockedConsumer(consumer, path.join(tmp, packed.filename), ROOT);
  execute('npm', ['ci', '--offline', '--ignore-scripts', '--no-audit', '--no-fund'], consumer);
  const installed = path.join(consumer, 'node_modules/healthcare-agents');
  const cli = path.join(installed, 'bin/cli.js');
  const call = args => JSON.parse(execute(process.execPath, [cli, ...args], consumer));
  verify('clean offline package dependency and registry load', () => {
    assert.equal(call(['list', '--json']).count, 51);
    assert.equal(require(require.resolve('ajv/package.json', { paths: [installed] })).version, require(require.resolve('ajv/package.json', { paths: [ROOT] })).version);
  });
  for (const [id, data, expected] of scenarios) {
    const input = { schema_version: 'healthcare-admin.case.v2', workflow_id: id, data_mode: 'synthetic_only', human_owner: 'Synthetic accountable owner',
      evidence: [{ id: 'consumer-evidence', origin: 'synthetic', as_of: '2026-10-02', description: 'Independent synthetic consumer case', fields: Object.keys(data) }], data };
    const file = path.join(consumer, id + ' case.json'); fs.writeFileSync(file, JSON.stringify(input));
    verify('external consumer case: ' + id, () => {
      const result = call(['admin', 'run', file]); expected(result.values);
      assert.equal(result.status, 'draft_for_human_review'); assert.equal(result.external_actions_performed, false);
      assert.equal(result.human_owner, input.human_owner); assert.deepEqual(result.evidence, input.evidence);
      assert.ok(result.next_actions.length > 0); assert.ok(result.completion_gate.length > 20);
      assert.equal(result.input_sha256, crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'));
    });
    verify('consumer refuses unattributed case: ' + id, () => {
      const invalid = { ...input, evidence: [] }; fs.writeFileSync(file, JSON.stringify(invalid));
      const r = spawnSync(process.execPath, [cli, 'admin', 'run', file], { cwd: consumer, encoding: 'utf8', shell: false });
      assert.notEqual(r.status, 0); assert.match(r.stderr, /Invalid contract/);
    });
  }
  for (const [target, folder] of [['codex', '.agents/skills'], ['claude', '.claude/skills'], ['chatgpt', 'chatgpt-payload'], ['azure', 'azure-payload'], ['databricks', 'databricks-payload']]) {
    verify('consumer exports relative payload to ' + target, () => {
      const destination = path.join(consumer, folder, 'healthcare-survey-readiness-gap-review');
      const manifest = call(['admin', 'export', target, 'survey-readiness-gap-review', '--output', destination]);
      for (const f of manifest.files) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(destination, f.path))).digest('hex'), f.sha256);
      assert.equal(JSON.parse(fs.readFileSync(path.join(destination, 'compatibility.json'))).live_host_tested, false);
      if (['codex', 'claude'].includes(target)) {
        const skill = fs.readFileSync(path.join(destination, 'SKILL.md'), 'utf8');
        assert.ok(skill.includes('references/workflow.json'));
        assert.equal(JSON.parse(fs.readFileSync(path.join(destination, 'references/workflow.json'))).id, 'survey-readiness-gap-review');
      }
    });
  }
  verify('consumer builder creates reusable custom pack and refuses overwrite', () => {
    const spec = JSON.parse(fs.readFileSync(path.join(installed, 'workflows/admin-v2/custom-example.json')));
    const file = path.join(consumer, 'custom.json'); fs.writeFileSync(file, JSON.stringify(spec));
    assert.equal(call(['admin', 'validate', file]).status, 'valid');
    const destination = path.join(consumer, 'custom workflow');
    call(['admin', 'build', file, '--output', destination]);
    const template = JSON.parse(fs.readFileSync(path.join(destination, 'CASE.template.json')));
    assert.equal(template.inputs.community_scope.source, null);
    const r = spawnSync(process.execPath, [cli, 'admin', 'build', file, '--output', destination], { cwd: consumer, encoding: 'utf8', shell: false });
    assert.notEqual(r.status, 0); assert.match(r.stderr, /already exists/);
  });
  verify('packaged consumer validates structured multi-workflow and specialist selection files', () => {
    const file = path.join(consumer, 'selection with spaces.json');
    const selection = { schema_version: 'healthcare-admin.selection.v1', selected_by: 'host_agent',
      rationale: 'Two explicitly requested current administrative drafts',
      workflow_ids: ['payer-contract-underpayment-review', 'prior-authorization-appeal-workup'] };
    fs.writeFileSync(file, JSON.stringify(selection));
    const draft = call(['workup', 'Payment and authorization evidence packets', '--selection', file, '--json']);
    assert.equal(draft.status, 'multiple_selected');
    assert.deepEqual(draft.workups.map(w => w.workflow.id), selection.workflow_ids);
    assert.deepEqual(draft.selection, selection);
    fs.writeFileSync(file, JSON.stringify({ schema_version: selection.schema_version, selected_by: 'user',
      rationale: 'Explicit specialist choice', agent_id: 'pophealth-community-health-coordinator' }));
    assert.equal(call(['choose', 'Prepare a community interview draft', '--selection', file, '--json']).primary_agent,
      'pophealth-community-health-coordinator');
  });
  for (const selectedBy of ['host_agent', 'user']) {
    verify('packaged consumer retains ' + selectedBy + ' child provenance and custom rationale', () => {
      const selection = { schema_version: 'healthcare-admin.selection.v1', selected_by: selectedBy,
        rationale: selectedBy + ' explicitly selected two current packets; retain this custom rationale.',
        workflow_ids: ['payer-contract-underpayment-review', 'prior-authorization-appeal-workup'] };
      const file = path.join(consumer, selectedBy + ' provenance.json');
      fs.writeFileSync(file, JSON.stringify(selection));
      const draft = call(['workup', 'Two current packets', '--selection', file, '--json']);
      assert.deepEqual(draft.selection, selection);
      assert.deepEqual(draft.workups.map(w => w.workflow.id), selection.workflow_ids);
      for (const child of draft.workups) {
        assert.equal(child.selection.selected_by, selection.selected_by);
        assert.equal(child.selection.rationale, selection.rationale);
        assert.deepEqual(child.selection.workflow_ids, [child.workflow.id]);
        assert.deepEqual(child.selection, { ...selection, workflow_ids: [child.workflow.id] });
      }
    });
  }
  verify('packaged consumer rejects malformed, oversized and conflicting selections', () => {
    const file = path.join(consumer, 'invalid selection.json');
    const rejected = (args, pattern) => {
      const result = spawnSync(process.execPath, [cli, ...args], { cwd: consumer, encoding: 'utf8', shell: false });
      assert.notEqual(result.status, 0); assert.match(result.stderr, pattern);
    };
    fs.writeFileSync(file, '{');
    rejected(['workup', '--selection', file, '--json'], /error:/);
    fs.writeFileSync(file, ' '.repeat(2 * 1024 * 1024 + 1));
    rejected(['workup', '--selection', file, '--json'], /exceeds 2 MiB/);
    fs.writeFileSync(file, JSON.stringify({ schema_version: 'healthcare-admin.selection.v1', selected_by: 'user',
      rationale: 'Invalid dual authority', agent_id: 'revenue-cycle-specialist', workflow_ids: ['denial-spike-workup'] }));
    rejected(['workup', '--selection', file, '--json'], /Invalid selection contract/);
    rejected(['workup', '--workflow', 'denial-spike-workup', '--selection', file], /Select one routing input/);
    rejected(['workup', '--workflow', 'denial-spike-workup', '--agent', 'revenue-cycle-specialist'], /Unsupported selection option/);
    rejected(['choose', '--agent', 'revenue-cycle-specialist', '--workflow', 'denial-spike-workup'], /Unsupported selection option/);
  });
  verify('consumer routing handles CHNA and family-qualified unrelated requests', () => {
    assert.equal(call(['choose', 'Prepare a CHNA community interview plan', '--agent', 'pophealth-community-health-coordinator', '--json']).primary_agent, 'pophealth-community-health-coordinator');
    for (const command of ['choose', 'workup']) {
      const r = call([command, 'Create a vacation budget spreadsheet for my family.', '--json']);
      assert.equal(r.status, 'no_match');
    }
  });
  console.log('Admin v2 clean consumer: ' + records.length + ' checks passed; offline install, no model/API calls');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
