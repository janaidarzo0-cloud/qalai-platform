# Deployment and database

## Environments

Use separate PostgreSQL databases and secrets for local, preview and production. Never point preview deployments at production content writes.

Required variables:

```dotenv
DATABASE_URL=
DATABASE_DIRECT_URL=
PAYLOAD_SECRET=
NEXT_PUBLIC_SITE_URL=
QALAI_CONTENT_MODE=cms
```

Analytics IDs are optional. The app remains functional when they are empty.

## Supabase connection modes

- Direct `:5432`: migrations, backup/restore and persistent IPv6-capable servers.
- Supavisor session `:5432`: persistent clients on IPv4-only networks.
- Supavisor transaction `:6543`: transient/serverless application traffic; prepared statements are not supported.

Use the direct URL for `npm run db:migrate`. Use SSL and percent-encode reserved characters in database passwords.

## Migration flow

Development can use Payload/Drizzle push against a disposable local database. Production must use committed migrations:

1. change the Payload schema locally;
2. run `npm run generate:types`;
3. create and review a migration with `npm run db:migrate:create`;
4. commit schema, generated types and migration together;
5. apply migrations before the production build/deploy;
6. run smoke checks.

## Pre-production gate

- upgrade to the scheduled patched Next.js release compatible with Payload;
- verify all unauthenticated and authenticated Admin routes;
- verify anonymous users cannot retrieve drafts through REST or Local API;
- run `npm run check` from a clean checkout;
- test migration rollback/recovery on a copy of the database;
- configure durable object storage before enabling Media uploads;
- set consent-aware GA4/Metрика loaders if analytics is enabled;
- confirm `robots.txt`, sitemap, canonical and noindex behavior on the actual hostname.
