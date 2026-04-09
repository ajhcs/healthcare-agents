---
holdout_id: prs-d02-holdout-01-idr-batch-eligibility-review
agent_slug: payer-relations-specialist
agents_relevant:
- payer-relations-specialist
deliverable_id: prs-d02
deliverable_title: No Surprises Act Dispute Tracker
seed_ref: payer-relations-specialist/prs-d02-seed-01-idr-batch-eligibility-review.yaml
scenario_summary: A multi-facility NSA review that tests whether the team can keep
  batching valid while separating emergency cases from facility-based disputes and
  tracking payer behavior cleanly.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- CMS No Surprises Act Independent Dispute Resolution Process, https://www.cms.gov/nosurprises/independent-dispute-resolution-process
- eCFR Title 45 Part 149, https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-B/part-149
- CMS IDR guidance and reporting pages, https://www.cms.gov/nosurprises
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The summary must distinguish emergency claims from non-emergency claims at in-network
  facilities.
- The tracker must call out batching ineligibility, notice-and-consent timing issues,
  and payer-specific settlement behavior.
- The financial section must reconcile billed charges, initial payments, negotiation
  recovery, IDR recovery, and unrecovered balance.
- Recommendations must be operational, not legalistic, and should target the intake
  and filing workflow.
---

# NSA Dispute Tracking Report — Q1 2026

**Organization**: Willow Creek Anesthesia and Imaging  
**Reporting Period**: 2026-01-01 to 2026-03-31  
**Analyst**: Tessa Nguyen

## Summary Statistics
| Metric | Emergency | Non-Emergency (In-Net Facility) | Total |
|--------|-----------:|---------------------------------:|------:|
| Total OON claims | 286 | 244 | 530 |
| Initial payer payment (mean % billed) | 11% | 14% | 12% |
| Open negotiations initiated | 252 | 211 | 463 |
| Settled in open negotiation | 138 | 103 | 241 |
| IDR cases initiated | 74 | 55 | 129 |
| IDR cases won (provider) | 51 | 35 | 86 |
| IDR cases lost (payer) | 23 | 20 | 43 |
| Average recovery (% Medicare) | 152% | 146% | 149% |

## By Payer
| Payer | OON Claims | Avg Initial Payment | IDR Cases | Win Rate | Avg Recovery |
|-------|-----------:|--------------------:|----------:|---------:|-------------:|
| SummitGate Health | 219 | $1,180 (11% billed) | 58 | 72% | $9,140 |
| Northline Select | 173 | $1,420 (14% billed) | 42 | 59% | $8,760 |
| Prairie Summit Plan | 138 | $1,610 (15% billed) | 29 | 69% | $9,480 |

## Financial Impact
| Metric | Amount |
|--------|-------:|
| Total billed charges (OON claims) | $8,640,000 |
| Initial payer payments received | $1,034,200 |
| Additional recovery via negotiation | $498,600 |
| Additional recovery via IDR | $836,900 |
| **Total recovered** | **$2,369,700** |
| Balance billing collected (where permitted) | $742,100 |
| Unrecovered balance | $5,528,200 |

## Operational Findings
- Emergency claims made up the larger negotiation volume, but the strongest settlements came from the radiology batches tied to higher-acuity episodes.
- Northline Select had the highest count of ineligible batch attempts because claim-line grouping did not consistently match the same service-area rule.
- Prairie Summit Plan settled quickly in open negotiation when the packet included remittance date, coding summary, and QPA comparison on the first submission.
- Elective facility-based cases with late consent forms should not be included in the same workflow as clean NSA disputes.
- The tracker should treat negative portal outcomes, ineligible batches, and late filings as separate failure modes.

## Recommendations
- Split the queue into emergency, elective facility-based, and ineligible-candidate worklists before filing.
- Require batch validation by payer, provider, service area, and related-service logic before any portal submission.
- Standardize the initial negotiation packet so every case includes the same claim IDs, remittance dates, and offer rationale.
- Escalate Northline Select for contract review because its low settlement rate and ineligible-batch pattern are operationally connected.

## Sources Reviewed
- CMS No Surprises Act Independent Dispute Resolution Process
- eCFR Title 45 Part 149
- CMS IDR guidance and reporting pages
