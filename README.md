# QALAI

QALAI is a mobile-first Kazakh-language service that turns everyday, financial and government tasks in Kazakhstan into clear next steps.

The product is not a replacement for eGov or `gov.kz`. QALAI explains what applies, what to prepare, what it may cost and where to complete the official action.

> Product pattern: **answer → action → details**
>
> North Star: **Resolved Tasks**, not page views.

## What is in this scaffold

- Next.js App Router + TypeScript frontend.
- Payload CMS embedded in the same Next.js application.
- PostgreSQL adapter that accepts a standard Supabase connection string.
- Structured `Scenario`, `Source`, `Category` and versioned calculator rule-set models.
- Role-based editorial workflow and fail-closed publish guard: material changes invalidate review; only reviewer/admin roles can publish; dependency state, evidence causality and review expiry are enforced on publication and public reads.
- Five-calculator registry; auto-loan is available and the source-backed 2026 salary calculator is
  implemented as a noindex closed alpha. The remaining government-dependent formulas stay locked.
- Mobile-first home, Scenario and Calculator page prototypes in Kazakh.
- Metadata, canonical URLs, `robots.txt`, sitemap and conditional HowTo JSON-LD.
- Consent-gated first-party analytics, atomic PostgreSQL Resolved Tasks deduplication and an optional server-side GA4 staging adapter.
- Payload Media with required Kazakh alt text, a 3 MB raster-only guard, local development storage
  and an S3/Supabase Storage-ready hosted adapter.
- Local PostgreSQL Compose file, CI checks and project documentation.

The repository starts in `demo` content mode. Its fixtures are clearly marked unverified and
`noindex`; they include a source-backed EDS route for closed-alpha review and a generic UX sample. A
separate, opt-in source pack contains ten closed-alpha drafts and cannot publish them without the
normal review gates.

## Quick start

Requirements: Node.js `20.9+` (CI uses `24.15`) and Docker for the local PostgreSQL path.

```bash
cp .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the generated random value into `PAYLOAD_SECRET` in `.env`. Never reuse that value across environments. Then continue:

```bash
docker compose up -d postgres
npm install
npm run db:migrate
npm run generate:types
npm run generate:importmap
npm run dev
```

Open:

- site: [http://localhost:3000](http://localhost:3000)
- Payload Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

Create the first Payload user through `/admin`, then switch `QALAI_CONTENT_MODE=cms` when the database contains verified, published content.

## Commands

| Command                      | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `npm run dev`                | Start Next.js and Payload locally        |
| `npm run lint`               | Run ESLint                               |
| `npm run typecheck`          | Run strict TypeScript checks             |
| `npm test`                   | Run calculator and registry tests        |
| `npm run build`              | Create a production build                |
| `npm run build:check`        | Build with non-networked S3 test values  |
| `npm run check`              | Run the full local quality gate          |
| `npm run generate:types`     | Regenerate Payload TypeScript types      |
| `npm run generate:importmap` | Regenerate the Payload Admin import map  |
| `npm run db:migrate:create`  | Create a schema migration                |
| `npm run db:migrate`         | Safely apply using `DATABASE_DIRECT_URL` |
| `npm run db:migrate:direct`  | Alias for the safe migration command     |
| `npm run db:seed`            | Seed non-production demo records         |
| `npm run db:seed:alpha`      | Opt-in import of ten alpha drafts only   |

Generated Payload types and import maps must be committed. CI fails when regeneration changes the worktree.
`npm run build:check` pins a fail-closed demo/indexing/database configuration and injects unreachable
`.example.test` database and S3 values only to exercise the production code path locally; never
deploy that artifact. A deployable `npm run build` requires the real hosted Media variables from
[docs/media.md](docs/media.md).

## Content modes

- `QALAI_CONTENT_MODE=demo`: database-independent UX fixture; never treated as verified or indexed.
- `QALAI_CONTENT_MODE=cms`: public pages use a server-only Payload Local API read, an explicit published-only filter and a current-trust predicate. Generic Scenario/rule-set REST and GraphQL reads remain authenticated.

## Supabase

Payload uses Supabase as managed PostgreSQL; `@supabase/supabase-js` is intentionally not part of the data path.

- Runtime/serverless traffic can use a Supavisor pooled URL in `DATABASE_URL`.
- `npm run db:migrate` requires `DATABASE_DIRECT_URL`, passes it only to the migration child process and forces schema push off. `db:migrate:direct` is an equivalent compatibility alias.
- Payload access control remains the application security boundary; Supabase RLS does not automatically protect privileged direct database connections.

See [deployment.md](docs/deployment.md) before configuring a hosted environment.

## Version gate

The scaffold pins `Payload 3.88.0` and `Next.js 16.3.2`. Payload officially accepts this Next.js range, but an open upstream issue reports blank unauthenticated Admin pages on some Next 16 setups. Next.js also announced a scheduled critical security release for 26 August 2026.

Do not deploy this scaffold unchanged. Before the first hosted environment:

1. install the patched Next.js release;
2. run `/admin/create-first-user` and `/admin/login` smoke tests;
3. run REST CRUD, migration and production-build checks;
4. keep all Payload packages on the same exact version.

Details are tracked in [SECURITY.md](SECURITY.md).

## Documentation

- [Product definition](docs/product-definition.md)
- [Product roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Content model](docs/content-model.md)
- [Closed-alpha Scenario pack](docs/alpha-scenarios.md)
- [Trust and verification](docs/trust-and-verification.md)
- [Calculators](docs/calculators.md)
- [Analytics](docs/analytics.md)
- [Editorial media](docs/media.md)
- [Deployment](docs/deployment.md)

## Explicitly out of scope for this phase

AI chat, mobile apps, Russian content, user accounts, comments/forum, news, advertising integrations, marketplace features and bulk content generation.
