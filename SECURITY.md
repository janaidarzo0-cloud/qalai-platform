# Security policy

## Current release gate

QALAI is an initial development scaffold, not a production release.

On 25 August 2026:

- Next.js announced a critical security patch scheduled for 26 August 2026.
- Payload issue [#17545](https://github.com/payloadcms/payload/issues/17545) remained open and described blank unauthenticated Admin routes on tested Next 16 versions.

Before any public deployment, upgrade to the patched Next.js version supported by the installed Payload release and explicitly verify:

- `/admin/create-first-user`, `/admin/login`, `/admin/forgot` and `/admin/logout`;
- an authenticated Admin session;
- Payload REST create/read/update/delete;
- draft isolation for anonymous users;
- database migrations and the production build.

Do not work around an Admin authentication rendering failure by setting cookies manually in production.

## Dependency audit baseline

The initial lockfile has no known high or critical npm advisories. Five moderate findings remain in the legacy `@esbuild-kit` chain bundled by `drizzle-kit` through `@payloadcms/db-postgres`; npm reports no compatible upstream fix. QALAI does not expose an esbuild development server publicly. Re-check this baseline on every Payload upgrade and never bind local development servers to an untrusted network.

## Secrets

- Never commit `.env` or database credentials.
- `PAYLOAD_SECRET` must be at least 32 random characters.
- `DATABASE_URL` and `DATABASE_DIRECT_URL` must never use the `NEXT_PUBLIC_` prefix.
- Calculator analytics must not contain input values, results or free-form search text.

## Reporting

Until a private security contact is configured, do not open a public issue containing credentials, personal data or an unpatched exploit. Contact the repository owner privately through the channel agreed by the team.
