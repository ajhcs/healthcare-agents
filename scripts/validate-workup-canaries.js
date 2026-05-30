#!/usr/bin/env node
const { loadWorkflows, routeWorkflow, createWorkup } = require('../lib/workflows');

const failures = [];
let count = 0;

for (const workflow of loadWorkflows()) {
  for (const test of workflow.canary_tests) {
    count += 1;
    const routed = routeWorkflow(test.input);
    if (routed.workflow.id !== test.expected_workflow) {
      failures.push(test.input + ' expected ' + test.expected_workflow + ' got ' + routed.workflow.id);
    }
    const workup = createWorkup(test.input, { target: test.target || 'codex' });
    if (!workup.safety || !workup.safety.constraints || workup.safety.constraints.length < 4) {
      failures.push(workflow.id + ' workup missing required safety constraints');
    }
    if (!workup.platform_prompts.codex || !workup.platform_prompts.claude || !workup.platform_prompts.copilot || !workup.platform_prompts.m365_copilot) {
      failures.push(workflow.id + ' workup missing platform prompts');
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error('workup canary: ' + failure);
  process.exit(1);
}

console.log('workup canaries ok: ' + count + ' cases');
