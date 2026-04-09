---
exemplar_id: psc-d02-example-01-riverview-reportable-disease-audit
agent_slug: pophealth-surveillance-coordinator
agents_relevant:
- pophealth-surveillance-coordinator
deliverable_id: psc-d02
deliverable_title: Reportable Disease Compliance Audit
scenario_summary: A community hospital audit found late reporting for measles,
  legionellosis, and pertussis due to weak weekend coverage and delayed ELR review.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'CDC NNDSS: https://ndc.services.cdc.gov/'
- 'CMS 42 CFR 482.42: https://www.ecfr.gov/current/title-42/section-482.42'
- 'Joint Commission infection control reporting standard IC.01.05.01: https://www.jointcommission.org/standards/'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Reportable Disease Compliance Audit

**Facility**: Riverview Community Hospital  
**Audit Period**: January 1, 2026 - March 31, 2026  
**Audit Date**: April 4, 2026  
**Auditor**: J. Alvarez, MPH

## Reporting Infrastructure
- Current jurisdiction reportable conditions list was on file, but the weekend version was two revisions old.
- The EHR alert fired for positive cultures, but no backup manual process was documented for after-hours results.
- The lab reported ELR message transmission success, but the charge nurse did not review delayed messages until Monday morning.
- A designated reportable disease contact existed, but the after-hours escalation tree was not posted in the lab area.

## Reporting Timeliness (Sample Review)
| Condition | Cases in Period | Reported on Time | Late Reports | Not Reported | Avg Time to Report |
|-----------|----------------|-----------------|-------------|-------------|-------------------|
| Measles exposure | 1 | 0 | 1 | 0 | 31 hours |
| Pertussis | 4 | 3 | 1 | 0 | 18 hours |
| Legionellosis | 2 | 1 | 1 | 0 | 22 hours |

## Compliance Metrics
- On-time reporting rate: 72% (target: >95%)
- Complete reporting rate: 94%
- ELR transmission success rate: 99%

## Staff Training
- Infection preventionist was trained on the current reportable conditions list.
- Providers had not completed a 2026 refresher on immediate-notification conditions.
- Laboratory staff were trained on ELR procedures, but weekend staffing was not included in the drill.

## Findings
| Finding | Severity | Root Cause | Corrective Action | Timeline |
|---------|----------|-----------|-------------------|----------|
| Weekend reporting list was stale | Major | Version control gap | Replace with controlled copy and weekly review | 14 days |
| After-hours escalation tree was missing | Major | Operational ownership gap | Post the tree and drill it monthly | 21 days |
| Monday review delayed report closure | Minor | Role clarity issue | Assign coverage to on-call infection prevention | 7 days |

## Overall Compliance Score: 76/100

