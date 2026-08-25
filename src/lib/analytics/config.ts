export type AnalyticsEnvironment = 'staging' | 'production'
export type AnalyticsProviderName = 'ga4' | 'none'

const analyticsEnvironment = (): AnalyticsEnvironment | null => {
  const value = process.env.ANALYTICS_ENVIRONMENT
  return value === 'staging' || value === 'production' ? value : null
}

export const isAnalyticsRuntimeEnabled = () =>
  process.env.ANALYTICS_ENABLED === 'true' &&
  process.env.QALAI_CONTENT_MODE === 'cms' &&
  analyticsEnvironment() != null &&
  (process.env.ANALYTICS_HASH_SECRET?.length ?? 0) >= 32

export type ServerAnalyticsConfig = {
  enabled: boolean
  environment: AnalyticsEnvironment | null
  hashSecret: string | null
  provider: AnalyticsProviderName
  siteURL: string
}

export const getServerAnalyticsConfig = (): ServerAnalyticsConfig => {
  const provider = process.env.ANALYTICS_PROVIDER === 'ga4' ? 'ga4' : 'none'
  const hashSecret = process.env.ANALYTICS_HASH_SECRET ?? null

  return {
    enabled: isAnalyticsRuntimeEnabled(),
    environment: analyticsEnvironment(),
    hashSecret,
    provider,
    siteURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  }
}

export const hasValidGA4Configuration = () =>
  /^G-[A-Z0-9]+$/.test(process.env.GA4_MEASUREMENT_ID ?? '') &&
  (process.env.GA4_API_SECRET?.length ?? 0) >= 16
