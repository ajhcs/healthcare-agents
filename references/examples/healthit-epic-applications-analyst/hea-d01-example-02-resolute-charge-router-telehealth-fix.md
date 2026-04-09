---
exemplar_id: hea-d01-example-02-resolute-charge-router-telehealth-fix
agent_slug: healthit-epic-applications-analyst
agents_relevant:
- healthit-epic-applications-analyst
deliverable_id: hea-d01
deliverable_title: Epic Build Change Request
scenario_summary: Corrects a professional billing charge-router issue for telehealth
  nutrition follow-up encounters after payer contract changes.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS telehealth policy and payment resources: https://www.cms.gov/medicare/coverage/telehealth'
- 'CMS Program Integrity Manual Chapter 3: https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/Downloads/pim83c03.pdf'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Epic Build Change Request

**Request ID**: SYN-CHG-2604-143
**Application**: Resolute Professional Billing
**Requested By**: Ivy Kestrel, Revenue Integrity
**Priority**: Urgent
**Target Date**: 2026-04-22

## Description
Correct charge-router logic for outpatient telehealth nutrition follow-up visits so modifier selection and place-of-service mapping align with the 2026 payer matrix approved by revenue integrity.

## Clinical/Business Justification
During post-contract review, revenue integrity identified denied claims for dietitian follow-up visits performed by video because the current build routes charges using an outdated telehealth modifier sequence for two commercial payer classes. The issue affects reimbursement, creates avoidable manual rebilling, and increases staff touches without improving documentation quality. The requested change preserves current clinician workflow while aligning downstream professional billing output to the revised payer requirements.

## Build Specification

### Records Affected
| Record Type | Record ID | Current Config | Proposed Change |
|-------------|-----------|----------------|-----------------|
| EPT | EPT 7712 | Telehealth nutrition follow-up linked to legacy routing profile | Repoint encounter type to revised 2026 telehealth routing profile |
| INI | INI PB 319 | Modifier hierarchy references 2025 commercial payer matrix | Update hierarchy to 2026 matrix for specified payer groupers |
| SER | SER 902144 | Two telehealth-only dietitians inherit generic ambulatory billing defaults | Assign provider-level billing profile matching nutrition telehealth service line |
| Rule Record | PB-RTR 1884 | Charge router maps all video follow-ups to single place-of-service outcome | Split logic by payer class and visit mode based on approved matrix |

### Downstream Impact
- Orders: None. No order entry behavior changes are included.
- Clinical Documentation: None. Note templates and diagnosis capture remain unchanged.
- Revenue Cycle (PB/HB): Direct impact. Professional claims for targeted telehealth follow-ups will carry revised modifier and place-of-service logic.
- Interfaces (Bridges): Low impact. DFT output should be validated to confirm charge detail remains parseable by the clearinghouse feed.
- Reporting (Caboodle/Clarity): Moderate impact. Denial trend reports and telehealth reimbursement dashboards need updated logic notes for post-change comparison.
- MyChart: None. Patient-facing workflow and visit booking rules are unchanged.

### Testing Plan
| Test Scenario | Environment | Tester | Expected Result |
|--------------|-------------|--------|-----------------|
| Video follow-up for payer class A posts revised modifier and place of service | POC | C. Morrow, PB Analyst | Charge review reflects approved 2026 billing matrix |
| Video follow-up for payer class B routes to alternate modifier sequence | POC | C. Morrow, PB Analyst | Claim detail matches payer-specific routing rules |
| In-person nutrition follow-up remains on existing professional billing logic | MST | H. Venn, Revenue Integrity | No regression to office visit billing output |
| DFT message containing revised charge detail passes to claims gateway | MST | S. Ilar, Interface Analyst | Clearinghouse test file accepted without parse error |
| Caboodle denial dashboard baseline versus post-fix cohort reconciles correctly | MST | W. Fable, Cogito Analyst | Charges appear in correct telehealth denial workbench category |

## Approval
- Application team lead: Approved by T. Orin on 2026-04-10
- Clinical informaticist: Not required; clinician workflow unchanged
- Revenue cycle: Approved by R. Mercer on 2026-04-11
- Governance committee: Revenue cycle CAB expedited review scheduled for 2026-04-14
