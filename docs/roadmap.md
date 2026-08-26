# QALAI product roadmap

Last updated: 2026-08-26

## Product direction

QALAI will prove a trustworthy search-to-resolution loop and turn it into a publisher business. The
next milestone remains a closed alpha, but scope is now explicitly prioritized by its contribution
to organic traffic and first revenue. The business sequence is documented in
[revenue-strategy.md](revenue-strategy.md).

The alpha must demonstrate:

```text
verified source
→ structured CMS scenario
→ clear mobile answer
→ official action or calculator result
→ privacy-safe resolved-task signal
```

## Status overview

| Area               | Status           | Current position                                                                              |
| ------------------ | ---------------- | --------------------------------------------------------------------------------------------- |
| Technical scaffold | **Done**         | Next.js, Payload, PostgreSQL adapter, CI and public prototype are in place                    |
| Trusted content    | **In progress**  | Ten sourced drafts exist; hosted mobile QA passed; native Kazakh and reviewer approval remain |
| CMS integration    | **Done**         | Committed migrations, idempotent seeds and PostgreSQL integration checks pass                 |
| Calculators        | **On track**     | Auto-loan is available; salary and vehicle tax work in noindex alpha                          |
| Measurement        | **Done locally** | Consent-aware funnel, search-result clicks and atomic session-task deduplication pass CI      |
| Staging            | **Done**         | Vercel, Supabase PostgreSQL/storage, Admin and noindex closed-alpha viewing pass hosted QA    |
| Public launch      | **Not started**  | Five verified demand-led pages, Search Console and policy pages are the gate                  |
| First revenue      | **Not started**  | AdSense follows useful original content and public traffic; no paid acquisition               |

## Now: closed alpha

Target: 2026-09-07. Scope confidence is high for autonomous repository work and medium for hosted staging because it depends on external accounts.

| Initiative                       | Priority | Outcome                                                                                                                           | Owner    | Dependency                                                         |
| -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| Security and editorial authority | P0       | Patched framework versions, role-based publishing, expiring verification and protected internal fields                            | Stefania | Hosted Payload Admin smoke                                         |
| Reproducible CMS database        | P0       | Empty PostgreSQL database reaches a working CMS through committed migrations and seed                                             | Stefania | GitHub Actions PostgreSQL; hosted Supabase for staging             |
| Integration and E2E gate         | P0       | Admin/auth, CRUD, draft isolation, publish-to-page and calculator flows fail safely in CI                                         | Stefania | Baseline migration                                                 |
| Five verified task scenarios     | P0       | Five Kazakh task pages have claim evidence, review dates, working official CTAs and mobile QA                                     | Stefania | Stable official sources; native Kazakh review before wider testing |
| Resolved Tasks measurement       | P0       | One session-task pair is counted at most once; successful calculation, official transition and helpful feedback are distinguished | Stefania | One analytics provider for staging                                 |
| Closed noindex staging           | P0       | Supabase-backed CMS mode is deployed with secrets, readiness checks and no public indexing                                        | Stefania | Supabase, storage and hosting access                               |
| Alpha research run               | P1       | 10–15 target users complete at least 30 task attempts with structured issue capture                                               | Stefania | Staging accepted                                                   |
| Revenue-ready launch foundation  | P1       | About, editorial and privacy pages are done; public domain, Search Console, contact and ad rules remain                           | Stefania | Five independently verified demand-led pages                       |

### Alpha acceptance

- Five verified Scenarios with primary sources, `checkedAt`, `nextReviewAt`, evidence notes and a working official CTA.
- One available auto-loan calculator with boundary copy and complete analytics.
- Committed migration baseline; a clean database can be migrated and seeded reproducibly.
- Payload first-user/login, role restrictions, CRUD and anonymous draft isolation are tested.
- Expired verification cannot display `Qalai тексерді ✓` or remain publicly trusted.
- Critical E2E passes `home → Scenario → official CTA` and `calculator → result` on mobile.
- Staging is entirely `noindex`; public SEO is inspected but not enabled.
- No open P0/P1 defects, no critical/high dependency findings and no sensitive analytics payloads.

Alpha exit signals:

- at least 30 task attempts from 10–15 target users;
- Resolved Task Rate at or above 60%;
- helpful rate at or above 70% among respondents;
- zero material factual errors;
- the three largest comprehension or completion barriers are classified and acted on.

## First five content scenarios

These five scenarios remain the closed-alpha trust and workflow pack; they are not presented as the
highest-volume search topics. The measured Kazakhstan demand baseline and the resulting public
expansion order are documented in [demand-research-2026-08.md](demand-research-2026-08.md).

| Order | Scenario                                                                              | Risk   | Alpha treatment                                                                                 | Primary starting sources                                                                                                                                                                                                                                                                                  |
| ----: | ------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     1 | Жаңа мекенжайға көшіп келдім. Тұрғылықты жерім бойынша қалай тіркелемін?              | Medium | Owner/non-owner and permanent/temporary decision path                                           | [gov.kz situation](https://www.gov.kz/situations/424/intro), [updated process](https://www.gov.kz/memleket/entities/aqmola-selinograd/press/news/details/1107111)                                                                                                                                         |
|     2 | Жеке куәлігімнің мерзімі бітті немесе жоғалды. Қалай ауыстырамын?                     | Medium | Split into two drafts: free expiry route with online eligibility; paid loss/theft route via PSC | [eGov service](https://egov.kz/cms/kk/services/passport/pass003_mvd?mobile=no), [online replacement window](https://www.gov.kz/situations/22/1556?lang=ru), [loss or theft](https://www.gov.kz/situations/22/162?lang=kk)                                                                                 |
|     3 | Бала дүниеге келді. Қандай төлемдер аламын және қанша?                                | Medium | Flagship guided route; version all annual amounts and label calculations preliminary            | [eGov benefits](https://egov.kz/cms/kk/articles/disabled_persons/allowance), [eGov maternity](https://egov.kz/cms/kk/articles/child/ui_decret), [Ministry update](https://www.gov.kz/memleket/entities/enbek/press/news/details/1181117)                                                                  |
|     4 | Жұмыстан айырылдым. Жұмыссыз ретінде тіркеліп, төлемді қалай аламын?                  | High   | Publish route first; calculate only from the effective legal text and validated history inputs  | [Ministry route](https://www.gov.kz/memleket/entities/enbek/press/news/details/1170681), [Social Code article 118](https://adilet.zan.kz/kaz/docs/K2300000224), [appointment rules](https://adilet.zan.kz/kaz/docs/V2300032881)                                                                           |
|     5 | Кәсіп бастаймын. Маған ЖК ашу керек пе, әлде өзін-өзі жұмыспен қамту режимі жарай ма? | High   | Screening and explanation only; QALAI must not choose the tax regime for the user               | [2026 tax regimes](https://www.gov.kz/memleket/entities/kgd-abay/press/news/details/1233244), [self-employed regime](https://www.gov.kz/memleket/entities/kgd-abay/press/news/details/1230603), [IP registration obligation](https://www.gov.kz/memleket/entities/kgd-zhambyl/press/news/details/1263163) |

Review cadence:

- procedural routes: every 90 days or immediately after an official change;
- benefits, taxes and calculations: every 30 days and on any legal/effective-date change;
- every amount and deadline displays an as-of date;
- an official action link accompanies every outcome.

## Demand-led expansion after alpha

The first measured Wordstat and Google Trends pass moves the following work ahead of additional
document pages and credit calculators:

1. obtain EDS;
2. salary calculator;
3. IP taxes and 2026 regime choice;
4. check fines;
5. unemployment registration and payment;
6. open IP;
7. close IP;
8. vehicle-tax calculator — working in closed alpha;
9. maternity-benefit calculator — working in closed alpha;
10. childcare-benefit calculator — working in closed alpha;
11. kindergarten application and queue check.

Mixed-language search aliases now cover the priority catalogue, starting with the observed `ИП ашу`
and mapped variants such as `ЭЦП алу`, `прописка` and `декретные`. They remain private discovery
metadata, never replace the Kazakh-first answer, and will be refined from Search Console evidence.
Search-volume priority does not bypass the source, verification, native-language or publication
gates.

## Ten-day execution plan

| Day | Committed result                                                                                                    |
| --: | ------------------------------------------------------------------------------------------------------------------- |
|   1 | Freeze alpha scope, source register, metric definition and acceptance matrix                                        |
|   2 | Close the Next.js/Payload version gate; strengthen RBAC and verification expiry                                     |
|   3 | Create the baseline migration and CI database integration flow                                                      |
|   4 | Test Admin/auth, role restrictions, REST/Local API CRUD and anonymous draft isolation                               |
|   5 | Complete Resolved Tasks deduplication, page views and calculator resolution; remove or implement placeholder search |
|   6 | Add critical Playwright paths, database-aware readiness and CMS empty states                                        |
| 7–8 | Review ten demand-led drafts; complete native-language, mobile and official-link QA for each                        |
|   9 | Independent factual, Kazakh-language, accessibility and analytics-debug review                                      |
|  10 | Deploy release candidate, run hosted smoke and backup/rollback rehearsal, prepare tester tasks                      |

Days 9–10 retain a 20% buffer for framework, database or hosting incompatibilities.

## Next: public MVP

Time horizon: the following 1–3 months, conditioned on alpha evidence.

- Expand from 5 to 30 verified Scenarios using measured demand and alpha failure patterns.
- Release regulated calculators one by one only with versioned rules, official evidence and control examples.
- Enable public indexing, Search Console and canonical production URLs.
- Add useful search and related-task discovery.
- Establish a content freshness queue and reviewer operating cadence.
- Improve conversion from answer to official action without dark patterns.
- Submit the original-content site to AdSense and run a restrained placement test only after the
  public trust and policy gates pass.

## Later

- Broader scenario catalogue and regional variations.
- Reusable short-form content distribution.
- Personalization that does not require storing sensitive profiles.
- Additional languages only after the Kazakh product proves task completion.

## Explicitly not now

AI chat, user accounts, comments, news, premature ad code, paid Google Ads acquisition, mobile apps,
Russian public content, marketplace functionality, bulk AI publication and unverified regulated
calculators remain out of scope. Display monetization itself is a `Next` item after public launch,
not a discarded direction.

## External dependencies and default decisions

QALAI will use one project owner and one accountable agent until evidence justifies a larger process. Default hosted choices for the alpha are Supabase PostgreSQL/storage and a compatible Next.js host. External resources will be created only after account access and any spending implications are approved.

The only user intervention expected before staging is authorization to use the selected Supabase and hosting accounts. All repository, research, QA and editorial preparation proceeds independently.
