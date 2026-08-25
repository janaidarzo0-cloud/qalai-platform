# Security policy

## Current release gate

QALAI is an initial development scaffold, not a production release.

On 25 August 2026:

- Next.js announced a critical security patch scheduled for 26 August 2026.
- Payload issue [#17545](https://github.com/payloadcms/payload/issues/17545) remained open and described blank unauthenticated Admin routes on tested Next 16 versions.
- The related Payload fix PR [#17638](https://github.com/payloadcms/payload/pull/17638) was still open, so no production-safe Next/Payload version intersection had been confirmed.

The repository therefore remains pinned to its tested development versions. Do not treat a newer npm `latest` tag by itself as proof that the scheduled security fix and the Payload Admin compatibility fix are both present.

Before any public deployment, upgrade to the patched Next.js version supported by the installed Payload release and explicitly verify:

- `/admin/create-first-user`, `/admin/login`, `/admin/forgot` and `/admin/logout`;
- an authenticated Admin session;
- Payload REST create/read/update/delete;
- draft isolation for anonymous users;
- database migrations and the production build.

The CMS also treats the editorial dependency graph as a security boundary: anonymous Scenario and RuleSet reads are closed; drafts, expired reviews, draft Categories and stale Source/RuleSet evidence fail closed; trust-graph writes are serialized in PostgreSQL transactions. User bulk edit/delete is disabled to preserve the last-admin invariant.

Do not work around an Admin authentication rendering failure by setting cookies manually in production.

## Dependency audit baseline

The initial lockfile has no known high or critical npm advisories. Five moderate findings remain in the legacy `@esbuild-kit` chain bundled by `drizzle-kit` through `@payloadcms/db-postgres`; npm reports no compatible upstream fix. QALAI does not expose an esbuild development server publicly. Re-check this baseline on every Payload upgrade and never bind local development servers to an untrusted network.

## Secrets

- Never commit `.env` or database credentials.
- `PAYLOAD_SECRET` must be at least 32 random characters.
- `DATABASE_URL` and `DATABASE_DIRECT_URL` must never use the `NEXT_PUBLIC_` prefix.
- S3 access keys are server-only, bypass Supabase Storage RLS across all project buckets and must be
  treated as project-wide privileged credentials.
- The public Media bucket must never contain identity documents, personal data or internal files.
- Calculator analytics must not contain input values, results or free-form search text.

## Reporting

Until a private security contact is configured, do not open a public issue containing credentials, personal data or an unpatched exploit. Contact the repository owner privately through the channel agreed by the team.
