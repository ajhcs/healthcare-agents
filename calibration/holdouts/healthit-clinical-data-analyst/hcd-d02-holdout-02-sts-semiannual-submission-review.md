---
holdout_id: hcd-d02-holdout-02-sts-semiannual-submission-review
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d02
deliverable_title: Registry Submission Validation Report
seed_ref: healthit-clinical-data-analyst/hcd-d02-seed-02-sts-semiannual-submission-review.yaml
scenario_summary: Semiannual synthetic STS Adult Cardiac Surgery registry validation
  report centered on case capture completeness and mortality risk model inputs.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- STS National Database public overview
- CMS Care Compare cardiac surgery public reporting context
- 45 CFR 164.502(b)
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the registry validation report structure with concise but complete population,
  error, data-quality, benchmark, and sign-off sections.
- Address completeness of procedure capture for CABG and valve cases and note any
  risk-model input corrections.
- Keep the benchmark section framed as pre-submission preview rather than definitive
  public ranking.
---

# Registry Submission Validation Report

**Registry**: STS Adult Cardiac Surgery Database
**Reporting Period**: 2026 H1 synthetic submission cycle
**Submission Deadline**: 2026-08-20
**Analyst**: Elise Navarro

## Volume Summary
| Metric | This Period | Prior Period | % Change | Expected Range |
|--------|------------|-------------|---------|----------------|
| Total cases | 186 | 181 | 2.8% | 170 to 195 |
| Cases passing validation | 179 | 176 | 1.7% | 168 to 192 |
| Cases with errors | 7 | 5 | 40.0% | 0 to 8 |
| Error rate | 3.8% | 2.8% | 1.0 points | Below 4.0% |

## Validation Results
| Validation Rule | Errors Found | Severity | Root Cause | Resolution |
|----------------|-------------|----------|-----------|-----------|
| Operative status missing | 2 | Critical | Two abstraction records were created before surgeon attestation note finalized | Abstracts updated after chart verification |
| Cardiopulmonary bypass time outlier | 3 | Critical | Interface loaded minutes as decimal hours for one source feed | Unit conversion corrected and all affected cases recalculated |
| Duplicate abstract | 1 | Warning | Repeat abstract created after late procedure code addendum | Duplicate removed after OR schedule reconciliation |
| Discharge mortality mismatch | 1 | Critical | Final discharge disposition update posted after first registry extract | Record refreshed from final coded discharge table |

## Data Quality Metrics
| Data Element | Completeness | Accuracy (Sample) | Issue |
|-------------|-------------|-------------------|-------|
| Procedure capture | 100.0% after OR schedule tie-out | 100.0% | Clean |
| Operative status | 100.0% after correction | 98.0% | Two records corrected |
| Bypass time | 100.0% after correction | 97.0% | Three unit-conversion defects corrected |
| Discharge mortality | 100.0% | 100.0% | Clean after final refresh |
| Valve procedure classification | 99.5% | 99.0% | Clean |

## Benchmark Preview (Pre-Submission)
| Outcome Measure | Our Rate | National Benchmark | Percentile | Flag |
|----------------|----------|-------------------|-----------|------|
| Operative mortality observed to expected | Favorable to comparator | Current STS comparator release | Upper half preview | No |
| Prolonged ventilation | Above comparator | Current STS comparator release | Lower half preview | Watch |
| Major morbidity composite | Near comparator | Current STS comparator release | Mid-band preview | No |

## Sign-Off
- Data extraction validated: Completed with OR schedule and billing reconciliation.
- All critical validation errors resolved: Completed before final file generation.
- Clinical review of outlier cases completed: Cardiac surgery clinical reviewer completed case review.
- Submission file generated and format-validated: Completed with synthetic package STS-SYN-H1-2026-R1.
- Registry submission portal upload confirmed: Synthetic confirmation retained under STS-SYN-CONF-88412.
