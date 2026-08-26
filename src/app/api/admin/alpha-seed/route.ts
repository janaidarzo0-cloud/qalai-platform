import config from '@payload-config'
import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isAllowedAlphaSeedRequest } from '@/lib/cms/alpha-seed-request'
import { seedClosedAlpha } from '@/scripts/seed-alpha'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const noStore = { 'Cache-Control': 'no-store' }

const authenticateAdmin = async (request: NextRequest) => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const roles = user && 'roles' in user && Array.isArray(user.roles) ? user.roles : []

  return { isAdmin: roles.includes('admin'), payload }
}

export const GET = async (request: NextRequest) => {
  const { isAdmin } = await authenticateAdmin(request)

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { headers: noStore, status: 403 })
  }

  return new NextResponse(
    `<!doctype html>
<html lang="kk">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>QALAI — жабық альфа импорты</title>
    <style>
      body { font: 16px/1.5 system-ui, sans-serif; max-width: 42rem; margin: 4rem auto; padding: 0 1.25rem; color: #18181b; }
      button { border: 0; border-radius: .7rem; background: #18181b; color: white; font: inherit; font-weight: 650; padding: .8rem 1.1rem; cursor: pointer; }
      p { color: #52525b; }
    </style>
  </head>
  <body>
    <h1>10 жабық альфа материалын жүктеу</h1>
    <p>Материалдар тек тексерілмеген, noindex черновик ретінде сақталады. Ештеңе жарияланбайды.</p>
    <form method="post">
      <input type="hidden" name="confirm" value="IMPORT_CLOSED_ALPHA_DRAFTS">
      <button type="submit">10 черновикті жүктеу</button>
    </form>
  </body>
</html>`,
    {
      headers: {
        ...noStore,
        'Content-Security-Policy':
          "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
      status: 200,
    },
  )
}

export const POST = async (request: NextRequest) => {
  const { isAdmin, payload } = await authenticateAdmin(request)

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { headers: noStore, status: 403 })
  }

  let confirmation: FormDataEntryValue | null = null
  try {
    confirmation = (await request.formData()).get('confirm')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { headers: noStore, status: 400 })
  }

  if (
    !isAllowedAlphaSeedRequest({
      confirmation,
      origin: request.headers.get('origin'),
      secFetchSite: request.headers.get('sec-fetch-site'),
      siteURL: process.env.NEXT_PUBLIC_SITE_URL ?? '',
    })
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { headers: noStore, status: 400 })
  }

  try {
    const result = await seedClosedAlpha(payload)
    return NextResponse.json({ imported: true, ...result }, { headers: noStore, status: 200 })
  } catch (error) {
    payload.logger.error(error)
    return NextResponse.json(
      { error: 'Closed-alpha import failed safely; no content was published.' },
      { headers: noStore, status: 409 },
    )
  }
}
