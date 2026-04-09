---
holdout_id: pbs-d02-holdout-01-aurora-adalimumab-biosimilar-business-case
agent_slug: pharmacy-benefits-specialist
agents_relevant:
  - pharmacy-benefits-specialist
deliverable_id: pbs-d02
deliverable_title: Biosimilar Conversion Business Case
seed_ref: pharmacy-benefits-specialist/pbs-d02-seed-01-aurora-adalimumab-biosimilar-business-case.yaml
scenario_summary: Build a biosimilar conversion case for an adalimumab class drug used across commercial, MA, and Medicaid lines.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
  - FDA Biosimilars, https://www.fda.gov/drugs/biosimilars/biosimilar-and-interchangeable-products
  - CMS Part D formulary guidance, https://www.cms.gov/medicare/prescription-drug-coverage/prescriptiondrugcovcontra/formulary-guidance
  - CMS Part D Star Ratings, https://www.cms.gov/medicare/health-drug-plans/part-d-star-ratings
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or workflow standard materially changes
expectations:
  - Show current-state spend, conversion economics, projected impact, implementation needs, and risk.
  - Include a clear conversion target and a member/provider communication plan.
  - Quantify year-one savings under at least two adoption scenarios.
---

# Biosimilar Conversion Business Case

**Drug Class**: Adalimumab  
**Originator Product**: Humira  
**Proposed Conversion**: Preferred biosimilar tier with utilization management support

## Current State
| Metric | Value |
|---|---:|
| Annual members using originator | 1,180 |
| Annual net drug spend | $9.1M |
| Average member out-of-pocket | $71 PMPM |
| Current biosimilar penetration | 20% |

## Biosimilar Economics
| Metric | Originator | Biosimilar | Delta |
|---|---:|---:|---:|
| Net cost per treated member | $7,710 | $6,180 | -$1,530 |
| Admin/support cost | $410 | $525 | +$115 |
| Net annual plan cost | $9.1M | $7.5M | -$1.6M |

## Projected Impact (Year 1)
| Adoption rate | Members | Plan savings |
|---|---:|---:|
| 35% conversion | 413 | $580,000 |
| 50% conversion | 590 | $840,000 |
| 65% conversion | 767 | $1.09M |

## Implementation Requirements
- P&T approval and preferred tier placement
- Prior authorization language that supports nonmedical switching
- Provider outreach and member education scripts
- Specialty pharmacy and supply chain readiness

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Provider reluctance | Medium | Share comparative economics and clinical equivalence summary |
| Member abrasion | Medium | Use advance notice and refill outreach |
| Supply interruption | High | Maintain two contracted sources where possible |
| Site-of-care leakage | Medium | Align specialty pharmacy edits with conversion policy |
