---
exemplar_id: cpa-d01-example-01-ortho-joint-replacement-log
agent_slug: clinical-prior-authorization-specialist
agents_relevant:
- clinical-prior-authorization-specialist
deliverable_id: cpa-d01
deliverable_title: Prior Authorization Tracking Log
scenario_summary: Monthly outpatient orthopedic and imaging prior authorization log
  for a multispecialty clinic with active follow-up and denial analytics.
complexity: moderate
mcp_servers_relevant:
- coverage_determination
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 422.568
- CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F), published
  January 17, 2024
- CAQH CORE Prior Authorization Operating Rules
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Prior Authorization Tracking Log

**Facility/Practice**: North Maple Specialty Clinic
**Reporting Period**: March 2026

## Active PA Requests
| Patient | MRN | Service/CPT | Payer | Submitted | Status | Auth # | Exp Date | Notes |
|---------|-----|-----------|-------|-----------|--------|--------|----------|-------|
| Mara Keswick | NM-460118 | Total knee arthroplasty / CPT 27447 | UnitedHealthcare Commercial | 2026-03-03 | Approved | UHC-PA-8831042 | 2026-06-30 | Orthopedic note documented Kellgren-Lawrence grade 4 OA, BMI 31, 6 months PT and NSAID failure |
| Lionel Voss | NM-460207 | Lumbar spine MRI / CPT 72148 | Aetna Commercial | 2026-03-05 | Denied | AET-5139087 | 2026-03-19 | Denial cited missing conservative therapy duration; PT discharge summary obtained for appeal |
| Elina Trask | NM-460244 | PET/CT tumor imaging / CPT 78815 | Blue Cross Blue Shield PPO | 2026-03-06 | Approved | BCBS-7714205 | 2026-04-20 | Oncology documentation included pathology, staging, and treatment plan |
| Rowan Bell | NM-460255 | Bariatric surgery / CPT 43775 | Cigna Commercial | 2026-03-07 | Pending | CG-PA-214908 |  | Awaiting behavioral health clearance note and supervised weight-loss program summary |
| Nia Hollis | NM-460301 | Home sleep study / CPT 95800 | Humana Medicare Advantage | 2026-03-10 | Approved | HUM-6627441 | 2026-05-31 | Coverage reviewed against plan sleep testing policy and charted STOP-BANG risk factors |
| Petra Noll | NM-460355 | Infliximab infusion / HCPCS J1745 | Meridian State Medicaid MCO | 2026-03-11 | Pending | MED-PA-990184 |  | Expedited request submitted with CRP trend, colonoscopy report, prior biologic intolerance |
| Dorian Pike | NM-460402 | Inpatient rehabilitation admission | Apex Health Plan MA | 2026-03-12 | Denied | AHP-4409012 | 2026-03-16 | Denial relied on internal functional threshold; case escalated for MA basic benefit criteria review |
| Sela Morrow | NM-460447 | Genetic testing panel / CPT 81479 | Blue Cross Blue Shield PPO | 2026-03-14 | Approved | BCBS-7811044 | 2026-05-14 | Genetics consult, family history, and NCCN-supported indication attached |
| Jaron Flint | NM-460498 | Shoulder arthroscopy / CPT 29827 | UnitedHealthcare Commercial | 2026-03-18 | Pending | UHC-PA-8894201 |  | Portal shows clinical review in progress; operative scheduler notified not to finalize date until approval |
| Talia Wren | NM-460530 | CT angiography chest / CPT 71275 | Aetna Commercial | 2026-03-21 | Approved | AET-5190061 | 2026-04-30 | Expedited pathway used due to worsening exertional symptoms and concern for vascular complication |

## PA Metrics Summary
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------|------------|-----|--------|
| Total PA requests submitted | 126 | 119 | 361 | >0 |
| Initial approval rate | 86.5% | 84.0% | 85.3% | >85% |
| Average turnaround (days) | 2.7 | 3.4 | 3.0 | <3 days |
| Denials received | 17 | 19 | 49 | <20 |
| Appeals filed | 15 | 14 | 42 | >90% of denials |
| Appeal overturn rate | 66.7% | 57.1% | 61.9% | >60% |
| P2P reviews completed | 9 | 7 | 24 | >0 |
| P2P overturn rate | 55.6% | 42.9% | 54.2% | >50% |

## Denial Analysis
| Denial Reason | Count | % | Top Payer | Action Taken |
|--------------|-------|---|-----------|-------------|
| Medical necessity not met | 7 | 41.2% | Aetna Commercial | Added service-line checklist mapping conservative therapy dates and functional scores to policy criteria |
| Insufficient documentation | 4 | 23.5% | UnitedHealthcare Commercial | Standardized packet now requires PT discharge summary and imaging impression for ortho cases |
| Out-of-network | 2 | 11.8% | Cigna Commercial | Confirm network status before scheduling and redirect to contracted facility when clinically appropriate |
| Service not covered | 2 | 11.8% | Blue Cross Blue Shield PPO | Escalate benefit exclusion review before appeal to avoid non-meritorious filings |
| Untimely submission | 2 | 11.8% | Apex Health Plan MA | Added same-day workqueue alert for post-discharge rehab and SNF cases |

## Operational Notes
- Two requests crossed the payer response deadline without written extension; payer escalation logs retained with call reference numbers.
- MA inpatient rehabilitation denial under Apex Health Plan is under review for possible conflict with Medicare coverage criteria for a basic benefit.
- If coverage criteria for bariatric surgery or rehab remain unclear, verify the live payer policy before resubmission or appeal.
- CMS-0057-F timeline updates remain relevant for decision timing and denial specificity expectations in 2026 workflows.
