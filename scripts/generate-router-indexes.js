#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./_release-utils');
const { buildAgentIndex, buildWorkflowIndex, buildWorkflowReferences, serializeIndex } = require('../lib/router-indexes');

const skillDir = path.join(ROOT, 'skills', 'healthcare-agents');
const references = buildWorkflowReferences();
for (const [reference, content] of [
  ['references/workflow-index.json', buildWorkflowIndex()],
  ['references/agent-index.json', buildAgentIndex()],
  ...references
]) {
  const target = path.join(skillDir, reference);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, serializeIndex(content));
}
console.log(`router indexes and ${references.size} workflow references generated`);
