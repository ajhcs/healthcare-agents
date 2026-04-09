---
exemplar_id: hcd-d02-example-01-cathpci-quarterly-validation-q2
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d02
deliverable_title: Registry Submission Validation Report
scenario_summary: Quarterly ACC NCDR CathPCI validation report for a synthetic tertiary
  cardiac center with chart-reviewed resolutions for mapping defects.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- ACC NCDR CathPCI Registry public overview
- CMS Care Compare public reporting documentation for cardiac catheterization outcomes
- 45 CFR 164.502(b)
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Registry Submission Validation Report

**Registry**: ACC NCDR CathPCI Registry
**Reporting Period**: 2026 Q1 synthetic reporting cycle
**Submission Deadline**: 2026-05-15
**Analyst**: Mara Ivers, Clinical Data Analyst

## Volume Summary
| Metric | This Period | Prior Period | % Change | Expected Range |
|--------|------------|-------------|---------|----------------|
| Total cases | 428 | 411 | 4.1% | 390 to 440 |
| Cases passing validation | 417 | 404 | 3.2% | 385 to 435 |
| Cases with errors | 11 | 7 | 57.1% | 0 to 12 |
| Error rate | 2.6% | 1.7% | 0.9 points | Below 3.0% |

## Validation Results
| Validation Rule | Errors Found | Severity | Root Cause | Resolution |
|----------------|-------------|----------|-----------|-----------|
| Procedure start time after device deployment time | 3 | Critical | One cath lab interface sent local time without DST adjustment for room C2 | Time-zone conversion fixed in staging logic and three records reloaded |
| STEMI first medical contact to device time missing | 2 | Critical | EMS arrival timestamp stored in scanned document rather than structured field | Manual abstraction completed and ED workflow escalation sent |
| Contrast volume outside accepted range | 1 | Warning | Duplicate contrast administration event loaded into Caboodle bridge table | Duplicate event filter added using source event identifier |
| PCI indication inconsistent with diagnosis hierarchy | 2 | Critical | SNOMED-to-registry mapping favored chronic CAD term over acute coronary syndrome term | Mapping table revised and physician reviewer confirmed final coding |
| Discharge status blank | 1 | Critical | One encounter remained open in ADT at extraction cutoff | Encounter re-extracted after coding close |
| Cardiogenic shock status mismatch | 2 | Warning | Hemodynamic support documentation present in narrative note but not discrete flowsheet | Manual review completed and abstraction note added |

## Data Quality Metrics
| Data Element | Completeness | Accuracy (Sample) | Issue |
|-------------|-------------|-------------------|-------|
| Procedure date/time | 100.0% | 100.0% | Clean after DST correction |
| STEMI arrival time | 98.6% | 96.0% | Two missing structured timestamps required manual abstraction |
| PCI indication | 100.0% | 94.0% | Acute vs chronic CAD terminology mapping revised |
| Contrast volume | 99.8% | 100.0% | One duplicate administration event removed |
| Cardiogenic shock status | 99.5% | 92.0% | Two cases required clinical adjudication |
| Discharge disposition | 100.0% | 100.0% | Clean after final ADT close |

## Benchmark Preview (Pre-Submission)
| Outcome Measure | Our Rate | National Benchmark | Percentile | Flag |
|----------------|----------|-------------------|-----------|------|
| Door-to-balloon within target for direct-arrival STEMI PCI | 91.8% | 93.5% | 43rd | Watch |
| Bleeding event rate risk-adjusted | 2.1% | 2.4% | 61st | No |
| Acute kidney injury rate risk-adjusted | 5.8% | 5.1% | 39th | Watch |
| Mortality risk-adjusted | 1.3% | 1.5% | 57th | No |

## Sign-Off
- Data extraction validated: Yes. Encounter count reconciled to cath lab schedule, billing procedure volume, and physician log within 0.7%.
- All critical validation errors resolved: Yes. Eight critical issues closed before file generation.
- Clinical review of outlier cases completed: Yes. Interventional cardiology champion reviewed all STEMI timing and shock-status outliers.
- Submission file generated and format-validated: Yes. Final registry flat file passed portal precheck on 2026-04-27.
- Registry submission portal upload confirmed: Yes. Synthetic confirmation ID CATHPCI-SYN-2026Q1-4417 retained in submission archive.

## Extraction and Validation Notes
- Source extraction used Clarity procedural logs, hemodynamics flowsheets, ED arrival events, medication administrations, and final coded discharge diagnoses.
- Patient identifiers in working files used synthetic MRNs in the S900000 to S909999 range with direct identifiers removed from analyst review exports.
- A 25-case manual chart sample covered elective PCI, NSTEMI PCI, STEMI PCI, shock, transfer-in, and aborted procedure scenarios.
- Duplicate detection logic used PAT_ENC_CSN_ID plus procedure room timestamp plus accession number to prevent duplicate denominator cases.
- All transformation scripts are versioned in the registry repository under release tag cathpci-2026q1-r2.

## Open Monitoring Items
- STEMI first medical contact capture remains dependent on EMS structured documentation compliance and will be trended weekly in Q2.
- Acute kidney injury rate remains above internal goal despite passing validation; clinical review packet sent to cath lab quality committee.

## Sources
- ACC NCDR public registry overview
- CathPCI public reporting context through CMS Care Compare
- HIPAA minimum necessary standard at 45 CFR 164.502(b)
