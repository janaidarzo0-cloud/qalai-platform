# Closed-alpha editorial review — 2026-08-26

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

Remaining gate: authenticated completion and native Kazakh copy review.

## Self-employed regime or individual entrepreneur route

Official pages checked:

- [State Revenue Committee 2026 regime explanation](https://www.gov.kz/memleket/entities/kgd/press/news/details/1185260);
- [current government eligibility guide](https://www.gov.kz/situations/810/1707);
- [permitted activities resolution No. 994](https://adilet.zan.kz/kaz/docs/P2500000994);
- [eGov individual-entrepreneur registration guide](https://egov.kz/cms/kk/articles/ip-registration).

Confirmed: the self-employed regime is limited to Kazakhstan citizens and kandas who are not
registered as individual entrepreneurs, do not employ workers, perform a permitted activity and stay
within 300 MCI per calendar month. For 2026, the official guide gives 1,297,500 tenge; the regime uses
e-Salyq Business and 4% social payments. One material omission was corrected: QALAI now states the
citizen-or-kandas condition in the answer and eligibility checklist instead of presenting only the
business and income conditions.

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
