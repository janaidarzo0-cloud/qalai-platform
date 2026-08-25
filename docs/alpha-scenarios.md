# Closed-alpha Scenario pack

Checked: 2026-08-25. Mandatory next review: 2026-09-25.

The repository contains five evidence-backed Kazakh draft Scenarios in
`src/content/alpha-scenarios.ts`. They answer the agreed alpha tasks:

1. permanent or temporary residence registration;
2. identity-card replacement after expiry, loss or theft;
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
- no regulated calculator rule set is attached.

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

Without the explicit flag the command fails closed. It may be run again: existing Sources,
Categories and Scenarios are preserved, while missing draft records are created.

## Recorded conflict decisions

| Scenario               | Conflict                                                                                              | Alpha decision                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Residence registration | The live temporary-registration card and the effective service rules disagree on channel and duration | Keep the duty and eligibility; do not promise a fixed temporary-registration channel or 15-minute completion until MIA/1414 confirms it |
| Identity card          | Some official instructions still show the old 0.2 MCI fee for expiry replacement                      | Follow the 2026 Tax Code and the newer MIA explanation: expiry replacement is free; retain the fee only for loss                        |
| Child payments         | Official sources differ by one tenge for second- and third-child monthly benefits                     | Show the legal MCI coefficients, not a disputed converted amount                                                                        |
| Unemployment payment   | The exact amount depends on the fund's contribution history                                           | Explain the route and eligibility; do not estimate a personal amount                                                                    |
| IP vs self-employed    | Some official explanations convert the 360 MCI threshold using a stale MCI                            | Exclude that converted amount and use the direct 2026 self-employed conditions plus the current legal text                              |

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
