'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import {
  ANALYTICS_READY_EVENT,
  type AnalyticsConsent,
  configureAnalyticsRuntime,
  establishAnalyticsSession,
  getStoredAnalyticsConsent,
  revokeAnalyticsSession,
  storeAnalyticsConsent,
  subscribeToAnalyticsConsent,
  trackEvent,
} from '@/lib/analytics/client'

const subscribeToHydration = () => () => undefined

export const AnalyticsRuntime = ({ enabled }: { enabled: boolean }) => {
  const pathname = usePathname()
  const consent = useSyncExternalStore<AnalyticsConsent | null>(
    subscribeToAnalyticsConsent,
    getStoredAnalyticsConsent,
    () => null,
  )
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const trackedPath = useRef<string | null>(null)

  configureAnalyticsRuntime(enabled)

  useEffect(() => {
    if (!enabled || consent !== 'granted') return

    let cancelled = false
    void establishAnalyticsSession().then((ready) => {
      if (!ready || cancelled) return

      if (trackedPath.current !== pathname) {
        trackEvent({ name: 'page_view', path: pathname })
        trackedPath.current = pathname
      }
      window.dispatchEvent(new Event(ANALYTICS_READY_EVENT))
    })

    return () => {
      cancelled = true
    }
  }, [consent, enabled, pathname])

  if (!enabled || !hydrated) return null

  const chooseConsent = (nextConsent: AnalyticsConsent) => {
    storeAnalyticsConsent(nextConsent)
    setSettingsOpen(false)
    if (nextConsent === 'denied') void revokeAnalyticsSession()
  }

  const showDialog = consent == null || settingsOpen

  return (
    <>
      {showDialog ? (
        <section
          aria-labelledby="analytics-consent-title"
          aria-live="polite"
          className="analytics-consent"
          role="dialog"
        >
          <div>
            <p className="eyebrow">Құпиялық</p>
            <h2 id="analytics-consent-title">QALAI-ды жақсартуға көмектесесіз бе?</h2>
            <p>
              Рұқсат берсеңіз, қай нұсқаулықтардың көмектескенін жасырын түрде санаймыз. Іздеу
              мәтінін, есептеу мәндерін және жеке деректерді жібермейміз.
            </p>
          </div>
          <div className="analytics-consent__actions">
            <button
              className="button button--small"
              onClick={() => chooseConsent('granted')}
              type="button"
            >
              Рұқсат беремін
            </button>
            <button
              className="button button--ghost button--small"
              onClick={() => chooseConsent('denied')}
              type="button"
            >
              Жоқ, рақмет
            </button>
          </div>
        </section>
      ) : (
        <button className="analytics-settings" onClick={() => setSettingsOpen(true)} type="button">
          Аналитика баптауы
        </button>
      )}
    </>
  )
}
