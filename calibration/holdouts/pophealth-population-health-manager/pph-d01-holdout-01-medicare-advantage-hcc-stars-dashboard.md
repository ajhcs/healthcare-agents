---
holdout_id: pph-d01-holdout-01-medicare-advantage-hcc-stars-dashboard
agent_slug: pophealth-population-health-manager
agents_relevant:
- pophealth-population-health-manager
deliverable_id: pph-d01
deliverable_title: Population Health Dashboard Report
seed_ref: pophealth-population-health-manager/pph-d01-seed-01-medicare-advantage-hcc-stars-dashboard.yaml
scenario_summary: Quarterly Medicare Advantage dashboard for a synthetic regional
  plan balancing HCC accuracy, Stars performance, and utilization control.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Advantage risk adjustment resources at cms.gov/medicare/payment/medicare-advantage-rates-statistics/risk-adjustment
- CMS Star Ratings technical notes and resources at cms.gov/medicare/health-drug-plans/part-c-d-performance-data
- NCQA HEDIS measure information at ncqa.org/hedis/measures
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Produce a fully filled dashboard with internally consistent risk, quality, care
  gap, SDOH, utilization, and rising-risk sections.
- Reflect Medicare Advantage context by tying quality priorities to Stars and risk
  priorities to compliant current-year diagnosis capture.
- Show executive-level interpretation and near-term operational actions without turning
  the deliverable into a narrative memo.
- Distinguish rising-risk members from current high-risk members in a way that changes
  intervention assignment.
---

# Population Health Performance Report

**Organization**: Lattice Peak Medicare Advantage Plan
**Reporting Period**: Q2 2026
**Attributed Population**: 31,440 members
**Report Date**: 2026-04-09

## Population Risk Profile
| Risk Tier | Members | % of Pop | % of Cost | PMPM |
|-----------|---------|----------|-----------|------|
| Low Risk (RUB 0-1) | 12,874 | 41.0% | 12.8% | $268 |
| Moderate Risk (RUB 2-3) | 11,318 | 36.0% | 30.7% | $701 |
| High Risk (RUB 4-5) | 4,901 | 15.6% | 44.3% | $2,914 |
| Rising Risk (flagged) | 2,347 | 7.5% | 12.2% | $1,426 |
| **Total** | **31,440** | **100.1%** | **100.0%** | **$947** |

## Quality Performance Summary (HEDIS/Stars)
| Measure | Current Rate | 4-Star | 5-Star | Gap to Goal | Trend |
|---------|-------------|--------|--------|-------------|-------|
| BCS | 74.9% | 76.0% | 80.0% | 1.1 pp | ↑ |
| COL | 69.8% | 70.0% | 76.0% | 0.2 pp | ↑ |
| CDC HbA1c <8% | 78.1% | 80.0% | 85.0% | 1.9 pp | ↑ |
| CBP | 72.6% | 75.0% | 81.0% | 2.4 pp | → |
| AMM Acute | 71.5% | 72.0% | 78.0% | 0.5 pp | ↑ |
| FUA 7-day | 49.7% | 54.0% | 63.0% | 4.3 pp | ↓ |

## Care Gap Summary
| Category | Open Gaps | Members Affected | Outreach Attempted | Gaps Closed MTD |
|----------|-----------|-----------------|-------------------|----------------|
| Cancer Screening | 1,966 | 1,842 | 1,448 | 332 |
| Diabetes Care | 1,438 | 904 | 696 | 164 |
| Cardiovascular | 1,207 | 1,108 | 611 | 119 |
| Behavioral Health | 588 | 541 | 372 | 47 |
| Immunizations | 1,512 | 1,406 | 924 | 213 |

## SDOH Screening Metrics
| Metric | Value |
|--------|-------|
| Members screened this period | 6,288 |
| Screening rate (% of attributed) | 20.0% |
| Positive screens (any domain) | 1,924 |
| Referrals generated | 1,166 |
| Referral-to-connection rate | 61.4% |
| Closed-loop rate | 69.8% |

## Utilization Trends
| Metric | Current | Prior Period | Benchmark | Variance |
|--------|---------|-------------|-----------|----------|
| ED visits/1000 | 389 | 408 | 395 | -6 |
| IP admits/1000 | 109 | 114 | 112 | -3 |
| 30-day readmit rate | 14.9% | 15.8% | 15.5% | -0.6 pp |
| Avoidable ED rate | 19.7% | 21.3% | 20.0% | -0.3 pp |

## Rising Risk Cohort
| Trigger | New This Period | Total Active | Intervention Assigned |
|---------|---------------|-------------|---------------------|
| New chronic dx | 142 | 404 | 93% |
| Increasing ED use | 167 | 471 | 89% |
| Uncontrolled condition | 126 | 388 | 86% |
| SDOH trigger | 109 | 355 | 81% |
| Disengagement signal | 83 | 261 | 79% |

Leadership interpretation:
- COL and AMM are within immediate reach of threshold with targeted outreach and validated supplemental data capture.
- FUA remains the largest Stars drag because weekend ED discharges and out-of-network behavioral follow-up are not closing fast enough.
- Diagnosis governance needs tightening: suspected and historical conditions must be segregated from compliant current-year risk-adjusting diagnoses before provider recapture lists are refreshed.

Next-quarter operating actions:
- Rebuild RAF opportunity files using only current-year compliant encounter-supported diagnoses.
- Pair post-discharge AHC HRSN screening with behavioral health access navigation for members discharged from the ED.
- Push PCP point-of-care workflows for BCS, COL, and CBP at the six lowest-performing practices.
- Validate all numerator evidence against current measure specifications before publishing final rate movement.
