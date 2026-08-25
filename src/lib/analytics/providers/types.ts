import type { ProviderAnalyticsEvent } from '../events'

export type AnalyticsProviderEnvelope = {
  event: ProviderAnalyticsEvent
  eventId: string
  environment: 'staging' | 'production'
  sessionHash: string
}

export interface AnalyticsProvider {
  send(envelope: AnalyticsProviderEnvelope): Promise<void>
}
