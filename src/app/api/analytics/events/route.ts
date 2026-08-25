import { type NextRequest, NextResponse } from 'next/server'

import { getServerAnalyticsConfig } from '@/lib/analytics/config'
import { analyticsEnvelopeSchema } from '@/lib/analytics/events'
import { isAnalyticsRequestBodyTooLarge, isTrustedAnalyticsOrigin } from '@/lib/analytics/request'
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_INTERNAL_COOKIE,
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_SECONDS,
  ingestAnalyticsEnvelope,
} from '@/lib/analytics/server'

export const runtime = 'nodejs'

const hasPayloadSession = (request: NextRequest) => request.cookies.has('payload-token')

export const POST = async (request: NextRequest) => {
  const config = getServerAnalyticsConfig()
  if (!config.enabled) return new NextResponse(null, { status: 404 })

  if (
    !isTrustedAnalyticsOrigin({
      origin: request.headers.get('origin'),
      requestOrigin: request.nextUrl.origin,
      secFetchSite: request.headers.get('sec-fetch-site'),
    })
  ) {
    return new NextResponse(null, { status: 403 })
  }

  if (
    request.cookies.get(ANALYTICS_CONSENT_COOKIE)?.value !== 'granted' ||
    request.cookies.get(ANALYTICS_INTERNAL_COOKIE)?.value === '1' ||
    hasPayloadSession(request)
  ) {
    return new NextResponse(null, { status: 204 })
  }

  const sessionID = request.cookies.get(ANALYTICS_SESSION_COOKIE)?.value
  if (!sessionID) return new NextResponse(null, { status: 409 })

  if (isAnalyticsRequestBodyTooLarge(request.headers.get('content-length'))) {
    return new NextResponse(null, { status: 413 })
  }

  const body = await request.text()
  if (isAnalyticsRequestBodyTooLarge(null, Buffer.byteLength(body, 'utf8'))) {
    return new NextResponse(null, { status: 413 })
  }

  let value: unknown
  try {
    value = JSON.parse(body)
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  const envelope = analyticsEnvelopeSchema.safeParse(value)
  if (!envelope.success) return new NextResponse(null, { status: 400 })

  try {
    await ingestAnalyticsEnvelope({ envelope: envelope.data, sessionID })
  } catch (error) {
    console.error('Analytics event ingestion failed.', error)
    return new NextResponse(null, { status: 503 })
  }

  const response = new NextResponse(null, { status: 202 })
  response.cookies.set(ANALYTICS_SESSION_COOKIE, sessionID, {
    httpOnly: true,
    maxAge: ANALYTICS_SESSION_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: config.environment != null,
  })
  return response
}
