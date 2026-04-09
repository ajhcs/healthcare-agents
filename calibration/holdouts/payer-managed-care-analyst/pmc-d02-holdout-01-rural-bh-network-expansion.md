---
holdout_id: pmc-d02-holdout-01-rural-bh-network-expansion
agent_slug: payer-managed-care-analyst
agents_relevant:
- payer-managed-care-analyst
deliverable_id: pmc-d02
deliverable_title: Network Adequacy Assessment Report
seed_ref: payer-managed-care-analyst/pmc-d02-seed-01-rural-bh-network-expansion.yaml
scenario_summary: Medicaid MCO network review for a largely rural service area identifies
  behavioral health access and OB/GYN wait-time gaps despite nominal provider ratio
  compliance.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 438.68
- 2024 Medicaid and CHIP Managed Care Access, Finance, and Quality Final Rule
- CMS Medicaid managed care access and network adequacy guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The draft should distinguish time-distance compliance from real appointment access
  and show that ratio compliance alone is not enough.
- Behavioral health should emerge as the most material gap, with county-level remediation
  tied to telehealth and contract amendments.
- The overall score should reflect meaningful deficiencies rather than a pass result.
---

# Network Adequacy Assessment

**Plan**: Pine Arc Community Care
**Product**: Medicaid MCO
**Service Area**: Birch, Hollow, Stone, Wren, and Yarrow counties
**Assessment Date**: 2026-02-28
**Total Enrolled Members**: 54,210

## Time/Distance Compliance by Provider Type
| Provider Type | Standard | # Providers | % Members Meeting Standard | Gap Areas |
|--------------|----------|-------------|---------------------------|-----------|
| Primary Care | 30 mi / 40 min rural | 96 | 95.1% | West Yarrow and north Stone |
| Cardiology | 60 mi / 75 min rural | 14 | 92.8% | Birch ridge corridor |
| Orthopedics | 60 mi / 75 min rural | 11 | 90.4% | Hollow east and south Wren |
| OB/GYN | 45 mi / 60 min rural | 15 | 94.2% | South Birch and north Yarrow |
| Behavioral Health | 60 mi / 75 min rural | 18 | 83.7% | Hollow, Stone, and west Yarrow |
| Acute Hospital | 45 mi / 60 min rural | 7 | 97.0% | One tract in western Wren |
| Pharmacy | 20 mi / 30 min rural | 49 | 98.8% | No material gaps |

## Provider-to-Member Ratios
| Provider Type | Required Ratio | Actual Ratio | Status |
|--------------|---------------|-------------|--------|
| Primary Care | 1:2,000 | 1:565 | ✅ |
| Behavioral Health | 1:1,500 | 1:1,087 | ✅ |
| OB/GYN | 1:3,000 | 1:1,807 | ✅ |

## Appointment Wait Time Results
| Appointment Type | Standard | Actual (Avg) | % Meeting Standard |
|-----------------|----------|-------------|-------------------|
| Routine PCP | 15 business days | 11.8 days | 82% |
| Urgent (non-emergency) | 48 hrs | 37 hrs | 91% |
| BH routine | 10 business days | 18.6 days | 49% |

## Gap Analysis & Remediation
| Gap | Impact | Remediation Plan | Timeline |
|-----|--------|-----------------|----------|
| Behavioral health time-distance failure in Hollow, Stone, and west Yarrow | 8,944 members affected | Add tele-BH panel with in-state licensed clinicians, contract two certified community behavioral health clinics, and require weekly slot reporting | 75 days |
| OB/GYN access strain with delayed prenatal appointments | 2,706 members affected | Add rotating prenatal clinic sessions in Birch and Yarrow and amend contracts for protected prenatal capacity | 90 days |
| Directory inflation from closed PCP and BH panels | 6,112 members affected | Conduct panel validation, purge non-accepting clinicians from directory, and repeat secret-shopper audit monthly | 45 days |

## Overall Adequacy Score: 71/100
