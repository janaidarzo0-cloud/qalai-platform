'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { trackEvent } from '@/lib/analytics/client'

type AnalyticsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  publisher: string
  scenarioSlug: string
}

export const AnalyticsLink = ({
  children,
  onClick,
  publisher,
  scenarioSlug,
  ...props
}: AnalyticsLinkProps) => (
  <a
    {...props}
    onClick={(event) => {
      trackEvent({ name: 'official_link_click', publisher, scenarioSlug })
      trackEvent({ name: 'task_resolved', method: 'official-link', scenarioSlug })
      onClick?.(event)
    }}
  >
    {children}
  </a>
)
