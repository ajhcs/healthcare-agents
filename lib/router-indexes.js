const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const WORKFLOW_SOURCE = path.join(ROOT, 'workflows', 'workflows.json');
const AGENT_SOURCE = path.join(ROOT, 'agents', 'registry.json');

function buildWorkflowIndex(source = readJson(WORKFLOW_SOURCE)) {
  return {
    schema_version: '1.0.0',
    generated_from: 'workflows/workflows.json',
    routing_order: 'Match triggers and reject anti_triggers before loading an agent index or full prompt.',
    workflows: source.workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      category: workflow.category,
      summary: workflow.summary,
      triggers: workflow.triggers,
      anti_triggers: workflow.anti_triggers,
      primary_agent: workflow.primary_agent,
      handoff_agents: workflow.handoff_agents,
      required_inputs: workflow.required_inputs,
      red_flags: workflow.red_flags,
      output_artifact: workflow.output_artifact,
      artifact_sections: workflow.artifact_sections,
      safety_constraints: workflow.safety_constraints
    }))
  };
}

function buildAgentIndex(source = readJson(AGENT_SOURCE)) {
  return {
    schema_version: '1.0.0',
    generated_from: 'agents/registry.json',
    routing_order: 'Use only when no workflow in workflow-index.json is a fit. Select one narrow primary specialist.',
    output_modes: Object.keys(source.output_modes),
    agents: source.agents.map(agent => ({
      slug: agent.slug,
      display_name: agent.display_name,
      domain: agent.domain,
      description: agent.description,
      common_tasks: agent.common_tasks,
      prompt_file: agent.provenance.prompt_file
    }))
  };
}

function serializeIndex(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

module.exports = {
  AGENT_SOURCE,
  WORKFLOW_SOURCE,
  buildAgentIndex,
  buildWorkflowIndex,
  serializeIndex
};
