---
holdout_id: oam-d01-holdout-01-surgical-specialty-dashboard-holdout
agent_slug: operations-ambulatory-manager
agents_relevant:
- operations-ambulatory-manager
deliverable_id: oam-d01
deliverable_title: Clinic Operations Dashboard
seed_ref: operations-ambulatory-manager/oam-d01-seed-01-surgical-specialty-dashboard-holdout.yaml
scenario_summary: Dashboard for a four-site surgical specialty network with strong
  revenue performance but unstable access and long checkout times.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'AHRQ CAHPS Clinician & Group Survey: https://www.ahrq.gov/cahps/surveys-guidance/cg/index.html'
- 'CMS Quality Payment Program: https://qpp.cms.gov/'
- 'CMS Conditions for Coverage for ASCs, 42 CFR Part 416: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-416'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Show site-level access, productivity, patient experience, and financial results
  in the exact dashboard structure.
- Surface the tension between very high fill rates and poor new-patient access.
- Include action items that address template control, checkout conversion, and procedure
  scheduling flow.
---

# Ambulatory Operations Monthly Dashboard

**Month**: March 2026
**Network/Region**: Summit Surgical Ambulatory Network
**Sites**: 4
**Providers**: 18.0 FTE

## Access Metrics
| Site | Providers (FTE) | 3NA (New) | 3NA (Est) | Fill Rate | No-Show % | Cycle Time (min) |
|------|----------------|-----------|-----------|-----------|-----------|-------------------|
| Summit Ridge | 4.5 | 16 days | 6 days | 96% | 5.4% | 61 |
| Lakeview Pavilion | 5.0 | 22 days | 8 days | 98% | 6.1% | 68 |
| Orchard Point | 3.5 | 13 days | 5 days | 93% | 5.7% | 58 |
| Mesa Annex | 5.0 | 19 days | 7 days | 97% | 6.3% | 65 |
| **Network** | **18.0** | **18 days** | **7 days** | **96%** | **5.9%** | **63** |

## Volume & Productivity
| Site | Visits (Actual) | Visits (Budget) | Var % | wRVUs (Actual) | wRVUs (Budget) | Var % |
|------|----------------|----------------|-------|---------------|----------------|-------|
| Summit Ridge | 1,182 | 1,140 | +3.7% | 3,412 | 3,280 | +4.0% |
| Lakeview Pavilion | 1,396 | 1,330 | +5.0% | 4,108 | 3,950 | +4.0% |
| Orchard Point | 952 | 980 | -2.9% | 2,744 | 2,810 | -2.3% |
| Mesa Annex | 1,301 | 1,260 | +3.3% | 3,828 | 3,700 | +3.5% |
| **Network** | **4,831** | **4,710** | **+2.6%** | **14,092** | **13,740** | **+2.6%** |

## Patient Experience (CG-CAHPS or Equivalent)
| Metric | Score | Benchmark | Percentile |
|--------|-------|-----------|------------|
| Overall provider rating | 89.8 | 87.9 | 71st |
| Access to care | 81.6 | 82.7 | 48th |
| Communication | 90.7 | 88.6 | 75th |
| Care coordination | 83.9 | 83.1 | 58th |
| Office staff | 84.9 | 86.0 | 39th |

## Financial Performance
| Site | Revenue | Expenses | Margin | Net Collection % | Days in A/R |
|------|---------|----------|--------|-------------------|-------------|
| Summit Ridge | $742,600 | $489,300 | $253,300 | 97.8% | 24 |
| Lakeview Pavilion | $921,400 | $609,800 | $311,600 | 97.2% | 26 |
| Orchard Point | $571,900 | $419,800 | $152,100 | 96.5% | 29 |
| Mesa Annex | $882,500 | $558,300 | $324,200 | 97.0% | 27 |
| **Network** | **$3,118,400** | **$2,077,200** | **$1,041,200** | **97.1%** | **27** |

## Action Items
| Issue | Site | Owner | Action | Deadline | Status |
|-------|------|-------|--------|----------|--------|
| New-patient access above target with fill rates above 95% | Network | Director of Surgical Access Lena Cor | Rebalance template supply by carving out protected consult slots and separating post-op returns from consult lanes | 2026-04-26 | In progress |
| Checkout congestion after procedural clinic | All sites | Front Desk Manager Soren Hale | Move routine post-op scheduling into room close-out and add second close-out workstation from 1300-1700 | 2026-04-18 | Planned |
| Office-staff patient experience below benchmark | Lakeview Pavilion | Site Administrator Pella Rue | Retrain arrival and checkout scripting with mystery-shopper follow-up | 2026-04-20 | Active |
| Cycle time above 65 minutes | Lakeview Pavilion | Clinic Manager Tavi Senn | Pilot provider-ready alert standard and pre-close imaging handoff | 2026-04-22 | Planned |
| Procedure and clinic follow-up demand competing for same supply | Mesa Annex | Template Analyst Orin Faye | Create distinct procedure-follow-up lane rules with weekly governance review | 2026-04-25 | In progress |
