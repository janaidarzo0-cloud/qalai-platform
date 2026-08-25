import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getServerAnalyticsConfig,
  hasValidGA4Configuration,
  isAnalyticsRuntimeEnabled,
} from '@/lib/analytics/config'

const enableBaseConfig = () => {
  vi.stubEnv('ANALYTICS_ENABLED', 'true')
  vi.stubEnv('ANALYTICS_ENVIRONMENT', 'staging')
  vi.stubEnv('ANALYTICS_HASH_SECRET', 'a'.repeat(32))
  vi.stubEnv('QALAI_CONTENT_MODE', 'cms')
}

afterEach(() => vi.unstubAllEnvs())

describe('analytics environment gate', () => {
  it('is fail-closed unless every first-party runtime requirement is explicit', () => {
    enableBaseConfig()
    expect(isAnalyticsRuntimeEnabled()).toBe(true)

    vi.stubEnv('QALAI_CONTENT_MODE', 'demo')
    expect(isAnalyticsRuntimeEnabled()).toBe(false)
    vi.stubEnv('QALAI_CONTENT_MODE', 'cms')
    vi.stubEnv('ANALYTICS_HASH_SECRET', 'too-short')
    expect(isAnalyticsRuntimeEnabled()).toBe(false)
    vi.stubEnv('ANALYTICS_HASH_SECRET', 'a'.repeat(32))
    vi.stubEnv('ANALYTICS_ENVIRONMENT', 'preview')
    expect(isAnalyticsRuntimeEnabled()).toBe(false)
  })

  it('keeps provider credentials server-side and validates the GA4 pair', () => {
    enableBaseConfig()
    vi.stubEnv('ANALYTICS_PROVIDER', 'ga4')
    vi.stubEnv('GA4_MEASUREMENT_ID', 'G-QALAI2026')
    vi.stubEnv('GA4_API_SECRET', 'staging-api-secret')

    expect(getServerAnalyticsConfig()).toMatchObject({
      enabled: true,
      environment: 'staging',
      provider: 'ga4',
    })
    expect(hasValidGA4Configuration()).toBe(true)

    vi.stubEnv('GA4_MEASUREMENT_ID', 'UA-legacy-or-invalid')
    expect(hasValidGA4Configuration()).toBe(false)
  })
})
