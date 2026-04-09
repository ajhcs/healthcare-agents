---
exemplar_id: pce-d01-example-02-delegated-network-quarterly-dashboard
agent_slug: payer-credentialing-enrollment-coordinator
agents_relevant:
- payer-credentialing-enrollment-coordinator
deliverable_id: pce-d01
deliverable_title: Provider Credentialing Status Dashboard
scenario_summary: Delegated credentialing dashboard for an employed primary care network
  preparing for an annual health plan oversight audit.
complexity: routine
mcp_servers_relevant:
- provider_enrollment_status
regulatory_as_of: '2026-04-09'
source_basis:
- NCQA Delegation Oversight requirements within credentialing standards
- OIG LEIE monthly screening guidance
- SAM.gov exclusions search
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Provider Credentialing & Enrollment Status Dashboard

**Organization**: Cedar Brook Primary Care Network
**Report Date**: 2026-04-09
**Total Active Providers**: 42
**Providers in Credentialing Pipeline**: 5

## Credentialing Status Summary
| Status | Count | % |
|--------|-------|---|
| Fully credentialed & enrolled (all payers) | 34 | 81% |
| Credentialed, enrollment pending (1+ payers) | 3 | 7% |
| Initial credentialing in process | 2 | 5% |
| Recredentialing due (next 90 days) | 2 | 5% |
| Action required (expired credential or missing document) | 1 | 2% |

## Expiring Credentials (Next 90 Days)
| Provider | Credential | Expiration Date | Status | Action Required |
|----------|-----------|----------------|--------|----------------|
| Dr. Senna Pike | CAQH Attestation | 2026-04-29 | Reminder sent day 96 | Re-attest by 2026-04-22 |
| Dr. Rowan Keel | Illinois License | 2026-05-31 | Renewal packet filed | Save board confirmation once posted |
| Dr. Mira Tolland | Malpractice Policy | 2026-06-01 | Carrier renewal underwriter review | Secure binder by 2026-05-15 |
| Dr. Ash Verran | DEA | 2026-06-24 | Renewal started | Upload receipt after payment |
| Dr. Pella North | Board Certification | 2026-06-30 | Continuing certification complete | Await board portal update |

## Payer Enrollment Status
| Provider | Medicare | Medicaid | BCBS | United | Aetna | Cigna | RiverState Exchange |
|----------|---------|----------|------|--------|-------|-------|-------------------|
| Dr. Senna Pike | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dr. Rowan Keel | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dr. Mira Tolland | ✅ | ✅ | ✅ | ✅ | ⏳ roster add | ✅ | ✅ |
| Dr. Ash Verran | ✅ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ✅ |
| Dr. Pella North | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dr. Lio Mercer | ⏳ PECOS in review | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

## Revalidation Tracker
| Provider/Entity | PECOS ID | Revalidation Due | Status | Days Remaining |
|----------------|----------|------------------|--------|----------------|
| Cedar Brook Primary Care Network PLLC | 8H1T54Q7 | 2026-08-12 | Not started | 125 |
| Dr. Mira Tolland | 3N4K20Z8 | 2026-06-18 | In progress | 70 |
| Dr. Rowan Keel | 6V9B11C2 | 2026-10-01 | Complete 2026-03-30 | 175 |

## Action Items
| Priority | Provider | Issue | Action | Deadline | Owner |
|----------|----------|-------|--------|----------|-------|
| CRITICAL | Dr. Lio Mercer | PECOS file pending due to missing reassignment section to group TIN | Submit corrected CMS-855I reassignment pages through PECOS | 2026-04-12 | Enrollment team |
| HIGH | Dr. Mira Tolland | Aetna roster add pending 29 days | Escalate to delegated plan liaison and confirm effective date | 2026-04-14 | Delegation manager |
| HIGH | Dr. Ash Verran | Medicaid application exceeds target cycle | Call state provider enrollment unit and upload signed disclosure addendum | 2026-04-15 | Payer enrollment coordinator |
| ROUTINE | Dr. Senna Pike | CAQH attestation window closing | Re-attest and export updated PDF for audit file | 2026-04-22 | Provider support |
| ROUTINE | Network entity | Annual delegation audit due in May | Pull six-file mock sample and confirm monthly exclusion logs | 2026-04-26 | Audit prep lead |

Source note: Monthly OIG LEIE and SAM.gov screening completed 2026-04-03 for all 42 active providers and 11 owners. No exclusion matches identified.
