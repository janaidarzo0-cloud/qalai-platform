# QALAI dependency security review — 2026-08-27

## Result

`npm audit --omit=dev --audit-level=high` reports zero critical or high findings.

Five moderate findings share one transitive cause: Payload's PostgreSQL adapter includes
`drizzle-kit`, which includes an old `esbuild` development-server package. The published advisory
concerns requests to an exposed esbuild development server. QALAI's production runtime does not
start that server, and npm currently reports no compatible automated fix.

## Treatment

- Do not expose a local or CI development server to the public internet.
- Keep the production deployment on the compiled Next.js runtime.
- Monitor Payload/drizzle-kit releases and remove the transitive version when upstream provides a
  compatible fix.
- Repeat the audit before enabling public indexing and treat any future high or critical finding as
  a launch blocker.

This is an accepted, bounded development-tool risk, not evidence that the production site is free
of all security risk.
