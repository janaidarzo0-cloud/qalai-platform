import { randomUUID } from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAnalyticsConfig } from '@/lib/analytics/config'
import { isAnalyticsRequestBodyTooLarge, isTrustedAnalyticsOrigin } from '@/lib/analytics/request'
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_CONSENT_SECONDS,
  ANALYTICS_INTERNAL_COOKIE,
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_SECONDS,
} from '@/lib/analytics/server'

export const runtime = 'nodejs'

const consentRequestSchema = z
  .object({
    consent: z.enum(['denied', 'granted']),
    internalQA: z.boolean(),
  })
  .strict()

const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const,
  secure,
})

const expireCookie = (response: NextResponse, name: string, secure: boolean) => {
  response.cookies.set(name, '', { ...cookieOptions(secure), maxAge: 0 })
}

export const POST = async (request: NextRequest) => {
  const config = getServerAnalyticsConfig()
  if (!config.enabled) return NextResponse.json({ tracking: false }, { status: 404 })

  if (
    !isTrustedAnalyticsOrigin({
      origin: request.headers.get('origin'),
      requestOrigin: request.nextUrl.origin,
      secFetchSite: request.headers.get('sec-fetch-site'),
    })
  ) {
    return NextResponse.json({ tracking: false }, { status: 403 })
  }

  if (isAnalyticsRequestBodyTooLarge(request.headers.get('content-length'))) {
    return NextResponse.json({ tracking: false }, { status: 413 })
  }
  const body = await request.text()
  if (isAnalyticsRequestBodyTooLarge(null, Buffer.byteLength(body, 'utf8'))) {
    return NextResponse.json({ tracking: false }, { status: 413 })
  }

  let value: unknown
  try {
    value = JSON.parse(body)
  } catch {
    return NextResponse.json({ tracking: false }, { status: 400 })
  }

  const parsed = consentRequestSchema.safeParse(value)
  if (!parsed.success) return NextResponse.json({ tracking: false }, { status: 400 })

  const secure = config.environment != null
  const response = NextResponse.json({
    tracking: parsed.data.consent === 'granted' && !parsed.data.internalQA,
  })

  if (parsed.data.internalQA) {
    response.cookies.set(ANALYTICS_INTERNAL_COOKIE, '1', cookieOptions(secure))
  } else {
    expireCookie(response, ANALYTICS_INTERNAL_COOKIE, secure)
  }

  if (parsed.data.consent === 'denied' || parsed.data.internalQA) {
    expireCookie(response, ANALYTICS_CONSENT_COOKIE, secure)
    expireCookie(response, ANALYTICS_SESSION_COOKIE, secure)
    return response
  }

  response.cookies.set(ANALYTICS_CONSENT_COOKIE, 'granted', {
    ...cookieOptions(secure),
    maxAge: ANALYTICS_CONSENT_SECONDS,
  })
  response.cookies.set(
    ANALYTICS_SESSION_COOKIE,
    request.cookies.get(ANALYTICS_SESSION_COOKIE)?.value ?? randomUUID(),
    { ...cookieOptions(secure), maxAge: ANALYTICS_SESSION_SECONDS },
  )

  return response
}
