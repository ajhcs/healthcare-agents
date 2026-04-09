---
exemplar_id: opp-d01-example-01-family-medicine-q1-productivity-reset
agent_slug: operations-physician-practice-manager
agents_relevant:
- operations-physician-practice-manager
deliverable_id: opp-d01
deliverable_title: Provider Productivity Dashboard
scenario_summary: Quarterly family medicine dashboard showing FTE-normalized productivity,
  access strain, and compensation variance ahead of renewal discussions.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'MGMA DataDive product page: https://www.mgma.com/datadive'
- 'CMS Physician Fee Schedule Look-Up Tool: https://www.cms.gov/medicare/payment/fee-schedules/physician/look-up-tool'
- 'CMS QPP Portal: https://qpp.cms.gov/'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Provider Productivity Report

**Period**: Q1 2026
**Practice**: Harbor Willow Medical Group
**Specialty**: Family Medicine

## Individual Provider Performance
| Provider | Clinical FTE | wRVUs | wRVU/FTE | MGMA %ile | Total Comp | $/wRVU | Comp %ile | Variance |
|----------|-------------|-------|----------|-----------|------------|--------|-----------|----------|
| Dr. Elian Voss | 1.00 | 1,412 | 1,412 | 72nd | $294,000 | $52.06 | 51st | Comp below productivity percentile; favorable margin |
| Dr. Mara Selnik | 0.90 | 1,011 | 1,123 | 28th | $301,500 | $74.53 | 63rd | Comp above productivity percentile; access leakage risk |
| Dr. Tovin Rees | 0.80 | 1,004 | 1,255 | 46th | $248,000 | $61.75 | 42nd | Aligned compensation and production |
| Dr. Imani Kade | 1.00 | 1,566 | 1,566 | 86th | $318,000 | $50.77 | 61st | High output with efficient cost per wRVU |

## Practice Summary
| Metric | Practice | MGMA Median | MGMA 75th | %ile |
|--------|----------|-------------|-----------|------|
| wRVU per provider FTE | 1,351 | 1,240 | 1,420 | 63rd |
| Total compensation per provider | $290,375 | $287,000 | $312,000 | 54th |
| $/wRVU | $58.89 | $60.00 | $64.00 | 47th |
| Net collection rate | 96.2% | 95.0% | 97.0% | 67th |
| Cost per RVU | $36.40 | $38.20 | $34.90 | 58th |
| Operating margin | 8.6% | 7.0% | 10.0% | 61st |

## Observations & Recommendations
| Finding | Impact | Recommendation | Priority |
|---------|--------|----------------|----------|
| Dr. Mara Selnik's 3rd next available new-patient visit is 21 days and no-show rate is 11.8% | New-patient conversion is slipping and compensation per wRVU is above internal target | Rebuild template to reserve four same-week acute slots per session, reduce low-value six-week follow-up holds, and assign centralized reminder workflow | H |
| Dr. Imani Kade is producing 154 wRVUs per 0.1 FTE per quarter with stable patient experience | Current template supports top-decile productivity without burnout signals | Preserve template density and add one APP-supported procedure block per month to absorb referral growth | M |
| Practice fill rate for new-patient family medicine slots is 92%, but referral abandonment reached 6.4% in February | Call-center leakage is suppressing panel growth | Add overflow scheduling rules and same-day callback queue during Monday and Tuesday peaks | H |
| Established follow-up visits longer than 20 minutes account for 29% of Dr. Mara Selnik's schedule | Session capacity is constrained without documented acuity benefit | Shift routine chronic follow-ups meeting protocol criteria to blended in-person/telehealth template | M |
| Professional margin remains positive despite Medicare-heavy panel mix | Current compensation structure remains supportable | Continue quarterly monitoring and refresh benchmark comparison before FY2027 contract amendments | M |

## Supporting Notes
- MGMA percentile mapping reflects 2026 internal benchmark file built from current-year licensed survey extracts and normalized to clinical FTE.
- wRVUs were assigned from final posted claims using the CMS physician fee schedule mapping maintained in the billing warehouse.
- Compensation reflects annualized base salary plus earned productivity incentive through March 31, 2026.
- Patient access review used 3rd next available, slot utilization, fill rate, and no-show trend by provider.
- If current CMS policy language affecting incident-to billing or QPP category weights is material to compensation design updates, verify the latest rule text through a current regulatory policy lookup before final external distribution.
