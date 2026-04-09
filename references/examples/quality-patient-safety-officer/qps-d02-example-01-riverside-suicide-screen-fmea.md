---
exemplar_id: qps-d02-example-01-riverside-suicide-screen-fmea
agent_slug: quality-patient-safety-officer
agents_relevant:
- quality-patient-safety-officer
deliverable_id: qps-d02
deliverable_title: FMEA Worksheet
scenario_summary: A cross-setting suicide-risk screening process was evaluated
  before implementation and found vulnerable at handoff and documentation points.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'AHRQ Common Formats: https://www.pso.ahrq.gov/common'
- 'The Joint Commission NPSG.15.01.01: https://www.jointcommission.org/standards/national-patient-safety-goals/'
- 'AHRQ Patient Safety Network: https://psnet.ahrq.gov/'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Failure Mode and Effects Analysis

**Process Analyzed**: ED to inpatient suicide-risk screening and safety-bundle handoff  
**Date**: March 14, 2026  
**Facilitator**: Kendra Lewis, MSN, RN, CPPS  
**Team Members**: ED nurse manager, inpatient psych liaison, informatics analyst, social worker

## Process Steps
1. Triage screening in ED
2. Suicide-risk documentation in EHR
3. Positive-screen escalation to provider
4. Safety precautions order entry
5. Inpatient handoff at admission
6. Reassessment on unit arrival

## Failure Mode Analysis
| Step | Failure Mode | Potential Effect | Severity (1-4) | Probability (1-4) | Hazard Score | Existing Controls | Single Point? | Action Required? |
|------|-------------|-----------------|---------------|-------------------|-------------|-------------------|-------------|-----------------|
| 2 | Positive screen not documented in the handoff note | Inpatient team unaware of risk | 4 | 3 | 12 | EHR prompt | Y | Y |
| 4 | Safety precautions order not placed | No sitter or ligature precautions | 4 | 2 | 8 | Provider reminder | Y | Y |
| 5 | Handoff omits environmental safety needs | Patient room not secured | 3 | 3 | 9 | Verbal report | Y | Y |

## Action Plan (for high-priority failure modes)
| Failure Mode | Root Cause | Countermeasure | Action Strength | Owner | Due Date | Measure |
|-------------|-----------|---------------|----------------|-------|----------|---------|
| Positive screen not documented | Handoff note lacks forced field | Add mandatory EHR suicide-risk flag to handoff template | Strong | Informatics analyst | 2026-03-28 | 100% flagged screens visible on transfer |
| Safety precautions order not placed | Provider reminder too weak | Convert reminder to hard stop for positive screens | Strong | Behavioral health lead | 2026-03-22 | Zero positive screens without orders |
| Handoff omits environmental needs | No standard checklist | Add admission checklist item for ligature/environment review | Intermediate | Nurse educator | 2026-04-01 | 95% checklist completion |

