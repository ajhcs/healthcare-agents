---
exemplar_id: pce-d01-example-01-spring-multispecialty-launch-dashboard
agent_slug: payer-credentialing-enrollment-coordinator
agents_relevant:
- payer-credentialing-enrollment-coordinator
deliverable_id: pce-d01
deliverable_title: Provider Credentialing Status Dashboard
scenario_summary: Quarterly dashboard for a new multispecialty group tracking initial
  credentialing, payer enrollment, and PECOS readiness.
complexity: moderate
mcp_servers_relevant:
- provider_enrollment_status
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- NCQA Credentialing Product Updates and Standards materials, effective July 1, 2025
- CMS Medicare Program Integrity Manual, Chapter 15
- PECOS overview at CMS.gov
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Provider Credentialing & Enrollment Status Dashboard

**Organization**: North Mesa Specialty Group
**Report Date**: 2026-04-09
**Total Active Providers**: 18
**Providers in Credentialing Pipeline**: 7

## Credentialing Status Summary
| Status | Count | % |
|--------|-------|---|
| Fully credentialed & enrolled (all payers) | 9 | 50% |
| Credentialed, enrollment pending (1+ payers) | 4 | 22% |
| Initial credentialing in process | 3 | 17% |
| Recredentialing due (next 90 days) | 1 | 6% |
| Action required (expired credential or missing document) | 1 | 6% |

## Expiring Credentials (Next 90 Days)
| Provider | Credential | Expiration Date | Status | Action Required |
|----------|-----------|----------------|--------|----------------|
| Dr. Elian Voss | Arizona Medical License | 2026-05-31 | Renewal submitted 2026-04-02 | Confirm board posting by 2026-05-15 |
| Dr. Mara Quin | DEA | 2026-06-18 | Renewal not yet filed | Submit renewal by 2026-04-18 |
| Dr. Ivo Larkin | Malpractice Policy | 2026-05-01 | Carrier binder received | Load final face sheet when issued |
| Dr. Talia Soren | CAQH Attestation | 2026-04-22 | Reminder sent on day 104 | Re-attest by 2026-04-19 |
| Dr. Niko Vale | Board Certification | 2026-06-30 | Renewal packet in progress | Obtain board portal confirmation |

## Payer Enrollment Status
| Provider | Medicare | Medicaid | BCBS | United | Aetna | Cigna | DesertCare HMO |
|----------|---------|----------|------|--------|-------|-------|----------------|
| Dr. Elian Voss | ✅ 2026-03-01 | ⏳ | ✅ 2026-03-15 | ✅ 2026-03-15 | ⏳ | ⏳ | ✅ 2026-03-20 |
| Dr. Mara Quin | ✅ 2026-02-15 | ✅ 2026-03-01 | ✅ 2026-03-10 | ✅ 2026-03-10 | ✅ 2026-03-18 | ✅ 2026-03-22 | ✅ 2026-03-25 |
| Dr. Ivo Larkin | ⏳ PECOS in review | ⏳ | ⏳ | ⏳ | ❌ application held | ⏳ | ⏳ |
| Dr. Talia Soren | ✅ 2025-11-01 | ✅ 2025-11-15 | ✅ 2025-11-20 | ✅ 2025-11-20 | ✅ 2025-12-01 | ✅ 2025-12-05 | ✅ 2025-12-08 |
| Dr. Niko Vale | ✅ 2026-04-01 | ⏳ | ✅ 2026-04-05 | ⏳ | ⏳ | ⏳ | ⏳ |
| Dr. Rina Calder | ❌ file incomplete | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Revalidation Tracker
| Provider/Entity | PECOS ID | Revalidation Due | Status | Days Remaining |
|----------------|----------|------------------|--------|----------------|
| North Mesa Specialty Group LLC | 4K7M29B1 | 2026-07-14 | In progress | 96 |
| Dr. Talia Soren | 7D2P88L4 | 2026-06-30 | Complete 2026-03-28 | 82 |
| Dr. Mara Quin | 1R5C63T9 | 2026-09-02 | Not started | 146 |

## Action Items
| Priority | Provider | Issue | Action | Deadline | Owner |
|----------|----------|-------|--------|----------|-------|
| CRITICAL | Dr. Rina Calder | State license renewed with new number, CAQH still carries prior record | Update CAQH, re-run primary source verification, hold payer submissions | 2026-04-11 | J. Fen, CPCS |
| CRITICAL | Dr. Ivo Larkin | Aetna enrollment held for missing malpractice face sheet | Upload final face sheet and send cover note to plan analyst | 2026-04-10 | S. Mercer |
| HIGH | Dr. Mara Quin | DEA expires in 70 days | File renewal and save receipt to credentialing file | 2026-04-18 | Dr. Mara Quin |
| HIGH | Dr. Talia Soren | CAQH attestation expires in 13 days | Re-attest and confirm payer authorizations remain active | 2026-04-19 | Provider liaison |
| HIGH | Group entity | CMS-855B revalidation open | Complete ownership disclosure review and submit final signature | 2026-04-25 | Enrollment manager |
| ROUTINE | Dr. Elian Voss | Medicaid enrollment exceeds 45-day target | Escalate to state portal help desk with application number 26-44719 | 2026-04-15 | S. Mercer |
| ROUTINE | Dr. Niko Vale | United and Cigna pending since 2026-03-21 | Request status update and confirm CAQH document pull date | 2026-04-16 | J. Fen, CPCS |

Source note: Ongoing exclusion monitoring remains current through the 2026-04-01 run for OIG LEIE and SAM.gov. No exclusion matches were identified.
