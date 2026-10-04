#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const admin = require('../lib/admin-workflows');
const { createWorkup, routeWorkflow } = require('../lib/workflows');
const root = path.join(__dirname, '..');
const fixture = id => JSON.parse(fs.readFileSync(path.join(root, 'examples/admin-v2', id + '.json')));
const copy = value => JSON.parse(JSON.stringify(value));
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
const denial = fixture('denial-spike-workup');
check('denial rates distinguish percentage points, relative change and unknown recovery', () => {
  const r = admin.runCase(denial);
  assert.equal(r.values.baseline_rate, 0.10); assert.equal(r.values.current_rate, 0.18);
  assert.equal(r.values.percentage_point_change, 8); assert.equal(r.values.relative_change, 0.8);
  assert.equal(r.values.recoverable_dollars, null); assert.equal(r.external_actions_performed, false);
  assert.equal(r.status, 'draft_for_human_review');
});
check('access stock-flow scenario needs positive net capacity', () => {
  const input = fixture('ambulatory-access-backlog');
  assert.equal(admin.runCase(input).values.weeks_to_clear_backlog, 5);
  input.data.additional_weekly_slots = 0;
  assert.equal(admin.runCase(input).values.weeks_to_clear_backlog, null);
  input.data.backlog = 0; assert.equal(admin.runCase(input).values.weeks_to_clear_backlog, 0);
});
check('survey reports evidence gaps without certification', () => {
  const r = admin.runCase(fixture('survey-readiness-gap-review'));
  assert.equal(r.values.missing_evidence, 1); assert.equal(r.values.gaps[0].id, 'F1');
  assert.equal(Object.hasOwn(r.values, 'compliant'), false);
  assert.deepEqual(r.values.finding_records, fixture('survey-readiness-gap-review').data.findings);
  assert.equal(r.values.finding_records[1].owner, 'Nursing');
});
check('appeal uses explicit dates and missing documents', () => {
  const r = admin.runCase(fixture('prior-authorization-appeal-workup'));
  assert.equal(r.values.supplied_calendar_day_window, 30);
  assert.deepEqual(r.values.missing_documents, ['clinician statement']);
});
check('underpayments preserve offsetting overpayments', () => {
  const input = fixture('payer-contract-underpayment-review');
  const r = admin.runCase(input); assert.equal(r.values.net_variance, 150); assert.equal(r.values.positive_variance, 200);
  assert.equal(r.values.lines[1].variance, -50);
  input.data.lines[0].expected = 0.30; input.data.lines[0].paid = 0.10;
  input.data.lines.splice(1); assert.equal(admin.runCase(input).values.net_variance, 0.20);
});
check('discharge summary remains administrative', () => {
  const r = admin.runCase(fixture('discharge-barrier-workplan'));
  assert.equal(r.values.barrier_counts, 6); assert.equal(r.values.reported_avoidable_days, 13);
  assert.equal(Object.hasOwn(r.values, 'discharge_approved'), false);
});
const mutations = [
 ['missing evidence attribution', i => { i.evidence[0].fields.pop(); }],
 ['unknown evidence field', i => { i.evidence[0].fields.push('patient_name'); }],
 ['unknown input field', i => { i.data.patient_name = 'fixture'; }],
 ['mixed provenance in synthetic mode', i => { i.evidence[0].origin = 'user_supplied'; }],
 ['synthetic disguised as aggregate', i => { i.data_mode = 'aggregate'; }],
 ['duplicate evidence ID', i => { i.evidence.push(copy(i.evidence[0])); }],
 ['zero denominator', i => { i.data.current_claims = 0; }],
 ['denials above denominator', i => { i.data.current_denied = 1001; }],
 ['negative count', i => { i.data.current_denied = -1; }],
 ['fractional count', i => { i.data.current_denied = 0.5; }],
 ['invalid date', i => { i.evidence[0].as_of = '2026-02-30'; }],
 ['blank human owner', i => { i.human_owner = ' '; }],
 ['unknown workflow', i => { i.workflow_id = '../outside'; }],
 ['unsupported mode', i => { i.data_mode = 'internal_private'; }]
];
for (const [name, mutate] of mutations) check('reject ' + name, () => { const input = copy(denial); mutate(input); assert.throws(() => admin.runCase(input)); });
check('accept declared user-supplied aggregate evidence', () => {
  const input = copy(denial); input.data_mode = 'aggregate'; input.evidence[0].origin = 'user_supplied';
  assert.equal(admin.runCase(input).data_mode, 'aggregate');
});
check('zero baseline produces explicit undefined relative change', () => {
  const input = copy(denial); input.data.baseline_denied = 0;
  assert.equal(admin.runCase(input).values.relative_change, null);
});
check('reject invented appeal deadline calendar', () => {
  const input = fixture('prior-authorization-appeal-workup'); input.data.appeal_deadline = '2026-09-01';
  assert.throws(() => admin.runCase(input)); input.data.appeal_deadline = '2026-02-30'; assert.throws(() => admin.runCase(input));
});
check('reject duplicate finding and malformed due date', () => {
  const input = fixture('survey-readiness-gap-review'); input.data.findings.push(copy(input.data.findings[0]));
  assert.throws(() => admin.runCase(input)); input.data.findings.pop(); input.data.findings[0].due_date = '2026-02-30';
  assert.throws(() => admin.runCase(input));
});
check('reject fractional currency and duplicate variance line', () => {
  const input = fixture('payer-contract-underpayment-review'); input.data.lines[0].expected = 1.001;
  assert.throws(() => admin.runCase(input)); input.data.lines[0].expected = 1; input.data.lines.push(copy(input.data.lines[0]));
  assert.throws(() => admin.runCase(input));
});
check('CHNA interview selects community specialist without an invented workflow', () => {
  const r = createWorkup('Design a community health needs assessment stakeholder interview plan', { agentId: 'pophealth-community-health-coordinator' });
  assert.equal(r.status, 'specialist'); assert.equal(r.workflow.id, null);
  assert.equal(r.roles.primary, 'pophealth-community-health-coordinator');
});
for (const problem of ['Help me format a vacation budget spreadsheet', 'Create a vacation budget spreadsheet for my family.', 'Write a poem about the moon', '']) {
  check('abstain on unrelated task: ' + problem, () => {
    const r = createWorkup(problem); assert.equal(r.status, 'no_match'); assert.equal(r.workflow.id, null);
    assert.equal(r.roles.primary, null);
  });
}
check('payer keyword does not establish a payer/product value', () => {
  const r = createWorkup('Commercial payer denial rate jumped', { workflowIds: ['denial-spike-workup'] });
  assert.ok(r.questions.required.some(q => q.includes('payer or product')));
  assert.equal(r.workflow.confidence_kind, 'explicit_selection_not_a_probability');
});
check('underspecified claim evidence does not force a workflow', () => {
  const r = routeWorkflow('claim evidence');
  assert.ok(['no_match', 'needs_clarification'].includes(r.status));
});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-v2-test-'));
try {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'workflows/admin-v2/custom-example.json')));
  check('custom builder produces source-required fields and verified manifest', () => {
    const out = path.join(tmp, 'custom'); const manifest = admin.buildCustom(spec, out);
    for (const file of manifest.files) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(out, file.path))).digest('hex'), file.sha256);
    assert.ok(fs.readFileSync(path.join(out, 'SKILL.md'), 'utf8').includes('references/workflow.json'));
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'CASE.template.json'))).inputs.community_scope.source, null);
    assert.throws(() => admin.buildCustom(spec, out), /already exists/);
  });
  for (const [name, mutate] of [
    ['traversal ID', s => { s.id = '../../escape'; }],
    ['oversized skill name', s => { s.id = 'a'.repeat(54); }],
    ['unknown specialist', s => { s.primary_agent = 'generic'; }],
    ['arbitrary execution field', s => { s.shell = 'echo unsafe'; }],
    ['unattributed input', s => { s.required_inputs[0].source_required = false; }],
    ['duplicate input key', s => { s.required_inputs.push(copy(s.required_inputs[0])); }]
  ]) check('builder rejects ' + name, () => { const input = copy(spec); mutate(input); assert.throws(() => admin.validateCustom(input)); });
  check('builder maximum ID fits the 64-character skill name contract', () => {
    const bounded = copy(spec); bounded.id = 'a'.repeat(53);
    admin.buildCustom(bounded, path.join(tmp, 'max-name'));
    const skill = fs.readFileSync(path.join(tmp, 'max-name/SKILL.md'), 'utf8');
    assert.equal(skill.match(/^name: (.*)$/m)[1].length, 64);
  });
  for (const target of ['codex', 'claude', 'chatgpt', 'azure', 'databricks']) {
    for (const workflow of admin.catalog().workflows) {
      check(target + ' payload roundtrip: ' + workflow.id, () => {
        const out = path.join(tmp, target + '-' + workflow.id);
        const manifest = admin.exportWorkflow(target, workflow.id, out);
        for (const file of manifest.files) {
          const bytes = fs.readFileSync(path.join(out, file.path));
          assert.equal(bytes.length, file.bytes); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256);
        }
        assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'compatibility.json'))).live_host_tested, false);
        assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out, 'references/workflow.json'))), workflow);
      });
    }
  }
  check('CLI validates, runs and builds real files', () => {
    const call = args => JSON.parse(execFileSync(process.execPath, ['bin/cli.js', 'admin', ...args], { cwd: root, encoding: 'utf8' }));
    assert.equal(call(['run', 'examples/admin-v2/denial-spike-workup.json']).values.percentage_point_change, 8);
    assert.equal(call(['validate', 'workflows/admin-v2/custom-example.json']).status, 'valid');
    call(['build', 'workflows/admin-v2/custom-example.json', '--output', path.join(tmp, 'cli-built')]);
    assert.ok(fs.existsSync(path.join(tmp, 'cli-built/SKILL.md')));
  });
  check('choose also abstains on the vacation budget task', () => {
    const r = JSON.parse(execFileSync(process.execPath, ['bin/cli.js', 'choose', 'Help me format a vacation budget spreadsheet', '--json'], { cwd: root, encoding: 'utf8' }));
    assert.equal(r.status, 'no_match'); assert.equal(r.primary_agent, null);
    const family = JSON.parse(execFileSync(process.execPath, ['bin/cli.js', 'choose', 'Create a vacation budget spreadsheet for my family.', '--json'], { cwd: root, encoding: 'utf8' }));
    assert.equal(family.status, 'no_match'); assert.equal(family.primary_agent, null);
  });
  check('CLI rejects invalid data with nonzero status', () => {
    const file = path.join(tmp, 'invalid.json'); fs.writeFileSync(file, JSON.stringify({ ...denial, human_owner: '' }));
    const r = spawnSync(process.execPath, ['bin/cli.js', 'admin', 'run', file], { cwd: root, encoding: 'utf8' });
    assert.notEqual(r.status, 0); assert.match(r.stderr, /Invalid contract/);
  });
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
console.log('Admin v2: ' + passed + ' checks passed');
