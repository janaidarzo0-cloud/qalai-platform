# Architecture

## Decision

QALAI starts as one Next.js application with Payload embedded in the App Router. This keeps the frontend, CMS Admin, Local API, REST API and data model in one deployable unit. A monorepo or separate backend would add coordination cost before there is evidence it is needed.

```text
browser
  ├─ public Next.js pages
  │    ├─ Scenario renderer
  │    ├─ calculator UI
  │    └─ consent-gated first-party analytics transport
  └─ Payload Admin
       └─ Payload access control + publish guards
             ├─ PostgreSQL (content + canonical Resolved Tasks)
             ├─ public editorial Media → S3/Supabase Storage
             └─ optional server-side GA4 staging sink
```

## Repository boundaries

```text
src/app/(frontend)          public routes and UX
src/app/(payload)           generated-compatible Payload Admin/API routes
src/collections             persistent content schemas
src/fields                  reusable structured fields
src/lib/cms                 public read model and Payload mapping
src/lib/analytics           strict event contract, server ingest and provider adapter
src/lib/search              local published-task search
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
- Payload owns Media metadata; a dedicated public S3-compatible bucket owns public image bytes.
- Calculator code owns algorithms and input schemas.
- `CalculatorRuleSets` owns time-bound official coefficients and source evidence.
- The browser owns factual interaction signals but cannot declare a resolved task.
- PostgreSQL owns deduplicated Resolved Tasks; the GA4 sink is best-effort reporting only.
- Search runs locally over a server-built index of trusted public tasks.
- PostgreSQL transaction advisory locks serialize mutations of the publication dependency graph; operations fail closed when no transaction session exists.

## Deferred decisions

- Image transformation: keep original raster uploads in alpha; add reviewed responsive derivatives
  only after real page-weight measurements justify the processing and cache surface.
- Revalidation: add collection hooks and tagged cache invalidation once CMS content replaces demo mode.
- Search ranking: keep the current local index through alpha; evaluate PostgreSQL full-text search only
  after content volume or measured misses justify it.
- User-facing auth, AI chat, Russian content and mobile apps are out of scope.
