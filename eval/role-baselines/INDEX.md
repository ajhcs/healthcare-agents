# Role Baseline Index

> FROZEN expected capability baselines for eval question generation.
> Every installable healthcare agent should have one matching baseline.

## Policy

- Baselines define what a role should handle, independent of the current prompt.
- `/eval` reads the matching baseline before generating questions.
- Baselines are frozen once reviewed; update only through an explicit baseline-review task.
- Do not create baselines for retired utility prompts or non-installable agents.

## Coverage

| Agent Slug | Agent Name | Baseline | Status |
|---|---|---|---|
| `clinical-care-management-specialist` | Care Management Specialist | `eval/role-baselines/clinical-care-management-specialist.md` | Draft frozen |
| `clinical-case-manager` | Case Manager | `eval/role-baselines/clinical-case-manager.md` | Draft frozen |
| `clinical-documentation-improvement-specialist` | Documentation Improvement Specialist | `eval/role-baselines/clinical-documentation-improvement-specialist.md` | Draft frozen |
| `clinical-infection-prevention-specialist` | Infection Prevention Specialist | `eval/role-baselines/clinical-infection-prevention-specialist.md` | Draft frozen |
| `clinical-prior-authorization-specialist` | Prior Authorization Specialist | `eval/role-baselines/clinical-prior-authorization-specialist.md` | Draft frozen |
| `clinical-referral-specialist` | Referral Specialist | `eval/role-baselines/clinical-referral-specialist.md` | Draft frozen |
| `clinical-research-coordinator` | Clinical Research Coordinator | `eval/role-baselines/clinical-research-coordinator.md` | Draft frozen |
| `clinical-utilization-management-specialist` | Utilization Management Specialist | `eval/role-baselines/clinical-utilization-management-specialist.md` | Draft frozen |
| `emergency-preparedness-coordinator` | Emergency Preparedness Coordinator | `eval/role-baselines/emergency-preparedness-coordinator.md` | Draft frozen |
| `healthit-clinical-data-analyst` | Clinical Data Analyst | `eval/role-baselines/healthit-clinical-data-analyst.md` | Draft frozen |
| `healthit-epic-applications-analyst` | Epic Applications Analyst | `eval/role-baselines/healthit-epic-applications-analyst.md` | Draft frozen |
| `healthit-informatics-manager` | Health Informatics Manager | `eval/role-baselines/healthit-informatics-manager.md` | Draft frozen |
| `healthit-information-manager` | Health Information Manager | `eval/role-baselines/healthit-information-manager.md` | Draft frozen |
| `healthit-interoperability-engineer` | Healthcare Interoperability Engineer | `eval/role-baselines/healthit-interoperability-engineer.md` | Draft frozen |
| `healthit-telehealth-program-manager` | Telehealth Program Manager | `eval/role-baselines/healthit-telehealth-program-manager.md` | Draft frozen |
| `operations-ambulatory-manager` | Ambulatory Operations Manager | `eval/role-baselines/operations-ambulatory-manager.md` | Draft frozen |
| `operations-home-health-administrator` | Home Health Administrator | `eval/role-baselines/operations-home-health-administrator.md` | Draft frozen |
| `operations-hospital-administrator` | Hospital Operations Administrator | `eval/role-baselines/operations-hospital-administrator.md` | Draft frozen |
| `operations-long-term-care-administrator` | Long-Term Care Administrator | `eval/role-baselines/operations-long-term-care-administrator.md` | Draft frozen |
| `operations-physician-practice-manager` | Physician Practice Manager | `eval/role-baselines/operations-physician-practice-manager.md` | Draft frozen |
| `operations-supply-chain-manager` | Supply Chain Manager | `eval/role-baselines/operations-supply-chain-manager.md` | Draft frozen |
| `operations-workforce-manager` | Healthcare Workforce Manager | `eval/role-baselines/operations-workforce-manager.md` | Draft frozen |
| `payer-credentialing-enrollment-coordinator` | Credentialing & Enrollment Coordinator | `eval/role-baselines/payer-credentialing-enrollment-coordinator.md` | Draft frozen |
| `payer-managed-care-analyst` | Managed Care Analyst | `eval/role-baselines/payer-managed-care-analyst.md` | Draft frozen |
| `payer-medicare-medicaid-specialist` | Medicare & Medicaid Specialist | `eval/role-baselines/payer-medicare-medicaid-specialist.md` | Draft frozen |
| `payer-medicare-outreach-coordinator` | Medicare Outreach Coordinator | `eval/role-baselines/payer-medicare-outreach-coordinator.md` | Draft frozen |
| `payer-relations-specialist` | Payer Relations Specialist | `eval/role-baselines/payer-relations-specialist.md` | Draft frozen |
| `payer-value-based-care-manager` | Value-Based Care Manager | `eval/role-baselines/payer-value-based-care-manager.md` | Draft frozen |
| `pharmacy-benefits-specialist` | Pharmacy Benefits Specialist | `eval/role-baselines/pharmacy-benefits-specialist.md` | Draft frozen |
| `pharmacy-medication-safety-specialist` | Medication Safety Specialist | `eval/role-baselines/pharmacy-medication-safety-specialist.md` | Draft frozen |
| `pophealth-community-health-coordinator` | Community Health Coordinator | `eval/role-baselines/pophealth-community-health-coordinator.md` | Draft frozen |
| `pophealth-population-health-manager` | Population Health Manager | `eval/role-baselines/pophealth-population-health-manager.md` | Draft frozen |
| `pophealth-surveillance-coordinator` | Public Health Surveillance Coordinator | `eval/role-baselines/pophealth-surveillance-coordinator.md` | Draft frozen |
| `quality-accreditation-specialist` | Accreditation Specialist | `eval/role-baselines/quality-accreditation-specialist.md` | Draft frozen |
| `quality-compliance-officer` | Compliance Officer | `eval/role-baselines/quality-compliance-officer.md` | Draft frozen |
| `quality-improvement-specialist` | Quality Improvement Specialist | `eval/role-baselines/quality-improvement-specialist.md` | Draft frozen |
| `quality-patient-experience-coordinator` | Patient Experience Coordinator | `eval/role-baselines/quality-patient-experience-coordinator.md` | Draft frozen |
| `quality-patient-safety-officer` | Patient Safety Officer | `eval/role-baselines/quality-patient-safety-officer.md` | Draft frozen |
| `quality-process-improvement-analyst` | Process Improvement Analyst | `eval/role-baselines/quality-process-improvement-analyst.md` | Draft frozen |
| `quality-risk-manager` | Risk Manager | `eval/role-baselines/quality-risk-manager.md` | Draft frozen |
| `revenue-340b-program-manager` | 340B Program Manager | `eval/role-baselines/revenue-340b-program-manager.md` | Draft frozen |
| `revenue-chargemaster-analyst` | Chargemaster Analyst | `eval/role-baselines/revenue-chargemaster-analyst.md` | Draft frozen |
| `revenue-contract-analyst` | Healthcare Contract Analyst | `eval/role-baselines/revenue-contract-analyst.md` | Draft frozen |
| `revenue-cycle-specialist` | Revenue Cycle Specialist | `eval/role-baselines/revenue-cycle-specialist.md` | Draft frozen |
| `revenue-finance-manager` | Healthcare Finance Manager | `eval/role-baselines/revenue-finance-manager.md` | Draft frozen |
| `revenue-medical-coding-specialist` | Medical Coding Specialist | `eval/role-baselines/revenue-medical-coding-specialist.md` | Draft frozen |
| `strategy-actuarial-advisor` | Healthcare Actuarial Advisor | `eval/role-baselines/strategy-actuarial-advisor.md` | Draft frozen |
| `strategy-clinical-operations-consultant` | Clinical Operations Consultant | `eval/role-baselines/strategy-clinical-operations-consultant.md` | Draft frozen |
| `strategy-healthcare-consultant` | Healthcare Strategy Consultant | `eval/role-baselines/strategy-healthcare-consultant.md` | Draft frozen |
| `strategy-operations-consultant` | Healthcare Operations Consultant | `eval/role-baselines/strategy-operations-consultant.md` | Draft frozen |
| `strategy-structural-improvement-consultant` | Structural Improvement Consultant | `eval/role-baselines/strategy-structural-improvement-consultant.md` | Draft frozen |
