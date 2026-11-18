const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const WORKFLOW_SOURCE = path.join(ROOT, 'workflows', 'workflows.json');
const AGENT_SOURCE = path.join(ROOT, 'agents', 'registry.json');
const DEEP_WORKFLOW_SOURCE = path.join(ROOT, 'workflows', 'admin-v2', 'catalog.json');

function workflowReference(id) {
  return `references/workflows/${id}.json`;
}

function buildWorkflowIndex(source = readJson(WORKFLOW_SOURCE)) {
  return {
    schema_version: '2.0.0',
    generated_from: 'workflows/workflows.json',
    routing_order: 'Match triggers and rule out anti_triggers. Open each selected reference relative to the router skill directory.',
    workflows: source.workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      triggers: workflow.triggers,
      anti_triggers: workflow.anti_triggers,
      output_artifact: workflow.output_artifact,
      reference: workflowReference(workflow.id)
    }))
  };
}

function buildWorkflowReferences(source = readJson(WORKFLOW_SOURCE), deepCatalog = readJson(DEEP_WORKFLOW_SOURCE)) {
  const deepIds = new Set(deepCatalog.workflows.map(workflow => workflow.id));
  return new Map(source.workflows.map(workflow => {
    const reference = {
      id: workflow.id,
      name: workflow.name,
      category: workflow.category,
      summary: workflow.summary,
      primary_agent: workflow.primary_agent,
      handoff_agents: workflow.handoff_agents,
      required_inputs: workflow.required_inputs,
      optional_inputs: workflow.optional_inputs,
      red_flags: workflow.red_flags,
      output_artifact: workflow.output_artifact,
      artifact_sections: workflow.artifact_sections,
      review_guidance: workflow.platform_prompt_templates.codex,
      safety_constraints: workflow.safety_constraints
    };
    if (deepIds.has(workflow.id)) {
      reference.deep_contract_reference = `../../../healthcare-${workflow.id}/references/workflow.json`;
    }
    return [workflowReference(workflow.id), reference];
  }));
}

function buildAgentIndex(source = readJson(AGENT_SOURCE)) {
  return {
    schema_version: '1.0.0',
    generated_from: 'agents/registry.json',
    routing_order: 'Use for each requested deliverable without a matching workflow. Choose the narrowest primary specialist for that deliverable.',
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
  DEEP_WORKFLOW_SOURCE,
  WORKFLOW_SOURCE,
  buildAgentIndex,
  buildWorkflowIndex,
  buildWorkflowReferences,
  serializeIndex
};
