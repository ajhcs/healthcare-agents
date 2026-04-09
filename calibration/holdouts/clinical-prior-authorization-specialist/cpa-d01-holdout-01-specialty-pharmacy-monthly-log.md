---
holdout_id: cpa-d01-holdout-01-specialty-pharmacy-monthly-log
agent_slug: clinical-prior-authorization-specialist
agents_relevant:
- clinical-prior-authorization-specialist
deliverable_id: cpa-d01
deliverable_title: Prior Authorization Tracking Log
seed_ref: clinical-prior-authorization-specialist/cpa-d01-seed-01-specialty-pharmacy-monthly-log.yaml
scenario_summary: Monthly specialty pharmacy prior authorization tracking log for
  rheumatology, dermatology, and neurology biologic requests.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- NCPDP SCRIPT standard resources
- CMS-0057-F prior authorization API and electronic prior authorization policy materials
- AMA Prior Authorization Reform resources
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Produce a filled tracking log with at least eight active requests across multiple
  payers.
- Include a metrics table and a denial analysis table matching the structure in the
  agent prompt.
- Reflect pharmacy PA realities such as step therapy, specialty pharmacy routing,
  and lab documentation.
- Show concise operational notes without breaking the deliverable structure.
---

# Prior Authorization Tracking Log

**Facility/Practice**: Juniper Reed Rheum & Neuro Center
**Reporting Period**: April 2026

## Active PA Requests
| Patient | MRN | Service/CPT | Payer | Submitted | Status | Auth # | Exp Date | Notes |
|---------|-----|-----------|-------|-----------|--------|--------|----------|-------|
| Soren Vale | JR-510104 | Ustekinumab induction and maintenance | Harbor Crest Commercial | 2026-04-01 | Approved | HCC-RX-218401 | 2026-10-01 | Prior anti-TNF failure and colonoscopy results attached |
| Mira Solt | JR-510155 | Adalimumab biosimilar for rheumatoid arthritis | ApexCare Medicaid MCO | 2026-04-02 | Pending | ACM-PA-771044 |  | RF and anti-CCP labs submitted through ePA portal |
| Elowen Pike | JR-510188 | Erenumab monthly injection for chronic migraine | North Basin PPO | 2026-04-03 | Denied | NBP-RX-309511 | 2026-04-05 | Denial cites inadequate documented preventive therapy trials |
| Dax Hollow | JR-510224 | Ocrelizumab infusion for multiple sclerosis | Blue Summit MA | 2026-04-03 | Approved | BSMA-PA-552104 | 2026-09-30 | MRI and relapse history supported request |
| Talia Crest | JR-510248 | Secukinumab for plaque psoriasis | Harbor Crest Commercial | 2026-04-04 | Pending | HCC-RX-219007 |  | Specialty pharmacy channel confirmation requested by payer |
| Nira Wren | JR-510279 | Tofacitinib for rheumatoid arthritis | North Basin PPO | 2026-04-05 | Denied | NBP-RX-309844 | 2026-04-06 | Missing TB and hepatitis screening labs in original packet |
| Jalen Morrow | JR-510315 | Vedolizumab infusion for Crohn's disease | ApexCare Medicaid MCO | 2026-04-06 | Approved | ACM-PA-772310 | 2026-10-06 | GI note documented steroid dependence and prior biologic intolerance |
| Petra Bell | JR-510349 | Guselkumab for plaque psoriasis | Blue Summit MA | 2026-04-07 | Pending | BSMA-PA-553002 |  | ePA acknowledgment received; specialty pharmacy assignment under review |
| Cora Flint | JR-510388 | Fremanezumab for chronic migraine | Harbor Crest Commercial | 2026-04-08 | Approved | HCC-RX-220114 | 2026-10-08 | Pharmacy PA approved after headache-day log uploaded |

## PA Metrics Summary
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------|------------|-----|--------|
| Total PA requests submitted | 41 | 39 | 158 | >0 |
| Initial approval rate | 87.8% | 86.1% | 86.9% | >85% |
| Average turnaround (days) | 2.3 | 2.8 | 2.5 | <3 days |
| Denials received | 5 | 6 | 21 | <10 |
| Appeals filed | 4 | 5 | 18 | >90% of denials |
| Appeal overturn rate | 62.5% | 60.0% | 61.1% | >60% |
| P2P reviews completed | 1 | 2 | 6 | >0 |
| P2P overturn rate | 100.0% | 50.0% | 66.7% | >50% |

## Denial Analysis
| Denial Reason | Count | % | Top Payer | Action Taken |
|--------------|-------|---|-----------|-------------|
| Medical necessity not met | 1 | 20.0% | North Basin PPO | Added preventive-failure chronology to migraine packet |
| Insufficient documentation | 2 | 40.0% | North Basin PPO | Require TB and hepatitis labs before JAK inhibitor submission |
| Out-of-network | 0 | 0.0% | Harbor Crest Commercial | Network status verified before submission |
| Service not covered | 0 | 0.0% | Blue Summit MA | Coverage check performed before submission |
| Untimely submission | 0 | 0.0% | ApexCare Medicaid MCO | Same-day intake maintained |

## Operational Notes
- The completed draft should preserve the log structure and keep the seeded requests distinctly pharmacy-focused.
- At least one note should show resubmission after missing labs were corrected.
- At least one note should show specialty pharmacy channel reconciliation rather than a generic pending status.
- If live formulary sequence rules are uncertain, verify the current policy before writing denial follow-up actions.
