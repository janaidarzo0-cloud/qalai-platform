# Closed-alpha Scenario pack

Checked: 2026-08-25. Mandatory next review: 2026-09-25.

The repository contains six evidence-backed Kazakh draft Scenarios in
`src/content/alpha-scenarios.ts`. They answer the five agreed alpha tasks:

1. permanent or temporary residence registration;
2. identity-card replacement, deliberately split into separate expiry and loss/theft drafts;
3. childbirth and childcare payments;
4. unemployment registration and work-loss payment;
5. choosing between the 2026 self-employed regime and registering an IP.

Each draft includes eligibility, requirements, documents, cost/as-of information, processing
time, ordered actions, official CTAs, FAQ, material claims, evidence notes, source keys, recorded
conflicts, and a publication-blocker list. Every material claim is mapped to a registered official
source. Unsupported or conflicting claims are recorded as `excluded`; they are not silently turned
into user guidance.

## Safety state

The pack is deliberately not public:

- every Scenario is imported as `_status: draft`;
- `verification.status` remains `unverified` and `riskLevel` is `high`;
- `seo.noIndex` is always true;
- the seed never updates an existing Scenario, so it cannot overwrite editorial work;
- Payload's normal reviewer-only publish gate still applies;
- no regulated calculator rule set is attached;
- every calendar-bound 2026 snapshot is a primary reference wherever it supports an included claim
  and expires at `2027-01-01 00:00` in Kazakhstan (`2026-12-31T19:00:00Z`).

Research completion is not publication approval. A separate native Kazakh-language editor and an
accountable factual reviewer must review the rendered page. Hosted mobile and official-link QA must
also pass.

## Import into a review database

Run migrations first. Then explicitly opt in for one command:

```bash
QALAI_ALLOW_ALPHA_SEED=true npm run db:seed:alpha
```

On PowerShell:

```powershell
$env:QALAI_ALLOW_ALPHA_SEED='true'
npm run db:seed:alpha
Remove-Item Env:QALAI_ALLOW_ALPHA_SEED
```

Without the explicit flag the command fails closed. It may be run again against the same source-pack
version: matching Sources, Categories and Scenarios are preserved, while missing draft records are
created.

Each seeded Scenario stores the current `[alpha-source-pack:...]` marker. Before writing anything,
the importer checks that existing alpha Scenarios carry that marker, that their populated Source
links still point to the reviewed URLs with the expected primary/validity settings, and that existing
Sources still match the reviewed metadata. If an older pack or any drift is detected, the import
stops instead of silently mixing two research versions. Recreate a disposable review database or
reconcile the affected records through the editorial workflow before rerunning it.

## Identity-card split

The earlier combined `zheke-kualikti-auystyru` draft mixed two different outcomes. It has been
retired from the source pack and replaced by:

- `zheke-kualik-merzimi-ayaktaldy`: expiry, with an online-first route and no standard state duty
  in 2026;
- `zheke-kualik-zhogaldy-nemese-urlandy`: loss or theft, with a PSC-only route, situation-specific
  documents and a state duty.

The live gov.kz PSC-queue information page remains linked as information only. Its internal online
transition returned 404 on 2026-08-25, so the drafts do not promise that the link completes a booking;
working end-to-end booking must be retested before publication.

The seed never deletes existing editorial records. If the retired combined slug exists only as a
draft, the seed emits a warning and leaves it untouched. If that slug is published, the seed stops
before writing anything: unpublish it through the reviewed editorial workflow first. Then confirm
both replacement drafts exist and remove the retired draft only through a deliberate reviewed
operation.

## Recorded conflict decisions

| Scenario               | Conflict                                                                                                     | Alpha decision                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Residence registration | The live temporary-registration card and the effective service rules disagree on channel and duration        | Keep the duty and eligibility; do not promise a fixed temporary-registration channel or 15-minute completion until MIA/1414 confirms it  |
| Identity card expiry   | Some official instructions still show the old 0.2 MCI fee for expiry replacement                             | Follow the 2026 Tax Code and the newer MIA explanation: expiry replacement is free; keep loss fees only in the separate loss/theft draft |
| Identity expiry day 10 | The online window includes day 10 after expiry while administrative-document rules also start at day 10      | State the official online window exactly, advise against waiting, and do not promise that day 10 is free of an administrative question   |
| Identity loss deadline | A 2025 eGov article still uses a three-month penalty threshold; current Code and service cards use one month | Follow Administrative Code article 492 and current service cards; exclude the stale three-month threshold                                |
| Identity loss location | The same older article restricts the PSC location; current service pages allow any convenient PSC            | Follow the current service pages and exclude the stale territorial restriction                                                           |
| Child payments         | Official sources differ by one tenge for second- and third-child monthly benefits                            | Show the legal MCI coefficients, not a disputed converted amount                                                                         |
| Unemployment payment   | The exact amount depends on the fund's contribution history                                                  | Explain the route and eligibility; do not estimate a personal amount                                                                     |
| IP vs self-employed    | Some official explanations convert the 360 MCI threshold using a stale MCI                                   | Exclude that converted amount and use the direct 2026 self-employed conditions plus the current legal text                               |

## Review checklist

For each Scenario, the reviewer must:

1. open every official source and CTA on the review date;
2. confirm each included claim and the recorded conflict decision;
3. confirm amounts, deadlines, effective dates and regional limitations;
4. review the Kazakh copy independently, including tax and social-insurance terminology;
5. test the rendered page at narrow mobile width and with keyboard navigation;
6. keep `noIndex` during the closed alpha;
7. set a future `nextReviewAt`, mark the Scenario verified, and publish only in a separate reviewer
   save after its Category is published.

If a source changed, the draft must be revised and reviewed again. A reviewer must not convert the
research check timestamp into a human approval without performing the review.
