---
exemplar_id: hcd-d01-example-02-mips-primary-care-scorecard
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d01
deliverable_title: Quality Measure Performance Dashboard Specification
scenario_summary: A multispecialty employed physician group needs a MIPS-focused dashboard
  specification for primary care quality and promoting interoperability oversight.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Quality Payment Program public overview and MIPS participation resources
- eCQI Resource Center public information on eCQM logic, CQL, and annual value set
  maintenance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Quality Measure Dashboard Specification

**Dashboard Name**: Silver Fir Medical Group MIPS Performance Dashboard
**Owner**: Ambulatory Quality and Population Health Office
**Data Source**: Enterprise data warehouse sourced from Caboodle ambulatory facts and payer attribution files
**Refresh Frequency**: Weekly every Monday at 06:00 UTC
**Audience**: Physician executives, primary care site medical directors, ambulatory operations

## Measures
| Measure ID | Measure Name | Numerator Definition | Denominator Definition | Target | Benchmark Source |
|-----------|-------------|---------------------|----------------------|--------|-----------------|
| QPP-001 | Quality measure portfolio completion | Clinicians with 6 reportable quality measures including required outcome or high-priority set | All clinicians in the reporting TIN participating in MIPS quality submission | 100.0% | CMS QPP participation guidance |
| CMS122v12 | Diabetes: Hemoglobin A1c Poor Control >9.0% | Patients with most recent HbA1c greater than 9.0% or no test during period | Adults 18-75 with diabetes and qualifying encounters | <=18.0% | CMS QPP benchmark history and internal prior-year performance |
| CMS165v12 | Controlling High Blood Pressure | Patients with adequately controlled blood pressure during measurement period | Adults 18-85 with diagnosis of hypertension | 74.0% | CMS QPP benchmark history |
| PI-HIE-01 | Promoting Interoperability Health Information Exchange | Numerator meeting CMS scoring requirements for electronic referral exchange and receipt/incorporation | MIPS clinicians without applicable exclusions in PI category | 95.0% | CMS QPP PI category guidance |

## Data Pipeline
| Step | Source | Transformation | Output | Validation |
|------|--------|---------------|--------|-----------|
| Extract | Caboodle FactEncounter, FactLabResult, FactFlowsheet, payer attribution roster | Pull active attributed panel, office visits, BP observations, HbA1c results, clinician roster | Staging table `mips_stg_primary_care_weekly` | Clinician count reconciliation to credentialing roster; weekly encounter volume trend |
| Transform | `mips_stg_primary_care_weekly` and clinician dimension | Apply denominator logic, most-recent-result rules, exclusions, and PI numerator rollups | Mart table `mips_mart_exec_site_provider` | Unit tests on age and measurement-period logic; duplicate patient check; measure spot-check in chart |
| Present | `mips_mart_exec_site_provider` | Site and provider scorecards with category-level drilldowns | Tableau workbook `MIPS_PrimaryCare_2026` | Compare weekly rates to prior freeze file; review outliers with ambulatory quality lead |

## Drill-Down Hierarchy
- Organization → region → practice site → clinician → attributed patient action list
- Patient action list is visible only to approved care managers, practice leaders, and analytics staff
- Benchmark cards compare current run rate to prior performance year and current internal target

## Alert Thresholds
| Measure | Green | Yellow | Red | Action Required |
|---------|-------|--------|-----|-----------------|
| Quality portfolio completion | 100.0% | 95.0%-99.9% | <95.0% | Resolve missing measure assignment or submission pathway within 5 business days |
| CMS122v12 poor control rate | <=18.0% | 18.1%-22.0% | >22.0% | Launch panel cleanup and outreach review at site quality huddle |
| CMS165v12 blood pressure control | >=74.0% | 68.0%-73.9% | <68.0% | Review repeat BP workflow, intake documentation, and device calibration |
| PI-HIE-01 | >=95.0% | 90.0%-94.9% | <90.0% | Investigate referral exchange workflow and CEHRT configuration gaps |

## Access Control
| Role | Access Level | PHI Visible |
|------|-------------|------------|
| Medical group executive | System and regional summary | No |
| Site medical director | Site and clinician scorecards, action counts | Limited |
| Care manager | Patient outreach list for assigned site | Yes |
| Ambulatory quality analyst | Full detail, validation tabs, clinician roster mapping | Yes |

## Validation Notes
- HbA1c LOINC mapping must be reconciled quarterly to the laboratory interface crosswalk.
- Blood pressure control logic requires exclusion of readings documented during acute inpatient or urgent observation stays.
- Attributed clinician roster must reconcile to the payroll-effective provider roster each Monday.
- If current QPP policy updates changed category weights or submission requirements, verify scoring assumptions before revising dashboard targets.

## Publication Controls
- Weekly freeze file retained for reproducibility in `mips/weekly_snapshots/2026`.
- Dashboard publish is blocked if any site loses more than 5.0% of expected denominator volume week over week without documented explanation.
- Rate displays always include numerator count, denominator count, and prior-week delta.
