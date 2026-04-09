---
exemplar_id: cpa-d01-example-02-post-acute-pa-aging-log
agent_slug: clinical-prior-authorization-specialist
agents_relevant:
- clinical-prior-authorization-specialist
deliverable_id: cpa-d01
deliverable_title: Prior Authorization Tracking Log
scenario_summary: Hospital-based post-acute authorization log focused on Medicare
  Advantage and Medicaid managed care cases with deadline escalation.
complexity: high
mcp_servers_relevant:
- coverage_determination
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 438.210
- 42 CFR 422.568
- CMS Medicare Advantage prior authorization and coverage criteria guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Prior Authorization Tracking Log

**Facility/Practice**: Harbor Lantern Medical Center Case Management Department
**Reporting Period**: April 2026

## Active PA Requests
| Patient | MRN | Service/CPT | Payer | Submitted | Status | Auth # | Exp Date | Notes |
|---------|-----|-----------|-------|-----------|--------|--------|----------|-------|
| Celine Harrow | HL-882104 | Skilled nursing facility admission | BrightPath Medicare Advantage | 2026-04-01 | Approved | BPMA-2201448 | 2026-04-21 | Functional scores, therapy notes, and discharge plan attached; approval communicated to SNF and registration |
| Orin Vale | HL-882151 | Inpatient rehabilitation facility admission | BrightPath Medicare Advantage | 2026-04-01 | Denied | BPMA-2201783 | 2026-04-03 | Reviewer cited plan functional threshold more restrictive than discharge team's assessment; MA criteria review initiated |
| Juniper Sloane | HL-882190 | Home health RN plus PT services | Meridian State Medicaid MCO | 2026-04-02 | Pending | MSM-6110482 |  | Day 7 follow-up completed; payer acknowledged receipt and no extension requested |
| Evren Pike | HL-882224 | Non-emergent ambulance repetitive transport | Medicare FFS | 2026-04-02 | Approved | MAC-RNAT-34091 | 2026-06-02 | Packet included physician certification and transport necessity statement |
| Ada Mercer | HL-882267 | Outpatient wound VAC DME | Apex Health Plan MA | 2026-04-03 | Pending | AHP-4420086 |  | Coverage packet references wound measurements, debridement history, and home-care limitations |
| Tomas Reef | HL-882291 | SNF admission after hip fracture repair | Summit Harbor Health Plan Commercial | 2026-04-04 | Approved | SHP-PA-780042 | 2026-04-18 | Standard review converted to expedited due to unsafe discharge risk |
| Leora Finch | HL-882330 | Home infusion antibiotics | Meridian State Medicaid MCO | 2026-04-04 | Denied | MSM-6113905 | 2026-04-07 | Denial cited site-of-service mismatch; infectious disease note amended and resubmission sent |
| Bram Huxley | HL-882372 | Inpatient psych transfer | Blue Horizon Medicaid MCO | 2026-04-05 | Approved | BHM-9931450 | 2026-04-15 | Expedited submission documented danger to self and need for higher level of care |
| Oona Crest | HL-882418 | Inpatient rehabilitation facility admission | Apex Health Plan MA | 2026-04-06 | Pending | AHP-4421920 |  | Appeal prep started because payer requested additional ADL scoring after initial packet |
| Kira Noll | HL-882441 | Home oxygen DME | Medicare FFS | 2026-04-07 | Approved | DME-110845 | 2026-07-07 | ABG values and discharge respiratory therapy assessment attached |

## PA Metrics Summary
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------|------------|-----|--------|
| Total PA requests submitted | 58 | 61 | 223 | >0 |
| Initial approval rate | 82.8% | 80.3% | 83.1% | >85% |
| Average turnaround (days) | 2.9 | 3.6 | 3.2 | <3 days |
| Denials received | 10 | 12 | 38 | <15 |
| Appeals filed | 9 | 10 | 34 | >90% |
| Appeal overturn rate | 55.6% | 60.0% | 58.8% | >60% |
| P2P reviews completed | 4 | 6 | 17 | >0 |
| P2P overturn rate | 50.0% | 50.0% | 52.9% | >50% |

## Denial Analysis
| Denial Reason | Count | % | Top Payer | Action Taken |
|--------------|-------|---|-----------|-------------|
| Medical necessity not met | 3 | 30.0% | Apex Health Plan MA | Added rehab packet crosswalk to Medicare criteria and plan denial language |
| Insufficient documentation | 2 | 20.0% | Meridian State Medicaid MCO | Require same-day upload of therapy evaluation, wound measurements, and discharge summary |
| Out-of-network | 1 | 10.0% | Summit Harbor Health Plan Commercial | Verify contracted post-acute facility options before transfer acceptance |
| Service not covered | 1 | 10.0% | Medicare FFS | Escalate to utilization review lead for NCD/LCD confirmation before filing appeal |
| Untimely submission | 3 | 30.0% | BrightPath Medicare Advantage | Added weekend discharge queue coverage and automated due-date escalation |

## Aging and Escalation Notes
- Juniper Sloane home health request reaches Medicaid managed care standard review midpoint on 2026-04-09; if no determination posts, escalation call will be placed with acknowledgment reference retained.
- Orin Vale inpatient rehab denial is being reviewed against Medicare basic benefit coverage criteria because the denial appears to rely on a stricter internal plan threshold.
- Leora Finch home infusion case was corrected within one business day after site-of-service denial; amended packet now includes home infusion capability assessment.
- BrightPath weekend discharge cases drove three untimely submissions in the first week of the month; staffing coverage was revised effective 2026-04-08.
- If MA rehab criteria or post-acute policy rules remain uncertain, verify the current payer policy and CMS guidance before second-level appeal filing.
