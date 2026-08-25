import type { ProviderAnalyticsEvent } from '../events'
import type { AnalyticsProvider, AnalyticsProviderEnvelope } from './types'

type GA4Event = {
  name: string
  params: Record<string, boolean | number | string>
}

const taskParameters = (event: Extract<ProviderAnalyticsEvent, { task: unknown }>) => ({
  task_key: event.task.key,
  task_type: event.task.type,
})

export const toGA4Event = (
  event: ProviderAnalyticsEvent,
  eventId: string,
  environment: 'staging' | 'production',
  siteURL: string,
): GA4Event | null => {
  const common = {
    app_environment: environment,
    event_id: eventId,
    schema_version: 1,
  }

  switch (event.name) {
    case 'page_view': {
      const pageLocation = new URL(event.path, siteURL).toString()
      return {
        name: event.name,
        params: {
          ...common,
          page_location: pageLocation,
          page_path: event.path,
          page_referrer: '',
        },
      }
    }
    case 'task_opened':
    case 'calculator_start':
    case 'official_link_click':
      return { name: event.name, params: { ...common, ...taskParameters(event) } }
    case 'calculator_complete':
      return {
        name: event.name,
        params: { ...common, ...taskParameters(event), outcome: event.outcome },
      }
    case 'feedback_submitted':
      return {
        name: event.name,
        params: { ...common, ...taskParameters(event), helpful: event.helpful },
      }
    case 'search_submitted':
      return {
        name: event.name,
        params: {
          ...common,
          query_length_bucket: event.queryLengthBucket,
          result_count_bucket: event.resultCountBucket,
        },
      }
    case 'task_resolved':
      return {
        name: event.name,
        params: {
          ...common,
          ...taskParameters(event),
          resolution_method: event.resolutionMethod,
        },
      }
    default:
      return null
  }
}

export const createGA4Provider = ({
  apiSecret,
  measurementID,
  siteURL,
}: {
  apiSecret: string
  measurementID: string
  siteURL: string
}): AnalyticsProvider => ({
  async send(envelope: AnalyticsProviderEnvelope) {
    const event = toGA4Event(envelope.event, envelope.eventId, envelope.environment, siteURL)
    if (!event) return

    const endpoint = new URL('https://www.google-analytics.com/mp/collect')
    endpoint.searchParams.set('api_secret', apiSecret)
    endpoint.searchParams.set('measurement_id', measurementID)

    const response = await fetch(endpoint, {
      body: JSON.stringify({
        client_id: envelope.sessionHash,
        consent: { ad_personalization: 'DENIED', ad_user_data: 'DENIED' },
        events: [event],
        non_personalized_ads: true,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      signal: AbortSignal.timeout(3_000),
    })

    if (!response.ok) throw new Error(`GA4 Measurement Protocol returned ${response.status}.`)
  },
})
