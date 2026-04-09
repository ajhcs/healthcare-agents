---
holdout_id: psc-d02-holdout-01-riverview-reportable-disease-audit
agent_slug: pophealth-surveillance-coordinator
agents_relevant:
- pophealth-surveillance-coordinator
deliverable_id: psc-d02
deliverable_title: Reportable Disease Compliance Audit
seed_ref: pophealth-surveillance-coordinator/psc-d02-seed-01-riverview-reportable-disease-audit.yaml
scenario_summary: A community hospital audit found multiple late reports because
  the weekend coverage workflow did not match the jurisdiction's immediate-notification
  requirements.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'CDC NNDSS: https://ndc.services.cdc.gov/'
- 'CMS 42 CFR 482.42: https://www.ecfr.gov/current/title-42/section-482.42'
- 'Joint Commission IC.01.05.01: https://www.jointcommission.org/standards/'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when disease-reporting obligations or reporting workflow
  standards materially change
expectations:
- The audit should quantify timeliness, completeness, and ELR success rates for the review
  period.
- The findings section should identify infrastructure, training, and escalation gaps with
  specific corrective actions.
- The completed report should read as a real audit, including a score or compliance summary.
---

# Reportable Disease Compliance Audit

**Facility**: Riverview Community Hospital  
**Audit Period**: February 1, 2026 - April 30, 2026  
**Audit Date**: May 3, 2026  
**Auditor**: J. Alvarez, MPH

## Reporting Infrastructure
- Current jurisdiction list was available, but the weekend copy was not formally version-controlled.
- The EHR alert fired correctly for positive cultures, but the manual backup process was not posted in the lab.
- The on-call infection preventionist knew the after-hours phone tree, but the respiratory unit did not have the same reference.
- ELR messages transmitted successfully, but the Monday review process delayed closure on several cases.

## Reporting Timeliness (Sample Review)
| Condition | Cases in Period | Reported on Time | Late Reports | Not Reported | Avg Time to Report |
|-----------|----------------|-----------------|-------------|-------------|-------------------|
| Measles exposure | 1 | 0 | 1 | 0 | 29 hours |
| Pertussis | 3 | 2 | 1 | 0 | 20 hours |
| Legionellosis | 2 | 1 | 1 | 0 | 24 hours |

## Compliance Metrics
- On-time reporting rate: 74%
- Complete reporting rate: 96%
- ELR transmission success rate: 98%

## Staff Training
- Infection preventionist training was current.
- Provider refresher training on immediate-report conditions had not been completed for 2026.
- Laboratory staff were trained on ELR procedures, but weekend drills were missing.

## Findings
| Finding | Severity | Root Cause | Corrective Action | Timeline |
|---------|----------|-----------|-------------------|----------|
| Weekend reporting copy lacked version control | Major | Ownership gap | Assign controlled document owner and weekly review | 14 days |
| After-hours phone tree not posted in lab and unit areas | Major | Communication gap | Post the tree and run a drill | 21 days |
| Monday review delayed closure of several cases | Minor | Coverage gap | Add on-call report verification | 7 days |

## Overall Compliance Score: 77/100

