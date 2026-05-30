#!/usr/bin/env node
const { loadWorkflows, loadSafety } = require('../lib/workflows');
const renderers = require('../lib/renderers');

const workflows = loadWorkflows();
const safety = Object.values(loadSafety().snippets).slice(0, 4);
const failures = [];

function check(name, content) {
  if (!content || content.length < 300) failures.push(name + ' rendered too little content');
  for (const snippet of safety) {
    if (!content.includes(snippet)) failures.push(name + ' missing safety snippet: ' + snippet.slice(0, 48));
  }
  if (/medical device|medical-device/i.test(content) && !/Do not claim medical-device|Forbidden use cases|No unsupported .*medical-device/i.test(content)) {
    failures.push(name + ' may overclaim medical-device behavior');
  }
}

for (const workflow of workflows) {
  check('claude ' + workflow.id, renderers.renderClaudeWorkflowSkill(workflow));
  check('codex ' + workflow.id, renderers.renderCodexWorkflowSkill(workflow));
  check('copilot prompt ' + workflow.id, renderers.renderCopilotPrompt(workflow));
  check('m365 ' + workflow.id, renderers.renderM365DeclarativeAgent(workflow));
  check('copilot studio ' + workflow.id, renderers.renderCopilotStudioGuide(workflow));
  check('azure foundry ' + workflow.id, renderers.renderAzureFoundrySpec(workflow));
}

check('copilot repo instructions', renderers.renderCopilotRepoInstructions(workflows));

if (failures.length) {
  for (const failure of failures) console.error('platform export validation: ' + failure);
  process.exit(1);
}

console.log('platform export validation ok: ' + workflows.length + ' workflows');
