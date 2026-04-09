---
holdout_id: hcd-d01-holdout-01-system-readmissions-executive-spec
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d01
deliverable_title: Quality Measure Performance Dashboard Specification
seed_ref: healthit-clinical-data-analyst/hcd-d01-seed-01-system-readmissions-executive-spec.yaml
scenario_summary: Systemwide readmissions and HAC executive dashboard specification
  for three synthetic hospitals with peer grouping, financial exposure, and restricted
  drill-through to case review.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Hospital Readmissions Reduction Program overview, QualityNet
- CMS Hospital-Acquired Condition Reduction Program overview, QualityNet
- 42 CFR 412.150 through 42 CFR 412.172
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Produce a dashboard specification with completed measure, pipeline, hierarchy, threshold,
  and access-control sections.
- Distinguish HRRP readmission measures from HAC safety measures and reflect that
  one uses readmission ratios while the other uses composite or infection metrics.
- Include thresholds tied to escalation actions and show a PHI-restricted path for
  case review.
- Reflect multi-hospital rollup logic and note any benchmark lag or claims-based timing
  limitations.
---

# Quality Measure Dashboard Specification

**Dashboard Name**: Alder System Readmissions and Safety Command Center
**Owner**: Enterprise Quality and Finance Strategy
**Data Source**: Enterprise Data Warehouse with claims lag mart, Caboodle inpatient mart, and NHSN import tables
**Refresh Frequency**: Monthly official scorecard with weekly surveillance refresh
**Audience**: Board quality committee, CFO, CMOs, hospital presidents

## Measures
| Measure ID | Measure Name | Numerator Definition | Denominator Definition | Target | Benchmark Source |
|-----------|-------------|---------------------|----------------------|--------|-----------------|
| HRRP-AMI | Acute Myocardial Infarction 30-Day Readmission | Indexed AMI discharges followed by unplanned readmission within 30 days under CMS logic | Eligible AMI index discharges for HRRP cohort | Better than peer-group expected ratio | CMS HRRP public reporting |
| HRRP-HF | Heart Failure 30-Day Readmission | Indexed HF discharges followed by unplanned readmission within 30 days | Eligible HF index discharges | Better than peer-group expected ratio | CMS HRRP public reporting |
| HRRP-PN | Pneumonia 30-Day Readmission | Indexed pneumonia discharges followed by unplanned readmission within 30 days | Eligible pneumonia index discharges | Better than peer-group expected ratio | CMS HRRP public reporting |
| HAC-PSI90 | Patient Safety and Adverse Events Composite | Weighted composite score for qualifying discharges | All coded qualifying discharges in AHRQ PSI population | 0.70 or lower | CMS HAC Reduction Program |
| HAC-CLABSI | CLABSI Standardized Infection Ratio | Observed CLABSI events risk-adjusted against predicted events | All reportable central-line-associated surveillance populations | 0.85 or lower | CDC NHSN and CMS HAC |
| HAC-CAUTI | CAUTI Standardized Infection Ratio | Observed CAUTI events risk-adjusted against predicted events | All reportable urinary catheter surveillance populations | 0.90 or lower | CDC NHSN and CMS HAC |

## Data Pipeline
| Step | Source | Transformation | Output | Validation |
|------|--------|---------------|--------|-----------|
| Extract | Caboodle inpatient encounters, coded diagnoses, claims completion tables, NHSN monthly imports | Build index-discharge cohorts, align claims completion windows, and stage infection surveillance files | StgSystemQualityCohort | Monthly hospital census reconciliation and claims completion aging check |
| Transform | StgSystemQualityCohort plus peer-group and benchmark tables | Derive readmission ratios, PSI-90 components, SIR trend lines, and payment exposure estimates | MartSystemQualityScorecard | Volume trend review, duplicate index discharge test, and benchmark file version check |
| Present | MartSystemQualityScorecard | Roll up by system and hospital with financial exposure tiles and drill-through to case-review worklists | Executive dashboard and analyst workbook | CFO tie-out of exposure assumptions and hospital CMO face-validity review |

## Drill-Down Hierarchy
- System
- Hospital
- Program cohort or safety domain
- Service line
- Case-review worklist restricted to authorized quality analysts and physician reviewers

## Alert Thresholds
| Measure | Green | Yellow | Red | Action Required |
|---------|-------|--------|-----|-----------------|
| HRRP AMI, HF, Pneumonia | Better than expected ratio and stable volume | Near peer-group threshold or worsening three-month trend | Penalty exposure indicated in finance model | Open hospital-level readmission reduction review within 5 business days |
| HAC PSI-90 | 0.70 or lower | 0.71 to 0.85 | Above 0.85 | CDI, coding integrity, and patient safety review |
| HAC CLABSI | 0.85 or lower | 0.86 to 1.00 | Above 1.00 | Infection prevention escalation and unit action plan |
| HAC CAUTI | 0.90 or lower | 0.91 to 1.05 | Above 1.05 | Device-utilization review and nursing education follow-up |

## Access Control
| Role | Access Level | PHI Visible |
|------|-------------|------------|
| Board and executive finance users | System and hospital summary | No |
| Hospital presidents and CMOs | Hospital detail and trend | No |
| Quality directors | Service line detail and validated case counts | Limited |
| Quality analysts | Full drill-through to case-review worklists | Yes |
| Physician reviewers | Assigned case-review worklists only | Limited |
