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
