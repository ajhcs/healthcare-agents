---
holdout_id: qrm-d01-holdout-01-enterprise-risk-heatmap
agent_slug: quality-risk-manager
agents_relevant:
- quality-risk-manager
deliverable_id: qrm-d01
deliverable_title: Enterprise Risk Register
seed_ref: quality-risk-manager/qrm-d01-seed-01-enterprise-risk-heatmap.yaml
scenario_summary: A multi-site physician network needs a board-ready risk register
  covering cyber, credentialing, reserves, and telehealth expansion.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.21
- OIG General Compliance Program Guidance (2023)
- AHRQ PSO / patient-safety resources
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact Enterprise Risk Register structure from the prompt template with filled
  synthetic values.
- Show all major risk domains with clear scores and mitigation owners.
- Keep the board-facing language concise and operational.
---
# Enterprise Risk Register

**Organization**: Lakeview Physician Network
**Assessment Period**: 2026
**Risk Manager**: Amira Khan, MBA
**Last Updated**: 2026-04-09

| # | Risk Domain | Risk Description | Likelihood (1-5) | Impact (1-5) | Risk Score | Response Strategy | Mitigation Actions | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Technology | Phishing and credential theft could expose patient records and payment systems. | 4 | 5 | 20 | Mitigate | MFA refresh and simulated phishing | IT security lead | Open |
| 2 | Compliance | Telehealth clinicians may practice across states without current licensure review. | 4 | 4 | 16 | Mitigate | Monthly licensure audit and roster lock | Medical staff office | Open |
| 3 | Financial | Claims reserves may lag actual severity if litigation trends shift. | 3 | 5 | 15 | Transfer/Mitigate | Quarterly reserve review with counsel | Risk manager | Open |
| 4 | Operational | Credentialing turnaround may slow new provider onboarding. | 4 | 4 | 16 | Mitigate | Dedicated credentialing queue and weekly dashboard | Credentialing manager | Open |
| 5 | Strategic | Rapid telehealth growth may outpace staffing and patient access design. | 3 | 4 | 12 | Mitigate | Capacity planning and access review | Operations director | Open |
| 6 | Clinical | Cross-site handoff inconsistency may increase post-discharge defects. | 3 | 4 | 12 | Mitigate | Standard handoff checklist | Quality lead | Open |
| 7 | Hazard | Clinic-space interruptions or utility outages could affect weekend access. | 2 | 3 | 6 | Accept | Business continuity test twice annually | Facilities manager | Monitoring |

## Risk Heat Map Summary
|  | Impact 1 (Negligible) | Impact 2 (Minor) | Impact 3 (Moderate) | Impact 4 (Major) | Impact 5 (Catastrophic) |
|---|---|---|---|---|---|
|  | 1 | 2 | 3 | 4 | 5 |
| 5 | 0 | 0 | 1 | 1 | 1 |
| 4 | 0 | 0 | 1 | 2 | 1 |
| 3 | 0 | 1 | 1 | 1 | 1 |
| 2 | 0 | 0 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 | 0 |

## Top Risks and Actions
| Risk | Why It Matters | Immediate Action | Owner | Timeline |
|---|---|---|---|---|
| Cybersecurity | A single compromised mailbox can expose PHI and disrupt billing. | Require MFA reset and simulation training | IT security lead | 30 days |
| Credentialing backlog | Delayed credentialing slows onboarding and revenue | Publish weekly queue and aging report | Credentialing manager | 14 days |
| Telehealth licensure | Cross-state practice risk can create compliance exposure | Lock roster until licensure review is current | Medical staff office | 14 days |

## Notes
- The register is intended for quarterly board review and monthly management follow-up
- Response strategies include avoid, mitigate, transfer, and accept only when residual risk is explicitly documented
