import { describe, expect, it } from 'vitest'

import {
  ANALYTICS_REQUEST_MAX_BYTES,
  isAnalyticsRequestBodyTooLarge,
  isTrustedAnalyticsOrigin,
} from '@/lib/analytics/request'

describe('analytics ingest request boundary', () => {
  it('accepts same-origin browser posts and rejects missing or cross-site origins', () => {
    const requestOrigin = 'https://staging.qalai.kz'
    expect(
      isTrustedAnalyticsOrigin({
        origin: requestOrigin,
        requestOrigin,
        secFetchSite: 'same-origin',
      }),
    ).toBe(true)
    expect(
      isTrustedAnalyticsOrigin({ origin: null, requestOrigin, secFetchSite: 'same-origin' }),
    ).toBe(false)
    expect(
      isTrustedAnalyticsOrigin({
        origin: 'https://attacker.example',
        requestOrigin,
        secFetchSite: 'cross-site',
      }),
    ).toBe(false)
  })

  it('caps both declared and actual request sizes', () => {
    expect(isAnalyticsRequestBodyTooLarge(String(ANALYTICS_REQUEST_MAX_BYTES))).toBe(false)
    expect(isAnalyticsRequestBodyTooLarge(String(ANALYTICS_REQUEST_MAX_BYTES + 1))).toBe(true)
    expect(isAnalyticsRequestBodyTooLarge(null, ANALYTICS_REQUEST_MAX_BYTES + 1)).toBe(true)
  })
})
