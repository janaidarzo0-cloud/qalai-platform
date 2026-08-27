# Closed-alpha editorial review — 2026-08-26

Rechecked: 2026-08-27. EDS is now part of the same structured evidence model as the other ten
routes. The salary formula audit was refreshed against current 2026 KGD, pension, health-insurance
and budget sources; the calculator is available while global indexing remains closed.

This is an agent-assisted evidence and hosted-QA record. It is not independent publication
approval and does not set Payload reviewer fields. Native Kazakh review remains mandatory.

## Hosted acceptance

The production Vercel hostname was tested in deliberately unverified `demo` content mode while
global indexing remained disabled. Eight checks passed:

- database readiness, `robots.txt`, empty sitemap, canonical and `noindex` headers;
- auto-loan, 2026 salary and 2026 vehicle-tax calculation paths;
- EDS official destinations and unverified alpha state;
- About, editorial-policy and privacy pages;
- all ten demand-led Scenario routes with official actions and source links;
- 390 x 844 mobile rendering without horizontal overflow on primary paths.

The imported Payload records remain isolated drafts. Demo mode is only the closed-alpha viewing
surface; it does not promote CMS records or show a verification badge.

## EDS route

Official pages checked:

- [eGov remote EDS service](https://egov.kz/cms/kk/services/reservation_for_busunesses/pass_onlineecp);
- [NCA remote identification](https://pki.gov.kz/ru/poluchenie-flud/);
- [official NCALayer downloads](https://ncl.pki.gov.kz/);
- [NCA owner-only and key-safety notice](https://pki.gov.kz/ru/2025/08/28/%D1%83%D0%B2%D0%B0%D0%B6%D0%B0%D0%B5%D0%BC%D1%8B%D0%B5-%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D0%B8-5/).

Confirmed: valid photo ID/passport record, SMS-capable phone, camera, NCALayer, owner-only issue,
biometric identification, five biometric attempts and key-safety guidance. One material wording
issue was corrected: the one-business-day period applies when failed remote identification sends a
document to operator moderation; it is not presented as the ordinary end-to-end service time.

Remaining gate: native Kazakh terminology and rendered-copy approval by a separate editor.
The desktop and 390 x 844 mobile smoke checks are complete. The current Kazakh NCA application
template and official NCALayer destination are locked by unit and browser tests; both links must
still be rechecked on the publication date because government service URLs can change independently.

## Salary calculator

Official rules rechecked:

- [KGD 2026 income-tax rates and deductions](https://www.gov.kz/memleket/entities/kgd-vko/press/news/details/1238674?lang=ru);
- [KGD monthly basic-deduction rule](https://www.gov.kz/memleket/entities/kgd-zhambyl/press/news/details/1260225?lang=ru);
- [employee pension contribution](https://www.gov.kz/situations/332/intro?lang=ru);
- [2026 employee health-insurance cap](https://www.gov.kz/memleket/entities/almaty-densaulyk/press/news/details/1133766?lang=ru);
- [Ministry of Finance progressive-rate explanation](https://www.gov.kz/memleket/entities/minfin/documents/details/1030415?lang=ru);
- [2026 MRP and minimum wage](https://www.gov.kz/article/17157?lang=ru).

Confirmed: 10% employee pension contribution with a 50 MZW base cap; 2% employee health-insurance
contribution with a 20 MZW base cap; a 30 MRP monthly basic deduction at one tax agent; and the
10%/15% annual income-tax bands above 8,500 MRP. The 140,000-tenge control case has zero income tax,
and the 500,000-tenge standard case produces 408,975 tenge net under the stated assumptions.

The interface now says explicitly that the model assumes one employer and the same salary for all
twelve months. Above the progressive threshold it presents an annual-tax average and tells the user
to verify the actual monthly withholding on the employer payslip. Other employers, other income,
bonuses, exemptions and social deductions remain out of scope.

## Fines route

Official pages checked:

- [administrative-offence information service](https://www.gov.kz/services/3867?lang=kk);
- [eGov fine search and payment guidance](https://www.gov.kz/article/694?lang=ru);
- [eGov payment destination](https://egov.kz/services/P21.01/).

Confirmed: a government online route exists for administrative-offence information, and eGov
documents online search and payment for administrative and traffic fines. QALAI correctly avoids
calculating a discount, tells the user to compare the case data before payment and defers the amount
and deadline to the official system.

Remaining gate: authenticated end-to-end service completion cannot be performed without using a
real citizen's case data; native Kazakh copy review also remains.

## Unemployment registration and payment route

Official pages checked:

- [eGov unemployment registration service](https://egov.kz/cms/kk/services/pass363_mtszn);
- [2026 Ministry of Labour payment guidance](https://www.gov.kz/memleket/entities/enbek/press/news/details/1170681);
- [current government situation guide](https://www.gov.kz/situations/18/99);
- [Social Code](https://adilet.zan.kz/kaz/docs/K2300000224).

Confirmed: registration is free, the service card gives two working days and requires no uploaded
documents. Payment eligibility begins after unemployment registration, requires at least six months
of social-insurance participation and depends on contribution history. The official 2026 guidance
supports the one-to-six-month range, use of the last 24 months of income, the 45% reference rate and
the proactive 1414 route. QALAI correctly refuses to promise a personal amount.

The eligibility section now also reflects the official registration exclusions: employed people,
people under 16, people who reached retirement age, and the student/senior-school group described by
the service card are not presented as automatically eligible.

Remaining gate: authenticated completion and native Kazakh copy review.

## Self-employed regime or individual entrepreneur route

Official pages checked:

- [State Revenue Committee 2026 regime explanation](https://www.gov.kz/memleket/entities/kgd-abay/press/news/details/1230603);
- [current government eligibility guide](https://www.gov.kz/situations/810/1707);
- [permitted activities resolution No. 994](https://adilet.zan.kz/kaz/docs/P2500000994);
- [eGov individual-entrepreneur registration guide](https://egov.kz/cms/kk/articles/ip-registration).

Confirmed: the self-employed regime is limited to Kazakhstan citizens and kandas who are not
registered as individual entrepreneurs, do not employ workers, perform a permitted activity and stay
within 300 MCI per calendar month. For 2026, the official guide gives 1,297,500 tenge; the regime uses
e-Salyq Business and 4% social payments. One material omission was corrected: QALAI now states the
citizen-or-kandas condition in the answer and eligibility checklist instead of presenting only the
business and income conditions.

The 2026 payment wording now states that 4% is the general rule and points pensioners and students
to the individual e-Salyq Business calculation because the current official KGD explanation names
an exemption for these groups. The app calculation remains authoritative for the user's status.

Remaining gate: tax-terminology review by an independent native Kazakh editor and authenticated
device testing of the e-Salyq Business/eLicense routes.

## Individual-entrepreneur opening route

Official pages checked:

- [eGov start-of-activity notification service](https://egov.kz/cms/kk/services/business_registration/reg_ip);
- [eGov online registration guide](https://egov.kz/cms/kk/articles/ip-registration);
- [2026 State Revenue Committee tax-regime guide](https://www.gov.kz/memleket/entities/kgd-abay/press/news/details/1233244?lang=ru).

Confirmed: the notification is free, is completed through eLicense and signed with the applicant's
EDS. The eGov guide says that business may start from submission of the notification and that the
result appears within one working day. QALAI now shows that useful time instead of the vague “online
notification” label. The source link was also corrected from a redirecting Russian URL to the live
Kazakh service card.

Remaining gate: authenticated eLicense completion, 2026 tax-terminology review and native Kazakh
copy approval.

## Individual-entrepreneur closing route

Official pages checked:

- [Ministry of Finance online closing-service announcement](https://www.gov.kz/memleket/entities/minfin/press/news/details/1247311?lang=ru);
- [Ministry of Finance order and current rules](https://www.gov.kz/memleket/entities/minfin/documents/details/925017?lang=ru);
- [Adilet legal record](https://www.adilet.zan.kz/rus/docs/V2500037312);
- [State Revenue Committee 2026 explanation](https://www.gov.kz/memleket/entities/kgd/press/news/details/1168654?lang=ru).

Two material issues were corrected. The controlling act is the acting Minister of Finance order of
31 October 2025 No. 654, as amended by order No. 117 in 2026, not order No. 642. The simplified route
now exposes all seven simultaneous conditions: no VAT registration, no joint entrepreneurship, no
listed Article 104 activity, no tax or social-payment debt, prior-period obligations fulfilled, no
unresolved notices and no open bank accounts.

The official timing is now visible: acceptance or rejection is sent on the filing day; after the tax
obligation is fulfilled, deregistration occurs no later than the following day. Amounts in the
liquidation return must be paid within ten calendar days. QALAI continues to require the user to
confirm final deregistration instead of treating application submission as successful closure.

Remaining gate: authenticated ELC completion and independent tax/native-Kazakh review.

## Child-birth and care payments route

Official pages checked:

- [eGov 2026 allowances and social payments guide](https://egov.kz/cms/kk/articles/disabled_persons/allowance);
- [Ministry of Labour 2026 child-payment explanation](https://www.gov.kz/memleket/entities/enbek/press/news/details/1181117);
- [child-care income-loss service card](https://www.gov.kz/services/3450?lang=kk);
- [Social Code](https://adilet.zan.kz/kaz/docs/K2300000224).

Confirmed: the 2026 one-time birth allowance is 164,350 tenge for the first through third child and
272,475 tenge from the fourth child. The application limit is 18 months, and the portal notification
for the birth allowance is seven working days. The fixed budget care allowance and the insured
income-loss payment remain separate routes; QALAI does not invent a personal insured amount.

One material eligibility omission was corrected. The current Ministry explanation allows claims by
Kazakhstan citizens, kandas and foreigners permanently residing in Kazakhstan. The route no longer
uses the broader phrase “all families” without that status gate. The known one-tenge discrepancy in
second- and third-child monthly amounts remains excluded from the public answer.

Remaining gate: authenticated application, independent benefit-specialist review and native Kazakh
copy approval.

## Kindergarten queue route

Official pages checked:

- [current government service and regional-system router](https://www.gov.kz/services/3042?lang=kk);
- [government queue application guide](https://www.gov.kz/situations/58/219?lang=kk).

The previous generic eGov action URL was not a dependable national entry point. It was replaced with
the current government service card, which routes applicants to different systems by region. The
answer now tells the parent to select the region first and treats the guide's four-organisation
instruction as general guidance, with an explicit warning that the regional interface may differ.

Confirmed: the service is free; general and first-priority applications are processed automatically,
while out-of-turn, sanatorium and special applications can take up to one working day. QALAI still
requires the user to retain the placement notice and monitor the account for vacancy messages.

Remaining gate: authenticated testing in at least three regional systems and native Kazakh copy
approval.

## Residence registration route

Official pages checked:

- [permanent-registration service card](https://www.gov.kz/services/3038?lang=kk);
- [temporary-registration service card](https://www.gov.kz/services/3888?lang=kk);
- [current registration channels and documents guide](https://www.gov.kz/situations/424/1044?lang=ru);
- [registration rules](https://adilet.zan.kz/rus/docs/V2400035045).

The earlier channel warning is no longer appropriate. The live permanent and temporary service
cards both provide an online route, state that the service is free and give a 15-minute portal
processing time. The March 2026 government guide additionally lists service centres and supported
bank applications. QALAI now presents the online route directly instead of asking the user to resolve
the old inconsistency.

Two material details were added: separate residence registration starts at age 14, and a homeowner
must confirm a non-owner's online application within one hour after registration or the request is
automatically rejected. The one-month stay, ten-day application period and retention of permanent
registration during temporary registration remain unchanged.

Remaining gate: authenticated owner/non-owner testing in eGov and at least one supported bank
application, plus native Kazakh copy approval.

## Identity-card expiry route

Official pages checked:

- [current ID service card](https://www.gov.kz/services/3087?lang=ru);
- [2026 online replacement guide](https://www.gov.kz/situations/22/1556?lang=ru);
- [2026 government fee explanation](https://www.gov.kz/situations/22/158?lang=ru);
- [2026 police explanation of the new Tax Code](https://www.gov.kz/memleket/entities/mvd-shymkent/press/news/details/1151733?lang=ru).

Confirmed: online replacement is limited to the expiry reason, from 30 calendar days before expiry
through no more than ten calendar days after it. The normal production time remains up to 15 working
days. From 1 January 2026, first issuance and replacement because of expiry are free under the new Tax
Code, even though two service pages still display the older general 0.2-MCI instruction. QALAI keeps
the newer rule, clearly records the source conflict and advises users not to wait for the overlapping
tenth day.

Remaining gate: authenticated online submission, independent legal review of the exact tenth-day
boundary and native Kazakh copy approval.

## Lost or stolen identity-card route

Official pages checked:

- [current lost-or-stolen ID guide](https://www.gov.kz/situations/22/162);
- [current ID service card and document list](https://www.gov.kz/services/3087?lang=ru);
- [2026 government fee explanation](https://www.gov.kz/situations/22/158?lang=ru);
- [2026 police explanation of repeated-loss fees](https://www.gov.kz/memleket/entities/mvd-shymkent/press/news/details/1151733?lang=ru).

Confirmed: a lost or stolen identity card cannot use the expiry-only online pilot. The user may visit
any convenient service centre. A simple loss requires a written circumstances statement; theft
requires the police notification coupon. The 2026 fee is 0.2 MCI (865 tenge) for the first and second
loss within a year and 1 MCI (4,325 tenge) after more than two losses. The normal production time is
up to 15 working days.

The current administrative threshold remains ten days to one month for a warning and more than one
month for a 7-MCI fine (30,275 tenge in 2026). QALAI continues to exclude an older eGov article's
three-month threshold and preserves the warning that a recovered old card is invalid after the loss
application is filed.

Remaining gate: authenticated service-centre/fee-flow testing, independent legal review and native
Kazakh copy approval.
