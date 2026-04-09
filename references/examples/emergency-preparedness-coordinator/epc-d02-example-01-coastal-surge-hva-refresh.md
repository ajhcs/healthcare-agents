---
exemplar_id: epc-d02-example-01-coastal-surge-hva-refresh
agent_slug: emergency-preparedness-coordinator
agents_relevant:
- emergency-preparedness-coordinator
deliverable_id: epc-d02
deliverable_title: Hazard Vulnerability Analysis Template
scenario_summary: A synthetic coastal referral hospital refreshes its HVA after hurricane
  flooding, cyber incidents in the region, and pediatric surge planning changes.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
- literature_search
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.15(a) Emergency plan requirements
- CMS State Operations Manual, Appendix Z, Tag E-0006
- ASPR TRACIE Hospital Surge Evaluation Tool
- CDC Emergency Preparedness and Response
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Hazard Vulnerability Analysis (HVA)

**Facility**: Seabrook Harbor Medical Center
**Date**: 2026-02-11
**Lead Assessor**: Julian Park, HEMS, Emergency Preparedness Manager

## Scoring Scale (1=Low, 4=High)

| Hazard | Probability | Human Impact | Property Impact | Business Impact | Preparedness | Internal Response | External Response | Total Risk Score |
|--------|------------|-------------|----------------|----------------|-------------|-----------------|-----------------|-----------------|
| **Natural** | | | | | | | | |
| Hurricane/Tropical storm | 4 | 4 | 4 | 4 | 3 | 3 | 2 | 24 |
| Tornado | 2 | 3 | 3 | 3 | 2 | 2 | 2 | 17 |
| Flood | 4 | 4 | 4 | 4 | 3 | 2 | 2 | 23 |
| Earthquake | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 13 |
| Severe winter weather | 1 | 2 | 1 | 2 | 2 | 3 | 2 | 13 |
| Wildfire | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 13 |
| Pandemic/EID | 3 | 4 | 2 | 4 | 3 | 3 | 2 | 21 |
| **Man-Made** | | | | | | | | |
| Active shooter | 2 | 4 | 2 | 3 | 3 | 3 | 3 | 20 |
| Cyberattack/ransomware | 4 | 4 | 2 | 4 | 2 | 2 | 2 | 20 |
| Bomb threat | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 17 |
| HazMat release (external) | 3 | 3 | 2 | 3 | 2 | 2 | 3 | 18 |
| Civil disturbance | 2 | 2 | 1 | 2 | 2 | 3 | 3 | 15 |
| Mass casualty incident | 3 | 4 | 1 | 4 | 3 | 3 | 3 | 21 |
| **Facility-Based** | | | | | | | | |
| Fire (internal) | 2 | 4 | 3 | 3 | 3 | 3 | 3 | 21 |
| Power failure | 3 | 4 | 3 | 4 | 3 | 2 | 2 | 21 |
| Water supply disruption | 3 | 4 | 2 | 4 | 2 | 2 | 2 | 19 |
| IT/EHR system failure | 4 | 4 | 1 | 4 | 2 | 2 | 2 | 19 |
| Medical gas failure | 2 | 4 | 2 | 4 | 3 | 2 | 2 | 19 |
| HVAC failure | 3 | 3 | 2 | 3 | 2 | 2 | 2 | 17 |
| Structural damage | 2 | 4 | 4 | 4 | 2 | 2 | 2 | 20 |
| Supply chain disruption | 3 | 3 | 1 | 4 | 2 | 2 | 2 | 17 |

## Risk Prioritization (Top 5 by Total Score)
1. Hurricane/Tropical storm — Score: 24 — Priority actions: finalize flood-barrier deployment sequence, revise campus access control triggers, and re-stage ambulance offload zones above projected surge level.
2. Flood — Score: 23 — Priority actions: elevate basement pharmacy overflow stock, protect telecom rooms, and validate portable pump vendor response time.
3. Pandemic/EID — Score: 21 — Priority actions: refresh respiratory isolation surge plan, update PPE burn-rate assumptions, and revalidate alternate staffing tiers.
4. Mass casualty incident — Score: 21 — Priority actions: confirm trauma receiving thresholds, decontamination staffing matrix, and blood product courier redundancy.
5. Power failure — Score: 21 — Priority actions: test chilled-water loss contingencies, prioritize limited generator branch loads, and expand fuel resupply coordination with county EOC.

## Gap Analysis
| Gap Identified | Hazard | Current State | Target State | Action Required |
|---------------|--------|---------------|-------------|----------------|
| Flood barrier deployment is unit-dependent and not timed to a storm warning decision point | Hurricane/Tropical storm | Facilities has equipment but no campus-wide activation timeline | Barrier deployment linked to HICS objectives and weather trigger matrix | Add flood barrier annex and run timed deployment drill before 2026-06-15 |
| Generator sustainment assumptions do not reflect summer HVAC demand in tower B | Power failure | Fuel duration estimate is based on shoulder-season demand | Demand-based sustainment model for critical cooling loads | Perform engineering recalculation and revise utility failure annex |
| Downtime medication administration process is inconsistent across inpatient units | Cyberattack/ransomware | Paper MAR packet exists but night-shift usage is uneven | Standardized downtime medication workflow across all units | Pharmacy and nursing to complete competency validation and chart audit |
| Pediatric surge reception area is identified but lacks staffing escalation matrix | Mass casualty incident | Space is named in plan without role assignments | Scalable pediatric surge team staffing with labor pool trigger points | Update pediatric MCI annex and include in coalition exercise |
| Water outage contingency does not specify sterile processing reduction thresholds | Water supply disruption | General conservation guidance only | Unit-level trigger points for case reduction and diversion | Add service reduction thresholds and incident action planning prompts |
| Respiratory PPE supply assumptions rely on outdated burn-rate data | Pandemic/EID | Cache count is current but usage model reflects prior staffing ratios | Updated 96-hour and 14-day burn-rate model | Recalculate PPE demand and align reorder trigger with coalition cache access |

## Risk Interpretation
- The facility remains primarily threatened by coastal storm impacts that cascade into flood, power, access, and evacuation challenges rather than by a single isolated hazard.
- Cyber downtime risk increased after two regional ransomware events in late 2025 exposed dependence on manual pharmacy, imaging, and transfer workflows.
- Pandemic and mass casualty scores remain elevated because the hospital is the pediatric-capable receiving center for three surrounding counties.
- External response strength is constrained during hurricane conditions because EMS transport capacity and public works support degrade across the region at the same time.

## Planning Priorities for the Next Cycle
- Align the 2026 full-scale exercise with combined flood and prolonged utility-loss assumptions rather than a short-duration wind event.
- Rework the communication plan to support sustained county medical coordination center reporting when internet and cellular bandwidth are degraded.
- Tie top five hazards to annex owners, training deliverables, and one measurable improvement objective per quarter.
- Present the HVA crosswalk to the governing body with explicit resource requests for flood protection, satellite communications, and pediatric surge staffing.

## Community Linkages Used in Scoring
- County healthcare coalition annual risk summary influenced hurricane, flood, mass casualty, and water disruption scoring.
- Regional public health respiratory pathogen planning assumptions informed pandemic surge and PPE sustainment scoring.
- Local utility emergency liaison briefings informed power and water outage restoration assumptions.
- EMS transport coordinator input shaped evacuation and external response scoring for storm conditions.
