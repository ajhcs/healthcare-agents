---
holdout_id: cdi-d01-holdout-02-enterprise-cmi-variance-dashboard
agent_slug: clinical-documentation-improvement-specialist
agents_relevant:
- clinical-documentation-improvement-specialist
deliverable_id: cdi-d01
deliverable_title: CDI Program Dashboard
seed_ref: clinical-documentation-improvement-specialist/cdi-d01-seed-02-enterprise-cmi-variance-dashboard.yaml
scenario_summary: System-level synthetic dashboard for a large urban hospital where
  final CMI lags working CMI because of coder reconciliation fallout and unresolved
  validation risk.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'AHIMA Practice Brief: Clinical Validation: The Next Level of CDI (2019)'
- AHIMA-ACDIS Guidelines for Achieving a Compliant Query Practice (2022 Update)
- CMS Medicare Program Integrity Manual, Chapter 6
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the dashboard format to show an unfavorable but credible month where final CMI
  underperforms working CMI.
- Explain the variance through reconciliation, clinical validation caution, or unresolved
  query timing rather than generic underperformance language.
- Include meaningful quality metrics and top query categories that align with the
  adverse trend.
- Preserve a compliance-forward tone and avoid suggesting revenue chasing.
---

# CDI Program Monthly Dashboard

**Facility**: Harbor Gate Regional Medical Center  
**Reporting Period**: May 2026  
**Prepared By**: Soren Vale, MBA, RN, CCDS, CDIP

## Volume Metrics
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------|------------|-----|--------|
| Total discharges | 1,788 |  |  |  |
| Records reviewed by CDI |  |  |  |  |
| Review rate (%) | 88.2% |  |  | >85% |
| Queries issued |  |  |  |  |
| Query rate (queries/reviews) | 31.4% |  |  | 25-35% |

## Query Metrics
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------|------------|-----|--------|
| Total queries issued |  |  |  |  |
| Queries answered |  |  |  |  |
| Query response rate | 89.1% |  |  | >90% |
| Physician agreement rate | 68.7% |  |  | >70% |
| Query compliance audit score | 95.6% |  |  | >95% |
| Queries by type (CC/MCC / PSI / Specificity / CV) |  |  |  |  |

## Financial Impact
| Metric | This Month | Prior Month | YTD |
|--------|-----------|------------|-----|
| CMI (working) | 1.973 |  |  |
| CMI (final) | 1.941 |  |  |
| CDI-identified DRG changes |  |  |  |
| Estimated revenue impact |  |  |  |
| CDI-coder reconciliation rate | 84.9% |  |  |

## Quality Impact
| Metric | This Month | Prior Month | YTD |
|--------|-----------|------------|-----|
| SOI/ROM accuracy reviews |  |  |  |
| PSI-related queries |  |  |  |
| HAC POA documentation corrections |  |  |  |
| Mortality O/E documentation impact |  |  |  |

## Top Query Categories
| Category | Count | Agreement Rate |
|----------|-------|---------------|
| Heart failure specificity |  |  |
| Respiratory failure |  |  |
| Malnutrition |  |  |
| Sepsis/SIRS |  |  |
| AKI staging |  |  |
| Encephalopathy |  |  |
| Other |  |  |

## Leadership Interpretation
The completed dashboard should make clear that CDI activity remained high and compliant, yet final CMI trended below working CMI because several DRG-changing cases did not survive coder reconciliation or physician advisor validation review. The artifact should tie the variance specifically to malnutrition and respiratory failure documentation support, unanswered discharge-proximate queries, and lower-than-target response and agreement rates.

This should read as a serious but controlled operational signal: the program is not failing at query compliance, but it is overcalling working opportunity relative to final supportable documentation. The action plan should emphasize stronger concurrent follow-up, tighter diagnosis-specific validation standards, and joint CDI-coding review before final bill.
