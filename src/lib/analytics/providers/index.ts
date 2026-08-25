import { getServerAnalyticsConfig, hasValidGA4Configuration } from '../config'
import { createGA4Provider } from './ga4'
import { noopAnalyticsProvider } from './noop'
import type { AnalyticsProvider } from './types'

let provider: AnalyticsProvider | null = null

export const getAnalyticsProvider = (): AnalyticsProvider => {
  if (provider) return provider

  const config = getServerAnalyticsConfig()
  if (config.provider !== 'ga4' || !hasValidGA4Configuration()) {
    provider = noopAnalyticsProvider
    return provider
  }

  provider = createGA4Provider({
    apiSecret: process.env.GA4_API_SECRET as string,
    measurementID: process.env.GA4_MEASUREMENT_ID as string,
    siteURL: config.siteURL,
  })
  return provider
}
