---
exemplar_id: hcd-d02-example-01-cathpci-quarterly-validation
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d02
deliverable_title: Registry Submission Validation Report
scenario_summary: A cardiovascular analytics team needs a quarterly validation report
  for a synthetic CathPCI registry submission with pre-submission error resolution
  and benchmark preview.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- ACC NCDR public overview of CathPCI Registry data collection and benchmarking
- CMS Quality Payment Program and quality reporting public guidance for defensible
  submission and audit documentation practices
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Registry Submission Validation Report

**Registry**: ACC NCDR CathPCI Registry
**Reporting Period**: Synthetic 2026 Q1
**Submission Deadline**: 2026-05-15
**Analyst**: Jalen Mercer, Clinical Data Analyst

## Volume Summary
| Metric | This Period | Prior Period | % Change | Expected Range |
|--------|------------|-------------|---------|----------------|
| Total cases | 428 | 417 | 2.6% | 395-445 |
| Cases passing validation | 416 | 403 | 3.2% | 390-440 |
| Cases with errors | 12 | 14 | -14.3% | 0-15 |
| Error rate | 2.8% | 3.4% | -0.6 pts | <3.0% |

## Validation Results
| Validation Rule | Errors Found | Severity | Root Cause | Resolution |
|----------------|-------------|----------|-----------|-----------|
| PCI-VAL-014 Contrast volume missing when fluoroscopy documented | 4 | Critical | Interface mapping excluded structured contrast field from two cath lab rooms after build update | Restored source mapping, reloaded affected encounters, revalidated all March procedures |
| PCI-VAL-031 STEMI symptom onset later than device activation | 3 | Warning | Abstractor entered arrival time in symptom onset field for overnight transfers | Corrected source rows after chart review and abstractor feedback |
| PCI-VAL-042 Discharge medications incomplete for P2Y12 inhibitor | 2 | Critical | Medication reconciliation status finalized after nightly extract cutoff | Moved extract to T+2 business days for final pull and reran affected cases |
| PCI-VAL-077 Duplicate procedure identifier | 2 | Critical | One merged encounter carried both original and replacement case IDs from scheduling feed | Applied deduplication rule keyed on accession number plus procedure start timestamp |
| PCI-VAL-101 Height or weight outlier | 1 | Warning | Pounds incorrectly loaded into kilograms for a single record | Corrected transformed weight logic and confirmed no additional unit-conversion defects |

## Data Quality Metrics
| Data Element | Completeness | Accuracy (Sample) | Issue |
|-------------|-------------|-------------------|-------|
| Arrival date/time | 100.0% | 100.0% | Clean |
| STEMI symptom onset time | 97.7% | 94.0% | Transfer cases require targeted chart review due to narrative source variability |
| Contrast volume | 99.1% | 100.0% | March room-mapping defect corrected before submission |
| Culprit vessel | 100.0% | 98.0% | One abstractor misclassified branch lesion; coaching completed |
| Discharge aspirin status | 99.8% | 100.0% | Clean |
| P2Y12 inhibitor at discharge | 99.5% | 96.0% | Two late-finalized medication reconciliation records corrected |
| Procedure identifier uniqueness | 99.5% | 100.0% | Duplicate scheduling keys removed |

## Benchmark Preview (Pre-Submission)
| Outcome Measure | Our Rate | National Benchmark | Percentile | Flag |
|----------------|----------|-------------------|-----------|------|
| Risk-adjusted bleeding | 2.7% | 3.1% | 63rd | No |
| Door-to-balloon within 90 minutes, direct arrivals | 91.4% | 88.6% | 71st | No |
| Discharge on statin | 96.9% | 95.2% | 68th | No |
| Acute kidney injury post PCI | 6.2% | 4.9% | 29th | Yes |
| Same-admission mortality | 1.8% | 1.9% | 52nd | No |

## Sign-Off
- Data extraction validated: completed 2026-04-28 with case count reconciliation to cath lab scheduling log and professional billing feed
- All critical validation errors resolved: completed 2026-04-30 after reload of 12 impacted records
- Clinical review of outlier cases completed: interventional cardiology champion reviewed 9 acute kidney injury cases on 2026-05-02
- Submission file generated and format-validated: CathPCI submission package `NBGH_CathPCI_2026Q1_v3.csv` passed registry validator on 2026-05-03
- Registry submission portal upload confirmed: synthetic portal confirmation archived under `registry/cathpci/2026q1/final`

## Reconciliation Summary
- Cath lab schedule log count: 431 procedures
- Registry-eligible cases after exclusion of peripheral-only interventions: 428 procedures
- Professional billing cross-check: 428 qualifying CPT-linked PCI cases after exclusion review
- Manual review sample: 25 records stratified by STEMI, NSTEMI, elective PCI, and transfer-in status

## Key Risks Before Final Close
- Acute kidney injury performance is materially worse than internal target and requires immediate renal protection workflow review.
- Transfer-in symptom onset documentation remains the least reliable structured element and should stay on the focused audit list next quarter.
- Medication reconciliation timing can still affect discharge-medication fields if the final extract is advanced too early.

## Recommended Follow-Up
- Lock the final registry extraction to T+2 business days after quarter close until discharge medication completeness exceeds 99.8% for two consecutive quarters.
- Add automated room-level contrast volume completeness monitoring to the cath lab interface validation suite.
- Review contrast-sparing protocol adherence in the 9 flagged acute kidney injury cases with the cath lab quality committee.
- If current ACC or CMS-linked public program expectations changed this cycle, verify whether benchmark methodology or linked public reporting rules were updated before external presentation.
