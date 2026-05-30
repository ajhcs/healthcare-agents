#!/usr/bin/env node
const { validateWorkflowRegistry, validatePlatformRegistry, loadWorkflows } = require('../lib/workflows');

const messages = [
  ...validateWorkflowRegistry(),
  ...validatePlatformRegistry()
];

const ids = loadWorkflows().map(workflow => workflow.id);
if (ids.length !== 16) messages.push('expected exactly 16 phase-one workflows, found ' + ids.length);

if (messages.length) {
  for (const message of messages) console.error('workflow validation: ' + message);
  process.exit(1);
}

console.log('workflow validation ok: ' + ids.length + ' workflows');
