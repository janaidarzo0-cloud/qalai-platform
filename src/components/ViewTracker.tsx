'use client'

import { useEffect } from 'react'

import { trackEvent } from '@/lib/analytics/client'

export const ViewTracker = ({ scenarioSlug }: { scenarioSlug: string }) => {
  useEffect(() => {
    trackEvent({ name: 'scenario_view', scenarioSlug })
  }, [scenarioSlug])

  return null
}
