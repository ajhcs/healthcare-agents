#!/usr/bin/env node
const fs = require('fs');
const { loadWorkflows } = require('../lib/workflows');

const workflows = loadWorkflows();
const failures = [];

function exists(file) {
  if (!fs.existsSync(file)) failures.push('missing docs file: ' + file);
}

exists('docs/workflows/README.md');
exists('docs/examples/workup-packets.md');
exists('docs/usage/workflow-contribution-guide.md');

for (const workflow of workflows) {
  const file = 'docs/workflows/' + workflow.id + '.md';
  exists(file);
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const needle of [workflow.name, workflow.primary_agent, workflow.output_artifact, 'Platform Prompts']) {
      if (!text.includes(needle)) failures.push(file + ' missing ' + needle);
    }
  }
}

for (const file of [
  'claude.md',
  'codex.md',
  'github-copilot.md',
  'microsoft-365-copilot.md',
  'copilot-studio.md',
  'azure-ai-foundry.md',
  'microsoft-cloud-for-healthcare.md',
  'fhir-and-medplum.md',
  'ehr-compatibility.md',
  'teams-sharepoint-servicenow.md'
]) {
  exists('docs/platforms/' + file);
}

if (fs.existsSync('docs/examples/workup-packets.md')) {
  const count = (fs.readFileSync('docs/examples/workup-packets.md', 'utf8').match(/^## /gm) || []).length;
  if (count < 20) failures.push('expected at least 20 documented example workups, found ' + count);
}

if (failures.length) {
  for (const failure of failures) console.error('workflow docs: ' + failure);
  process.exit(1);
}

console.log('workflow docs ok: ' + workflows.length + ' workflow pages');
