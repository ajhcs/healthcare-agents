#!/usr/bin/env node
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');
const { routeWorkflow } = require('../lib/workflows');
const cli = path.resolve(__dirname, '../bin/cli.js');
const unrelated = [
  'Help our hospital Case Manager plan a birthday party.',
  'Help the Clinical Data Analyst choose a family holiday destination.',
  'My tourist visa was denied. Draft an appeal letter.',
  'Plan a discharge from a battery capacitor circuit.',
  'My auto insurance prior authorization appeal was rejected.',
  'Help our medical office plan a staff birthday party.',
  'Create a vacation budget spreadsheet for my family.',
  'Draft an appeal for a rejected university application.',
  'Build a dashboard for bookstore inventory.',
  'Prepare a survey of customer preferences for a furniture shop.',
  'Review the accreditation evidence for our engineering school.',
  'Discuss a discharge in an electrostatic experiment.',
  'Help a hospital employee plan their family holiday.',
  'Write a poem about our nursing team.'
];
const routes = [
  ['Investigate the hospital denial spike without CHNA or community benefit work.', 'matched', 'denial-spike-workup'],
  ['Prepare our clinic prior authorization appeal rather than a CHNA report.', 'matched', 'prior-authorization-appeal-workup'],
  ['This is not a CHNA or community benefit task. Investigate the hospital Medicaid denial spike.', 'matched', 'denial-spike-workup'],
  ['Ignore CHNA. Our clinic needs a prior authorization appeal packet.', 'matched', 'prior-authorization-appeal-workup'],
  ['Background: we completed CHNA last year. Review the hospital payer contract underpayment.', 'matched', 'payer-contract-underpayment-review'],
  ['Prepare a CHNA community stakeholder interview plan.', 'specialist', null],
  ['Our clinic needs both a payer contract underpayment review and a prior authorization appeal packet.', 'needs_clarification', null],
  ['Our hospital needs survey readiness and denial spike investigation.', 'needs_clarification', null],
  ['Prepare both a CHNA report and investigate the hospital denial spike.', 'needs_clarification', null],
  ['Our clinic needs an ambulatory access backlog plan.', 'matched', 'ambulatory-access-backlog'],
  ['Investigate our hospital payer denial spike and review the appeal backlog as evidence.', 'matched', 'denial-spike-workup'],
  ['Our hospital needs a discharge barrier workplan.', 'matched', 'discharge-barrier-workplan']
];
let checks = 0;
for (const prompt of unrelated) for (const command of ['choose', 'workup']) {
  const result = JSON.parse(execFileSync(process.execPath, [cli, command, prompt, '--json'], { encoding: 'utf8' }));
  assert.equal(result.status, 'no_match', command + ': ' + prompt);
  assert.equal(command === 'choose' ? result.primary_agent : result.roles.primary, null);
  checks++; console.log('PASS ' + command + ' abstains: ' + prompt);
}
for (const [prompt, status, id] of routes) {
  const result = routeWorkflow(prompt); assert.equal(result.status, status, prompt); assert.equal(result.workflow?.id || null, id, prompt);
  const workup = JSON.parse(execFileSync(process.execPath, [cli, 'workup', prompt, '--json'], { encoding: 'utf8' }));
  assert.equal(workup.status, status); assert.equal(workup.workflow.id, id);
  if (status === 'needs_clarification') {
    assert.ok(workup.requested_workflows.length > 1); assert.equal(workup.roles.primary, null);
    assert.ok(workup.questions.required[0].includes('Multiple explicit outcomes'));
    const choose = JSON.parse(execFileSync(process.execPath, [cli, 'choose', prompt, '--json'], { encoding: 'utf8' }));
    assert.equal(choose.status, status); assert.equal(choose.primary_agent, null); assert.deepEqual(choose.requested_workflows, workup.requested_workflows);
  }
  checks++; console.log('PASS explicit intent: ' + prompt);
}
console.log('Routing intent regression: ' + checks + ' checks passed; bounded adversarial cases, not general routing reliability');
