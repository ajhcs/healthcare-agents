---
exemplar_id: qis-d03-example-01-medicare-advantage-stars-impact
agent_slug: quality-improvement-specialist
agents_relevant:
- quality-improvement-specialist
deliverable_id: qis-d03
deliverable_title: Star Ratings Impact Analysis
scenario_summary: A Medicare Advantage analysis identifies the measure mix most likely
  to move the plan from 3.5 to 4.0 stars and quantifies associated bonus risk.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Medicare Star Ratings overview: https://www.cms.gov/medicare/quality/star-ratings'
- 'CMS Care Compare and quality program resources: https://www.cms.gov/medicare/quality'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Star Ratings Impact Analysis

**Plan**: Larkspur Horizon MA-PD
**Product Line**: MA-PD
**Current Overall Star Rating**: 3.5
**Target Overall Star Rating**: 4.0
**Analysis Date**: 2026-04-09

## Current Measure-Level Performance
| Domain | Measure | Current Star | Cut Point for Next Star | Gap | Improvement Feasibility |
|--------|---------|-------------|----------------------|-----|----------------------|
| Staying Healthy | Breast Cancer Screening | 3 | 72.0% | +4.8 pts | Medium |
| Staying Healthy | Colorectal Cancer Screening | 3 | 67.5% | +5.1 pts | Medium |
| Managing Chronic Conditions | Kidney Health Evaluation for Patients with Diabetes | 4 | 69.0% | +2.4 pts | High |
| Managing Chronic Conditions | Statin Adherence | 3 | 88.0% | +2.9 pts | High |
| Managing Chronic Conditions | Diabetes Medication Adherence | 4 | 89.5% | +1.7 pts | High |
| Member Experience with the Plan | Rating of Health Plan | 3 | 88.0 points | +3.6 points | Medium |
| Member Experience with the Plan | Care Coordination | 3 | 85.5 points | +4.2 points | Medium |
| Member Complaints and Changes | Members Choosing to Leave the Plan | 2 | 10.5% disenrollment | -1.9 pts | Low |
| Health Plan Customer Service | Appeals Timeliness | 4 | 96.0% | +1.0 pt | High |

## High-Impact Measures (Triple-Weighted)
| Measure | Current Star | Weight | Impact of +1 Star on Overall |
|---------|-------------|--------|----------------------------|
| Rating of Health Plan | 3 | 3x | +0.08 to +0.10 overall stars depending on final measure mix |
| Care Coordination | 3 | 3x | +0.08 to +0.10 overall stars depending on CAHPS stability |
| Statin Adherence | 3 | 3x | +0.09 overall stars with current enrollment weighting |
| Diabetes Medication Adherence | 4 | 3x | +0.07 overall stars if lifted to 5 stars |

## Projected QBP Financial Impact
- Current QBP status: Not Receiving
- Projected QBP if target achieved: $18.6M benchmark bonus equivalent across the next payment year projection
- Revenue at risk if rating declines: $11.4M from rebate compression, weaker enrollment growth, and lower marketability

## Priority Improvement Actions
| Measure | Action | Expected Star Impact | Investment | ROI |
|---------|--------|---------------------|-----------|-----|
| Statin Adherence | Expand 90-day fill conversion, outbound refill navigation, and prescriber exception review | +1 star feasible within one cycle | $420,000 | High |
| Rating of Health Plan | Tighten call center abandon rate, shorten grievance resolution cycle, and refresh post-call recovery | +0.5 to +1 star | $510,000 | High |
| Care Coordination | Daily inpatient census outreach, PCP handoff script, and specialist referral closure workflow | +0.5 to +1 star | $460,000 | High |
| KED | Close lab data lag with contracted labs and add diabetic care gap prompts to annual wellness visit workflow | Protect 4 stars and create 5-star path | $190,000 | High |
| Breast Cancer Screening | Deploy mobile imaging events and broker transportation support in two low-performing counties | +0.5 star path | $280,000 | Medium |
| Appeals Timeliness | Add peak-volume staffing model and aging queue trigger at day 20 | Preserve 4 stars and create upside | $150,000 | Medium |

## Executive Interpretation
- The shortest route to 4.0 overall stars is improvement in one adherence measure and one CAHPS measure because both are triple-weighted.
- Statin Adherence is the cleanest operational target: current gap is narrow, pharmacy data is timely, and intervention levers are already tested in the duals segment.
- Rating of Health Plan and Care Coordination require service recovery discipline rather than a pure clinical campaign; both should be managed through a joint operations and member experience workstream.
- Disenrollment is materially weak but less movable in one cycle; treat it as a containment priority rather than the lead 4.0 strategy.
- If CMS releases updated cut points or methodology detail, recalculate the projection before external use because clustering and weighting can shift year to year.

## Assumptions
- Projection uses current internal enrollment weighting and a stable CAI effect.
- Measure-level lift assumes no offsetting decline in already strong medication adherence or appeals performance.
- Financial estimate is synthetic and intended for draft planning, not bid submission.
