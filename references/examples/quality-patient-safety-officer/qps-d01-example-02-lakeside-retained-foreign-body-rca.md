---
exemplar_id: qps-d01-example-02-lakeside-retained-foreign-body-rca
agent_slug: quality-patient-safety-officer
agents_relevant:
- quality-patient-safety-officer
deliverable_id: qps-d01
deliverable_title: Root Cause Analysis Report
scenario_summary: A retained sponge was discovered after laparoscopic surgery,
  prompting a review of count reliability and room turnover pressures.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'The Joint Commission sentinel event policy: https://www.jointcommission.org/resources/sentinel-event/'
- 'AHRQ Patient Safety Network: https://psnet.ahrq.gov/'
- 'The Joint Commission Universal Protocol: https://www.jointcommission.org/standards/'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Root Cause Analysis Report

**Event Date**: January 16, 2026 | **RCA Completion Date**: February 2, 2026  
**Event Type**: Sentinel Event  
**Severity Category**: NCC MERP Category E equivalent  
**Facility**: Lakeside Surgery Center | **Unit**: Main OR
**RCA Team Leader**: Erin Walsh, RN, CPPS

## Event Description
- A sponge count discrepancy was documented at closure, but the team accepted a verbal assurance that the missing sponge had been discarded.
- Post-op imaging identified a retained sponge in the abdomen, and the patient returned to the OR for removal.
- The count sheet had been updated after the case without a contemporaneous witness signature.

## Timeline
| Time | Event | Staff Involved | System/Equipment |
|------|-------|---------------|------------------|
| 12:05 | Initial count completed | Scrub tech, RN | count sheet |
| 13:11 | Sponge discrepancy noted | Circulating RN | whiteboard |
| 13:18 | Case closed after verbal assurance | Surgeon, OR team | closure checklist |
| 18:30 | Imaging confirmed retained sponge | Radiology | PACS |

## Causal Factor Analysis
| Category | Contributing Factor | Evidence | Root Cause? |
|----------|-------------------|----------|-------------|
| Human Factors | Assumption that the sponge was in the trash | No visual confirmation was obtained | Y |
| Process/Procedure | Count reconciliation lacked a forced stop | Closure proceeded despite unresolved discrepancy | Y |
| Equipment/Technology | Count sheet was updated after closure | Time-stamp showed retrospective edit | Y |
| Environment | Room turnover pressure created rushing | Second room was waiting | N |
| Organization/Management | No audit of unresolved count discrepancies | Trends were not visible to leadership | N |

## Root Causes Identified
1. The OR count process allowed closure without a verified resolution of a discrepancy.
2. The documentation workflow allowed retrospective count edits without an immediate control.

## Action Plan
| # | Root Cause | Action | Strength | Owner | Due Date | Measure of Effectiveness | Status |
|---|-----------|--------|----------|-------|----------|------------------------|--------|
| 1 | Closure without verified count resolution | Add hard stop in closing checklist until count is reconciled | Strong | OR nurse manager | 2026-02-15 | Zero closures with unresolved count discrepancy | Implemented |
| 2 | Retrospective edits allowed | Lock count documentation after closure and require witness signoff | Strong | Surgical informatics lead | 2026-02-20 | No post-closure count edits | Planned |
| 3 | Leadership had no trend visibility | Review count discrepancies monthly at safety committee | Intermediate | Safety director | 2026-03-01 | 100% discrepancy review completion | Planned |

## Follow-Up Schedule
| Review Date | Reviewer | Findings | Actions Needed |
|------------|---------|----------|---------------|
| 30-day | OR leadership | Hard stop in place | Validate in live cases |
| 60-day | Quality committee | No repeat discrepancy | Continue audits |
| 90-day | Board quality committee | Sustained compliance | Maintain controls |

