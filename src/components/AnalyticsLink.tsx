'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { trackEvent } from '@/lib/analytics/client'

type AnalyticsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  taskKey: string
}

export const AnalyticsLink = ({ children, onClick, taskKey, ...props }: AnalyticsLinkProps) => (
  <a
    {...props}
    onClick={(event) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        trackEvent({
          name: 'official_link_click',
          task: { key: taskKey, type: 'scenario' },
        })
      }
    }}
  >
    {children}
  </a>
)
