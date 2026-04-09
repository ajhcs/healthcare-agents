---
exemplar_id: qps-d01-example-01-cedar-wrong-site-surgery-rca
agent_slug: quality-patient-safety-officer
agents_relevant:
- quality-patient-safety-officer
deliverable_id: qps-d01
deliverable_title: Root Cause Analysis Report
scenario_summary: A wrong-site orthopedic procedure was intercepted in the room
  during the time-out, exposing gaps in site marking and verification.
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

**Event Date**: February 7, 2026 | **RCA Completion Date**: February 24, 2026  
**Event Type**: Sentinel Event / Near Miss  
**Severity Category**: NCC MERP Category A equivalent  
**Facility**: Cedar Valley Hospital | **Unit**: Orthopedics OR
**RCA Team Leader**: Marcus Hill, RN, CPPS

## Event Description
- The patient was prepared for a left-knee arthroscopy, but the consent and schedule packet listed the right knee.
- The surgical site mark was placed correctly on the left knee after a pre-op nurse escalated the discrepancy.
- The room time-out identified the mismatch before incision, and the case was paused until the consent was corrected.

## Timeline
| Time | Event | Staff Involved | System/Equipment |
|------|-------|---------------|------------------|
| 06:15 | Pre-op verification began | Pre-op RN | EHR checklist |
| 06:42 | Consent mismatch identified | Pre-op RN, surgeon | paper consent packet |
| 06:58 | Site marked on left knee | Surgeon | site-marking pen |
| 07:10 | Time-out halted case | OR team | OR schedule board |

## Causal Factor Analysis
| Category | Contributing Factor | Evidence | Root Cause? |
|----------|-------------------|----------|-------------|
| Human Factors | Confirmation bias during pre-op review | Staff assumed schedule packet was correct | Y |
| Process/Procedure | Consent and scheduling workflow were not synchronized | Paper consent listed the opposite side | Y |
| Equipment/Technology | EHR alert did not require side-specific reconciliation | No forced mismatch stop | Y |
| Environment | Pre-op turnover pressure shortened verification time | Two add-on cases arrived late | N |
| Organization/Management | Site-marking audit was not tracked on monthly scorecard | No leader visibility | N |

## Root Causes Identified
1. The pre-op verification workflow allowed side-specific mismatches to persist into the OR.
2. The scheduling and consent processes were not linked to a hard stop for wrong-side risk.

## Action Plan
| # | Root Cause | Action | Strength | Owner | Due Date | Measure of Effectiveness | Status |
|---|-----------|--------|----------|-------|----------|------------------------|--------|
| 1 | Verification workflow allowed mismatch | Add EHR hard stop requiring side-specific consent match | Strong | Surgical informatics lead | 2026-03-01 | Zero cases proceed past time-out with mismatch | Planned |
| 2 | Scheduling and consent not linked | Rebuild pre-op checklist to require two identifiers and laterality read-back | Intermediate | OR nurse manager | 2026-02-28 | 100% checklist completion | Planned |
| 3 | Leader visibility was weak | Put site-marking compliance on the monthly safety dashboard | Intermediate | Patient safety director | 2026-03-15 | 95% audit compliance | Planned |

## Follow-Up Schedule
| Review Date | Reviewer | Findings | Actions Needed |
|------------|---------|----------|---------------|
| 30-day | Safety committee | Hard stop in build test | Release after UAT |
| 60-day | OR leadership | Audit compliance stable | Continue monitoring |
| 90-day | Board quality committee | No near misses recurred | Sustain controls |

