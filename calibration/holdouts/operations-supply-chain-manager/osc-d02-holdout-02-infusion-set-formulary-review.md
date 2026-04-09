---
holdout_id: osc-d02-holdout-02-infusion-set-formulary-review
agent_slug: operations-supply-chain-manager
agents_relevant:
- operations-supply-chain-manager
deliverable_id: osc-d02
deliverable_title: Value Analysis Request Form
seed_ref: operations-supply-chain-manager/osc-d02-seed-02-infusion-set-formulary-review.yaml
scenario_summary: A synthetic infusion therapy team requests a specialty tubing set
  and the committee approves a narrow use case after reviewing compatibility, training,
  and cost.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- FDA device labeling and public device database resources
- AHRMM value analysis governance resources
- 42 CFR 1001.952(j) Group purchasing organization safe harbor
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Completes the request form in the target structure with clear clinical rationale
  and financial comparison.
- Addresses total cost of ownership beyond unit price, including training and workflow
  compatibility.
- Uses a decision that is operationally realistic for a restricted-use infusion product.
- Keeps all names, dates, and organizations clearly synthetic.
---

# Value Analysis Product Request

**Request Date**: 2026-01-22
**Requestor**: Jalen Pryce, RN, Director of Infusion Therapy
**Product Requested**: FlowGuard Low-Sorb Extension Set, Norvale Medical, Catalog FG-LS-214
**Current Product**: PrimeLine Standard Extension Set, Alderon Clinical, Catalog PL-210

## Clinical Rationale
- Infusion therapy requested the low-sorb extension set for medications and patient populations where adsorption risk and line dead-space management are more clinically sensitive.
- The request was supported by internal practice review from oncology and NICU leaders who reported a narrow, recurring need rather than a systemwide replacement requirement.
- The current standard set remains appropriate for routine infusion use across adult med-surg, perioperative, and emergency care workflows.
- The committee reviewed product labeling, pump compatibility documentation, and internal workflow impact before making a restricted-use decision.

## Financial Analysis
| Item | Current Product | Requested Product | Difference |
|------|----------------|-------------------|------------|
| Unit cost | $2.18 | $3.06 | $0.88 |
| Projected annual volume | 4,200 sets | 4,200 sets | Comparison at requested annual use |
| Annual cost | $9,156 | $12,852 | $3,696 |
| GPO contract status | Premier committed | Premier portfolio | Requested item has higher tier cost |
| Contract compliance impact | Preserves committed status | Small dilution if use expands beyond restricted areas | Guardrails required |

## Total Cost of Ownership
| Factor | Current | Requested | Notes |
|--------|---------|-----------|-------|
| Product cost | $9,156 | $12,852 | Incremental spend is manageable if restricted |
| Training cost | $0 | $1,250 | Oncology, NICU, pharmacy, and educator in-service |
| Equipment or capital required | $0 | $0 | No pump replacement needed |
| Storage requirements | Standard par bins | Restricted bins in designated units | Prevents unplanned substitution |
| Procedure time impact | Baseline setup | Slightly longer line selection step | Offset by better fit for limited use cases |
| Reprocessing and disposal | Standard clinical waste | Standard clinical waste | No waste-stream change |
| **Total annual cost** | **$9,156** | **$14,102** | Includes one-time launch education |

## Committee Decision
- Decision: Approved with conditions for oncology and NICU use only
- Condition 1: Product remains restricted to approved indications and designated departments.
- Condition 2: Item will not be added to general house-wide par locations.
- Condition 3: Supply chain and pharmacy will review monthly usage for three months after launch.
- Condition 4: Unit educators must complete training before the first shipment is released to active inventory.

**Decision Date**: 2026-02-06
**Approved by**: Mae Linwood, PharmD, Co-Chair, Clinical Products Value Analysis Committee

## Implementation Notes
- Item master setup will include restricted ordering controls and department-specific cross references.
- Pharmacy and infusion therapy will publish use criteria and pump-compatibility guidance before go-live.
- Central supply will stock the item only in oncology and NICU distribution points.
- A 90-day review will confirm utilization, compatibility issues, and any compliance drift in the tubing category.
