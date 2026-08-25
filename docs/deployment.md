# Deployment and database

## Environments

Use separate PostgreSQL databases and secrets for local, preview and production. Never point preview
deployments at production content writes.

Required variables:

```dotenv
DATABASE_URL=
DATABASE_DIRECT_URL=
PAYLOAD_SECRET=
NEXT_PUBLIC_SITE_URL=
QALAI_CONTENT_MODE=cms
PAYLOAD_DB_PUSH=false
ANALYTICS_ENABLED=false
ANALYTICS_ENVIRONMENT=staging
ANALYTICS_PROVIDER=none
ANALYTICS_HASH_SECRET=
GA4_MEASUREMENT_ID=
GA4_API_SECRET=
```

Analytics is optional and fail-closed. Generate `ANALYTICS_HASH_SECRET` separately from
`PAYLOAD_SECRET`. To enable the staging funnel, set `ANALYTICS_ENABLED=true`, use a dedicated staging
GA4 stream/API secret and change `ANALYTICS_PROVIDER=ga4`. Provider credentials are server-only.

## Supabase connection modes

- Direct `:5432`: migrations, backup/restore and persistent IPv6-capable servers.
- Supavisor session `:5432`: persistent clients on IPv4-only networks.
- Supavisor transaction `:6543`: transient/serverless application traffic; prepared statements are
  not supported.

Use `npm run db:migrate` in deployment automation. It validates `DATABASE_DIRECT_URL`, passes it to
an isolated Payload migration process as `DATABASE_URL`, and forces `PAYLOAD_DB_PUSH=false`. The
compatibility alias `npm run db:migrate:direct` performs the same safe operation. There is no
standard npm command that migrates through the runtime pool URL. Use SSL and percent-encode reserved
characters in database passwords.

## Migration flow

Schema push is disabled by default in every environment. A developer may set `PAYLOAD_DB_PUSH=true`
only for a disposable local database; production rejects that setting. Shared and hosted databases
must use committed migrations:

1. change the Payload schema locally;
2. run `npm run generate:types`;
3. create and review a migration with `npm run db:migrate:create`;
4. commit schema, generated types and migration together;
5. apply migrations with `npm run db:migrate` before the production build/deploy;
6. run smoke checks.

## Pre-production gate

- upgrade to the scheduled patched Next.js release compatible with Payload;
- verify all unauthenticated and authenticated Admin routes;
- verify anonymous users cannot retrieve drafts through REST or Local API;
- run `npm run check` from a clean checkout;
- require `/api/health` to return 200 only after its PostgreSQL probe succeeds; database failures
  return 503 without diagnostic details;
- test migration rollback/recovery on a copy of the database;
- configure durable object storage before enabling Media uploads;
- apply the `resolved-tasks` migration before enabling analytics;
- verify consent accept/decline/revoke and the `?qalai_qa=1` internal-traffic exclusion;
- configure a dedicated staging GA4 Measurement Protocol stream and inspect its allowlisted payload;
- confirm `robots.txt`, sitemap, canonical and noindex behavior on the actual hostname.
