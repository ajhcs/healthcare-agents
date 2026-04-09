---
exemplar_id: pph-d01-example-01-aco-q1-diabetes-equity-dashboard
agent_slug: pophealth-population-health-manager
agents_relevant:
- pophealth-population-health-manager
deliverable_id: pph-d01
deliverable_title: Population Health Dashboard Report
scenario_summary: Quarterly dashboard for a synthetic MSSP-aligned ACO highlighting
  diabetes, rising risk, and equity-sensitive SDOH performance.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Quality Payment Program measure and quality reporting resources at qpp.cms.gov
- CMS Medicare Advantage and risk adjustment resources at cms.gov/medicare/payment/medicare-advantage-rates-statistics/risk-adjustment
- AHRQ Prevention Quality Indicators overview at ahrq.gov/patient-safety/settings/hospital/resource/pqi.html
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Population Health Performance Report

**Organization**: North Orchard Accountable Care Network
**Reporting Period**: Q1 2026
**Attributed Population**: 48,260 members
**Report Date**: 2026-04-09

## Population Risk Profile
| Risk Tier | Members | % of Pop | % of Cost | PMPM |
|-----------|---------|----------|-----------|------|
| Low Risk (RUB 0-1) | 23,910 | 49.5% | 18.2% | $214 |
| Moderate Risk (RUB 2-3) | 16,420 | 34.0% | 36.4% | $612 |
| High Risk (RUB 4-5) | 5,380 | 11.1% | 37.9% | $2,486 |
| Rising Risk (flagged) | 2,550 | 5.3% | 7.5% | $1,184 |
| **Total** | **48,260** | **100.0%** | **100.0%** | **$711** |

## Quality Performance Summary (HEDIS/Stars)
| Measure | Current Rate | 4-Star | 5-Star | Gap to Goal | Trend |
|---------|-------------|--------|--------|-------------|-------|
| BCS | 75.2% | 76.0% | 80.0% | 0.8 pp | ↑ |
| COL | 68.6% | 70.0% | 76.0% | 1.4 pp | ↑ |
| CDC HbA1c <8% | 77.4% | 80.0% | 85.0% | 2.6 pp | ↑ |
| CBP | 71.8% | 75.0% | 81.0% | 3.2 pp | → |
| AMM Acute | 69.1% | 72.0% | 78.0% | 2.9 pp | ↑ |
| FUA 7-day | 46.3% | 54.0% | 63.0% | 7.7 pp | ↓ |

## Care Gap Summary
| Category | Open Gaps | Members Affected | Outreach Attempted | Gaps Closed MTD |
|----------|-----------|-----------------|-------------------|----------------|
| Cancer Screening | 3,482 | 3,211 | 2,904 | 624 |
| Diabetes Care | 2,918 | 1,744 | 1,266 | 312 |
| Cardiovascular | 2,167 | 1,995 | 1,082 | 205 |
| Behavioral Health | 1,104 | 988 | 742 | 96 |
| Immunizations | 4,036 | 3,708 | 2,122 | 451 |

## SDOH Screening Metrics
| Metric | Value |
|--------|-------|
| Members screened this period | 9,864 |
| Screening rate (% of attributed) | 20.4% |
| Positive screens (any domain) | 3,126 |
| Referrals generated | 1,944 |
| Referral-to-connection rate | 62.8% |
| Closed-loop rate | 71.2% |

## Utilization Trends
| Metric | Current | Prior Period | Benchmark | Variance |
|--------|---------|-------------|-----------|----------|
| ED visits/1000 | 432 | 458 | 440 | -8 |
| IP admits/1000 | 76 | 81 | 79 | -3 |
| 30-day readmit rate | 14.8% | 15.6% | 15.5% | -0.7 pp |
| Avoidable ED rate | 21.9% | 24.2% | 22.5% | -0.6 pp |

## Rising Risk Cohort
| Trigger | New This Period | Total Active | Intervention Assigned |
|---------|---------------|-------------|---------------------|
| New chronic dx | 286 | 614 | 92% |
| Increasing ED use | 198 | 541 | 88% |
| Uncontrolled condition | 221 | 593 | 84% |
| SDOH trigger | 173 | 486 | 79% |
| Disengagement signal | 147 | 316 | 76% |

Population-level readout: total cost trend remains favorable, but quality yield is increasingly concentrated in three primary care pods and one behavioral health access bottleneck. The highest near-term financial opportunity is CDC and FUA performance because both measures are below the 4-Star threshold and overlap with members already in complex care management.

Operational interpretation:
- Diabetes gaps are clustered in Harbor East, Juniper Square, and Mesa Creek practices, where HbA1c lab completion lag exceeds 11 percentage points versus network median.
- FUA decline reflects a 30-day behavioral health scheduling backlog and incomplete ADT-driven ED follow-up alerts on weekend discharges.
- Rising-risk members with both food insecurity and worsening diabetes account for 14.6% of the flagged cohort but 28.1% of projected avoidable admit exposure.

Recommended next actions for Q2:
- Stand up a pharmacist-led diabetes closure sprint for 1,050 members with open HbA1c and nephropathy gaps.
- Add next-business-day behavioral health scheduling block for ED discharges tied to FUA and FUM.
- Expand PRAPARE-to-community-referral workflow in the two clinics with the highest housing instability prevalence.
- If current regulatory policy capability is available, verify 2026 CMS and contract-year quality updates before locking final 4-Star and reporting assumptions.

Quadruple Aim impact:
- Better outcomes through earlier diabetes and hypertension control.
- Better experience through reduced outreach duplication and faster behavioral health follow-up.
- Lower cost through avoidable ED and readmission reduction.
- Provider well-being through cleaner registries and narrower action queues.
