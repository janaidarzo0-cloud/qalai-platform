# QALAI public launch cohort

Last updated: 2026-08-26

## Fixed first cohort

The first public release is an explicit allowlist, not every draft that happens to exist. Demand
scores come from the August 2026 Kazakhstan demand baseline.

| Tier       | Score | Public task                            | Current gate                            |
| ---------- | ----: | -------------------------------------- | --------------------------------------- |
| Core       |    95 | Obtain EDS                             | Factual and native-Kazakh review        |
| Core       |    94 | Salary calculator                      | Independent formula and language review |
| Core       |    90 | IP/self-employed 2026 tax-regime route | Tax and native-Kazakh review            |
| Core       |    87 | Check and pay fines                    | Factual and native-Kazakh review        |
| Core       |    86 | Unemployment registration and payment  | Legal/factual and native-Kazakh review  |
| Supporting |    63 | Auto-loan calculator                   | Available; final public copy review     |

Vehicle tax is the first fast-follow calculator. Maternity, childcare, kindergarten, residence and
identity-card tasks remain outside the initial indexable allowlist even if their alpha implementation
is accessible to reviewers.

## Automated status

Run `npm run launch:report` for a non-mutating report. It checks the fixed cohort, calculator status,
formula versions, Scenario publication/trust/source/noindex state and the public indexing
configuration. `npm run launch:check` performs the same assessment and exits unsuccessfully while any
launch blocker remains; use it only as the final release gate.

The report is evidence, not editorial approval. It never creates reviewer fields, publishes a draft,
buys a domain or enables indexing.

## Remaining external gates

1. Register and connect the approved custom domain.
2. Create a project-specific public contact mailbox.
3. Complete independent factual and native-Kazakh reviews for the cohort.
4. Publish the reviewed CMS records and re-run hosted acceptance.
5. Configure production analytics, Search Console and sitemap submission.
6. Set the exact canonical origin, indexable host and both explicit launch flags.

Until every gate passes, `robots.txt`, metadata, sitemap and response headers remain closed.
