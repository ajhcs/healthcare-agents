# Handoff Map

Use one primary agent for the work product. Add supporting agents only when the
request crosses into another specialty. The agent should name handoffs, not blur
distinct accountabilities.

## Handoff Taxonomy

| Handoff type | Meaning |
|---|---|
| Primary agent | Owns the main analysis and deliverable |
| Supporting agent | Adds domain-specific review or a focused subsection |
| Human escalation owner | Makes final clinical, legal, compliance, contracting, coding, billing, employment, or executive decisions |

## Common Workflows

| Workflow | Primary | Supporting agents | Human escalation |
|---|---|---|---|
| Clean-claim or denial recovery | `revenue-cycle-specialist` | `revenue-medical-coding-specialist`, `revenue-contract-analyst`, `clinical-prior-authorization-specialist` | Revenue cycle director, CFO, compliance/legal |
| Coding/CDI/DRG accuracy | `clinical-documentation-improvement-specialist` or `revenue-medical-coding-specialist` | `healthit-information-manager`, `revenue-cycle-specialist` | Physician advisor, coding compliance, coder/physician of record |
| Prior auth and medical necessity | `clinical-prior-authorization-specialist` | `clinical-utilization-management-specialist`, `payer-relations-specialist`, `healthit-interoperability-engineer` | Ordering clinician, physician advisor, payer medical director |
| UM, case management, and discharge barriers | `clinical-case-manager` | `clinical-utilization-management-specialist`, `clinical-care-management-specialist`, `clinical-referral-specialist` | Attending physician, case management director, ethics/legal |
| Survey readiness | `quality-accreditation-specialist` | `quality-compliance-officer`, `quality-patient-safety-officer`, operations agent for the setting | Accreditation lead, executive sponsor, compliance/legal |
| Safety event to corrective action | `quality-patient-safety-officer` | `quality-risk-manager`, `quality-process-improvement-analyst`, `pharmacy-medication-safety-specialist` when medication-related | Patient safety officer, clinical executive, legal/risk |
| HIPAA/ROI/legal health record | `healthit-information-manager` | `quality-compliance-officer`, `quality-risk-manager` | Privacy officer, HIM director, legal counsel |
| ED boarding and bed capacity | `operations-hospital-administrator` | `strategy-clinical-operations-consultant`, `operations-workforce-manager`, `clinical-case-manager` | COO/CNO, medical staff leadership, incident command |
| Ambulatory access and referral leakage | `operations-ambulatory-manager` | `clinical-referral-specialist`, `operations-physician-practice-manager`, `quality-patient-experience-coordinator` | Clinic dyad leadership, practice executive |
| VBC performance | `payer-value-based-care-manager` | `pophealth-population-health-manager`, `strategy-actuarial-advisor`, `clinical-care-management-specialist` | ACO governance board, finance/actuarial leadership, compliance |
| Public health and infection-control response | `clinical-infection-prevention-specialist` or `pophealth-surveillance-coordinator` | `emergency-preparedness-coordinator`, `healthit-interoperability-engineer` | Infection prevention director, public health authority, incident command |
| EHR, interface, and analytics change | `healthit-informatics-manager` | `healthit-epic-applications-analyst`, `healthit-interoperability-engineer`, `healthit-clinical-data-analyst` | CMIO/CNIO, data governance, privacy/security |
| 340B, pharmacy, and charge integrity | `revenue-340b-program-manager` | `pharmacy-benefits-specialist`, `revenue-chargemaster-analyst`, `quality-compliance-officer` | 340B steering committee, pharmacy leadership, legal/compliance |
| Workforce and staffing redesign | `operations-workforce-manager` | `strategy-clinical-operations-consultant`, `operations-hospital-administrator`, setting-specific operations agent | CNO/HR leadership, labor relations counsel |
| Emergency preparedness | `emergency-preparedness-coordinator` | `operations-hospital-administrator`, `operations-workforce-manager`, `operations-supply-chain-manager`, `clinical-infection-prevention-specialist` | Incident commander, emergency management leader, executive/legal |

## Handoff Rules

- If the user asks for one deliverable, keep one primary owner and include a handoff section inside that deliverable.
- If the user asks for a cross-functional plan, identify workstreams by agent specialty and name the human owner for sign-off.
- If the task depends on local law, payer policy, code sets, accreditation standards, or contracts, state the source that must be verified.
- If the task includes PHI, remind the user to use an approved environment and minimum-necessary data.
- If the task asks for final clinical, legal, coding, billing, audit, employment, or contracting decisions, provide decision support and route final authority to the named human owner.
