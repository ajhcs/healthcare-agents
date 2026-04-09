---
exemplar_id: oam-d01-example-01-suburban-primary-care-dashboard
agent_slug: operations-ambulatory-manager
agents_relevant:
- operations-ambulatory-manager
deliverable_id: oam-d01
deliverable_title: Clinic Operations Dashboard
scenario_summary: Monthly dashboard for a three-site suburban primary care network
  showing access recovery after reminder and template changes.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Quality Payment Program: https://qpp.cms.gov/'
- 'AHRQ CAHPS Clinician & Group Survey: https://www.ahrq.gov/cahps/surveys-guidance/cg/index.html'
- 'OSHA Bloodborne Pathogens Standard, 29 CFR 1910.1030: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1030'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Ambulatory Operations Monthly Dashboard

**Month**: March 2026
**Network/Region**: North River Ambulatory Group
**Sites**: 3
**Providers**: 14.2 FTE

## Access Metrics
| Site | Providers (FTE) | 3NA (New) | 3NA (Est) | Fill Rate | No-Show % | Cycle Time (min) |
|------|----------------|-----------|-----------|-----------|-----------|-------------------|
| Pine Cross Clinic | 5.0 | 4 days | 2 days | 92% | 7.8% | 54 |
| Alder Square Clinic | 4.2 | 6 days | 3 days | 89% | 8.9% | 57 |
| Juniper Landing Clinic | 5.0 | 5 days | 2 days | 94% | 7.1% | 52 |
| **Network** | **14.2** | **5 days** | **2 days** | **92%** | **7.9%** | **54** |

## Volume & Productivity
| Site | Visits (Actual) | Visits (Budget) | Var % | wRVUs (Actual) | wRVUs (Budget) | Var % |
|------|----------------|----------------|-------|---------------|----------------|-------|
| Pine Cross Clinic | 1,986 | 1,920 | +3.4% | 4,184 | 4,020 | +4.1% |
| Alder Square Clinic | 1,524 | 1,560 | -2.3% | 3,108 | 3,210 | -3.2% |
| Juniper Landing Clinic | 2,041 | 1,980 | +3.1% | 4,302 | 4,180 | +2.9% |
| **Network** | **5,551** | **5,460** | **+1.7%** | **11,594** | **11,410** | **+1.6%** |

## Patient Experience (CG-CAHPS or Equivalent)
| Metric | Score | Benchmark | Percentile |
|--------|-------|-----------|------------|
| Overall provider rating | 91.2 | 88.0 | 78th |
| Access to care | 86.4 | 83.5 | 73rd |
| Communication | 92.8 | 89.7 | 81st |
| Care coordination | 87.5 | 84.0 | 76th |
| Office staff | 90.1 | 86.2 | 79th |

## Financial Performance
| Site | Revenue | Expenses | Margin | Net Collection % | Days in A/R |
|------|---------|----------|--------|-------------------|-------------|
| Pine Cross Clinic | $612,400 | $451,700 | $160,700 | 97.4% | 31 |
| Alder Square Clinic | $471,900 | $369,200 | $102,700 | 95.9% | 35 |
| Juniper Landing Clinic | $634,800 | $459,100 | $175,700 | 97.1% | 30 |
| **Network** | **$1,719,100** | **$1,280,000** | **$439,100** | **96.9%** | **32** |

## Action Items
| Issue | Site | Owner | Action | Deadline | Status |
|-------|------|-------|--------|----------|--------|
| 3NA above target for new patients | Alder Square Clinic | Site Manager Rina Holt | Convert one established follow-up block per provider per week to new-patient access and preserve two same-day slots per session | 2026-04-30 | In progress |
| No-show clustering in late afternoon sessions | Alder Square Clinic | Access Supervisor Theo Marr | Add 48-hour text plus 3-hour reminder for visits after 1500 and activate waitlist fill script | 2026-04-22 | In progress |
| Cycle time drift on Monday mornings | Pine Cross Clinic | Practice Administrator Jae Soren | Pilot staggered MA huddle start and front-load pre-visit planning for first four appointments | 2026-04-18 | Planned |
| Charge lag rising above 2 days in one provider pod | Juniper Landing Clinic | Revenue Cycle Lead Mara Fen | Daily chart-close report with same-day provider escalation at 1600 | 2026-04-15 | Active |
| Point-of-service collection below 95% in self-pay visits | Network | Regional Ops Director Elin Voss | Refresh front-desk scripting and enable eligibility pop-up before check-in completion | 2026-05-01 | Planned |
