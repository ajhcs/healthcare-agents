#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { loadWorkflows } = require('../lib/workflows');
const { getWorkflowProfile } = require('../lib/operator-os/workflow-profiles');

function readOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) return undefined;
  return value;
}

function slug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function titleCase(value) {
  return String(value || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function ownerForCategory(category, profile) {
  const text = category.toLowerCase();
  if (/privacy|security/.test(text)) return profile.human_review_owners.find(owner => /privacy|security|compliance/i.test(owner)) || 'Compliance or Privacy Officer';
  if (/contract|payer|appeal|dispute/.test(text)) return profile.human_review_owners.find(owner => /contract|payer|appeal|authorization/i.test(owner)) || profile.human_review_owners[0];
  if (/coding|clinical|medical|cdi/.test(text)) return profile.human_review_owners.find(owner => /clinical|coding|cdi/i.test(owner)) || profile.human_review_owners[0];
  if (/change|system|interface|lineage|data|validation/.test(text)) return profile.human_review_owners.find(owner => /data|interface|application|change|analyst|validation/i.test(owner)) || profile.human_review_owners[0];
  if (/governance|escalation|owner/.test(text)) return profile.human_review_owners[0];
  return profile.human_review_owners[0];
}

function sourceFamilyForCategory(category, workflow, profile, index) {
  const text = category.toLowerCase();
  const evidence = profile.required_evidence_families[index % profile.required_evidence_families.length];
  if (/local_policy|local_abstraction_policy/.test(text)) return evidence + '; local policy, evidence binder, and accountable owner lookup';
  if (/regulatory|cms|state/.test(text)) return evidence + '; regulator or program source-family lookup';
  if (/accreditation|standard/.test(text)) return evidence + '; current standard-set lookup';
  if (/contract|payer_policy|pbm_policy/.test(text)) return evidence + '; payer, contract, provider-manual, or plan-policy lookup';
  if (/clearinghouse|transaction|835|837|interface|system|logs/.test(text)) return evidence + '; local transaction or system log evidence';
  if (/data|metric|lineage|validation|telemetry/.test(text)) return evidence + '; governed data dictionary, source-of-truth, or validation record';
  if (/privacy|security|compliance/.test(text)) return evidence + '; local privacy/security/compliance policy and owner review';
  if (/change/.test(text)) return evidence + '; approved change ticket, production approval, rollback owner, and validation evidence';
  return evidence + '; local ' + workflow.name + ' source-family lookup';
}

function isLocalGovernanceCategory(category) {
  return /governance|compliance|privacy|security|local_policy|local_abstraction_policy/.test(category.toLowerCase());
}

function verificationStatusForCategory(category) {
  const text = category.toLowerCase();
  if (/governance|compliance|privacy|security|local_policy|local_abstraction_policy|contract|payer_policy|pbm_policy/.test(text)) {
    return 'local-policy-required';
  }
  return 'source-family-not-pinpoint';
}

function buildCards(workflow, profile) {
  return profile.source_categories.map((category, index) => {
    const coverage = profile.minimum_citation_card_coverage[index % profile.minimum_citation_card_coverage.length];
    const owner = ownerForCategory(category, profile);
    const section = workflow.artifact_sections[index % workflow.artifact_sections.length];
    const evidence = profile.required_evidence_families[index % profile.required_evidence_families.length];
    const sourceFamily = sourceFamilyForCategory(category, workflow, profile, index);
    const requiredFields = [...new Set([
      ...workflow.required_inputs,
      coverage,
      category.includes('change') ? 'approved change ticket/status' : null,
      category.includes('change') ? 'rollback owner and validation evidence' : null,
      category.includes('lineage') || category.includes('data_dictionary') ? 'source table/view or system of record' : null,
      category.includes('validation') ? 'validation owner and sign-off record' : null,
      category.includes('telemetry') ? 'denominator grain, exclusions, time window, and refresh timestamp' : null,
      category.includes('measure') ? 'measurement year, product line, collection method, and spec version' : null,
      category.includes('tracer') || category.includes('accreditation') ? 'standard set, tracer method, and prior finding reference' : null,
      category.includes('event') || category.includes('rca2') ? 'de-identified event timeline and protected review boundary' : null
    ].filter(Boolean))];
    return {
      id: slug(category + '-' + coverage),
      title: titleCase(category) + ' - ' + coverage,
      source_category: category,
      source_family: sourceFamily,
      authority_level: isLocalGovernanceCategory(category) ? 'local-governance' : 'source-family',
      citation_text: 'Use locally approved ' + evidence + ' for ' + workflow.name + '. This scaffold names the source family and lookup path; it is not a pinpoint citation.',
      last_verified: '2026-05-31',
      effective_date: 'local-policy-required',
      offline_locator: 'Local evidence binder or governed repository for ' + workflow.id + ' / ' + category,
      required_fields: requiredFields,
      applies_to_sections: [section],
      human_owner: owner,
      verification_status: verificationStatusForCategory(category),
      red_flags: [
        profile.common_failure_modes[index % profile.common_failure_modes.length],
        'Do not use this card as autonomous authority without human review.'
      ]
    };
  });
}

function buildEvidencePack(workflow) {
  const profile = getWorkflowProfile(workflow);
  return {
    schema_version: 'operator-os.evidence-packs.v1',
    packs: [
      {
        id: workflow.id + '-operator-os-v1',
        workflow_id: workflow.id,
        exemplar: false,
        version: '1.0.0',
        status: 'active',
        title: 'Operator OS ' + workflow.name + ' Evidence Pack',
        last_reviewed: '2026-05-31',
        offline_first: true,
        phi_policy: profile.phi_compliance_notes,
        source_categories: profile.source_categories,
        citation_cards: buildCards(workflow, profile),
        required_evidence: profile.required_evidence_families,
        failure_modes: profile.common_failure_modes,
        test_prompts: (workflow.canary_tests || workflow.examples || []).map(item => item.input).slice(0, 3)
      }
    ]
  };
}

function main() {
  const args = process.argv.slice(2);
  const workflowId = readOption(args, '--workflow') || args[0];
  if (!workflowId) {
    console.error('error: scaffold requires --workflow <workflow-id>');
    process.exit(2);
  }
  const workflow = loadWorkflows().find(item => item.id === workflowId);
  if (!workflow) {
    console.error('error: unknown workflow: ' + workflowId);
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(buildEvidencePack(workflow), null, 2) + '\n');
}

if (require.main === module) main();

module.exports = {
  buildEvidencePack
};
