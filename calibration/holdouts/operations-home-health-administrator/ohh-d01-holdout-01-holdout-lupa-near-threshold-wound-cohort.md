---
holdout_id: ohh-d01-holdout-01-holdout-lupa-near-threshold-wound-cohort
agent_slug: operations-home-health-administrator
agents_relevant:
- operations-home-health-administrator
deliverable_id: ohh-d01
deliverable_title: LUPA Monitoring Report
seed_ref: operations-home-health-administrator/ohh-d01-seed-01-holdout-lupa-near-threshold-wound-cohort.yaml
scenario_summary: Daily LUPA management report for a wound-heavy cohort with several
  periods sitting one visit short and documentation sensitivity around threshold-saving
  visits.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS MLN: Home Health LUPA Thresholds and Billing guidance'
- Medicare Benefit Policy Manual, Chapter 7, Home Health Services
- 42 CFR Part 484, Conditions of Participation for Home Health Agencies
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The report should show a realistic at-risk table with specific thresholds, completed
  visits, and days left.
- Actions should balance revenue protection with medical necessity and documentation
  integrity.
- At least one patient should require same-day intervention due to period end.
- The summary totals should reconcile with the table narrative.
---

# LUPA Monitoring Report — Daily

**Agency**: Alder Run Home Health
**Branch**: South Basin Branch
**Report Date**: 2026-04-09
**Report Prepared by**: Cato Mire, MHA

## Active 30-Day Periods at Risk
| Patient | 30-Day Start | 30-Day End | Clinical Group | LUPA Threshold | Visits Made | Visits Remaining | Days Left | Risk Level |
|---------|-------------|------------|----------------|---------------|-------------|-----------------|-----------|------------|
| Elin Fable, MRN AR-20814 | 2026-03-11 | 2026-04-09 | Wounds - Post-Op Wound | 5 | 4 | 1 | 0 | High |
| Noam Quarry, MRN AR-20839 | 2026-03-13 | 2026-04-11 | MMTA-Endocrine | 3 | 2 | 1 | 2 | High |
| Veda Clove, MRN AR-20866 | 2026-03-15 | 2026-04-13 | MMTA-Respiratory | 4 | 2 | 2 | 4 | Medium |
| Soren Heath, MRN AR-20871 | 2026-03-17 | 2026-04-15 | Musculoskeletal Rehabilitation | 2 | 1 | 1 | 6 | Low |

## Summary
- Total active 30-day periods: 29
- Periods currently below LUPA threshold: 4
- Periods at risk (< 5 days remaining, below threshold): 2
- Periods on track: 25

## Required Actions
| Patient | Action Needed | Responsible Clinician | Deadline |
|---------|--------------|----------------------|----------|
| Elin Fable, MRN AR-20814 | Same-day wound visit only if current drainage, packing, or skilled assessment needs remain supported in the chart; otherwise document why no added skilled visit is indicated | Rhea Vale, RN | 2026-04-09 1400 |
| Noam Quarry, MRN AR-20839 | Confirm insulin teaching and med-change follow-up still require skilled nursing and complete one visit before period close | Jorin Pike, RN | 2026-04-10 1600 |
| Veda Clove, MRN AR-20866 | Review respiratory symptom log and schedule next visit based on documented dyspnea teaching needs, not threshold proximity alone | Ivo Stern, RN | 2026-04-11 1700 |
| Soren Heath, MRN AR-20871 | Validate PT goal progression and close period with clear discharge or continuation rationale | Lena Moss, PT | 2026-04-12 1700 |
