---
holdout_id: qps-d01-holdout-01-cedar-wrong-site-surgery-rca
agent_slug: quality-patient-safety-officer
agents_relevant:
- quality-patient-safety-officer
deliverable_id: qps-d01
deliverable_title: Root Cause Analysis Report
seed_ref: quality-patient-safety-officer/qps-d01-seed-01-cedar-wrong-site-surgery-rca.yaml
scenario_summary: A wrong-side orthopedic surgery was intercepted at time-out after
  the consent packet and schedule board did not match.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'The Joint Commission sentinel event policy: https://www.jointcommission.org/resources/sentinel-event/'
- 'AHRQ Patient Safety Network: https://psnet.ahrq.gov/'
- 'The Joint Commission Universal Protocol: https://www.jointcommission.org/standards/'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when sentinel-event response, Universal Protocol, or
  safety reporting standards materially change
expectations:
- The RCA should describe the event, timeline, causal factors, root causes, and action
  plan in completed form.
- The action plan should include at least one strong or intermediate system redesign action
  and measurable follow-up.
- The report should read like a completed internal investigation rather than a template.
---

# Root Cause Analysis Report

**Event Date**: February 7, 2026 | **RCA Completion Date**: February 24, 2026  
**Event Type**: Sentinel Event / Near Miss  
**Severity Category**: NCC MERP Category A equivalent  
**Facility**: Cedar Valley Hospital | **Unit**: Orthopedics OR
**RCA Team Leader**: Marcus Hill, RN, CPPS

## Event Description
- The patient arrived for a left-knee arthroscopy, but the paper packet listed the right knee.
- The pre-op nurse caught the mismatch during the final verification step.
- The time-out stopped the case before incision and the consent was corrected on the spot.

## Timeline
| Time | Event | Staff Involved | System/Equipment |
|------|-------|---------------|------------------|
| 06:08 | Pre-op review started | Pre-op RN | EHR checklist |
| 06:31 | Laterality mismatch found | Pre-op RN | consent packet |
| 06:48 | Site mark applied | Surgeon | site-marking pen |
| 07:01 | Time-out halted case | Entire OR team | OR schedule board |

## Causal Factor Analysis
| Category | Contributing Factor | Evidence | Root Cause? |
|----------|-------------------|----------|-------------|
| Human Factors | Confirmation bias during pre-op review | Team assumed the packet was correct | Y |
| Process/Procedure | Consent and scheduling workflows were not synchronized | Side-specific mismatch persisted until time-out | Y |
| Equipment/Technology | No hard stop on laterality mismatch | EHR allowed check to pass | Y |
| Environment | Add-on cases increased pressure to start on time | Room turnover was delayed | N |
| Organization/Management | Compliance audits did not track site-marking reliability | No monthly trend data | N |

## Root Causes Identified
1. The pre-op workflow permitted side-specific mismatches to survive until the OR time-out.
2. The EHR did not force a laterality reconciliation before the case could proceed.

## Action Plan
| # | Root Cause | Action | Strength | Owner | Due Date | Measure of Effectiveness | Status |
|---|-----------|--------|----------|-------|----------|------------------------|--------|
| 1 | Workflow allowed mismatch | Add an EHR hard stop for laterality and consent mismatch | Strong | Surgical informatics lead | 2026-03-01 | Zero mismatched cases past time-out | Planned |
| 2 | No forced reconciliation | Require two-person laterality read-back on the pre-op checklist | Intermediate | OR nurse manager | 2026-02-28 | 100% checklist completion | Planned |
| 3 | No trend visibility | Add site-marking reliability to the monthly safety dashboard | Intermediate | Patient safety director | 2026-03-15 | 95% audit compliance | Planned |

## Follow-Up Schedule
| Review Date | Reviewer | Findings | Actions Needed |
|------------|---------|----------|---------------|
| 30-day | Safety committee | Build tested successfully | Move to live monitoring |
| 60-day | OR leadership | Checklist compliance strong | Sustain |
| 90-day | Board quality committee | No recurrence | Continue audit |

