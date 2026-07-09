#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./_release-utils');
const { buildAgentIndex, buildWorkflowIndex, serializeIndex } = require('../lib/router-indexes');

const outputDir = path.join(ROOT, 'skills', 'healthcare-agents', 'references');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'workflow-index.json'), serializeIndex(buildWorkflowIndex()));
fs.writeFileSync(path.join(outputDir, 'agent-index.json'), serializeIndex(buildAgentIndex()));
console.log('router indexes generated: workflow-index.json, agent-index.json');
