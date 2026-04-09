---
exemplar_id: hcd-d01-example-02-multispecialty-mips-dashboard-2026
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d01
deliverable_title: Quality Measure Performance Dashboard Specification
scenario_summary: Multispecialty MIPS performance dashboard specification for a synthetic
  employed medical group spanning quality, interoperability, and improvement activities.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Quality Payment Program overview, qpp.cms.gov
- 42 CFR Part 414 Subpart O
- ONC HTI-1 final rule resources for certified health IT context
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Quality Measure Dashboard Specification

**Dashboard Name**: Pine Harbor Medical Group MIPS Performance Tracker
**Owner**: Ambulatory Quality Programs Office
**Data Source**: Enterprise Data Warehouse with QPP submission mart and Clarity ambulatory extracts
**Refresh Frequency**: Monthly on the fifth business day
**Audience**: Medical group executives, specialty chairs, practice managers

## Measures
| Measure ID | Measure Name | Numerator Definition | Denominator Definition | Target | Benchmark Source |
|-----------|-------------|---------------------|----------------------|--------|-----------------|
| QPP 001 | Diabetes Hemoglobin A1c Poor Control Greater Than 9% | Patients age 18 to 75 with diabetes whose most recent HbA1c during period is greater than 9.0% or no result present | Patients age 18 to 75 with diabetes and qualifying visit | 14.0% or lower | QPP benchmark file |
| QPP 134 | Preventive Care and Screening Influenza Immunization | Patients who received influenza immunization or documented previous receipt | Patients six months and older seen for visit during influenza season | 82.0% | QPP benchmark file |
| QPP 226 | Preventive Care and Screening Tobacco Use Screening and Cessation Intervention | Patients screened for tobacco use and receiving cessation intervention if identified as user | Patients age 12 and older with qualifying encounter | 91.0% | QPP benchmark file |
| PI-HIE | Promoting Interoperability Health Information Exchange | Required numerator actions completed for HIE measure set | Eligible clinician and encounter population in PI reporting period | 85.0% | Internal target aligned to QPP scoring logic |
| IA-PA-1 | Improvement Activity Participation Completion | Documented completion of selected high-weight and medium-weight activities | All clinicians in MIPS APM-eligible practice roster | 100.0% | Internal attestation requirement |

## Data Pipeline
| Step | Source | Transformation | Output | Validation |
|------|--------|---------------|--------|-----------|
| Extract | Clarity ambulatory encounters, immunizations, problem list, smoking history, lab results, provider roster | Attribute visits to TIN and NPI, normalize result dates, align reporting period by measure type | StgMipsEncounter and StgMipsClinician | NPI roster tie-out to credentialing and claims submission files |
| Transform | StgMipsEncounter plus certified measure logic library | Compute quality measure denominator and numerator flags, PI completion counts, and IA status by clinician | MartMipsPerformance | Measure-level volume trend review and 30-record manual sample reconciliation |
| Present | MartMipsPerformance | Score estimation, decile preview, specialty rollups, and missing-data workqueues | Tableau medical group dashboard | Comparison to prior year submission and benchmark file sanity check |

## Drill-Down Hierarchy
- Medical group
- Specialty
- Practice
- Clinician
- Encounter and patient gap list for authorized quality staff

## Alert Thresholds
| Measure | Green | Yellow | Red | Action Required |
|---------|-------|--------|-----|-----------------|
| QPP 001 | 14.0% or lower | 14.1% to 18.0% | Above 18.0% | Endocrine and primary care outreach list to practice managers |
| QPP 134 | 82.0% and above | 76.0% to 81.9% | Below 76.0% | Immunization gap outreach before season close |
| QPP 226 | 91.0% and above | 86.0% to 90.9% | Below 86.0% | Smoking screening workflow audit by specialty |
| PI-HIE | 85.0% and above | 75.0% to 84.9% | Below 75.0% | Escalate interface and workflow defects to ambulatory informatics |
| IA-PA-1 | 100.0% | 95.0% to 99.9% | Below 95.0% | Missing attestation follow-up with practice administrator |

## Access Control
| Role | Access Level | PHI Visible |
|------|-------------|------------|
| CFO and COO | Enterprise score and financial risk summary | No |
| Specialty chair | Specialty and clinician detail | No |
| Practice manager | Practice workqueues and clinician status | Limited |
| Quality program analyst | Full measure detail and gap lists | Yes |
| Compliance reviewer | Audit trail and submission packet access | Limited |

## Scoring Rules
- Quality domain score uses six submitted measures with one outcome or high-priority measure requirement tracked at clinician and group level.
- PI domain reflects the elected continuous 90-day period stored as a dashboard parameter.
- Cost domain is displayed as informational only because CMS calculates it from claims and the dashboard does not estimate final score contribution.
- Dashboard shows preliminary payment adjustment exposure range using internal finance assumptions and last published QPP performance threshold.

## Validation Notes
- Diabetes poor-control logic treats missing HbA1c result as numerator failure and is validated against the QPP measure narrative.
- Influenza measure denominator excludes telehealth-only workflows lacking vaccine administration or documentation path in legacy visit types.
- PI-HIE completion requires certified workflow evidence from interface logs and patient portal exchange events.
- Improvement activity status is sourced from compliance attestation tracker and cross-checked to clinician roster monthly.

## Sources
- CMS Quality Payment Program guidance
- 42 CFR Part 414 Subpart O
- ONC Health Data, Technology, and Interoperability final rule materials
