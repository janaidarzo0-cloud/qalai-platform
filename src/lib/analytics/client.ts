'use client'

import type { AnalyticsEvent } from './events'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    ym?: (...args: unknown[]) => void
  }
}

export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return

  const { name, ...properties } = event

  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && window.dataLayer) {
    window.dataLayer.push({ event: name, ...properties })
  }

  const metrikaID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID)
  if (metrikaID && window.ym) {
    window.ym(metrikaID, 'reachGoal', name, properties)
  }
}
