---
holdout_id: opp-d01-holdout-01-obgyn-dashboard-with-ramp-holdout
agent_slug: operations-physician-practice-manager
agents_relevant:
- operations-physician-practice-manager
deliverable_id: opp-d01
deliverable_title: Provider Productivity Dashboard
seed_ref: operations-physician-practice-manager/opp-d01-seed-01-obgyn-dashboard-with-ramp-holdout.yaml
scenario_summary: Produce a six-month OB/GYN productivity dashboard for a new satellite
  clinic where one physician is in ramp-up and access metrics are improving unevenly.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 'MGMA DataDive product page: https://www.mgma.com/datadive'
- 'CMS Physician Fee Schedule Look-Up Tool: https://www.cms.gov/medicare/payment/fee-schedules/physician/look-up-tool'
- 'CMS Medicare Provider Enrollment resources: https://www.cms.gov/medicare/enrollment-renewal/providers-suppliers/medicare-provider-enrollment'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Show provider-level performance with at least three physicians and clear FTE normalization.
- Include practice summary metrics and a short recommendation table.
- Make the new-provider ramp visible so low early productivity is not framed as a
  mature-state deficit.
- Tie at least one recommendation to scheduling template design or access capacity.
---

# Provider Productivity Report

**Period**: First 6 months of 2026
**Practice**: Silver Fir Women's Health Collective
**Specialty**: OB/GYN

## Individual Provider Performance
| Provider | Clinical FTE | wRVUs | wRVU/FTE | MGMA %ile | Total Comp | $/wRVU | Comp %ile | Variance |
|----------|-------------|-------|----------|-----------|------------|--------|-----------|----------|
| Dr. Anya Merit | 1.00 | 3,284 | 3,284 | 64th | $398,000 | $60.60 | 58th | Balanced production and compensation |
| Dr. Ivo Calder | 0.80 | 2,372 | 2,965 | 49th | $346,000 | $72.93 | 61st | Comp slightly rich to output; surgery time reduces clinic volume |
| Dr. Nessa Vale | 1.00 | 1,486 | 1,486 | Ramp year | $332,000 | $111.71 | Ramp year | Start-up guarantee and panel build period materially affect ratio |

## Practice Summary
| Metric | Practice | MGMA Median | MGMA 75th | %ile |
|--------|----------|-------------|-----------|------|
| wRVU per provider FTE | 2,578 | 2,710 | 3,020 | 43rd |
| Total compensation per provider | $358,667 | $372,000 | $412,000 | 46th |
| $/wRVU | $69.54 | $58.00 | $63.00 | 71st |
| Net collection rate | 95.8% | 95.0% | 97.0% | 61st |
| Cost per RVU | $38.20 | $39.40 | $36.10 | 56th |
| Operating margin | 6.1% | 6.0% | 9.0% | 51st |

## Observations & Recommendations
| Finding | Impact | Recommendation | Priority |
|---------|--------|----------------|----------|
| Dr. Nessa Vale is in active ramp-up after a 2026-02-03 start date | Early six-month productivity is not a mature-state indicator | Keep guarantee structure intact through month 12 and track panel growth monthly instead of annualizing as full-year underperformance | H |
| Satellite-site 3rd next available remains 18 days | New-patient access is constraining panel build and referral retention | Add one dedicated new-obstetric consult block per clinic day and protect those slots from routine follow-up conversion | H |
| Dr. Ivo Calder's surgery-heavy template lowers clinic slot supply | Clinic access pressure may look like productivity softness if reviewed only through ambulatory volume | Separate OR productivity and clinic access review before any compensation action | M |
| Overall no-show rate of 9.4% is acceptable but concentrated in Friday afternoon gynecology follow-ups | Template inefficiency reduces effective capacity | Trial reminder escalation and convert one Friday afternoon follow-up block to same-week urgent gynecology slots | M |
