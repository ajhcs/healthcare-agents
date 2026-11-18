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

function reliabilityBullets() {
  return [
    'Define the target outcome and observable terminal state before starting multi-step work.',
    'Keep a compact ledger of verified facts and sources, required documents, completed and pending actions, owners, deadlines, discrepancies, and blockers.',
    'Collect downstream-required facts and documents before leaving a source system or handing work to another role.',
    'Finish as Completed, Partial, or Blocked with terminal evidence, the remaining gap, owner, and next action; subtask progress alone is not completion.'
  ];
}

function renderWorkflowSkill(workflow, host) {
  return lines([
    '---',
    `name: healthcare-${workflow.id}`,
    'description: >-',
    `  ${workflow.summary} Use for ${workflow.triggers.slice(0, 5).join(', ')}.`,
    'license: Apache-2.0',
    ...(host === 'claude' ? ['compatibility: claude-code, claude-desktop, claude-cowork'] : []),
    '---',
    '',
    `# ${workflow.name}`,
    '',
    workflow.platform_prompt_templates[host],
    '',
    '## Scope and ownership',
    '',
    `Use ${workflow.primary_agent} as the primary specialist for the ${workflow.output_artifact}. Read the primary specialist prompt for detailed methods or templates when available.`,
    `Involve ${workflow.handoff_agents.join(', ')} where their roles apply.`,
    `Exclude requests for ${workflow.anti_triggers.join(', ')} from this workflow.`,
    '',
    '## Evidence needed',
    '',
    bullets(workflow.required_inputs),
    '',
    'Record the source and effective date for each material input. Ask only for missing information that blocks useful progress. Mark gaps and conflicts in the draft.',
    '',
    '## Full workup sections',
    '',
    bullets(workflow.artifact_sections),
    '',
    'Adapt the sections to the requested deliverable. For visuals, follow the user’s reference or an existing report and check readability and interactions at the intended size.',
    '',
    '## Escalation triggers',
    '',
    bullets(workflow.red_flags),
    '',
    '## Review before delivery',
    '',
    'Confirm the role-specific checks, evidence and owner. For multi-step execution, track evidence, documents, owner, deadline, and downstream confirmation. Report Completed, Partial, or Blocked with terminal evidence or the remaining gap and next action.',
    '',
    '## Safety Constraints',
    bullets(safetyBullets(workflow))
  ]);
}

function renderClaudeWorkflowSkill(workflow) {
  return renderWorkflowSkill(workflow, 'claude');
}

function renderCodexWorkflowSkill(workflow) {
  return renderWorkflowSkill(workflow, 'codex');
}

function renderCodexAgentsMd() {
  return lines([
    '## Healthcare Agents',
    '',
    'For US healthcare administration, use the relevant workflow skill or the narrowest specialist prompt in `~/.codex/agents/`. The selected instructions contain the evidence and review requirements.',
    '',
    'Use PHI only in an approved environment with minimum necessary handling. Qualified humans own regulated decisions. External submissions, messages, and production changes require scoped authorization.'
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
      'Ask only for missing inputs that block a safe, useful response; otherwise state assumptions.',
      'Name supporting handoffs when work crosses roles.',
      'Write outputs as structured work packets with assumptions, evidence, owners, red flags, acceptance criteria, and review status.',
      'For multi-step work, maintain a compact state ledger and report Completed, Partial, or Blocked with terminal evidence and next action.'
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
    'When implementing or reviewing work, include acceptance criteria, safety notes, required inputs, and human review owners. For multi-step work, preserve state and distinguish terminal completion from partial progress.'
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
    bullets(['Structured artifact', 'Missing inputs', 'Evidence checklist', 'Handoffs', 'Acceptance criteria', 'Completed/Partial/Blocked status for multi-step work', 'Safety notes']),
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
      'Multi-step work records verified facts, source/version, documents, actions, owners, deadlines, discrepancies, and blockers.',
      'The final status distinguishes Completed, Partial, and Blocked using terminal evidence rather than subtask progress.',
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
    '        - Multi-step status is Completed, Partial, or Blocked with terminal evidence and the next action.',
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
    '## End-to-End Reliability',
    bullets(reliabilityBullets()),
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
    '## End-to-End Reliability',
    bullets(reliabilityBullets()),
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
    bullets(['Prompt version', 'Workflow id', 'User role', 'Knowledge sources used', 'State-ledger updates', 'Terminal evidence and status', 'Human review outcome', 'Safety red flags']),
    '',
    '## End-to-End Reliability',
    bullets(reliabilityBullets()),
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
