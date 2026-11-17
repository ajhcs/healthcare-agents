#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, fail } = require('./_release-utils');
const {
  AGENT_SOURCE,
  DEEP_WORKFLOW_SOURCE,
  WORKFLOW_SOURCE,
  buildAgentIndex,
  buildWorkflowIndex,
  buildWorkflowReferences,
  serializeIndex
} = require('../lib/router-indexes');

const skillDir = path.join(ROOT, 'skills', 'healthcare-agents');
const routerSkillPath = path.join(skillDir, 'SKILL.md');
const workflowIndex = buildWorkflowIndex();
const agentIndex = buildAgentIndex();
const deepCatalog = JSON.parse(fs.readFileSync(DEEP_WORKFLOW_SOURCE, 'utf8'));
const workflowReferences = buildWorkflowReferences(undefined, deepCatalog);
const expected = new Map([
  ['references/workflow-index.json', workflowIndex],
  ['references/agent-index.json', agentIndex],
  ...workflowReferences
]);
const messages = [];

for (const [name, content] of expected) {
  const target = path.join(skillDir, name);
  if (!fs.existsSync(target)) {
    messages.push(`missing ${path.relative(ROOT, target)}`);
    continue;
  }
  if (fs.readFileSync(target, 'utf8') !== serializeIndex(content)) {
    messages.push(`${path.relative(ROOT, target)} is stale; run node scripts/generate-router-indexes.js`);
  }
}

const sourceBytes = fs.statSync(AGENT_SOURCE).size + fs.statSync(WORKFLOW_SOURCE).size;
const workflowIndexBytes = Buffer.byteLength(serializeIndex(workflowIndex));
const indexBytes = workflowIndexBytes + Buffer.byteLength(serializeIndex(agentIndex));
if (workflowIndexBytes >= fs.statSync(WORKFLOW_SOURCE).size * 0.4) {
  messages.push(`workflow routing index is too large: ${workflowIndexBytes} bytes`);
}
if (indexBytes >= sourceBytes * 0.6) {
  messages.push(`router indexes are too large: ${indexBytes} bytes vs ${sourceBytes} source bytes`);
}

const deepById = new Map(deepCatalog.workflows.map(workflow => [workflow.id, workflow]));
for (const entry of workflowIndex.workflows) {
  if (workflowReferences.get(entry.reference)?.id !== entry.id) {
    messages.push(`missing workflow detail for ${entry.id}: ${entry.reference}`);
  }
}
for (const [relativePath, reference] of workflowReferences) {
  if (!reference.deep_contract_reference) continue;
  const deepPath = path.resolve(skillDir, path.dirname(relativePath), reference.deep_contract_reference);
  const expectedContract = deepById.get(reference.id);
  if (!expectedContract || !fs.existsSync(deepPath) ||
      fs.readFileSync(deepPath, 'utf8') !== serializeIndex(expectedContract)) {
    messages.push(`invalid deep contract reference for ${reference.id}: ${path.relative(ROOT, deepPath)}`);
    continue;
  }
  deepById.delete(reference.id);
}
for (const id of deepById.keys()) {
  messages.push(`missing workflow reference to deep contract for ${id}`);
}

const routerSkill = fs.readFileSync(routerSkillPath, 'utf8');
const workflowIndexPosition = routerSkill.indexOf('references/workflow-index.json');
const agentIndexPosition = routerSkill.indexOf('references/agent-index.json');
if (workflowIndexPosition === -1 || agentIndexPosition === -1) {
  messages.push('router skill must reference both compact indexes');
} else if (workflowIndexPosition > agentIndexPosition) {
  messages.push('router skill must use the workflow index before the agent fallback index');
}
if (/Read `\.\.\/\.\.\/(workflows\/workflows|agents\/registry)\.json`/.test(routerSkill)) {
  messages.push('router skill still requires a canonical full registry during initial routing');
}

fail(messages);
const reduction = Math.round((1 - indexBytes / sourceBytes) * 100);
console.log(`router indexes ok: ${indexBytes} bytes, ${reduction}% smaller than canonical routing sources. Workflow index: ${workflowIndexBytes} bytes with ${workflowReferences.size} detail references.`);
