# Product Definition v1

## Product

QALAI is a Kazakh-language service that helps a person complete a household, financial or government task in Kazakhstan.

The primary competitor is fragmentation: opening search, eGov, `gov.kz`, Telegram and video explanations and still not knowing what to do. Official portals remain the place where the service is completed; QALAI is the clear user layer before them.

## Primary user

A Kazakh-speaking or primarily Kazakh-speaking person using a smartphone to solve a concrete task now. The initial hypothesis is adults aged 20–45, but age is not an access rule.

The five questions the interface must answer are:

1. Маған не істеу керек?
2. Қанша?
3. Қандай құжат керек?
4. Қайда барамын?
5. Қанша уақыт алады және маған тиесілі ме?

## North Star

**Resolved Tasks**: sessions in which the user obtains a usable outcome — a calculation, an action plan, a document list, an official-service transition or a clear choice.

Supporting events are defined in [analytics.md](analytics.md).

## Initial jobs to be done

|   # | User job                                  | QALAI response                             |
| --: | ----------------------------------------- | ------------------------------------------ |
|   1 | Obtain or replace a document              | Short route, documents and official action |
|   2 | Open or close an individual business      | Determine the case and guide step by step  |
|   3 | Understand eligible payments              | Eligibility check and calculation          |
|   4 | Calculate maternity or childcare payments | Calculator and result explanation          |
|   5 | Enrol a child in kindergarten or school   | Situation-specific instructions            |
|   6 | Buy or register a vehicle                 | Full cost and required actions             |
|   7 | Calculate tax, insurance or credit        | Calculator                                 |
|   8 | Find and pay a fine or debt               | Short official route                       |
|   9 | Understand net salary and deductions      | Calculator                                 |
|  10 | Understand a government service           | Translate bureaucracy into actions         |

## First 30 scenario pages

### Мемлекет / Құжаттар

1. ЖК қалай ашуға болады?
2. ЖК қалай жабуға болады?
3. ЖК үшін салық режимін қалай таңдау керек?
4. Салық берешегін қалай тексеруге болады?
5. ЭЦҚ қалай алуға болады?
6. ЭЦҚ мерзімін қалай ұзартуға болады?
7. Жеке куәлікті қалай ауыстыру керек?
8. Паспортты қалай алуға болады?
9. Тұрғылықты жерге тіркелу
10. Жұмыссыз ретінде тіркелу
11. Жұмыссыздық төлемін алу
12. Жалақы калькуляторы

### Отбасы / Төлемдер

13. Декреттік төлем калькуляторы
14. Бала күтімі төлемі калькуляторы
15. Бала туу жәрдемақысы қанша?
16. Көпбалалы отбасы жәрдемақысы
17. Бала туғаннан кейін қандай құжаттар керек?
18. Баланы балабақша кезегіне қою
19. Балабақша кезегін тексеру
20. 1-сыныпқа баланы қалай тіркеу керек?

### Авто

21. Көлік салығы калькуляторы
22. Көлікті онлайн қайта тіркеу
23. Көлікті алғаш тіркеу қанша тұрады?
24. Көлік айыппұлын қалай тексеруге болады?
25. Автосақтандыру қалай есептеледі?
26. Бонус-малус класын тексеру
27. Автонесие калькуляторы
28. Көліктің айлық шығыны
29. VIN бойынша көлікті қалай тексеру керек?
30. 10–15 млн ₸ бюджетке көлік таңдау

The five first product modules are maternity payment, childcare payment, vehicle tax, auto loan and salary. A calculator is an interactive product, not an article with a form on top.

## MVP acceptance target

| Area        | Target                                                        |
| ----------- | ------------------------------------------------------------- |
| Product     | 30 working scenarios                                          |
| Tools       | 5 verified calculators                                        |
| Content     | Every factual page has a primary source and verification date |
| SEO         | Indexable public pages, schema and sitemap                    |
| UX          | Mobile-first, answer → action → details                       |
| Analytics   | GA4, Metрика and Search Console readiness                     |
| Performance | No obvious Core Web Vitals regressions                        |
| CMS         | Editors can update structured content without code            |
| Growth      | Reusable scenario structure for short-form content            |
| Feedback    | “Бұл ақпарат пайдалы болды ма?” on every scenario             |
