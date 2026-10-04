#!/usr/bin/env node
const { loadWorkflows, routeWorkflow, createWorkup } = require('../lib/workflows');

const failures = [];
let count = 0;

for (const workflow of loadWorkflows()) {
  for (const test of workflow.canary_tests) {
    count += 1;
    // Catalog canaries are explicitly healthcare scoped; separate adversarial cases test abstention.
    const problem = 'Healthcare administration request: ' + test.input;
    const discovery = routeWorkflow(problem);
    if (discovery.workflow || discovery.fallback_agent) failures.push(workflow.id + ' discovery selected a route');
    const routed = routeWorkflow(problem, { workflowIds: [test.expected_workflow] });
    if (routed.workflow?.id !== test.expected_workflow) {
      failures.push(test.input + ' expected ' + test.expected_workflow + ' got ' + routed.workflow?.id);
    }
    const workup = createWorkup(problem, { target: test.target || 'codex', workflowIds: [test.expected_workflow] });
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

console.log('workup canaries ok: ' + count + ' explicit legacy workflow drafts plus discovery checks');
