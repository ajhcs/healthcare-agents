#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, fail } = require('./_release-utils');
const {
  AGENT_SOURCE,
  WORKFLOW_SOURCE,
  buildAgentIndex,
  buildWorkflowIndex,
  serializeIndex
} = require('../lib/router-indexes');

const indexDir = path.join(ROOT, 'skills', 'healthcare-agents', 'references');
const routerSkillPath = path.join(ROOT, 'skills', 'healthcare-agents', 'SKILL.md');
const expected = new Map([
  ['workflow-index.json', serializeIndex(buildWorkflowIndex())],
  ['agent-index.json', serializeIndex(buildAgentIndex())]
]);
const messages = [];

for (const [name, content] of expected) {
  const target = path.join(indexDir, name);
  if (!fs.existsSync(target)) {
    messages.push(`missing ${path.relative(ROOT, target)}`);
    continue;
  }
  if (fs.readFileSync(target, 'utf8') !== content) {
    messages.push(`${path.relative(ROOT, target)} is stale; run node scripts/generate-router-indexes.js`);
  }
}

const sourceBytes = fs.statSync(AGENT_SOURCE).size + fs.statSync(WORKFLOW_SOURCE).size;
const indexBytes = [...expected.values()].reduce((total, content) => total + Buffer.byteLength(content), 0);
if (indexBytes >= sourceBytes * 0.6) {
  messages.push(`router indexes are too large: ${indexBytes} bytes vs ${sourceBytes} source bytes`);
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
console.log(`router indexes ok: ${indexBytes} bytes, ${reduction}% smaller than canonical routing sources`);
