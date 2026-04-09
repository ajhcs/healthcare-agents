---
exemplar_id: cdi-d02-example-01-q1-query-compliance-audit
agent_slug: clinical-documentation-improvement-specialist
agents_relevant:
- clinical-documentation-improvement-specialist
deliverable_id: cdi-d02
deliverable_title: Query Compliance Audit Tool
scenario_summary: Quarterly compliance audit of a synthetic CDI specialist sample
  identifying leading language risk, title issues, and a yes-no misuse pattern.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- AHIMA-ACDIS Guidelines for Achieving a Compliant Query Practice (2022 Update)
- 'AHIMA Practice Brief: Clinical Validation: The Next Level of CDI (2019)'
- CMS Medicare Program Integrity Manual, Chapter 6
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# CDI Query Compliance Audit

**Auditor**: Leena Vorst, RHIA, CDIP  
**Audit Period**: 2026-01-01 to 2026-03-31  
**CDI Specialist Audited**: Rowan Pike, RN, CCDS  
**Sample Size**: 12 queries

## Per-Query Assessment
| # | Patient | Query Type | Compliant | Findings |
|---|---------|-----------|-----------|----------|
| 1 | MRN JV-400118 | MC | Y | Heart failure query included chart-sourced BNP, echo, diuretic escalation, and clinically supportable options with free-text alternative. |
| 2 | MRN JV-400274 | OE | Y | AKI clarification was concise and tied baseline creatinine to current rise without implying a desired diagnosis. |
| 3 | MRN JV-400311 | YN | N | Yes-no format used to establish acute respiratory failure that had not been documented elsewhere in the record. |
| 4 | MRN JV-400552 | MC | Y | Sepsis clinical validation query presented documented diagnosis with conflicting indicators and neutral response options. |
| 5 | MRN JV-400601 | MC | N | Query title visible in the EHR read "Clarification of Severe Malnutrition," which was too diagnosis-specific for a provider-facing title. |
| 6 | MRN JV-400644 | OE | Y | Encephalopathy query clearly separated AMS findings from etiology clarification and directed the question to the attending. |
| 7 | MRN JV-400703 | MC | N | Multiple-choice options omitted a clinically relevant dehydration alternative supported by intake-output trend and BUN/Cr ratio. |
| 8 | MRN JV-400721 | MC | Y | Pressure injury POA query appropriately cited wound care note, ED skin assessment, and operative timing. |
| 9 | MRN JV-400804 | MC | Y | Query contained relevant options, other, and unable-to-determine language without reimbursement references. |
| 10 | MRN JV-400845 | OE | N | Narrative included "to support accurate severity capture," creating avoidable quality-measure framing even though DRG language was absent. |
| 11 | MRN JV-400901 | MC | Y | Postoperative anemia clarification appropriately distinguished expected blood loss from acute blood loss anemia. |
| 12 | MRN JV-400944 | MC | Y | Malnutrition confirmation query cited ASPEN-aligned indicators and preserved physician clinical judgment. |

## Compliance Criteria (per AHIMA-ACDIS 2022)
- Clear, concise, and non-leading language: Met in 9 of 12 queries
- Clinical indicators present and sourced from health record: Met in 12 of 12 queries
- Multiple-choice options clinically relevant: Met in 10 of 12 queries
- Free-text alternative included: Met in 11 of 12 queries
- No reference to reimbursement, quality, or reportable data: Met in 11 of 12 queries
- Query title non-leading: Met in 11 of 12 queries
- Yes-no format used only for documented diagnoses: Met in 11 of 12 queries
- Query directed to the appropriate treating provider: Met in 12 of 12 queries

## Aggregate Results
| Criterion | Met | Not Met | % Compliant |
|-----------|----:|--------:|------------:|
| Non-leading language | 9 | 3 | 75.0% |
| Clinical indicators present | 12 | 0 | 100.0% |
| Clinically relevant options | 10 | 2 | 83.3% |
| Free-text alternative included | 11 | 1 | 91.7% |
| No reimbursement reference | 11 | 1 | 91.7% |
| Appropriate query format | 11 | 1 | 91.7% |
| **Overall compliance rate** | **76** | **8** | **90.5%** |

## Recommendations
1. Remove outcome-framing phrases such as severity capture, quality profile, or reportable impact from all query narratives and education examples.
2. Standardize provider-facing titles to neutral wording such as "Documentation Clarification" or service-line-neutral equivalents.
3. Re-educate staff that yes-no format is limited to clarifying an already documented condition, POA, or cause-and-effect relationship.
4. Add a pre-send peer review for sepsis, malnutrition, respiratory failure, and postoperative complication queries because those categories account for all four audit failures.
5. Re-audit this specialist with a 10-query focused sample in May 2026 after remediation.

## Auditor Summary
The specialist demonstrated strong clinical indicator selection and appropriate provider targeting. The compliance gap was not clinical judgment; it was phrasing discipline. Two issues reflected preventable wording risk, and one query used the wrong format entirely. Immediate education should focus on non-leading construction and strict yes-no limitations.

## Regulatory Watch
If the organization relies on internal query policy language tied to CMS or OIG commentary, the CDI manager should verify whether any current CMS or Federal Register publication changed documentation or audit emphasis before issuing the Q2 remediation memo.
