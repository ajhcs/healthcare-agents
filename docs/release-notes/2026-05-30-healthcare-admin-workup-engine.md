# Healthcare Admin Workup Engine

Date: 2026-05-30
Status: implemented on the next development branch

## Summary

This release line turns Healthcare Agents from a specialist prompt pack into a workflow-first healthcare administration kit. Users can now route a plain-language operational problem into a structured workup with a workflow match, primary specialist, handoffs, missing inputs, evidence to collect, artifact scaffold, safety boundaries, and platform-ready prompts.

## Added

- Workflow registry with 16 phase-one healthcare administration workflows.
- Workflow, platform, and safety source-of-truth files under workflows/, platforms/, and safety/.
- CLI commands for workflows, workflow <id>, workup "<problem>", and export <platform> <workflow-id>.
- Deterministic renderers for Claude workflow skills, Codex workflow skills and AGENTS.md guidance, GitHub Copilot surfaces, Microsoft 365 Copilot declarative agents, Copilot Studio guides, and Azure AI Foundry specs.
- Installer flags for --claude-workflow-skills, --codex-skills, --copilot-repo, --copilot-instructions, --copilot-agents, --copilot-prompts, --copilot-issue-templates, and --copilot-all.
- Validation scripts for workflows, routing canaries, platform exports, workflow docs, renderer snapshots, and public version sync.
- Workflow gallery, example workup packets, platform compatibility guides, demo folders, and workflow contribution guidance.

## Safety And Governance

The workflow engine remains healthcare administration decision support. It does not provide diagnosis, treatment, emergency medical guidance, medical-device behavior, direct EHR access, hosted PHI processing, or final legal, clinical, coding, billing, audit, compliance, contracting, employment, security, or executive authority.

Microsoft 365 Copilot, Copilot Studio, Azure AI Foundry, Teams, SharePoint, ServiceNow, EHR, FHIR, and Medplum support is framed as governed export or compatibility guidance unless direct integration is explicitly built later.

## Validation

- npm run release:check
- node scripts/validate-workflows.js
- node scripts/validate-workup-canaries.js
- node scripts/validate-platform-exports.js
- node scripts/validate-workflow-docs.js
- node scripts/test-platform-render-snapshots.js
- bash scripts/test-installer-e2e.sh
- node scripts/validate-public-version-sync.js

Local release readiness passes. Public release verification also passes: npm latest resolves to `healthcare-agents@1.4.0`, the GitHub `v1.4.0` release is available, and `node scripts/verify-public-release.js --network` verifies the public artifacts.
