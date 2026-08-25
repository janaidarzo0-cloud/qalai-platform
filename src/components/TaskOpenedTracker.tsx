'use client'

import { useEffect, useRef } from 'react'

import {
  ANALYTICS_READY_EVENT,
  isAnalyticsTransportReady,
  trackEvent,
} from '@/lib/analytics/client'
import type { TaskRef } from '@/lib/analytics/events'

export const TaskOpenedTracker = ({ eligible, task }: { eligible: boolean; task: TaskRef }) => {
  const tracked = useRef(false)
  const { key, type } = task

  useEffect(() => {
    if (!eligible) return

    const emit = () => {
      if (tracked.current) return
      trackEvent({ name: 'task_opened', task: { key, type } })
      tracked.current = true
    }

    if (isAnalyticsTransportReady()) emit()
    window.addEventListener(ANALYTICS_READY_EVENT, emit)
    return () => window.removeEventListener(ANALYTICS_READY_EVENT, emit)
  }, [eligible, key, type])

  return null
}
