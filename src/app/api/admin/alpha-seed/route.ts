import config from '@payload-config'
import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isAllowedAlphaSeedRequest } from '@/lib/cms/alpha-seed-request'
import { seedClosedAlpha } from '@/scripts/seed-alpha'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const noStore = { 'Cache-Control': 'no-store' }

export const POST = async (request: NextRequest) => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const roles = user && 'roles' in user && Array.isArray(user.roles) ? user.roles : []

  if (!roles.includes('admin')) {
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
