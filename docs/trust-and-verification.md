# Trust and verification

## Promise

QALAI may simplify wording, never facts. AI-generated or editorial text cannot invent a number, eligibility rule, document, deadline or action URL.

Primary sources, in order of preference:

1. normative legal act or official registry;
2. `gov.kz`, eGov, tax authority or responsible public body;
3. official service provider;
4. secondary material only as supporting context.

## Editorial workflow

QALAI uses three CMS roles:

- `editor` creates sources and prepares draft revisions;
- `reviewer` verifies facts and publishes or unpublishes content;
- `admin` manages users and settings and has reviewer authority.

The first Admin account is created only through Payload's dedicated first-user flow. Normal anonymous user creation is closed. PostgreSQL advisory transaction locks serialize first-user creation, every role mutation and every user deletion. Bulk user edit and delete are disabled so one transaction cannot remove several Admin roles against the same snapshot.

1. Create a Scenario as a draft. An editor may save a draft revision over a published document but cannot publish or unpublish it.
2. Split the answer into claims and actions.
3. Attach a Source to every material claim and describe the evidence.
4. Record `checkedAt`, effective dates and next review date.
5. A reviewer compares the rendered page, official source and calculator control examples.
6. Mark `verification.status = verified` only when all claims are supported.
7. Publish. Payload's hook rejects an incomplete publish attempt.
8. A material change always clears `reviewedAt` and `reviewedBy` and moves the document to `in-review`. Verification must happen in a separate save.
9. When a source expires or changes, mark the Scenario `stale` or return it to draft before editing.

`reviewedAt`, `reviewedBy` and the first published slug marker are server-managed. A client cannot submit or overwrite them. Any update to a Source used by published content is blocked; a Source with current or historical content references cannot be deleted. A shared PostgreSQL advisory lock serializes Source, Category, RuleSet and Scenario trust-graph changes so publication cannot race a dependency mutation.

## “Qalai тексерді ✓”

The frontend may display this mark only when all conditions are true:

- Payload status is `published`;
- verification status is `verified`;
- a real reviewer and review timestamp exist;
- `nextReviewAt` is in the future;
- every reference marked primary is current and classified as `primary-official` or `official-provider`, and at least one primary reference exists;
- every primary reference has a non-future `checkedAt`, an active `validFrom` and an unexpired `validUntil` when those dates exist;
- every primary Source was last changed no later than its `checkedAt`, and the factual review happened no earlier than every primary reference's `checkedAt`;
- any linked calculator rule set was last changed no later than the Scenario review;
- the linked Category is published.

These conditions are enforced at publication and evaluated again on every public page read, so trust expires without waiting for a database write. Anonymous generic REST/GraphQL reads for Scenarios and calculator rule sets are closed; the public Next.js read model uses a server-only Local API call and the same fail-closed trust predicate.

## Regulated calculators

Salary, maternity, childcare and vehicle-tax modules have source-backed formulas and control
examples but stay in closed alpha and `noindex` until an independent factual and native-language
review. A polished form is not evidence of correctness.

A Scenario can reference a calculator rule set only when that rule set is published, verified, currently effective and backed by a current official primary Source. A rule set used by a published Scenario cannot be changed in the live snapshot, unpublished or deleted; draft revisions remain possible and require a new coordinated review before replacing it.

## Research packs are not reviews

An evidence-backed draft may record a fresh source check without being verified. Automated or
agent-assisted research must not stamp `reviewedAt`, select `reviewedBy`, or publish. The six alpha
drafts covering five user tasks therefore remain unverified and noindex until a separate factual
reviewer checks the rendered content and a native Kazakh-language editor approves the copy. See
[alpha-scenarios.md](alpha-scenarios.md).
