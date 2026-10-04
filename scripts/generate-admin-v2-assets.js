#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { catalog, skillFor } = require('../lib/admin-workflows');
const root = path.join(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'agents/registry.json')));
function write(name, value) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}
for (const agent of registry.agents) {
  const source = fs.readFileSync(path.join(root, agent.provenance.prompt_file), 'utf8');
  const finish = source.match(/(?:^|\n)##[^\n]*Role Finish Check[^\n]*\n([\s\S]*?)(?=\n### |\n## |$)/);
  const brief = ['# ' + agent.display_name, '', agent.description, '',
    'Domain decisions: ' + agent.common_tasks.join('; '), '',
    'Evidence leads: ' + agent.source_families.join('; ') + '. Verify exact source applicability and effective date.',
    'Source review metadata: ' + agent.last_reviewed.date + '; this is not current regulatory verification.', '',
    'Human owner: ' + agent.required_human_owner, 'Boundary: ' + agent.role_boundaries, '',
    'Handoffs: ' + agent.handoffs.join(', '), '',
    finish ? 'Role finish check:\n' + finish[1].trim() : '',
    'For detailed domain material, read [the original specialist](../../../../' + agent.provenance.prompt_file + ').',
    'Resolve conflicts against authoritative current evidence; do not treat an old prompt table as governing policy.', ''].filter(line => line !== undefined).join('\n');
  write('skills/healthcare-agents/references/roles/' + agent.slug + '.md', brief);
}
for (const workflow of catalog().workflows) {
  const base = 'skills/healthcare-' + workflow.id;
  write(base + '/SKILL.md', skillFor(workflow));
  write(base + '/references/workflow.json', JSON.stringify(workflow, null, 2) + '\n');
}
console.log('Generated 51 compact role briefs and six progressive-disclosure workflow skills');
