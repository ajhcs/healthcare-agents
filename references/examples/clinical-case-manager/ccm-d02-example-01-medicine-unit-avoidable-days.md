---
exemplar_id: ccm-d02-example-01-medicine-unit-avoidable-days
agent_slug: clinical-case-manager
agents_relevant:
- clinical-case-manager
deliverable_id: ccm-d02
deliverable_title: Avoidable Day Report
scenario_summary: Monthly avoidable day report for a community hospital medicine service
  showing post-acute, authorization, and social barrier trends.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
- provider_enrollment_status
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.43 Hospital discharge planning requirements
- CMS Medicare Advantage prior authorization and utilization management final rule
- HHS OIG reports on hospital discharge status and post-acute transfer vulnerabilities
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Avoidable Day Analysis

**Facility**: Green Hollow Regional Hospital
**Reporting Period**: March 2026

## Summary
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------|------------|-----|--------|
| Total patient days | 4,862 | 4,701 | 14,233 |  |
| Avoidable days identified | 173 | 149 | 498 |  |
| Avoidable day rate (%) | 3.6% | 3.2% | 3.5% | <5% |
| Avg avoidable days per affected case | 2.7 | 2.4 | 2.6 |  |

## Avoidable Days by Cause
| Cause Category | Days | % of Total | Trend | Action |
|---------------|------|-----------|-------|--------|
| Post-acute placement | 68 | 39% | Up | Expand early referral on day 1 for high-risk patients and hold twice-daily bed huddles |
| Payer authorization delay | 37 | 21% | Up | Escalate pending requests at 24 hours and route weak documentation to physician advisor same day |
| Physician/clinical | 24 | 14% | Down | Continue discharge criteria scripting during IDR and noon-order campaign |
| Patient/family | 18 | 10% | Flat | Increase early family meetings for likely SNF and hospice cases |
| Social/housing | 19 | 11% | Up | Add weekly medical respite review with social work and community partners |
| Testing/procedure | 7 | 4% | Down | Maintain radiology escalation list for next-day discharge candidates |

## Financial Impact
- Estimated cost per avoidable day: $712
- Total avoidable day cost this period: $123,176
- Revenue at risk from LOS outlier cases: $284,000

## Recommendations
1. Launch a complex-placement watchlist for ventilator, bariatric, behavior-plus-medical, and Medicaid-pending patients within 24 hours of admission.
2. Standardize payer packets for SNF, IRF, and LTACH requests so therapy tolerance, medical necessity, and physician documentation are complete before submission.
3. Add a live observation-to-inpatient qualifying-stay tracker to prevent preventable SNF coverage failures and late disposition changes.

## Operational Detail
- Eight of the 68 post-acute placement days involved patients needing facilities with IV antibiotic capability plus isolation capacity.
- Thirteen authorization-delay days were concentrated in one Medicare Advantage product where peer-to-peer review was not requested until hospital day 5 or later.
- Six social-barrier days involved sheltered or unsheltered homelessness; two were resolved through regional medical respite placement.
- Fourteen physician-related days dropped from the prior month after hospitalists began documenting expected discharge dates during rounds.
- One LTACH candidate generated 6 avoidable days after three facilities declined because prolonged ventilation criteria and payer approval were misaligned.

## Corrective Work Already Underway
- Preferred post-acute outreach calls now occur at 09:00 and 15:00 for all pending referrals older than 24 hours.
- Case management leadership began weekly denial review with utilization management and physician advisor on 2026-03-12.
- Observation patients likely to need SNF are now flagged in the census comment field before noon each day.
- Transfer-packet audit now checks reconciled medications, pending tests, and named callback contacts before departure.

## Leadership Interpretation
- The service remains below the institutional target, but the month-over-month increase is operationally significant because it was driven by controllable delays rather than case-mix severity alone.
- Placement and authorization together accounted for 60% of avoidable days; these are the highest-yield intervention areas for April.
- No single unit explained the increase; the pattern was distributed across medicine, cardiology, and ICU step-down, which supports a system workflow response rather than a unit-only action plan.
- If federal MA prior-authorization timing standards or discharge-planning guidance change, confirm current requirements before updating the escalation policy.
