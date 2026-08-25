import { describe, expect, it } from 'vitest'

import { demoScenarios } from '@/content/demo-scenarios'

describe('demo content safety', () => {
  it('never represents a demo Scenario as verified or indexable', () => {
    for (const scenario of demoScenarios) {
      expect(scenario.status).toBe('draft')
      expect(scenario.seo.noIndex).toBe(true)
      expect(scenario.verification.status).not.toBe('verified')
      expect(scenario.officialLinks).toHaveLength(0)
    }
  })
})
