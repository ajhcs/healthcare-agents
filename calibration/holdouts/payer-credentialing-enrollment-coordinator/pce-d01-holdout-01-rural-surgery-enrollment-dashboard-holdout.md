---
holdout_id: pce-d01-holdout-01-rural-surgery-enrollment-dashboard-holdout
agent_slug: payer-credentialing-enrollment-coordinator
agents_relevant:
- payer-credentialing-enrollment-coordinator
deliverable_id: pce-d01
deliverable_title: Provider Credentialing Status Dashboard
seed_ref: payer-credentialing-enrollment-coordinator/pce-d01-seed-01-rural-surgery-enrollment-dashboard-holdout.yaml
scenario_summary: Status dashboard for a rural surgery expansion with mixed effective
  dates, pending reassignment fixes, and one provider held from go-live.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS PECOS and Medicare enrollment resources
- 42 CFR 424.520 and 42 CFR 424.515
- NCQA ongoing monitoring requirements, effective July 1, 2025
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Include a clear go-live risk signal showing that one surgeon cannot start because
  payer enrollment is incomplete.
- Differentiate credentialed status from payer enrollment status across at least six
  payer columns.
- Show revalidation tracking for both an entity and an individual provider.
- Use action items with deadlines and owners that reflect enrollment operations.
---

# Provider Credentialing & Enrollment Status Dashboard

**Organization**: High Desert Surgical Partners
**Report Date**: 2026-04-09
**Total Active Providers**: 11
**Providers in Credentialing Pipeline**: 4

## Credentialing Status Summary
| Status | Count | % |
|--------|-------|---|
| Fully credentialed & enrolled (all payers) | 5 | 45% |
| Credentialed, enrollment pending (1+ payers) | 3 | 27% |
| Initial credentialing in process | 2 | 18% |
| Recredentialing due (next 90 days) | 1 | 9% |
| Action required (expired credential or missing document) | 1 | 9% |

## Expiring Credentials (Next 90 Days)
| Provider | Credential | Expiration Date | Status | Action Required |
|----------|-----------|----------------|--------|----------------|
| Dr. Oren Pike | CAQH Attestation | 2026-04-21 | Reminder sent day 102 | Re-attest by 2026-04-17 |
| Dr. Sela Arden | Malpractice Policy | 2026-05-15 | Renewal proposal received | Secure binder before payer follow-up package |
| Dr. Juno Vale | Wyoming License | 2026-05-31 | Renewal started | Save board verification when posted |
| Dr. Kira Sol | DEA | 2026-06-12 | Renewal not filed | Submit renewal this month |

## Payer Enrollment Status
| Provider | Medicare | Medicaid | Blue Peak | Summit Choice | Aetna | Cigna | Frontier Community Plan |
|----------|---------|----------|----------|---------------|-------|-------|------------------------|
| Dr. Juno Vale | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dr. Kira Sol | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dr. Oren Pike | ✅ | ✅ | ✅ | ⏳ | ✅ | ⏳ | ✅ |
| Dr. Sela Arden | ❌ PECOS returned | ⏳ | ⏳ | ⏳ | ❌ file on hold | ⏳ | ⏳ |
| Dr. Teren Moss | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Dr. Lyra Fen | ✅ | ✅ | ✅ | ✅ | ⏳ | ✅ | ✅ |

## Revalidation Tracker
| Provider/Entity | PECOS ID | Revalidation Due | Status | Days Remaining |
|----------------|----------|------------------|--------|----------------|
| High Desert Surgical Partners LLC | 5P3L77R2 | 2026-07-01 | In progress | 83 |
| Dr. Lyra Fen | 9C6B24M8 | 2026-06-24 | Not started | 76 |
| Dr. Kira Sol | 2D8V15Q1 | 2026-10-10 | Complete 2026-03-26 | 184 |

## Action Items
| Priority | Provider | Issue | Action | Deadline | Owner |
|----------|----------|-------|--------|----------|-------|
| CRITICAL | Dr. Sela Arden | PECOS returned due to omitted reassignment to group TIN; provider scheduled for cases on 2026-04-20 | Correct CMS-855I reassignment section and re-submit through PECOS; hold go-live until active effective dates are confirmed | 2026-04-10 | Medicare enrollment lead |
| CRITICAL | Dr. Sela Arden | Aetna file held pending active Medicare reassignment | Send updated PECOS receipt and revised go-live plan to payer analyst after resubmission | 2026-04-11 | Commercial enrollment coordinator |
| HIGH | Dr. Oren Pike | CAQH attestation expires in 12 days | Re-attest and confirm all payer authorizations remain active | 2026-04-17 | Provider liaison |
| HIGH | Dr. Teren Moss | Initial credentialing PSV still open on training verification | Obtain fellowship verification and route file for final review | 2026-04-15 | Credentialing specialist |
| ROUTINE | Entity | PECOS revalidation open | Complete ownership attestation and final sign-off | 2026-04-23 | Enrollment manager |

Source note: Monthly OIG LEIE and SAM.gov screening completed 2026-04-02 for all active providers and owners. No exclusion matches were identified.
