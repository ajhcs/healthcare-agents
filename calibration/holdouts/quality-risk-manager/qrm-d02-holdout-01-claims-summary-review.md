---
holdout_id: qrm-d02-holdout-01-claims-summary-review
agent_slug: quality-risk-manager
agents_relevant:
- quality-risk-manager
deliverable_id: qrm-d02
deliverable_title: Claims Summary Report
seed_ref: quality-risk-manager/qrm-d02-seed-01-claims-summary-review.yaml
scenario_summary: A specialty group needs a claims summary that turns carrier data
  into board-level risk signals and lessons learned.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- AHRQ patient safety and risk resources
- 42 CFR 482.21
- OIG compliance and risk guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact Claims Summary Report structure from the prompt template with filled
  synthetic values.
- Preserve confidentiality tone while remaining board-ready.
- Quantify open and closed claims with enough detail to support trend discussion.
---
# Claims Summary Report

**Organization**: Eastgate Specialty Physicians
**Reporting Period**: Q1 2026
**Prepared By**: Olivia Hart, RN, JD

## Open Claims
| Claim # | Date of Loss | Claimant | Allegation | Facility | Specialty | Severity | Reserve | Status | Defense Counsel |
|---|---|---|---|---|---|---|---|---|---|
| CLM-2601 | 2026-01-08 | Maria L. | Postoperative infection after hip arthroscopy | Summit Surgical Center | Orthopedics | High | $450,000 | Open | Hale & Price |
| CLM-2607 | 2026-02-11 | Robert T. | Delayed diagnosis and transfer | Summit Orthopedic Clinic | Orthopedics | High | $300,000 | Open | Hale & Price |
| CLM-2611 | 2026-03-02 | Ava S. | Medication error during infusion | Summit Infusion Center | Oncology | Medium | $125,000 | Open | Bennett Law |

## Closed Claims (This Period)
| Claim # | Date of Loss | Resolution | Indemnity Paid | Defense Costs | Lessons Learned |
|---|---|---|---|---|---|
| CLM-2544 | 2025-09-17 | Settled | $210,000 | $42,000 | Medication reconciliation needs stronger pharmacy sign-off |
| CLM-2551 | 2025-10-28 | Dismissed | $0 | $18,000 | Documentation showed appropriate informed consent |
| CLM-2559 | 2025-11-12 | Settled | $95,000 | $24,000 | Escalation delay came from incomplete after-hours handoff |

## Trending
- New claims filed this period: 3
- Claims closed this period: 3
- Total open claims: 7
- Total reserves (all open claims): $1.28M
- Average indemnity (closed claims, rolling 3 years): $176K
- Top allegation categories: postoperative infection, delayed diagnosis, medication error

## Insurance Program Status
- Policy period: 2026-01-01 to 2027-01-01
- Premium: $1.9M
- SIR/deductible: $250K
- Claims within SIR this period: $125K
- Renewal strategy: tighten medication and transfer protocols before the July renewal meeting

## Recommendations for Risk Leadership
- Continue monthly claims trending by specialty and site.
- Prioritize infection and delayed-diagnosis defense reviews for orthopedics.
- Share a one-page lesson-learned summary with the board risk committee.
