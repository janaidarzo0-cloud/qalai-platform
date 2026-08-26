# Kazakhstan search-demand baseline

Captured: 2026-08-25. Decision scope: closed-alpha sequencing and the first public catalogue
expansion. This is a demand baseline, not a forecast of QALAI traffic.

## Sources and method

- [Yandex Wordstat](https://wordstat.yandex.ru/) was set to region `Kazakhstan` (`159`). Counts
  are the rolling-month totals shown during the session, mostly for 24 July–24 August 2026.
- [Google Trends](https://trends.google.com/trends/explore?geo=KZ) was set to Kazakhstan,
  web search and the last 12 months. Its values are normalized comparison indices, not search
  counts. Values from different comparison groups must not be compared directly.
- Russian, Kazakh and mixed-language task formulations were tested separately.
- Google Ads Keyword Planner was not used: the new QALAI Ads account requires completion of a
  campaign-and-billing onboarding flow. QALAI will not create or fund a dummy campaign solely to
  unlock research data.

Wordstat is the absolute-volume signal in this baseline. Google Trends is a corroborating signal for
relative topic strength, language formulation and seasonality. Neither source represents the whole
Kazakhstan search market. Search Console data will become the primary first-party demand signal
after the public site is indexed.

## Wordstat results

The counts below are broad phrase totals. They include morphological variants and longer searches,
so they are suitable for ranking topic clusters rather than forecasting visits to one page.

| Query or cluster                | Rolling-month searches | Product interpretation                                                            |
| ------------------------------- | ---------------------: | --------------------------------------------------------------------------------- |
| `эцп получить`                  |                 14,317 | Strong route demand; online, Kazakhstan and eGov variants dominate                |
| `налоги ип`                     |                  9,509 | Strong recurring need; 2026, simplified regime and tax-choice intents are visible |
| `калькулятор зарплаты`          |                  9,339 | Strong calculator intent with pronounced current-year wording                     |
| `проверить штрафы`              |                  2,989 | Direct action intent; Kazakhstan, vehicle and number-based variants               |
| `пособие по безработице`        |                  2,918 | High-pain route with amount, application and timing questions                     |
| `открыть ип`                    |                  2,717 | Direct route; online, Kazakhstan, eGov and bank-app variants                      |
| `налог на транспорт`            |                  2,679 | Calculator-led cluster; current-year and Kazakhstan wording dominate              |
| `закрыть ип`                    |                  2,677 | Direct route; online and current-year variants are material                       |
| `пособие на ребенка`            |                  1,815 | Broader child-payment cluster discovered inside the `пособие` result set          |
| `очередь в детский сад`         |                  1,350 | Application and queue-check intents; city systems create regional variants        |
| `прописка в казахстане`         |                  1,212 | Permanent, temporary, child and penalty sub-intents                               |
| `декретные выплаты`             |                    868 | Current-year, Kazakhstan, calculator and application variants                     |
| `автокредит калькулятор`        |                    705 | Clear calculator intent, but materially below salary and tax calculators          |
| `замена удостоверения личности` |                    605 | Useful procedural task, but not a top acquisition topic                           |
| `пособие при рождении ребенка`  |                    129 | Narrow wording; should sit inside a broader child-payments journey                |

## Kazakh and mixed-language formulations

Wordstat coverage for Kazakh task phrases is too sparse to use as a direct market-size estimate.
The result is nevertheless useful for query wording:

| Query                    | Wordstat total | Interpretation                                                        |
| ------------------------ | -------------: | --------------------------------------------------------------------- |
| `ЭЦҚ алу`                |            116 | The clearest measured Kazakh action phrase                            |
| `ИП ашу`                 |             55 | Mixed Russian abbreviation plus Kazakh verb is used in practice       |
| `жалақы калькуляторы`    |             10 | Too sparse for market sizing                                          |
| `көлік салығы`           |              8 | Too sparse for market sizing                                          |
| `декреттік төлем`        |              4 | Too sparse for market sizing                                          |
| `жеке куәлікті ауыстыру` |              2 | Too sparse for market sizing                                          |
| `балабақша кезегі`       |              1 | Too sparse for market sizing                                          |
| `ЖК ашу`                 |              0 | Normative abbreviation alone misses the observed mixed-language query |
| `жұмыссыздық төлемі`     |              0 | Zero is a source limitation, not evidence of zero user need           |

Product consequence: QALAI remains Kazakh-first, but search aliases and metadata should understand
the observed mixed form `ИП ашу` and mapped Russian/mixed variants such as `ЭЦП алу`, `прописка`
and `декретные`. Unmeasured variants must be validated later in Search Console. This does not
require publishing a parallel Russian catalogue.

## Google Trends checks

Each row below is one independent comparison group. The figures are the average normalized indices
shown by Google Trends for Kazakhstan over the last 12 months.

| Comparison group                      | Average indices                                                         | Readout                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Broad administrative/financial topics | `пособие` 14; `ИП` 69; `ипотека` 16; `алименты` 5; `ЭЦП` 50             | IP and EDS are the strongest topics in this set                                             |
| Specific operational phrases          | salary calculator 3; IP taxes 4; transport tax 6; check fines 0; EDS 63 | Exact long phrases are sparse; EDS remains robust                                           |
| Broad service topics                  | maternity leave 2; kindergarten 6; unemployment 1; auto loan 5; EDS 63  | Kindergarten and auto loans lead the non-EDS terms in this set                              |
| Broad Kazakh terms                    | `ЭЦҚ` 0; `жалақы` 2; `көлік` 18; `балабақша` 63; `жәрдемақы` 6          | Broad Kazakh searches exist, but exact action phrases are below Trends' reliable resolution |

The IP series reached its relative high in January 2026 in the inspected 12-month comparison,
while EDS demand was present throughout the year. This supports evergreen EDS content and a planned
annual refresh for IP/tax content before the January demand peak.

## Priority model

Every topic is rated from 1 to 5 on five dimensions and converted to the previously agreed
100-point model:

- 50%: Wordstat rolling-month volume band (`V`);
- 20%: strength of task-completion intent (`I`);
- 15%: user value and pain (`P`);
- 10%: feasibility of a reliable official-source answer (`F`);
- 5%: durability and manageable refresh cadence (`D`).

The formula is `10V + 4I + 3P + 2F + D`. Volume bands are explicit: `V=5` for at least 5,000
searches; `V=4` for 2,500–4,999; `V=3` for 1,000–2,499; `V=2` for 500–999; and `V=1` below 500.
The component ratings below make the editorial assessment reproducible. Scores rank research and
production; they do not authorize publication.

| Priority | Topic                                    | V/I/P/F/D | Score | Decision                                                                 |
| -------- | ---------------------------------------- | --------- | ----: | ------------------------------------------------------------------------ |
| P0       | Obtain EDS                               | 5/5/4/5/3 |    95 | First demand-led route after alpha review                                |
| P0       | Salary calculator                        | 5/5/4/4/4 |    94 | Promote ahead of auto-loan as the flagship calculator candidate          |
| P0       | IP taxes and 2026 regime choice          | 5/4/4/4/4 |    90 | High demand, but retain high-risk factual review and versioned rules     |
| P0       | Check vehicle/administrative fines       | 4/5/5/5/2 |    87 | Short official route with strong completion intent                       |
| P0       | Unemployment registration and payment    | 4/5/5/4/3 |    86 | Keep existing alpha work and strengthen amount/timing explanations       |
| P1       | Open IP                                  | 4/5/4/5/2 |    84 | Promote the existing route from demo status after review                 |
| P1       | Close IP                                 | 4/5/4/5/2 |    84 | Add as a separate outcome, not a paragraph on the opening page           |
| P1       | Vehicle-tax calculator                   | 4/5/4/4/3 |    83 | Build before additional credit calculators                               |
| P1       | Child-payment eligibility journey        | 3/5/5/4/3 |    76 | One guided entry route, then distinct birth/childcare outcomes           |
| P1       | Kindergarten application and queue check | 3/5/4/4/2 |    72 | Model regional systems and city variants explicitly                      |
| P1       | Residence registration                   | 3/5/4/4/2 |    72 | Keep in alpha; resolve channel conflict before public release            |
| P2       | Identity-card replacement                | 2/5/4/5/5 |    67 | Keep as a trust/edge-case alpha scenario, not the acquisition flagship   |
| P2       | Maternity-payment calculator             | 2/5/5/3/3 |    64 | Valuable but lower measured phrase volume and high rule-maintenance cost |
| P2       | Auto-loan calculator                     | 2/5/3/5/4 |    63 | Retain as a working product demo; do not let it set catalogue priority   |

## Product decisions

1. Do not discard the existing closed-alpha scenarios. They already test source evidence, regulated
   content, branching and official-action handoff. Alpha is a quality experiment, not a demand chart.
2. Change the public expansion order. EDS, salary, IP tax/regime, fines and vehicle tax move ahead
   of additional document pages and credit tools.
3. Split opening and closing an IP into separate search outcomes.
4. Treat child payments as one discovery journey with separate result pages/calculators; narrow
   birth-benefit wording alone understates the cluster.
5. Mixed-language aliases are now implemented in the private on-site search catalogue while the
   public answer stays Kazakh-first. Validate and refine the phrases from Search Console after launch.
6. Refresh Wordstat and Trends quarterly, before annual tax/benefit updates, and after any major
   search-platform methodology change.
7. Replace proxy demand with Search Console impressions, click-through rate and Resolved Task Rate
   once QALAI has sufficient public data.
