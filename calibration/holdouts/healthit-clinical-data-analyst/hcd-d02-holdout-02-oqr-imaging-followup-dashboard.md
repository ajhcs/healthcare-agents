---
holdout_id: hcd-d02-holdout-02-oqr-imaging-followup-dashboard
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d02
deliverable_title: Registry Submission Validation Report
seed_ref: healthit-clinical-data-analyst/hcd-d02-seed-02-oqr-imaging-followup-dashboard.yaml
scenario_summary: A synthetic ambulatory imaging quality team needs a validation report
  for a non-registry structured submission tied to outpatient quality oversight and
  follow-up recommendation capture.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Hospital Outpatient Quality Reporting Program public resources
- eCQI Resource Center public information on data element mapping and annual specification
  maintenance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Report should still use the registry validation template while clearly naming the
  reporting vehicle and validation scope.
- Validation results should emphasize structured data capture, code mapping, and chart-sample
  reconciliation.
- Benchmark preview should include one operational or comparative rate that could
  plausibly be reviewed before submission.
- Body should be fully completed and concise enough for analyst handoff.
---

# Registry Submission Validation Report

**Registry**: Outpatient imaging follow-up recommendation submission package
**Reporting Period**: Synthetic 2026 Q1
**Submission Deadline**: 2026-04-25
**Analyst**: Eli Navarro

## Volume Summary
| Metric | This Period | Prior Period | % Change | Expected Range |
|--------|------------|-------------|---------|----------------|
| Total cases | 1240 | 1186 | 4.6% | 1160-1285 |
| Cases passing validation | 1226 | 1170 | 4.8% | 1140-1275 |
| Cases with errors | 14 | 16 | -12.5% | 0-19 |
| Error rate | 1.1% | 1.3% | -0.2 pts | <1.5% |

## Validation Results
| Validation Rule | Errors Found | Severity | Root Cause | Resolution |
|----------------|-------------|----------|-----------|-----------|
| Structured follow-up recommendation missing for abnormal imaging impression | 6 | Critical | Six radiology impressions remained in narrative-only workflow after template bypass | Radiologist addenda completed and note template hard-stop restored |
| Duplicate candidate studies on same patient and modality/date | 4 | Warning | Repeat accession feed generated separate rows for corrected studies | Deduplication rule updated to retain final signed accession only |
| Ordering provider not finalized at extract time | 3 | Warning | Interface lag from scheduling to final report sign-off | Shifted final extract to T+1 business day and backfilled provider dimension |
| Follow-up interval outside approved category set | 1 | Critical | Local mapping table missed 6-month interval synonym | Added synonym mapping and reran validation set |

## Data Quality Metrics
| Data Element | Completeness | Accuracy (Sample) | Issue |
|-------------|-------------|-------------------|-------|
| Imaging accession number | 100.0% | 100.0% | Clean |
| Abnormal impression flag | 99.8% | 98.0% | One sample discrepancy corrected in ruleset |
| Structured follow-up category | 99.5% | 96.0% | Narrative-only workflow caused six missing categories |
| Follow-up interval | 99.9% | 98.0% | One synonym mapping defect corrected |
| Ordering provider attribution | 99.4% | 100.0% | Finalized provider lag addressed with later extract |

## Benchmark Preview (Pre-Submission)
| Outcome Measure | Our Rate | National Benchmark | Percentile | Flag |
|----------------|----------|-------------------|-----------|------|
| Structured follow-up recommendation capture | 99.5% |  |  | No |
| Outreach worklist routed within 2 business days | 93.8% | 90.0% internal network benchmark | 67th | No |
| Duplicate-candidate rate | 0.3% | 0.5% internal network benchmark | 72nd | No |

## Sign-Off
- Data extraction validated: completed 2026-04-18 with row-count reconciliation to radiology final report volume
- All critical validation errors resolved: completed 2026-04-19 after template correction and mapping table refresh
- Clinical review of outlier cases completed: radiology quality lead reviewed all six narrative-only abnormal studies
- Submission file generated and format-validated: package `JCOC_OQR_IMGFOLLOWUP_2026Q1_v2.csv` validated on 2026-04-20
- Registry submission portal upload confirmed: synthetic confirmation archived by ambulatory quality operations
