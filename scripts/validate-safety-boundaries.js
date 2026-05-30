#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT, agentFiles, fail, loadRegistry, runRequired } = require('./_release-utils');

const registry = loadRegistry();
const messages = [];
const requiredDocs = [
  'README.md',
  'INSTALL.md',
  'docs/trust-and-safety.md',
  'docs/usage/agent-selection-guide.md',
  'docs/usage/starter-prompts.md'
];

function hasAll(text, phrases) {
  const lower = text.toLowerCase();
  return phrases.every(phrase => lower.includes(phrase.toLowerCase()));
}

for (const file of requiredDocs) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const lower = text.toLowerCase();
  if (!/not final clinical|not make final clinical|do not (make|provide|use).*final clinical|they do not provide final\s+clinical|not (a )?clinical/.test(lower)) {
    messages.push(`${file} missing final-clinical boundary language`);
  }
  for (const phrase of ['legal', 'coding', 'billing', 'compliance']) {
    if (!lower.includes(phrase)) messages.push(`${file} missing safety concept: ${phrase}`);
  }
}
const trust = fs.readFileSync(path.join(ROOT, 'docs/trust-and-safety.md'), 'utf8');
if (!hasAll(trust, ['approved environment', 'minimum necessary', 'human owner', 'source freshness'])) {
  messages.push('docs/trust-and-safety.md does not cover approved environment, minimum necessary, human owner, and source freshness');
}

for (const agent of registry.agents) {
  if (!hasAll(agent.role_boundaries || '', ['support', 'does not'])) messages.push(`${agent.slug} role_boundaries are too weak`);
  if (!agent.required_human_owner || agent.required_human_owner.length < 8) messages.push(`${agent.slug} missing required_human_owner`);
}

for (const file of agentFiles()) {
  const text = fs.readFileSync(file, 'utf8');
  const slug = path.basename(file, '.md');
  for (const heading of ['Critical Rules You Must Follow', 'Output Modes', 'Collaboration & Handoffs']) {
    if (!text.includes(heading)) messages.push(`${slug} prompt missing heading: ${heading}`);
  }
  if (!/final|escalat|human owner|legal counsel|compliance/i.test(text)) {
    messages.push(`${slug} prompt lacks human escalation/final-decision language`);
  }
}

const cliPrompt = runRequired('node', ['bin/cli.js', 'prompt', 'quality-compliance-officer', '--mode', 'audit/checklist']).stdout;
if (!hasAll(cliPrompt, ['approved environment', 'minimum necessary', 'Do not make final', 'role boundary'])) {
  messages.push('CLI prompt output does not preserve required safety boundary language');
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-agents-safety-'));
try {
  runRequired('bash', ['install.sh', 'quality-compliance-officer', '--agent-skills'], { env: { HOME: path.join(tmp, 'home'), NO_COLOR: '1' } });
  const skill = fs.readFileSync(path.join(tmp, 'home', '.agents', 'skills', 'quality-compliance-officer', 'SKILL.md'), 'utf8');
  if (!skill.startsWith('---\nname: quality-compliance-officer')) messages.push('generated SKILL.md is missing frontmatter');
  if (!hasAll(skill, ['approved environment', 'minimum necessary', 'Critical Rules You Must Follow', 'Collaboration & Handoffs'])) {
    messages.push('generated SKILL.md does not preserve safety language and original prompt body');
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

fail(messages);
console.log(`safety boundaries ok: ${registry.agents.length} registry entries, ${agentFiles().length} prompts, CLI prompt, generated skill`);
