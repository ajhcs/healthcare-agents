---
exemplar_id: qas-d02-example-01-ncqa-health-plan-cap
agent_slug: quality-accreditation-specialist
agents_relevant:
- quality-accreditation-specialist
deliverable_id: qas-d02
deliverable_title: Corrective Action Plan (Post-Survey)
scenario_summary: A synthetic Medicaid health plan drafts a post-survey corrective
  action plan after an NCQA finding on utilization management timeliness.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'NCQA Health Plan Accreditation overview: https://www.ncqa.org/programs/health-plans/health-plan-accreditation-hpa/'
- '42 CFR Part 438 Medicaid managed care requirements: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-C/part-438'
- 'CMS Managed Care regulations and guidance portal: https://www.medicaid.gov/medicaid/managed-care/index.html'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Corrective Action Plan

**Organization**: Harbor Pine Health Plan
**Survey Date**: 2026-03-11
**Accrediting Body**: NCQA
**Finding Reference**: UM 5, Timeliness of UM Decisions
**Submission Deadline**: 2026-04-25

## Finding
**Standard**: UM 5, Timeliness of UM Decisions
**Element of Performance**: Timely notification of standard pre-service decisions
**Surveyor Finding**: Review of a synthetic file sample found 6 of 30 standard pre-service authorization cases with written notification issued after the plan's required decision timeframe.
**Risk Level**: Moderate

## Root Cause Analysis
| Contributing Factor | Evidence |
|--------------------|----------|
| Queue design routed escalated cases back to general inventory without priority aging rules | Workflow map from 2026-03-18 showed manual reassignment and no automated countdown trigger |
| Weekend coverage model left Monday backlog unmanaged for non-urgent determinations | Staffing schedule review and case aging report showed volume spikes every Monday |
| Denial letter generation required manual data entry into a separate correspondence platform | Time study on 12 synthetic cases showed a median 19-minute delay between decision entry and notice creation |
| Supervisor dashboard measured closure volume but not notices sent within required timeframe | Operations dashboard screenshot dated 2026-03-20 lacked timeliness-at-notice metric |

## Corrective Actions
| # | Action | Addresses | Owner | Start Date | Completion Date | Evidence of Completion |
|---|--------|-----------|-------|-----------|----------------|---------------------|
| 1 | Build priority routing rule so any standard pre-service case at day 10 auto-escalates to senior UM queue | Queue design weakness | Director of Utilization Management | 2026-03-22 | 2026-04-05 | Updated workflow specification, system configuration record, and test cases |
| 2 | Add weekend shared coverage for notice generation and Monday morning backlog huddle | Weekend coverage gap | UM Operations Manager | 2026-03-24 | 2026-04-07 | Revised staffing schedule, huddle agenda, and first three weeks of attendance logs |
| 3 | Integrate decision data feed from UM platform into correspondence system to remove duplicate entry | Manual notice preparation delay | IT Applications Manager | 2026-03-25 | 2026-04-16 | Interface validation results and before/after processing time comparison |
| 4 | Add daily metric for decision timeliness and notice timeliness to supervisor dashboard with red-threshold alert at 95 percent | Missing operational visibility | Senior Manager, Health Services Analytics | 2026-03-26 | 2026-04-10 | Dashboard publication notice, metric definition sheet, and screenshot of live alerting |
| 5 | Re-educate UM nurses, coordinators, and physician reviewers on decision clock start points and notice deadlines using live case examples | Inconsistent execution | Accreditation Program Lead | 2026-03-28 | 2026-04-12 | Training roster, post-test results, and competency attestations |

## Monitoring Plan
| Measure | Frequency | Responsible | Reporting To | Duration |
|---------|-----------|------------|-------------|----------|
| Percent of standard pre-service determinations with notice sent within required timeframe | Weekly for 12 weeks, then monthly | UM Operations Manager | Quality Management Committee | Minimum 12 months |
| Volume of cases auto-escalated at day 10 and resolved before deadline | Weekly | Director of Utilization Management | Health Services Leadership Council | Minimum 12 months |
| Median elapsed time from determination entry to notice release | Monthly | Senior Manager, Health Services Analytics | Compliance Committee | Minimum 12 months |
| Monday backlog count for standard pre-service inventory | Weekly | UM Supervisor Team | VP, Clinical Operations | Minimum 12 months |

## Sustainment
| Practice Change | Hardwired Into | Audit Mechanism |
|----------------|---------------|----------------|
| Auto-escalation for aging pre-service cases | Technology | Weekly case-aging exception report reviewed by UM leadership |
| Weekend and Monday backlog coverage model | Standard Work | Monthly staffing variance review and overtime analysis |
| Integrated decision-to-notice data transfer | Technology | Interface error log review and quarterly control validation |
| Timeliness metrics reviewed at operations huddle and committee level | Policy | Standing dashboard review with documented follow-up actions |
| Timeliness competency included in annual UM staff validation | Training | Annual competency audit and targeted remediation tracking |

**Effectiveness target**: Harbor Pine Health Plan will achieve and maintain at least 98 percent timely written notification performance for standard pre-service determinations for three consecutive months before downgrading the issue from active corrective action monitoring.

**Regulatory note**: Before final submission, compliance leadership should confirm whether current Medicaid managed care notice timing expectations or related CMS guidance changed after the 2025 policy set used in the operational desk procedures.
