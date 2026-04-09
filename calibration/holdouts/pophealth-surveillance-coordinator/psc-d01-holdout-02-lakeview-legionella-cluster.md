---
holdout_id: psc-d01-holdout-02-lakeview-legionella-cluster
agent_slug: pophealth-surveillance-coordinator
agents_relevant:
- pophealth-surveillance-coordinator
deliverable_id: psc-d01
deliverable_title: Outbreak Investigation Report
seed_ref: pophealth-surveillance-coordinator/psc-d01-seed-02-lakeview-legionella-cluster.yaml
scenario_summary: A long-term care facility experienced a Legionella cluster linked
  to a hot-water system and incomplete environmental maintenance logs.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'CDC Legionella investigation guidance: https://www.cdc.gov/legionella/php/public-health-strategy/index.html'
- 'CDC NEDSS: https://www.cdc.gov/nbs/'
- 'CSTE position statements: https://www.cste.org/page/PositionStatements'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when Legionella surveillance, water-management, or outbreak
  response standards materially change
expectations:
- The report should show a completed outbreak investigation with a clear case definition,
  epi summary, and control measures.
- The report should include environmental findings tied to the likely source and not rely
  on generic pneumonia language.
- The control measures should be specific enough to support after-action review.
---

# Outbreak Investigation Report

**Jurisdiction**: Lakeview County Health District  
**Condition**: Legionellosis  
**Investigation Period**: March 2, 2026 - March 18, 2026  
**Report Date**: March 22, 2026  
**Lead Investigator**: Priya Desai, MD, MPH  
**Report Status**: Interim

## Summary
- Total cases identified: 6
- Classification: 4 confirmed, 2 probable, 0 suspect
- Hospitalizations: 6
- Deaths: 1
- Date of onset, first case: February 25, 2026
- Date of onset, last case: March 6, 2026
- Source identified: Yes - building water system
- Outbreak declared over: No

## Background
- The signal was first noticed by the local hospital after two admissions from the same facility.
- The long-term care facility had not documented its last full water management review.
- The cluster involved residents with advanced age and multiple chronic conditions.

## Case Definition
- **Confirmed**: compatible Legionella illness plus positive laboratory testing and exposure to Lakeview Manor
- **Probable**: compatible illness with epidemiologic linkage and no confirmatory culture
- **Suspect**: compatible pneumonia under investigation

## Descriptive Epidemiology
### Person
| Characteristic | Cases (N) | % |
|---------------|-----------|---|
| Age 65+ | 6 | 100 |
| Hospitalized | 6 | 100 |
| Died | 1 | 17 |

### Place
- All cases were residents of the east wing or had spent time in the shared bathing area.

### Time
- Epi curve type: Continuous common source
- Incubation period estimate: 3-9 days

## Analytic Epidemiology
| Exposure | Cases Exposed | Cases Not Exposed | Controls Exposed | Controls Not Exposed | OR/RR | 95% CI | p-value |
|----------|--------------|-------------------|-----------------|---------------------|-------|--------|---------|
| East wing shower use | 5 | 1 | 3 | 16 | 26.7 | 2.0-356.4 | 0.003 |

## Laboratory Results
- Five urinary antigen tests were positive.
- Two sputum specimens grew Legionella pneumophila serogroup 1.
- One environmental isolate matched the clinical cluster by WGS.

## Environmental Investigation
- Hot-water temperatures were below the documented target in the east wing.
- Shower heads and sink aerators had not been replaced on the recommended schedule.
- Maintenance records showed a missed flush after a boiler repair three weeks earlier.

## Control Measures Implemented
- [x] Restricted shower use in the east wing - March 7, 2026
- [x] Hyperchlorinated the hot-water system - March 8, 2026
- [x] Instituted daily flushing logs and temperature review - March 9, 2026

## Recommendations
1. Formalize the water-management plan with monthly ownership review.
2. Require routine environmental sampling after repairs and before reopening affected areas.
3. Add surveillance triggers for clustered pneumonia admissions from the same facility.

## Appendices
- De-identified case line list
- Environmental sample summary
- Epi curve notes
- Facility action memo

