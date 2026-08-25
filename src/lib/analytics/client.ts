'use client'

import {
  ANALYTICS_SCHEMA_VERSION,
  type AnalyticsEnvelope,
  type AnalyticsEvent,
  serializeAnalyticsEvent,
} from './events'

export type AnalyticsConsent = 'denied' | 'granted'

export const ANALYTICS_READY_EVENT = 'qalai:analytics-ready'
export const ANALYTICS_CONSENT_CHANGED_EVENT = 'qalai:analytics-consent-changed'

const CONSENT_STORAGE_KEY = 'qalai.analytics.consent.v1'
const INTERNAL_QA_STORAGE_KEY = 'qalai.analytics.internal-qa.v1'
const MAX_PENDING_EVENTS = 25

let runtimeEnabled = false
let transportState: 'blocked' | 'idle' | 'ready' | 'starting' = 'idle'
let activation: Promise<boolean> | null = null
let activationToken = 0
let pendingEvents: AnalyticsEvent[] = []
let consentGeneration = 0

const readStorage = (storage: Storage, key: string) => {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (storage: Storage, key: string, value: string | null) => {
  try {
    if (value == null) storage.removeItem(key)
    else storage.setItem(key, value)
  } catch {
    // Storage can be unavailable in hardened browser contexts. Analytics fails closed.
  }
}

export const configureAnalyticsRuntime = (enabled: boolean) => {
  if (runtimeEnabled === enabled) return
  runtimeEnabled = enabled
  if (!enabled) {
    activationToken += 1
    activation = null
    consentGeneration += 1
    pendingEvents = []
    transportState = 'blocked'
  } else if (transportState === 'blocked') {
    transportState = 'idle'
  }
}

export const getStoredAnalyticsConsent = (): AnalyticsConsent | null => {
  if (typeof window === 'undefined') return null
  const value = readStorage(window.localStorage, CONSENT_STORAGE_KEY)
  return value === 'granted' || value === 'denied' ? value : null
}

export const storeAnalyticsConsent = (consent: AnalyticsConsent) => {
  if (typeof window === 'undefined') return
  writeStorage(window.localStorage, CONSENT_STORAGE_KEY, consent)
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGED_EVENT))
}

export const subscribeToAnalyticsConsent = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, listener)
  return () => window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, listener)
}

export const isInternalQATraffic = () => {
  if (typeof window === 'undefined') return false

  const queryFlag = new URLSearchParams(window.location.search).get('qalai_qa')
  if (queryFlag === '1') writeStorage(window.sessionStorage, INTERNAL_QA_STORAGE_KEY, '1')
  if (queryFlag === '0') writeStorage(window.sessionStorage, INTERNAL_QA_STORAGE_KEY, null)

  return queryFlag === '1' || readStorage(window.sessionStorage, INTERNAL_QA_STORAGE_KEY) === '1'
}

const createEnvelope = (event: AnalyticsEvent): AnalyticsEnvelope => ({
  event,
  eventId: window.crypto.randomUUID(),
  schemaVersion: ANALYTICS_SCHEMA_VERSION,
})

const postEnvelope = async (
  envelope: AnalyticsEnvelope,
  allowSessionRetry = true,
): Promise<void> => {
  try {
    const response = await window.fetch('/api/analytics/events', {
      body: JSON.stringify(envelope),
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      method: 'POST',
    })

    if (response.status === 409 && allowSessionRetry) {
      if (!activation) transportState = 'idle'
      if (await establishAnalyticsSession()) await postEnvelope(envelope, false)
    }
  } catch {
    // Product actions must never depend on analytics availability.
  }
}

const flushPendingEvents = () => {
  const events = pendingEvents
  pendingEvents = []
  for (const event of events) void postEnvelope(createEnvelope(event))
}

export const establishAnalyticsSession = async (): Promise<boolean> => {
  if (
    typeof window === 'undefined' ||
    !runtimeEnabled ||
    getStoredAnalyticsConsent() !== 'granted'
  ) {
    return false
  }

  if (transportState === 'ready') return true
  if (activation) return activation

  const internalQA = isInternalQATraffic()
  const generation = consentGeneration
  const token = ++activationToken
  transportState = 'starting'
  const currentActivation = (async () => {
    try {
      const response = await window.fetch('/api/analytics/consent', {
        body: JSON.stringify({ consent: 'granted', internalQA }),
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Analytics consent session was not established.')

      const result = (await response.json()) as { tracking?: unknown }
      if (
        generation !== consentGeneration ||
        getStoredAnalyticsConsent() !== 'granted' ||
        result.tracking !== true
      ) {
        pendingEvents = []
        transportState = 'blocked'
        return false
      }

      transportState = 'ready'
      flushPendingEvents()
      return true
    } catch {
      pendingEvents = []
      if (generation === consentGeneration) transportState = 'idle'
      return false
    } finally {
      if (activationToken === token) activation = null
    }
  })()
  activation = currentActivation

  return currentActivation
}

export const revokeAnalyticsSession = async () => {
  activationToken += 1
  consentGeneration += 1
  pendingEvents = []
  transportState = 'blocked'
  activation = null
  if (typeof window === 'undefined' || !runtimeEnabled) return

  try {
    await window.fetch('/api/analytics/consent', {
      body: JSON.stringify({ consent: 'denied', internalQA: isInternalQATraffic() }),
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
  } catch {
    // The local consent decision still blocks every future browser event.
  }
}

export const trackEvent = (event: AnalyticsEvent) => {
  if (
    typeof window === 'undefined' ||
    !runtimeEnabled ||
    getStoredAnalyticsConsent() !== 'granted' ||
    isInternalQATraffic()
  ) {
    return
  }

  const safeEvent = serializeAnalyticsEvent(event)
  if (!safeEvent) return

  if (transportState === 'ready') {
    void postEnvelope(createEnvelope(safeEvent))
    return
  }

  if (pendingEvents.length < MAX_PENDING_EVENTS) pendingEvents.push(safeEvent)
}

export const isAnalyticsTransportReady = () => runtimeEnabled && transportState === 'ready'
