---
holdout_id: owm-d01-holdout-01-harbor-canyon-snf-dashboard
agent_slug: operations-workforce-manager
agents_relevant:
- operations-workforce-manager
deliverable_id: owm-d01
deliverable_title: Workforce Dashboard
seed_ref: operations-workforce-manager/owm-d01-seed-01-harbor-canyon-snf-dashboard.yaml
scenario_summary: Monthly dashboard for a synthetic skilled nursing facility preparing
  for board review after weekend staffing complaints and turnover spikes among licensed
  nurses.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 483.35 - Nursing services
- CMS Nursing Home Care Compare and staffing data resources
- U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics for
  Licensed Practical and Licensed Vocational Nurses
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the workforce dashboard structure from the prompt with populated staffing, retention,
  labor cost, recruitment, and action-item sections.
- Reflect SNF operating realities, including RN coverage requirements, licensed nurse
  coverage, CNA dependence, and weekend call-off strain.
- Show a financially literate link between staffing variance, agency use, and quality
  risk without drifting into generic narrative.
- Flag at least one action tied to licensure, competency, or exclusion-screening discipline.
---

# Healthcare Workforce Monthly Dashboard

**Organization**: Harbor Canyon Skilled Nursing Center
**Month**: March 2026
**Total Employees**: 412
**Total Nursing FTEs**: 168.2

## Staffing Adequacy
| Unit | Budgeted FTEs | Actual FTEs | Vacancy Rate | HPPD (Actual) | HPPD (Target) | Agency % |
|------|--------------:|------------:|-------------:|--------------:|--------------:|---------:|
| Short-Stay Rehab | 48.0 | 44.3 | 7.7% | 4.8 | 5.0 | 6.4% |
| Long-Term Care A | 34.0 | 31.7 | 6.8% | 4.1 | 4.2 | 4.8% |
| Long-Term Care B | 33.0 | 30.6 | 7.3% | 4.0 | 4.1 | 5.3% |
| Memory Care | 19.0 | 17.4 | 8.4% | 4.6 | 4.7 | 3.9% |
| Night House Coverage | 12.0 | 10.8 | 10.0% | 3.3 | 3.5 | 8.1% |
| Rehab Support | 9.0 | 8.6 | 4.4% | 3.0 | 3.0 | 1.2% |
| **Total** | **155.0** | **143.4** | **7.5%** | **4.2** | **4.3** | **5.3%** |

## Turnover & Retention
| Metric | Current Month | Rolling 12-Month | Prior Year | National Benchmark |
|--------|--------------:|-----------------:|-----------:|-------------------:|
| RN turnover rate | 1.8% | 21.6% | 23.4% | 18-22% |
| CNA turnover rate | 2.6% | 31.8% | 34.2% | 27-33% |
| First-year RN turnover | 1.1% | 14.9% | 17.5% | 20-25% |
| Voluntary turnover | 1.5% | 17.2% | 19.1% |  |
| Involuntary turnover | 0.3% | 4.4% | 4.3% |  |

## Labor Cost
| Metric | Current | Budget | Variance | Benchmark |
|--------|--------:|-------:|---------:|----------:|
| Total labor cost | $1.86M | $1.71M | $0.15M |  |
| Labor % of net revenue | 58.9% | 57.1% | 1.8 pts | 50-55% |
| Agency spend | $126K | $84K | $42K | < 5% of total |
| Overtime % | 4.7% | 3.9% | 0.8 pts | < 4% |
| Premium pay % | 16.1% | 14.2% | 1.9 pts | < 15% |

## Recruitment Pipeline
| Position Category | Open Positions | Applications | Interviews | Offers | Accepted | Avg Time to Fill |
|-------------------|---------------:|-------------:|-----------:|-------:|---------:|-----------------:|
| RN | 8 | 22 | 7 | 4 | 2 | 49 days |
| CNA | 17 | 61 | 19 | 11 | 8 | 27 days |
| Allied Health | 4 | 10 | 4 | 2 | 1 | 42 days |
| Support Services | 6 | 24 | 8 | 5 | 4 | 21 days |

## Action Items
| Issue | Impact | Owner | Action | Deadline |
|-------|--------|-------|--------|----------|
| Weekend night CNA call-offs above policy threshold | Resident care delays and break coverage failures | Staffing Coordinator | Launch weekend reliability incentive and require backup call tree activation by Friday noon | 2026-04-18 |
| Licensed nurse turnover concentrated on rehab unit | Agency dependence and inconsistent assignment continuity | Director of Nursing | Add preceptor premium and 90-day stay interviews for rehab hires | 2026-04-30 |
| Premium labor exceeds board plan for second month | Margin pressure and board scrutiny | Administrator | Freeze off-contract agency usage and route all requests through approved vendor list | 2026-04-15 |
| Schedule eligibility file needs tighter controls | Exposure from expired credentials or missed screenings | HR and Compliance Lead | Reconcile scheduling permissions to licensure, certifications, and exclusion-screening log | 2026-04-20 |

March staffing supported required resident coverage, but weekend execution remains unstable. Short-stay rehab and night house coverage drove most premium labor variance. The next board packet should connect staffing stabilization work to both fall prevention and contract labor reduction.
