# Architecture

## Decision

QALAI starts as one Next.js application with Payload embedded in the App Router. This keeps the frontend, CMS Admin, Local API, REST API and data model in one deployable unit. A monorepo or separate backend would add coordination cost before there is evidence it is needed.

```text
browser
  ├─ public Next.js pages
  │    ├─ Scenario renderer
  │    ├─ calculator UI
  │    └─ privacy-safe analytics adapter
  └─ Payload Admin
       └─ Payload access control + publish guards
             └─ PostgreSQL (local or Supabase)
```

## Repository boundaries

```text
src/app/(frontend)          public routes and UX
src/app/(payload)           generated-compatible Payload Admin/API routes
src/collections             persistent content schemas
src/fields                  reusable structured fields
src/lib/cms                 public read model and Payload mapping
src/lib/analytics           stable event contract and provider adapter
src/modules/calculators     executable, deterministic calculator code
src/content                 demo-only, noindex UX fixtures
docs                        product and operating decisions
tests                       formula and architecture invariants
```

## Content read path

`QALAI_CONTENT_MODE=demo` returns explicit unverified fixtures so that UI work and CI do not require a database. `cms` mode uses a server-only Payload Local API query with `overrideAccess: true`, an explicit `_status = published` filter and a fail-closed trust mapper that rechecks review, dependency publication and evidence causality at read time. Public homepage and sitemap rendering are dynamic so an expired review cannot remain trusted in a static build artifact.

The override is confined to the server read module. Generic REST/GraphQL reads for regulated Scenarios and calculator rule sets require an authenticated CMS user, preventing a second anonymous surface from bypassing source-expiry checks.

Draft preview is intentionally not implemented yet. When added, it must use a separate authenticated route and `noindex` response.

## Data ownership

- Payload owns schema, migrations and application access control.
- Supabase is managed PostgreSQL in this phase; no parallel Supabase ORM/Auth/Data API layer.
- Calculator code owns algorithms and input schemas.
- `CalculatorRuleSets` owns time-bound official coefficients and source evidence.
- Frontend analytics owns event names, never user-entered values.
- PostgreSQL transaction advisory locks serialize mutations of the publication dependency graph; operations fail closed when no transaction session exists.

## Deferred decisions

- Media storage: local uploads are unsuitable for Vercel; choose S3/Supabase Storage before adding Media.
- Revalidation: add collection hooks and tagged cache invalidation once CMS content replaces demo mode.
- Search: start with Payload/Postgres search only after content exists; do not add a search vendor yet.
- User-facing auth, AI chat, Russian content and mobile apps are out of scope.
