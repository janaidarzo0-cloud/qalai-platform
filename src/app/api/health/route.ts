import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { checkReadiness } from '@/lib/health/readiness'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = async () => {
  const result = await checkReadiness(async () => {
    const payload = await getPayload({ config })
    const query = {
      query_timeout: 2_000,
      text: 'SELECT 1 FROM "users" LIMIT 1',
    }
    await payload.db.pool.query(query)
  })

  return NextResponse.json(result.body, {
    headers: { 'Cache-Control': 'no-store' },
    status: result.status,
  })
}
