# Trust and verification

## Promise

QALAI may simplify wording, never facts. AI-generated or editorial text cannot invent a number, eligibility rule, document, deadline or action URL.

Primary sources, in order of preference:

1. normative legal act or official registry;
2. `gov.kz`, eGov, tax authority or responsible public body;
3. official service provider;
4. secondary material only as supporting context.

## Editorial workflow

1. Create a Scenario as a draft.
2. Split the answer into claims and actions.
3. Attach a Source to every material claim and describe the evidence.
4. Record `checkedAt`, effective dates and next review date.
5. A reviewer compares the rendered page, official source and calculator control examples.
6. Mark `verification.status = verified` only when all claims are supported.
7. Publish. Payload's hook rejects an incomplete publish attempt.
8. When a source expires or changes, mark the Scenario `stale` or return it to draft before editing.

## “Qalai тексерді ✓”

The frontend may display this mark only when all conditions are true:

- Payload status is `published`;
- verification status is `verified`;
- review timestamp exists;
- at least one source is attached;
- the review is not past its next-review/valid-until date.

The current scaffold checks the first four conditions; expiry enforcement is a pre-production backlog item.

## Regulated calculators

Salary, maternity, childcare and vehicle-tax modules remain unavailable until their formula, dates, caps, rounding and control examples are supported by official sources. A polished form is not evidence of correctness.
