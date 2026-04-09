---
holdout_id: psc-d01-holdout-01-ashland-salmonella-wedding
agent_slug: pophealth-surveillance-coordinator
agents_relevant:
- pophealth-surveillance-coordinator
deliverable_id: psc-d01
deliverable_title: Outbreak Investigation Report
seed_ref: pophealth-surveillance-coordinator/psc-d01-seed-01-ashland-salmonella-wedding.yaml
scenario_summary: A catered anniversary dinner produced a Salmonella cluster traced
  to chicken salad and improper cold storage.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'CDC outbreak investigation steps: https://www.cdc.gov/food-safety/php/outbreak-response/steps-of-investigating-an-outbreak.html'
- 'CDC NNDSS: https://ndc.services.cdc.gov/'
- 'CSTE case definitions: https://www.cste.org/page/PositionStatements'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when outbreak reporting law, case definition practice, or
  surveillance workflow standards materially change
expectations:
- The report should present a clear summary, a case definition, descriptive epidemiology,
  analytic findings, laboratory results, environmental findings, and control measures.
- The report should identify the outbreak source and include an action-oriented recommendation
  section.
- The final report should be written as a completed investigation, not a template or outline.
---

# Outbreak Investigation Report

**Jurisdiction**: Ashland County Health Department  
**Condition**: Salmonellosis  
**Investigation Period**: April 6, 2026 - April 17, 2026  
**Report Date**: April 19, 2026  
**Lead Investigator**: Natalia Brooks, MPH  
**Report Status**: Final

## Summary
- Total cases identified: 11
- Classification: 7 confirmed, 4 probable, 0 suspect
- Hospitalizations: 2
- Deaths: 0
- Date of onset, first case: April 4, 2026
- Date of onset, last case: April 7, 2026
- Source identified: Yes - chicken salad
- Outbreak declared over: Yes - April 17, 2026

## Background
- The cluster was identified after three restaurant-associated ED visits were reported the same evening.
- Historical jurisdiction data show fewer than two salmonellosis cases per week in April.
- The caterer used a shared prep kitchen without a dedicated cold-holding log.

## Case Definition
- **Confirmed**: gastroenteritis plus culture-confirmed Salmonella matching the outbreak strain
- **Probable**: compatible illness with the shared meal exposure and pending or no lab confirmation
- **Suspect**: compatible illness after the event pending interview

## Descriptive Epidemiology
### Person
| Characteristic | Cases (N) | % |
|---------------|-----------|---|
| Age 0-17 | 1 | 9 |
| Age 18-44 | 6 | 55 |
| Age 45-64 | 3 | 27 |
| Age 65+ | 1 | 9 |
| Hospitalized | 2 | 18 |

### Place
- All cases attended the same catered anniversary dinner at Willow Point Hall.

### Time
- Epi curve type: Point source
- Incubation period estimate: 16-40 hours

## Analytic Epidemiology
| Exposure | Cases Exposed | Cases Not Exposed | Controls Exposed | Controls Not Exposed | OR/RR | 95% CI | p-value |
|----------|--------------|-------------------|-----------------|---------------------|-------|--------|---------|
| Chicken salad | 10 | 1 | 5 | 17 | 34.0 | 3.1-370.6 | <0.001 |

## Laboratory Results
- The state public health laboratory confirmed Salmonella enterica serotype Enteritidis.
- WGS showed a tight cluster with no unrelated background isolates.
- Leftover chicken salad from the prep kitchen matched the case strain.

## Environmental Investigation
- The caterer used one refrigerator for raw poultry and prepared salads.
- Cooling logs showed two salad trays held above 45 F for more than 90 minutes.
- The prep kitchen lacked written corrective actions after the temperature excursion.

## Control Measures Implemented
- [x] Notified exposed attendees and local clinicians - April 8, 2026
- [x] Suspended the caterer's off-site buffet service pending corrective action - April 9, 2026
- [x] Required a sanitation and temperature-control plan before reopening - April 12, 2026

## Recommendations
1. Require separate refrigeration and temperature logs for ready-to-eat foods.
2. Add event-catering notification requirements to the local food inspection program.
3. Use de-identified cluster summaries in quarterly public health surveillance review.

## Appendices
- De-identified line list
- Exposure matrix
- Lab summary
- Interview notes

