---
holdout_id: hea-d02-holdout-01-pa-fhir-quarterly-update-holdout
agent_slug: healthit-epic-applications-analyst
agents_relevant:
- healthit-epic-applications-analyst
deliverable_id: hea-d02
deliverable_title: Upgrade Impact Assessment
seed_ref: healthit-epic-applications-analyst/hea-d02-seed-01-pa-fhir-quarterly-update-holdout.yaml
scenario_summary: Assesses a quarterly update that intersects payer-facing prior authorization
  exchange, portal release controls, and reporting traceability.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Interoperability and Prior Authorization Final Rule fact sheet: https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f'
- 'CMS Prior Authorization API FAQ: https://www.cms.gov/priorities/burden-reduction/overview/interoperability/frequently-asked-questions/prior-authorization-api'
- 'ONC information blocking resources: https://www.healthit.gov/topic/information-blocking'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Tie interface risks to specific FHIR or X12 workflows rather than describing interoperability
  generically.
- Call out auditability of prior authorization requests, attachments, status changes,
  and denial reasons.
- Include a testing timeline that separates interface regression from Caboodle validation.
- Address whether any release-of-information or portal rules require compliance review
  under 45 CFR Part 171.
---

# Epic Upgrade Impact Assessment

**Current Version**: February 2026
**Target Version**: QU3 2026
**Assessment Date**: 2026-04-09
**Lead Analyst**: Selah Norwick

## Breaking Changes
| Nova Article | Module | Description | Custom Build Affected | Remediation Plan |
|-------------|--------|-------------|----------------------|-----------------|
| QU3 review packet item A | Referrals / Interoperability | Prior authorization transaction handling changes require reassessment of payer-facing request and response persistence | Yes — custom denial and attachment logic | Preserve request, attachment, status, and denial artifacts through end-to-end regression and adjust mapping where source detail is truncated |
| QU3 review packet item B | MyChart | Updated status display framework changes how prior authorization progress can be surfaced to patients | Yes — custom patient-facing status text | Review patient-facing language with compliance and replace unsupported blanket suppression rules |
| QU3 review packet item C | Cogito / Caboodle | Reporting feed for authorization events uses revised staging sequence | Yes — denial analytics mart and turnaround dashboard | Rebaseline ETL timing, validate field lineage, and compare to source transaction audit extracts |

## New Features for Adoption
| Feature | Module | Clinical Value | Build Effort | Adopt? |
|---------|--------|---------------|-------------|--------|
| Expanded electronic status updates for payer responses | Interoperability | Improves transparency for clinical staff and referral coordinators | 5 days | Yes |
| Revised patient-facing status framework in portal | MyChart | Gives patients clearer visibility into pending and approved requests | 3 days | Review |
| Standard authorization audit content for analytics | Cogito | Reduces manual reconciliation effort after denials and appeals | 4 days | Yes |
| Optional retirement path for older transaction mapping logic | Bridges / X12 | Simplifies long-term maintenance if payer network is ready | 6 days | Defer |

## INI Changes Required
| INI | Current Value | New Default | Action Required |
|-----|-------------|-------------|-----------------|
| INI AUTH 044 | Custom status text enabled for portal display | Revised default status framework available | Review with compliance before retaining override |
| INI FHIR 173 | Existing payload retention window below requested audit target | Expanded retention controls available | Review and increase if policy supports broader retention |
| INI COG 052 | Current analytics staging assumes prior event order | New event sequence for authorization feed | Override during transition and reassess after first stable cycle |

## Interface Impact
| Interface | Type | Change Required | Risk Level |
|-----------|------|-----------------|------------|
| PayerAuth FHIR Exchange | FHIR | Validate request submission, attachment persistence, status polling, and denial-reason capture | High |
| Cardiology Imaging Auth Vendor | X12 | Confirm 278 fallback transactions still align to updated routing rules | High |
| MyChart Authorization Status Feed | FHIR | Retest patient-visible status mapping and release timing logic | High |
| Denial Analytics Mart Load | HL7v2 | Validate source-to-Caboodle event completeness for authorization milestones | Medium |

## Testing Timeline
| Phase | Start | End | Responsible Team |
|-------|-------|-----|-----------------|
| POC build reconciliation | 2026-05-11 | 2026-05-22 | Epic referrals and interoperability analysts |
| MST clinical validation | 2026-05-26 | 2026-06-12 | Referral coordinators, utilization management, cardiology operations |
| Interface regression testing | 2026-06-01 | 2026-06-19 | Bridges, payer integration, and vendor liaison team |
| Caboodle ETL validation | 2026-06-15 | 2026-06-26 | Cogito data engineering and denial analytics team |
| Go-live | 2026-07-12 | 2026-07-13 | Enterprise change management, application leads, command center |

## Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Denial rationale retained in source workflow but lost in downstream analytics mart | Med | High | Compare source event audit extracts to Caboodle mart rows for approval, pended, denied, and appealed cases |
| Portal status wording delays or obscures lawful access to authorization-related EHI | Med | High | Route revised language through compliance review and map every restriction to documented policy basis |
| Attachment routing works for initial submission but fails on resubmission after payer pend | High | High | Add regression scripts covering initial, pended, denied, and resubmitted transactions with attachment history checks |
| Dual-stack FHIR and 278 workflow introduces conflicting status ownership across teams | Med | Med | Define source-of-truth transaction path per payer and publish operational escalation rules |
| Go-live support team cannot distinguish build defect from payer endpoint outage | Med | Med | Create command-center runbook with interface-monitoring thresholds and escalation contacts |
