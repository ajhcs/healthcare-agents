---
holdout_id: ccm-d02-holdout-01-psych-boarding-report-holdout
agent_slug: clinical-case-manager
agents_relevant:
- clinical-case-manager
deliverable_id: ccm-d02
deliverable_title: Avoidable Day Report
seed_ref: clinical-case-manager/ccm-d02-seed-01-psych-boarding-report-holdout.yaml
scenario_summary: Service-line report focuses on psychiatric boarding and medical-clearance
  delays for patients with co-occurring medical and behavioral health needs.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.43 Hospital discharge planning requirements
- CMS Conditions of Participation interpretive guidance for discharge planning
- Public state and federal behavioral health boarding policy discussions and hospital
  operations literature
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Quantify psych-boarding pressure distinctly from other avoidable day causes.
- Show financial and operational interpretation, not only a table dump.
- Include recommendations that connect case management, behavioral health coordination,
  and escalation workflow.
- Preserve the deliverable template structure while adding concise operational detail.
---

# Avoidable Day Analysis

**Facility**: Stonebank Medical Center
**Reporting Period**: February 2026

## Summary
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------|------------|-----|--------|
| Total patient days | 3,944 | 3,821 | 7,765 |  |
| Avoidable days identified | 121 | 93 | 214 |  |
| Avoidable day rate (%) | 3.1% | 2.6% | 2.8% | <5% |
| Avg avoidable days per affected case | 2.9 | 2.3 | 2.6 |  |

## Avoidable Days by Cause
| Cause Category | Days | % of Total | Trend | Action |
|---------------|------|-----------|-------|--------|
| Post-acute placement | 18 | 15% | Up | Add dual-diagnosis referral huddle with social work and behavioral health intake |
| Payer authorization delay | 11 | 9% | Flat | Escalate residential and rehab denials within 24 hours |
| Physician/clinical | 13 | 11% | Down | Standardize medical-clearance note elements |
| Patient/family | 9 | 7% | Flat | Increase early family meeting use for commitment and placement disputes |
| Social/housing | 22 | 18% | Up | Expand medical respite and shelter coordination workflow |
| Testing/procedure | 5 | 4% | Down | Maintain same-day ancillary escalation |
| Psychiatric boarding | 43 | 36% | Up | Daily registry check, leadership escalation at 24 boarding hours, diversion review twice daily |

## Financial Impact
- Estimated cost per avoidable day: $689
- Total avoidable day cost this period: $83,369
- Revenue at risk from LOS outlier cases: $176,500

## Recommendations
1. Create a psych-boarding command pathway that starts with daily bed-registry outreach and escalates to hospital leadership once a medically cleared patient exceeds 24 boarding hours.
2. Require a standardized medical-clearance packet for psychiatric transfer candidates so receiving facilities do not reject incomplete referrals.
3. Pair case management and behavioral health social work on all dual-diagnosis cases within one day of admission to reduce late-placement failures.

## Operational Detail
- Psychiatric boarding accounted for the largest single cause of avoidable days and rose materially from the prior month.
- Twelve of the boarding days involved patients with co-occurring substance use disorder and active medical follow-up needs that narrowed placement options.
- Guardianship or surrogate decision delays contributed to several prolonged stays and should be flagged earlier in the admission.
- Social barrier days clustered in patients needing shelter, respite, or supervised placement after psychiatric stabilization.
- Physician-related delays improved after inpatient teams began using a clearer medical-clearance note.

## Leadership Interpretation
- The overall rate remains below the target, but the concentration in psychiatric boarding makes this a safety and throughput issue rather than a routine LOS variance.
- The service should treat boarding as its own monitored category because it drives ED throughput pressure, inpatient bed blockage, and staff escalation burden.
- Immediate operational value will come from earlier dual-diagnosis planning, tighter transfer packets, and a visible escalation threshold for medically cleared patients.
