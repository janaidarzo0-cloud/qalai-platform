# Calculator architecture

## Registry

Five stable keys are defined in `src/modules/calculators/types.ts`:

- `maternity-benefit`
- `childcare-benefit`
- `vehicle-tax`
- `auto-loan`
- `salary`

The registry is safe to import from Payload configuration because it contains no React client code.

## Module contract

Each implemented calculator should contain:

```text
schema.ts       input and rule-set validation
calculate.ts    pure deterministic calculation
Calculator.tsx  client UI
calculate.test.ts
```

Rules:

- validate before calculating;
- represent tenge as integers at output boundaries;
- specify rounding explicitly;
- include a formula/rule-set version in the result;
- never fetch during the pure calculation;
- never send input or output amounts to analytics;
- display limitations next to the result.

## Auto-loan module

The scaffold implements the standard annuity formula and excludes bank fees, insurance, commissions and campaigns. This module demonstrates the technical contract; it is not a bank offer.

## Government-dependent modules

The other four registry entries have `source-review` status. Their URLs are `noindex` and show a transparent unavailable state. To implement one:

1. collect primary official sources and effective dates;
2. define typed input and rule-set schemas;
3. add control examples independently calculated from official rules;
4. implement the pure function;
5. add minimum, maximum, zero, invalid and date-boundary tests;
6. create and verify a Payload rule set;
7. change registry status only after review.
