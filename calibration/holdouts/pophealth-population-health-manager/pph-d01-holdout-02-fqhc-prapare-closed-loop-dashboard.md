---
holdout_id: pph-d01-holdout-02-fqhc-prapare-closed-loop-dashboard
agent_slug: pophealth-population-health-manager
agents_relevant:
- pophealth-population-health-manager
deliverable_id: pph-d01
deliverable_title: Population Health Dashboard Report
seed_ref: pophealth-population-health-manager/pph-d01-seed-02-fqhc-prapare-closed-loop-dashboard.yaml
scenario_summary: Operational dashboard for a synthetic FQHC consortium tracking PRAPARE
  deployment, chronic disease burden, and referral-loop performance.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- PRAPARE implementation resources at prapare.org
- National Association of Community Health Centers resources at nachc.org
- CMS Accountable Health Communities Model resources at innovation.cms.gov/innovation-models/ahcm
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Show a credible FQHC-oriented population profile with strong SDOH screening volume
  and realistic chronic disease management pressure.
- Keep the dashboard concise and operational, not academic.
- Make the closed-loop referral metrics and rising-risk cohort materially useful to
  site leaders.
- Preserve synthetic names, numbers, and organizations throughout.
---

# Population Health Performance Report

**Organization**: Maple Vale Community Health Alliance
**Reporting Period**: April 2026
**Attributed Population**: 18,920 members
**Report Date**: 2026-04-09

## Population Risk Profile
| Risk Tier | Members | % of Pop | % of Cost | PMPM |
|-----------|---------|----------|-----------|------|
| Low Risk (RUB 0-1) | 9,866 | 52.1% | 24.0% | $176 |
| Moderate Risk (RUB 2-3) | 5,792 | 30.6% | 34.6% | $468 |
| High Risk (RUB 4-5) | 1,925 | 10.2% | 31.8% | $1,714 |
| Rising Risk (flagged) | 1,337 | 7.1% | 9.6% | $838 |
| **Total** | **18,920** | **100.0%** | **100.0%** | **$431** |

## Quality Performance Summary (HEDIS/Stars)
| Measure | Current Rate | 4-Star | 5-Star | Gap to Goal | Trend |
|---------|-------------|--------|--------|-------------|-------|
| BCS | 69.1% | 76.0% | 80.0% | 6.9 pp | ↑ |
| COL | 62.7% | 70.0% | 76.0% | 7.3 pp | ↑ |
| CDC HbA1c <8% | 73.5% | 80.0% | 85.0% | 6.5 pp | → |
| CBP | 72.8% | 75.0% | 81.0% | 2.2 pp | ↑ |
| AMM Acute | 64.4% | 72.0% | 78.0% | 7.6 pp | → |
| FUA 7-day | 50.6% | 54.0% | 63.0% | 3.4 pp | ↑ |

## Care Gap Summary
| Category | Open Gaps | Members Affected | Outreach Attempted | Gaps Closed MTD |
|----------|-----------|-----------------|-------------------|----------------|
| Cancer Screening | 1,744 | 1,621 | 812 | 128 |
| Diabetes Care | 1,218 | 748 | 496 | 91 |
| Cardiovascular | 836 | 779 | 402 | 67 |
| Behavioral Health | 524 | 487 | 291 | 39 |
| Immunizations | 1,980 | 1,761 | 924 | 173 |

## SDOH Screening Metrics
| Metric | Value |
|--------|-------|
| Members screened this period | 3,281 |
| Screening rate (% of attributed) | 17.3% |
| Positive screens (any domain) | 1,587 |
| Referrals generated | 1,044 |
| Referral-to-connection rate | 56.8% |
| Closed-loop rate | 64.2% |

## Utilization Trends
| Metric | Current | Prior Period | Benchmark | Variance |
|--------|---------|-------------|-----------|----------|
| ED visits/1000 | 538 | 549 | 545 | -7 |
| IP admits/1000 | 97 | 101 | 100 | -3 |
| 30-day readmit rate | 15.1% | 15.7% | 15.5% | -0.4 pp |
| Avoidable ED rate | 25.3% | 26.2% | 25.5% | -0.2 pp |

## Rising Risk Cohort
| Trigger | New This Period | Total Active | Intervention Assigned |
|---------|---------------|-------------|---------------------|
| New chronic dx | 63 | 214 | 94% |
| Increasing ED use | 71 | 248 | 88% |
| Uncontrolled condition | 69 | 233 | 85% |
| SDOH trigger | 112 | 376 | 81% |
| Disengagement signal | 48 | 266 | 77% |

Operational readout:
- PRAPARE implementation is generating enough screening volume to justify further workflow optimization, but referral-loop performance is constrained by housing and transportation partner capacity.
- Diabetes and CBP registry work remains the cleanest near-term path to quality improvement because the target populations are identifiable and concentrated in two sites.
- CHW demand is highest among members with both transportation need and repeated no-show patterns, yet several of those referrals are waiting on outside community capacity rather than internal staffing alone.

Recommended decision frame:
- Expand CHW staffing only if the added capacity is paired with tighter referral triage and stronger community-partner slot management.
- Keep sensitive SDOH details segmented to role-based worklists rather than broad dashboard views.
- Revalidate diabetes and hypertension registry logic monthly using diagnosis, medication, and lab criteria rather than problem list entries alone.
