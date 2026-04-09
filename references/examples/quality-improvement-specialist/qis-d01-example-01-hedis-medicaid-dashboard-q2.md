---
exemplar_id: qis-d01-example-01-hedis-medicaid-dashboard-q2
agent_slug: quality-improvement-specialist
agents_relevant:
- quality-improvement-specialist
deliverable_id: qis-d01
deliverable_title: Quality Measure Performance Dashboard
scenario_summary: A Medicaid HEDIS dashboard summarizes mid-cycle performance, benchmark
  gaps, and data quality risks for preventive and chronic care measures.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'NCQA HEDIS overview and measure-year resources: https://www.ncqa.org/hedis/'
- 'CMS Medicare Star Ratings overview: https://www.cms.gov/medicare/quality/star-ratings'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Quality Measure Performance Dashboard

**Organization**: Juniper Vale Health Plan
**Product Line / Reporting Program**: HEDIS Medicaid
**Measurement Year**: 2025
**Report Date**: 2026-04-09
**Prepared By**: Elara Quist, CPHQ

## Performance Summary
| Measure ID | Measure Name | Denominator | Numerator | Rate | Benchmark (50th) | Benchmark (90th) | Trend vs PY | Gap to Goal |
|------------|-------------|-------------|-----------|------|------------------|------------------|-------------|-------------|
| BCS-E | Breast Cancer Screening | 8,420 | 5,642 | 67.0% | 69.5% | 78.9% | +2.8 pts | 11.9 pts |
| COL-E | Colorectal Cancer Screening | 10,115 | 6,082 | 60.1% | 61.8% | 72.4% | +3.9 pts | 12.3 pts |
| CBP | Controlling High Blood Pressure | 6,084 | 3,447 | 56.7% | 60.4% | 71.0% | +1.1 pts | 14.3 pts |
| KED | Kidney Health Evaluation for Patients with Diabetes | 4,238 | 2,497 | 58.9% | 57.2% | 72.0% | +6.0 pts | 13.1 pts |
| WCV | Child and Adolescent Well-Care Visits | 14,506 | 10,734 | 74.0% | 72.1% | 83.8% | +4.4 pts | 9.8 pts |
| FUH 7-Day | Follow-Up After Hospitalization for Mental Illness | 1,164 | 664 | 57.0% | 60.0% | 73.2% | -1.6 pts | 16.2 pts |
| AIS-E | Adult Immunization Status | 9,772 | 4,512 | 46.2% | 49.8% | 66.4% | +5.5 pts | 20.2 pts |

## Measures Below Benchmark
| Measure | Current Rate | Target Rate | Gap | Root Cause | Improvement Action | Owner | Timeline |
|---------|-------------|-------------|-----|------------|-------------------|-------|----------|
| BCS-E | 67.0% | 78.9% | 11.9 pts | Mammography results arriving late from two imaging affiliates; incomplete supplemental feed mapping | Reconcile imaging interfaces, add weekly gap file to PCP panel review, launch mobile mammography outreach | Director of Quality Ops | 90 days |
| COL-E | 60.1% | 72.4% | 12.3 pts | FIT results captured in free text at three FQHC partners; claims lag for colonoscopy encounters | Standardize structured lab result feed and refresh specialist claims supplement twice monthly | Population Health Analytics Lead | 120 days |
| CBP | 56.7% | 71.0% | 14.3 pts | Blood pressure values missing from discrete fields in community clinic EHR; low repeat visit closure | Provider education on structured vitals entry, nurse-led recheck workflow, targeted hypertension registry outreach | Medical Director, Value Programs | 60 days |
| FUH 7-Day | 57.0% | 73.2% | 16.2 pts | Behavioral health discharge roster delayed; appointment capacity tight in two counties | Daily ADT roster, reserved post-discharge slots, tele-behavioral bridge visits | Behavioral Health QI Manager | 45 days |
| AIS-E | 46.2% | 66.4% | 20.2 pts | State registry interface incomplete for adult vaccine history; pharmacy claims not fully matched | Complete registry reconciliation and add retail pharmacy vaccine load to monthly closure run | Immunization Program Manager | 75 days |

## Measures At or Above Benchmark
| Measure | Current Rate | Benchmark Percentile | Sustain Strategy |
|---------|-------------|---------------------|-----------------|
| KED | 58.9% | Above 50th | Keep nephropathy lab interface active, preserve diabetic registry prompts, review denominator drift monthly |
| WCV | 74.0% | Above 50th | Maintain text reminders, school-season outreach, and monthly pediatric panel performance review |

## Data Quality Notes
- Claims lag status: Professional claims are 24 days behind final adjudication; facility claims are 19 days behind.
- Supplemental data feeds: Active for labs, immunization registry, and ADT; mammography affiliate feed is under remediation.
- Medical record chase status: Hybrid chase strategy configured for eligible measures; current abstraction completion is 61%.
- Known data quality issues: One imaging affiliate uses a local code map not yet aligned to the current value set; three FQHC sites still send FIT documentation in narrative fields.
- Denominator integrity: Continuous enrollment logic validated on a 50-member audit sample with no material variances.
- Stratification readiness: Race and ethnicity stratification file passed completeness review for CBP, WCV, BCS-E, COL-E, KED, and FUH.
- Operational priority: Focus the next executive review on AIS-E, FUH, and CBP because each has a wide rate gap and a viable workflow fix within one quarter.
