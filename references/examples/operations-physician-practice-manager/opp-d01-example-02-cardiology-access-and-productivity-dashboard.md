---
exemplar_id: opp-d01-example-02-cardiology-access-and-productivity-dashboard
agent_slug: operations-physician-practice-manager
agents_relevant:
- operations-physician-practice-manager
deliverable_id: opp-d01
deliverable_title: Provider Productivity Dashboard
scenario_summary: Multi-site non-invasive cardiology dashboard combining productivity,
  collections, and access metrics after referral growth outpaced template capacity.
complexity: high
mcp_servers_relevant:
- provider_directory
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'MGMA DataDive product page: https://www.mgma.com/datadive'
- 'CMS Physician Fee Schedule Look-Up Tool: https://www.cms.gov/medicare/payment/fee-schedules/physician/look-up-tool'
- 'CMS Medicare Provider Enrollment resources: https://www.cms.gov/medicare/enrollment-renewal/providers-suppliers/medicare-provider-enrollment'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Provider Productivity Report

**Period**: FY 2025
**Practice**: North Maple Heart Partners
**Specialty**: Cardiology (Non-Invasive)

## Individual Provider Performance
| Provider | Clinical FTE | wRVUs | wRVU/FTE | MGMA %ile | Total Comp | $/wRVU | Comp %ile | Variance |
|----------|-------------|-------|----------|-----------|------------|--------|-----------|----------|
| Dr. Senna Vale | 1.00 | 7,842 | 7,842 | 76th | $552,000 | $70.39 | 58th | Productive and economically aligned |
| Dr. Corin Hale | 0.90 | 5,481 | 6,090 | 34th | $534,000 | $97.43 | 62nd | Compensation materially rich to output |
| Dr. Liora Fen | 0.75 | 4,992 | 6,656 | 47th | $418,500 | $83.84 | 44th | Stable but limited by admin time |
| Dr. Oren Pell | 1.00 | 8,416 | 8,416 | 84th | $588,000 | $69.86 | 66th | Strong throughput and collections |

## Practice Summary
| Metric | Practice | MGMA Median | MGMA 75th | %ile |
|--------|----------|-------------|-----------|------|
| wRVU per provider FTE | 7,309 | 7,050 | 7,850 | 61st |
| Total compensation per provider | $523,125 | $545,000 | $586,000 | 46th |
| $/wRVU | $77.15 | $76.00 | $82.00 | 54th |
| Net collection rate | 94.7% | 95.0% | 97.0% | 43rd |
| Cost per RVU | $41.90 | $43.50 | $39.80 | 57th |
| Operating margin | 4.2% | 5.0% | 8.0% | 39th |

## Observations & Recommendations
| Finding | Impact | Recommendation | Priority |
|---------|--------|----------------|----------|
| Dr. Corin Hale is at the 34th percentile for wRVU/FTE while compensation remains above the internal cardiology support band | Reduces service-line margin and increases renewal friction | Rebase FY2027 comp model to a lower guaranteed base with productivity true-up and document 0.1 FTE admin carve-out separately | H |
| New consult 3rd next available is 19 business days at the East Quay site despite 91% slot fill | Referral leakage risk for high-value imaging and downstream admissions | Convert two low-yield follow-up sessions per month to new consult blocks and add APP treadmill-read follow-up coverage | H |
| Net collection rate underperformed due to enrollment lag for a newly added outreach clinic in January | Collections suppression distorts provider economics | Freeze external template expansion until payer linkage and rendering location setup are verified for every site and NPI mapping | H |
| Dr. Oren Pell and Dr. Senna Vale both exceed the 75th percentile for productivity with stable patient complaints | Capacity is concentrated in two physicians | Standardize reading-room support and redistribute echo review sessions to reduce burnout concentration | M |
| Dr. Liora Fen carries 0.15 FTE medical director duties and remains near median productivity after normalization | Productivity appears reasonable once non-clinical duties are recognized | Keep FTE-adjusted benchmark methodology explicit in all provider-facing presentations | M |

## Access and Template Detail
- East Quay new consult 3NA: 19 business days
- Riverside Pavilion new consult 3NA: 11 business days
- Return visit no-show rate: 7.1%
- Stress-test slot utilization: 96%
- Echo interpretation turnaround: 1.8 days

## Supporting Notes
- Provider wRVUs were built from final claim-level CPT mapping and reconciled to monthly compensation files.
- Clinical FTE excludes approved medical director time, dyad leadership meetings, and documented outreach administration sessions.
- Enrollment lag at the outreach clinic affected January and February collections and should not be treated as physician productivity decline.
- Before issuing any external-facing recommendation naming the outreach clinic or affiliated diagnostic site, verify provider and facility identity details through a provider directory lookup to avoid site-matching errors.
- If CMS enrollment, reassignment, or payment policy changes are material to the action plan, confirm the live requirements through a current regulatory policy lookup.
