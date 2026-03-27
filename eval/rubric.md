# Healthcare Agent Evaluation Rubric

> **FROZEN** — This file is the evaluation metric. The eval loop must NEVER modify it.
> Changing this file changes what "good" means, invalidating all prior scores.

## Scale

| Level | Score | General Definition |
|-------|-------|--------------------|
| Exemplary | 4 | Correct, comprehensive, cites specific regulations/codes by name, immediately actionable |
| Proficient | 3 | Correct, covers main points, references specific codes or sections, practical |
| Developing | 2 | Mostly correct but vague, missing key details, generic guidance |
| Novice | 1 | Partially correct, significant gaps, no specific citations |
| Incorrect | 0 | Factually wrong, hallucinated citations, or dangerously misleading |

## Criteria

### Accuracy (Weight: 0.40)

Judge accuracy against what the agent's own .md file states — its guidelines, its referenced sources, its cited regulations. Do NOT independently verify external facts.

| Score | Anchor |
|-------|--------|
| 4 | All statements consistent with the agent's stated guidelines. Names specific sources with publication dates or CFR numbers (e.g., "42 CFR §482.12", "FY 2026 ICD-10-CM Guidelines, Section I.C.9.a.3", "CMS-1785-F published November 2025"). No hallucinated citations. |
| 3 | Statements consistent with the agent's guidelines. References specific codes or regulatory sections (e.g., "ICD-10-CM code I11.-", "CPT 99214") but may lack publication dates or exact CFR numbers. No factual errors. |
| 2 | Mostly correct but relies on general statements without citing specific codes or sections. May reference a regulation by name ("HIPAA") without pinpointing the relevant provision. |
| 1 | Partially correct. Contains vague or unsupported claims. May reference outdated guidelines or use imprecise terminology (e.g., "CMS rules" without specifying which). |
| 0 | Factually wrong. Cites regulations or codes that do not exist, applies guidelines to the wrong context, or provides advice that would cause compliance violations. |

### Completeness (Weight: 0.35)

Does the answer cover all relevant aspects of the question? Are exceptions, edge cases, and conditional logic addressed?

| Score | Anchor |
|-------|--------|
| 4 | Addresses every aspect of the question. Flags relevant exceptions, edge cases, and conditional pathways. Mentions cross-domain implications where applicable (e.g., coding impact on DRG, compliance impact on audit risk). Nothing critical omitted. |
| 3 | Covers the main aspects of the question with minor gaps. May miss one edge case or exception but captures the core workflow and primary decision points. |
| 2 | Addresses the surface-level question but misses significant sub-steps, exceptions, or conditional logic. A practitioner following this advice would need to look up additional information. |
| 1 | Answers only part of the question. Major workflow steps, regulatory requirements, or decision branches are omitted. |
| 0 | Does not meaningfully address the question, or addresses a different question entirely. |

### Specificity (Weight: 0.25)

Does the answer provide actionable, specific guidance rather than generic advice? Could a practitioner act on this immediately?

| Score | Anchor |
|-------|--------|
| 4 | Provides specific codes, section references, timelines, dollar thresholds, or step-by-step procedures. A practitioner could act on this answer without further research. Example: "Assign I11.0 (Hypertensive heart disease with heart failure) per Section I.C.9.a.1, then assign a code from I50.- to identify the type of heart failure." |
| 3 | Provides specific guidance with named codes or sections but lacks the step-by-step detail or conditional logic for full autonomy. The practitioner would need minimal additional lookup. |
| 2 | Gives directionally correct advice but in generic terms. References categories of regulations rather than specific provisions (e.g., "follow CMS guidelines for modifier usage" instead of naming the modifier and the NCCI edit policy). |
| 1 | Vague advice that could apply to almost any healthcare scenario. No specific codes, timelines, or procedures. |
| 0 | Pure platitudes or boilerplate. No actionable content whatsoever. |

## Score Computation

For each question, compute:

```
weighted_score = (Accuracy × 0.40) + (Completeness × 0.35) + (Specificity × 0.25)
```

Average `weighted_score` across all 25 questions. Multiply by 25 for a 0-100 scale.

Example: If a question scores Accuracy=3, Completeness=4, Specificity=3:
  weighted_score = (3 × 0.40) + (4 × 0.35) + (3 × 0.25) = 1.20 + 1.40 + 0.75 = 3.35

## Judge Instructions

1. Score one question at a time. Do not batch or rush.
2. For each question-answer pair, score all three criteria independently.
3. Provide a one-line justification for each score citing specific evidence from the answer.
4. Do NOT inflate scores. A correct but vague answer is Developing (2), not Proficient (3).
5. Do NOT independently verify external facts. Judge accuracy against what the agent's .md file claims and references.
6. Apply the scoring thresholds strictly: a score of 3+ on Accuracy requires specific codes or regulatory sections; a score of 4 requires named sources with dates or CFR numbers.
7. After scoring all 25 questions, compute the overall weighted average and multiply by 25.
