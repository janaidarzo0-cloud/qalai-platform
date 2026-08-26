# Analytics contract

The North Star is `Resolved Tasks`: unique tasks that a participant explicitly completed in an
analytics session. PostgreSQL is the source of truth; GA4 is an optional funnel/reporting sink.

## Counting rule

A task is resolved only when the server receives one of these allowlisted facts:

- a valid calculator result (`calculation`);
- a transition to the primary official action (`official-transition`);
- an explicit “I found my answer” response (`helpful-feedback`).

The browser cannot emit `task_resolved`. The server derives it, verifies that the Scenario is
published and trusted or that the calculator is available, then inserts a row into the hidden
`resolved-tasks` collection. A unique HMAC key over `session + task type + task key` makes the first
method canonical and rejects every later duplicate, including concurrent requests from two tabs.

The anonymous session is a random value in a `HttpOnly`, `Secure`, `SameSite=Lax` cookie with a
rolling 30-minute lifetime. PostgreSQL and GA4 receive only an HMAC; the raw cookie never leaves the
QALAI origin.

| Client event               | Purpose                                       | Can derive resolution |
| -------------------------- | --------------------------------------------- | --------------------- |
| `page_view`                | Canonical public pathname                     | No                    |
| `task_opened`              | Trusted Scenario or available calculator open | No                    |
| `calculator_start`         | Calculator submitted                          | No                    |
| `calculator_complete`      | Success/error only, never values              | Success only          |
| `official_link_click`      | Primary official action selected              | Yes                   |
| `feedback_submitted`       | Found/not found answer                        | Positive only         |
| `search_submitted`         | Query-length and result-count buckets         | No                    |
| `internal_task_link_click` | Fixed source and destination task IDs only    | No                    |

## Consent and exclusions

Analytics is fail-closed. The browser calls only QALAI's same-origin endpoint, and only after the
visitor explicitly grants analytics consent. There is no Google/Yandex browser script. The server
requires a consent cookie, a valid same-origin POST and a bounded strict-schema payload before any
database write or provider call.

These never enter the North Star:

- demo, draft, unverified or stale Scenarios;
- planned/source-review calculators;
- Admin/Payload sessions;
- local/test mode or an analytics-disabled deployment;
- internal QA traffic. Append `?qalai_qa=1` once in the tab to opt out; `?qalai_qa=0` clears it.

## Privacy boundary

The request schema rejects unknown properties. Never collect or send:

- calculator inputs or results, including money, salary, family or vehicle values;
- free-form search text;
- labels, page copy or financial values attached to internal-link events;
- names, IIN, phone numbers, email addresses or user/admin IDs;
- query strings, hashes, referrers or arbitrary URLs;
- Payload draft content, titles, answers or publisher text;
- IP address or user agent as an analytics event field.

The GA4 Measurement Protocol adapter receives only schema/environment, event ID, canonical page
path/location, fixed task identifiers, outcome/helpful flags and safe buckets. Advertising consent
and personalization are denied. Provider failure does not roll back a canonical Resolved Task.

## Environment contract

```dotenv
ANALYTICS_ENABLED=true
ANALYTICS_ENVIRONMENT=staging # staging | production
ANALYTICS_PROVIDER=ga4       # none | ga4
ANALYTICS_HASH_SECRET=<separate random secret, at least 32 characters>
GA4_MEASUREMENT_ID=G-...
GA4_API_SECRET=...
```

Also set `QALAI_CONTENT_MODE=cms`. Staging must use its own GA4 property/data stream and
non-production API secret. Keep `ANALYTICS_PROVIDER=none` when validating the first-party store
without Google.

## Verification checklist

1. Open a clean browser: no `/api/analytics/*` or Google requests occur before consent.
2. Decline: navigating, searching and calculating produce no analytics calls.
3. Accept: one canonical `page_view` and one `task_opened` are sent.
4. Resolve the same task through multiple methods/tabs: one `resolved-tasks` row remains, with the
   first method.
5. Inspect request bodies and GA4 DebugView: no calculator values, query text, query strings,
   referrer, IIN or contacts appear.
6. Repeat with `?qalai_qa=1`, a Payload login and demo mode: no North Star row is created.

Search Console remains a deployment/configuration task, not a runtime SDK.
