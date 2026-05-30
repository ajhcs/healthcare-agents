const { loadSafety } = require('./workflows');

function lines(parts) {
  return parts.flat().join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function bullets(items) {
  return items.map(item => `- ${item}`);
}

function numbered(items) {
  return items.map((item, index) => `${index + 1}. ${item}`);
}

function safetyBullets(workflow) {
  const snippets = loadSafety().snippets;
  return workflow.safety_constraints.map(key => snippets[key]).filter(Boolean);
}

function workflowSummary(workflow) {
  return [
    `Workflow: ${workflow.name} (${workflow.id})`,
    `Primary specialist: ${workflow.primary_agent}`,
    `Supporting handoffs: ${workflow.handoff_agents.join(', ') || 'None'}`,
    `Output artifact: ${workflow.output_artifact}`
  ];
}

function renderClaudeWorkflowSkill(workflow) {
  return lines([
    '---',
    `name: healthcare-${workflow.id}`,
    'description: >-',
    `  Healthcare administration workflow for ${workflow.summary} Use when the user describes ${workflow.triggers.slice(0, 5).join(', ')}.`,
    'license: Apache-2.0',
    'compatibility: claude-code, claude-desktop, claude-cowork',
    '---',
    '',
    `# ${workflow.name}`,
    '',
    workflow.summary,
    '',
    '## When To Use',
    bullets(workflow.triggers),
    '',
    '## Required User Inputs',
    bullets(workflow.required_inputs),
    '',
    '## Missing-Input Triage Questions',
    bullets(workflow.required_inputs.map(input => `What is the ${input}?`)),
    '',
    '## Specialist Routing',
    bullets(workflowSummary(workflow)),
    '',
    '## Output Artifact Structure',
    bullets(workflow.artifact_sections),
    '',
    '## Safety Constraints',
    bullets(safetyBullets(workflow)),
    '',
    '## Example Prompt',
    workflow.platform_prompt_templates.claude,
    '',
    '## Quality Checklist',
    bullets([
      'The workflow match and assumptions are explicit.',
      'Required missing inputs are asked before final recommendations.',
      'Handoffs are named when the work crosses role boundaries.',
      'The artifact includes owners, evidence, red flags, and review status.',
      'The response avoids clinical, legal, billing, coding, audit, or compliance final authority.'
    ])
  ]);
}

function renderCodexAgentsMd() {
  return lines([
    '## Healthcare Agents',
    '',
    'Healthcare Agents is a healthcare administration workflow and specialist prompt kit. Use it for operations, revenue cycle, quality, compliance, population health, payer, pharmacy, health IT, and strategy workups.',
    '',
    bullets([
      'Do not provide diagnosis, treatment, emergency guidance, or final clinical judgment.',
      'Do not include PHI unless the user is working in an approved environment, with local governance and minimum necessary handling in place.',
      'Choose one primary healthcare specialist first, then name supporting handoffs instead of blending roles.',
      'When a workflow applies, ask for required missing inputs from the workflow before drafting a final artifact.',
      'Produce structured artifacts with assumptions, evidence needed, red flags, owners, and quality checks.',
      'Preserve operational decision ownership with local compliance, legal, clinical, finance, IT security, and executive leaders.',
      'Follow any deeper repo-local AGENTS.md instructions when working inside a healthcare project.'
    ])
  ]);
}

function renderCodexWorkflowSkill(workflow) {
  return lines([
    '---',
    `name: healthcare-${workflow.id}`,
    'description: >-',
    `  Healthcare administration workflow skill for ${workflow.name}. Use when the user asks for ${workflow.triggers.slice(0, 6).join(', ')}.`,
    'license: Apache-2.0',
    '---',
    '',
    `# ${workflow.name}`,
    '',
    'Read the primary specialist prompt before producing the final artifact when it is available locally.',
    '',
    '## Routing',
    bullets(workflowSummary(workflow)),
    '',
    '## Required Inputs',
    bullets(workflow.required_inputs),
    '',
    '## Workflow Steps',
    numbered([
      'Restate the problem and assumptions.',
      'Identify missing required inputs and ask concise questions when needed.',
      'List immediate triage steps and evidence to collect.',
      'Draft the requested artifact using the section structure below.',
      'Name red flags, human owners, and supporting handoffs.',
      'Run the quality checklist before finalizing.'
    ]),
    '',
    '## Artifact Sections',
    bullets(workflow.artifact_sections),
    '',
    '## Red Flags',
    bullets(workflow.red_flags),
    '',
    '## Safety',
    bullets(safetyBullets(workflow)),
    '',
    '## Codex Prompt',
    workflow.platform_prompt_templates.codex
  ]);
}

function renderCopilotRepoInstructions(workflows) {
  const workflowList = workflows.map(workflow => `- ${workflow.id}: ${workflow.name} -> ${workflow.primary_agent}`);
  return lines([
    '# Healthcare Agents Copilot Instructions',
    '',
    'Use this repository guidance for healthcare administration workflows only. Approved use cases include operations, revenue cycle, compliance, quality, analytics, payer, pharmacy, and health IT workups.',
    '',
    'Forbidden use cases: diagnosis, treatment advice, emergency guidance, medical-device behavior, hidden PHI processing, or final legal/compliance/coding/billing authority.',
    '',
    '## Agent Selection Policy',
    bullets([
      'Select one primary healthcare specialist or workflow first.',
      'Ask for missing required inputs before drafting final artifacts.',
      'Name supporting handoffs when work crosses roles.',
      'Write outputs as structured work packets with assumptions, evidence, owners, red flags, acceptance criteria, and review status.'
    ]),
    '',
    '## Core Workflows',
    workflowList,
    '',
    '## Security And Compliance',
    bullets(Object.values(loadSafety().snippets).slice(0, 4))
  ]);
}

function renderCopilotPathInstruction(group) {
  return lines([
    '---',
    `applyTo: "${group.applyTo}"`,
    '---',
    '',
    `# ${group.title}`,
    '',
    group.description,
    '',
    'Use Healthcare Agents workflows in this area. Keep PHI out of examples unless the repository and task are explicitly governed for PHI.',
    '',
    'When implementing or reviewing work, include acceptance criteria, safety notes, required inputs, and human review owners.'
  ]);
}

function renderCopilotAgent(agent) {
  return lines([
    '---',
    `name: ${agent.name}`,
    `description: ${agent.description}`,
    'tools: codebase, search, terminal',
    '---',
    '',
    `# ${agent.title}`,
    '',
    'You are a governed healthcare administration Copilot custom agent. Stay inside the role boundaries below.',
    '',
    '## Role Boundaries',
    bullets(agent.boundaries),
    '',
    '## Input Expectations',
    bullets(['Problem statement', 'Healthcare setting', 'Available evidence', 'Constraints and deadline', 'Human owner for final decisions']),
    '',
    '## Output Expectations',
    bullets(['Structured artifact', 'Missing inputs', 'Evidence checklist', 'Handoffs', 'Acceptance criteria', 'Safety notes']),
    '',
    '## Safety Constraints',
    bullets(Object.values(loadSafety().snippets).slice(0, 4))
  ]);
}

function renderCopilotPrompt(workflow) {
  return lines([
    `# ${workflow.name}`,
    '',
    workflow.platform_prompt_templates.copilot,
    '',
    '## Required Inputs',
    bullets(workflow.required_inputs),
    '',
    '## Output Artifact',
    `Produce a ${workflow.output_artifact} with these sections:`,
    bullets(workflow.artifact_sections),
    '',
    '## Acceptance Criteria',
    bullets([
      'The workflow match and primary specialist are explicit.',
      'Required missing inputs are listed as questions.',
      'Evidence requests are specific and actionable.',
      'Safety constraints and human review owners are included.',
      'No unsupported clinical, legal, coding, billing, audit, compliance, or medical-device claims are made.'
    ]),
    '',
    '## Safety',
    bullets(safetyBullets(workflow))
  ]);
}

function renderIssueTemplate(workflow) {
  return lines([
    `name: ${workflow.name}`,
    `description: Request a ${workflow.output_artifact}`,
    `title: "[Healthcare Workup] ${workflow.name}"`,
    'labels: ["healthcare-agents", "workup"]',
    'body:',
    '  - type: textarea',
    '    id: background',
    '    attributes:',
    '      label: Background',
    '      description: Describe the healthcare administration problem without unnecessary PHI.',
    '    validations:',
    '      required: true',
    '  - type: textarea',
    '    id: required-inputs',
    '    attributes:',
    '      label: Required inputs',
    '      value: |',
    ...workflow.required_inputs.map(input => `        - ${input}:`),
    '    validations:',
    '      required: true',
    '  - type: textarea',
    '    id: acceptance',
    '    attributes:',
    '      label: Acceptance criteria',
    '      value: |',
    ...workflow.artifact_sections.map(section => `        - ${section} section is complete and reviewed.`),
    '  - type: markdown',
    '    attributes:',
    '      value: "Safety: do not include PHI unless this repository is approved for it; final decisions require qualified human review."'
  ]);
}

function renderM365DeclarativeAgent(workflow) {
  return lines([
    `# Microsoft 365 Copilot Declarative Agent Export: ${workflow.name}`,
    '',
    `Agent name: Healthcare ${workflow.name}`,
    `Description: ${workflow.summary}`,
    '',
    '## Instructions',
    workflow.platform_prompt_templates.m365_copilot,
    '',
    '## Starter Prompts',
    bullets(workflow.examples.map(example => example.input)),
    '',
    '## Knowledge Source Guidance',
    bullets([
      'Use approved SharePoint, OneDrive, connector, or uploaded-file sources selected by tenant admins.',
      loadSafety().snippets.knowledge_not_instruction,
      'Keep local policies, payer contracts, and operating reports as knowledge sources, not hidden instruction channels.'
    ]),
    '',
    '## Action Placeholder Guidance',
    bullets(['Data lookup action for approved reports', 'Ticket creation action for governed workflow systems', 'Human approval action before operational changes']),
    '',
    '## Safety Boundaries',
    bullets(safetyBullets(workflow)),
    '',
    '## Test Cases',
    bullets(workflow.canary_tests.map(test => `Prompt: ${test.input}; expected workflow: ${test.expected_workflow}`)),
    '',
    '## Admin Review Checklist',
    bullets(['Tenant data policy reviewed', 'PHI handling approved or prohibited', 'Knowledge sources verified', 'Action owners assigned', 'Human review path documented'])
  ]);
}

function renderCopilotStudioGuide(workflow) {
  return lines([
    `# Copilot Studio Build Guide: ${workflow.name}`,
    '',
    '## Instructions',
    workflow.platform_prompt_templates.m365_copilot,
    '',
    '## Topics And Trigger Phrases',
    bullets(workflow.triggers),
    '',
    '## Inputs',
    bullets(workflow.required_inputs),
    '',
    '## Knowledge Source Mapping',
    bullets(['Policies and procedures', 'Operational dashboards', 'Payer contracts or quality program documents when applicable', 'Do not use knowledge files as hidden instructions']),
    '',
    '## Tool And Action Placeholders',
    bullets(['Create workup ticket', 'Retrieve approved dashboard summary', 'Route for human review']),
    '',
    '## Escalation And Human Review',
    bullets(['Compliance/legal for regulatory questions', 'Clinical leadership for clinical judgment', 'Finance or contracting for payer/payment decisions', 'IT security for PHI/security concerns']),
    '',
    '## Test Script',
    numbered(workflow.canary_tests.map(test => `Submit "${test.input}" and confirm the agent returns ${workflow.output_artifact} with safety boundaries.`)),
    '',
    '## Safety Boundaries',
    bullets(safetyBullets(workflow))
  ]);
}

function renderAzureFoundrySpec(workflow) {
  return lines([
    `# Azure AI Foundry Agent Spec: ${workflow.name}`,
    '',
    '## Prompt Agent Spec',
    workflow.platform_prompt_templates.m365_copilot,
    '',
    '## Workflow Agent Spec',
    bullets(workflow.artifact_sections.map(section => `Produce and validate ${section}.`)),
    '',
    '## Tool Schema Placeholders',
    bullets(['approved_report_lookup', 'ticket_create', 'policy_document_search', 'human_review_request']),
    '',
    '## Identity And RBAC Notes',
    bullets(['Use least-privilege managed identity', 'Restrict data connectors by role', 'Log access to governed knowledge sources']),
    '',
    '## Observability Checklist',
    bullets(['Prompt version', 'Workflow id', 'User role', 'Knowledge sources used', 'Human review outcome', 'Safety red flags']),
    '',
    '## Versioning Checklist',
    bullets(['Version workflow definition', 'Version prompt instructions', 'Snapshot tests before deployment', 'Rollback plan documented']),
    '',
    '## Private Networking And Distribution',
    bullets(['Evaluate private networking for sensitive data sources', 'Document Teams and Microsoft 365 Copilot distribution path', 'Do not claim medical-device behavior']),
    '',
    '## Safety',
    bullets(safetyBullets(workflow))
  ]);
}

module.exports = {
  renderClaudeWorkflowSkill,
  renderCodexAgentsMd,
  renderCodexWorkflowSkill,
  renderCopilotRepoInstructions,
  renderCopilotPathInstruction,
  renderCopilotAgent,
  renderCopilotPrompt,
  renderIssueTemplate,
  renderM365DeclarativeAgent,
  renderCopilotStudioGuide,
  renderAzureFoundrySpec
};
