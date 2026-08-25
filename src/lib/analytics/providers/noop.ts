import type { AnalyticsProvider } from './types'

export const noopAnalyticsProvider: AnalyticsProvider = {
  async send() {},
}
