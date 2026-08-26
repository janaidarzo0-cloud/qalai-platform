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

## Salary module

The salary module is a working closed-alpha estimate with formula version
`kz-salary-2026-v2`. It is `noindex` and is not added to public task search until an independent
editorial check is complete.

The first rule set assumes a Kazakhstan resident employee who is not exempt from employee pension
or health-insurance contributions receives the same gross salary in each month of 2026. It includes:

- employee pension contribution: 10%, with a 50 MZW income cap;
- employee health-insurance contribution: 2%, with a 20 MZW income cap;
- an optional basic deduction of 30 MRP per month, used at one tax agent;
- annualized 10%/15% progressive individual-income-tax bands.

The v2 review caps the applied monthly basic deduction at the income remaining after employee social
payments: an unused amount is not carried by the tax agent to the next month. For annual taxable
income above 8,500 MRP, the displayed net amount is explicitly an average month: the annual tax is
calculated first and divided by twelve because actual payroll withholding can vary by month.

It excludes one-off bonuses, employer-paid contributions and special social deductions. Inputs and
results are never sent to analytics.

Primary control sources:

- [2026 individual income tax rates and deductions](https://www.gov.kz/memleket/entities/kgd-vko/press/news/details/1238674?lang=ru);
- [monthly basic-deduction non-carry rule](https://www.gov.kz/memleket/entities/kgd-zhambyl/press/news/details/1260225?lang=ru);
- [employee pension contribution](https://www.gov.kz/situations/332/intro?lang=ru);
- [2026 employee health-insurance cap](https://www.gov.kz/memleket/entities/almaty-densaulyk/press/news/details/1133766?lang=ru);
- [Ministry of Finance progressive-rate explanation](https://www.gov.kz/memleket/entities/minfin/documents/details/1030415?lang=ru);
- [2026 MRP and minimum wage](https://www.gov.kz/article/17157?lang=ru).

## Vehicle-tax module

The vehicle-tax module is a working closed-alpha estimate with formula version
`kz-vehicle-tax-2026-v2`. It remains `noindex` until an independent control calculation and native
Kazakh review are complete.

The first rule set covers category-B passenger cars owned by individuals in the 2026 tax year. It
uses the seven engine-volume bands, the additional 7 tenge per cubic centimetre above the band's
lower boundary for engines over 1,500 cc, age coefficients of 0.7 from 10 through 20 years inclusive
and 0.5 over 20 years, and months of ownership. The acquisition month is included and the disposal
month is excluded when the user determines the ownership-month input. The v2 review corrects the
ten-year boundary, adds engine-band boundary tests and adds a 4,200 cc partial-year control example.
It excludes exemptions, legal entities and other vehicle categories. The final official assessment
must be checked in the KGD portal or e-Salyq Azamat.

Primary control sources:

- [current Tax Code](https://adilet.zan.kz/rus/docs/K2500000214);
- [KGD calculation rules and ownership-period boundaries](https://www.gov.kz/memleket/entities/kgd-zhetysu/press/news/details/1174210);
- [2026 MRP](https://www.gov.kz/article/17157?lang=ru);
- [KGD summary of the 2026 changes](https://www.gov.kz/memleket/entities/kgd-abay/press/news/details/1167191?lang=ru);
- [KGD payment deadline for individuals](https://astana.kgd.gov.kz/ru/news/sroki-i-poryadok-uplaty-naloga-na-transport-v-2026-godu-2-157904).

## Remaining government-dependent modules

Maternity benefit and childcare benefit remain in `source-review` status. Their URLs are `noindex`
and show a transparent unavailable state. To implement one:

1. collect primary official sources and effective dates;
2. define typed input and rule-set schemas;
3. add control examples independently calculated from official rules;
4. implement the pure function;
5. add minimum, maximum, zero, invalid and date-boundary tests;
6. create and verify a Payload rule set;
7. change registry status only after review.
