---
exemplar_id: hcd-d01-example-01-sepsis-ed-throughput-dashboard
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d01
deliverable_title: Quality Measure Performance Dashboard Specification
scenario_summary: A hospital quality team needs a monthly dashboard specification
  for sepsis bundle performance and emergency department throughput trends.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS QualityNet Hospital Inpatient Quality Reporting Program public reporting and
  reporting resources
- eCQI Resource Center guidance for electronic clinical quality measures and annual
  specification updates
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Quality Measure Dashboard Specification

**Dashboard Name**: Northbank General Hospital Quality Scorecard
**Owner**: Quality Analytics and CMO Office
**Data Source**: Caboodle quality mart with Clarity encounter detail reconciliation
**Refresh Frequency**: Monthly on the 5th business day after month close
**Audience**: Executive leadership, quality directors, emergency medicine leadership, inpatient nursing leadership

## Measures
| Measure ID | Measure Name | Numerator Definition | Denominator Definition | Target | Benchmark Source |
|-----------|-------------|---------------------|----------------------|--------|-----------------|
| SEP-1 | Severe Sepsis and Septic Shock Management Bundle | Cases meeting all required bundle elements in the required time windows | Adult inpatient or ED patients abstracted into SEP-1 eligible population | 62.0% | CMS Hospital quality program public resources |
| OP-18b | Median Time from ED Arrival to ED Departure for Discharged ED Patients | Median minutes from ED arrival timestamp to ED departure timestamp for discharged visits | All qualifying outpatient ED visits discharged home or outpatient setting | 165 minutes | CMS Outpatient Quality Reporting resources |
| CMS-871v12 | Severe Obstetric Complications eCQM, structure-only display for pilot tracking | Encounters meeting numerator logic per annual CQL package | Delivery hospitalizations in eligible value sets and age range | 0.0% display target suppressed until governance approval | eCQI Resource Center |
| Internal-QM-CLIN-04 | Sepsis Lactate Result Within 3 Hours | Eligible sepsis cases with resulted lactate within 180 minutes of time zero | ED and inpatient sepsis surveillance cases mapped to local sepsis cohort | 88.0% | Internal benchmark validated against SEP-1 abstraction |

## Data Pipeline
| Step | Source | Transformation | Output | Validation |
|------|--------|---------------|--------|-----------|
| Extract | Clarity PAT_ENC, ED_IEV_EVENT_INFO, ORDER_RESULTS, HSP_ACCOUNT | Pull inpatient and ED encounters for rolling 13 months; derive sepsis surveillance cohort and ED visit timestamps | Staging table `qm_stg_sepsis_ed` | Monthly row count trend versus prior 12 months; 20-chart sample review |
| Transform | `qm_stg_sepsis_ed`, Caboodle FactEncounter, FactLabResult | Calculate denominator eligibility, bundle timing intervals, and median ED throughput | Mart table `qm_mart_exec_quality_monthly` | Unit tests on timing logic; exclusion boundary review; duplicate encounter scan |
| Present | `qm_mart_exec_quality_monthly` | Render scorecards, SPC trend lines, service-line drilldowns, and patient-level exception worklists | Power BI dashboard `QualityScorecard_SepsisED` | Benchmark comparison to prior quarter; executive review sign-off before publish |

## Drill-Down Hierarchy
- Organization → hospital campus → service line → department → attending provider → encounter exception list
- Patient-level drilldown is restricted to quality analysts and approved physician leaders through role-based security
- Executive landing page defaults to aggregate monthly trends with no direct identifiers

## Alert Thresholds
| Measure | Green | Yellow | Red | Action Required |
|---------|-------|--------|-----|-----------------|
| SEP-1 bundle compliance | >=62.0% | 55.0%-61.9% | <55.0% | Review failed elements within 3 business days; escalate to Sepsis Steering Committee if red for 2 months |
| OP-18b median ED departure time | <=165 min | 166-195 min | >195 min | ED operations review of boarding, provider-to-disposition lag, and discharge order timing |
| Sepsis lactate within 3 hours | >=88.0% | 80.0%-87.9% | <80.0% | Charge nurse and ED medical director review missed timestamps and lab routing issues |
| CMS-871v12 pilot completeness | >=95.0% structured capture | 90.0%-94.9% | <90.0% | OB informatics review of documentation template adoption and coded result mapping |

## Access Control
| Role | Access Level | PHI Visible |
|------|-------------|------------|
| Chief executive and board quality committee | Enterprise summary, 13-month trends, benchmark comparisons | No |
| Department chair and service line leader | Department and provider detail, monthly exception counts | Limited |
| Quality analyst | Full measure detail, patient-level exception worklists, validation tabs | Yes |
| Clinical informatics specialist | Data quality views, field-completeness drilldowns, encounter-level troubleshooting | Yes |
| Performance improvement coordinator | Department trend views and remediation status | Limited |

## Visualization Notes
- Landing page shows four KPI tiles, 13-month run charts, and red-threshold alerts.
- SEP-1 view includes element-level fail Pareto: antibiotics timing, blood cultures, repeat lactate, fluid resuscitation, vasopressor timing.
- OP-18b view separates ambulance arrivals from walk-in arrivals to avoid operational masking.
- Data quality tab includes missing arrival timestamp rate, missing time zero flag rate, and duplicate encounter count.

## Validation Notes
- SEP-1 denominator counts must reconcile within 3.0% of abstractor-maintained monthly case log before publication.
- ED throughput encounter count must reconcile to the operational ED census dashboard for the same month.
- Structured lactate result mapping must be checked against active LOINC crosswalk whenever annual lab interface updates occur.
- If current CMS or eCQI specifications changed this quarter, verify measure version and submission-year applicability before revising numerator or denominator logic.

## Operational Ownership
- Monthly refresh owner: Rowan Pike, Quality Analytics Manager, synthetic NPI 1881234501
- Clinical reviewer: Mira Solis, MD, ED Quality Lead, synthetic NPI 1447652308
- Escalation committee: Hospital Quality Council on the second Wednesday of each month
