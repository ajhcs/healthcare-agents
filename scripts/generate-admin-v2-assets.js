#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { catalog, skillFor } = require('../lib/admin-workflows');

const root = path.join(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'agents/registry.json'), 'utf8'));
const check = process.argv.includes('--check');
const stale = [];

function write(name, value) {
  const file = path.join(root, name);
  if (check) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== value) stale.push(name);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

for (const agent of registry.agents) {
  const source = fs.readFileSync(path.join(root, agent.provenance.prompt_file), 'utf8');
  const outcome = source.match(/^# [^\n]+\n\n([\s\S]+?)\n\n## Review the Work$/m);
  const finish = source.match(/(?:^|\n)### Role Finish Check\n([\s\S]+?)(?=\n### |\n## |$)/);
  if (!outcome || !finish) throw new Error(agent.provenance.prompt_file + ' needs an opening outcome and Role Finish Check');

  const brief = [
    '# ' + agent.display_name,
    '',
    outcome[1].trim(),
    '',
    '## Review the draft',
    '',
    finish[1].trim(),
    '',
    agent.role_boundaries,
    'Route related work to ' + agent.handoffs.join(', ') + ' when their roles apply.',
    '',
    'Catalog review date: ' + agent.last_reviewed.date + '.',
    'Open the [full specialist prompt](../../../../' + agent.provenance.prompt_file + ') for detailed methods and templates.',
    ''
  ].join('\n');
  write('skills/healthcare-agents/references/roles/' + agent.slug + '.md', brief);
}

const workflows = catalog().workflows;
for (const workflow of workflows) {
  const base = 'skills/healthcare-' + workflow.id;
  write(base + '/SKILL.md', skillFor(workflow, { builtin: true }));
  write(base + '/references/workflow.json', JSON.stringify(workflow, null, 2) + '\n');
}

if (stale.length) {
  console.error('Run node scripts/generate-admin-v2-assets.js to refresh:\n' + stale.join('\n'));
  process.exitCode = 1;
} else {
  console.log((check ? 'Verified ' : 'Generated ') + registry.agents.length + ' role briefs and ' + workflows.length + ' workflow skills');
}
