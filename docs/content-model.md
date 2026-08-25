# Structured content model

## Scenario

`Scenarios` represents a task, not an article. Its public shape answers the user's task in a stable order.

| Group            | Fields                                        |
| ---------------- | --------------------------------------------- |
| Identity         | `title`, stable `slug`, `category`            |
| Immediate answer | `shortAnswer`, `whoIsItFor`, `eligibility[]`  |
| Preparation      | `requirements[]`, `documents[]`               |
| Expectations     | structured `cost`, `processingTime`           |
| Action           | ordered `steps[]`, `officialLinks[]`          |
| Product          | optional `calculatorRuleSet`                  |
| Help             | `faq[]`, `relatedScenarios[]`                 |
| Evidence         | `sourceReferences[]`, `verification`          |
| Discovery        | `seo.title`, `seo.description`, `seo.noIndex` |

Payload `_status` is the editorial draft/published state. It must not be duplicated as a custom content-status field. `verification.status` answers a different question: whether the factual claims are reviewed and current.

### Publish guard

A published Scenario must have:

- one or more action steps;
- one or more official action links;
- a current primary reference to a Source classified as `primary-official` or `official-provider`;
- a non-future source check timestamp after that Source's latest registry update, active source validity dates, and a factual review at or after the check;
- `verification.status = verified`, a server-stamped reviewer and review time, and a future `nextReviewAt`;
- reviewer or admin authority for the publish transition;
- a published Category;
- when `calculatorRuleSet` is present, a published, verified and currently effective linked rule set with its own current official evidence, last updated no later than the Scenario review.

A server-managed `publishedSlug` marker makes a slug immutable after its first publication, including across unpublish/republish cycles, until a redirect mechanism exists. A material field change resets verification to `in-review` and must be reviewed in a later save before publication.

## Source and source reference

`Sources` is a canonical registry of official pages and documents. `trustTier` defaults to `secondary`; only a reviewer or admin may classify a Source as official. A plain relationship is not enough because evidence applies to a claim in a specific Scenario.

Each embedded source reference records:

- the canonical Source;
- whether it is primary;
- claims supported and editorial evidence;
- exact checked date and time;
- effective start and end dates.

## Calculator rule set

`CalculatorRuleSets` stores a calculator key, version, effective period, JSON parameters, sources and verification. JSON is never executed directly. Its calculator module must validate it against a code-owned schema before calculation.

Only one applicable verified rule set should be selected for a calculation date. Ambiguity or a missing rule set must produce an unavailable state, not an estimated formula.

Anonymous generic CMS reads for Scenarios and rule sets are disabled. Public pages query them server-side and expose only the mapped, current trust state.

## Localization

The initial public language is Kazakh (`kk`). Translatable fields are marked `localized`, while slugs and machine keys are stable and unlocalized. Russian content is intentionally not part of this MVP.

## Closed-alpha draft import

The five research-backed alpha drafts live in a code-reviewed source pack rather than the public
demo fixture. `npm run db:seed:alpha` requires `QALAI_ALLOW_ALPHA_SEED=true`, imports only missing
records, and always uses draft, unverified and noindex state. Claim ledgers and conflict decisions
remain in the pack; the CMS receives their official Source references and internal evidence notes.

See [alpha-scenarios.md](alpha-scenarios.md) for the review and publication procedure.
