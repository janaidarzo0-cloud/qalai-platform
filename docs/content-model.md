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
- one or more source references;
- `verification.status = verified`.

A published slug is immutable until a redirect mechanism exists.

## Source and source reference

`Sources` is a canonical registry of official pages and documents. A plain relationship is not enough because evidence applies to a claim in a specific Scenario.

Each embedded source reference records:

- the canonical Source;
- whether it is primary;
- claims supported and editorial evidence;
- checked date;
- effective start and end dates.

## Calculator rule set

`CalculatorRuleSets` stores a calculator key, version, effective period, JSON parameters, sources and verification. JSON is never executed directly. Its calculator module must validate it against a code-owned schema before calculation.

Only one applicable verified rule set should be selected for a calculation date. Ambiguity or a missing rule set must produce an unavailable state, not an estimated formula.

## Localization

The initial public language is Kazakh (`kk`). Translatable fields are marked `localized`, while slugs and machine keys are stable and unlocalized. Russian content is intentionally not part of this MVP.
