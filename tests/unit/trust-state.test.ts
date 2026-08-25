import { describe, expect, it } from 'vitest'

import { demoScenarios } from '@/content/demo-scenarios'
import { isScenarioTrusted } from '@/lib/cms/trust'
import type { ScenarioViewModel } from '@/lib/cms/types'

const NOW = new Date('2026-08-25T08:00:00.000Z')

const trustedScenario: ScenarioViewModel = {
  ...demoScenarios[0],
  calculatorRuleSetCurrent: true,
  seo: { ...demoScenarios[0].seo, noIndex: false },
  sources: [
    {
      checkedAt: '2026-08-24T00:00:00.000Z',
      isPrimary: true,
      publisher: 'eGov.kz',
      registryID: 'source-id',
      registryUpdatedAt: '2026-08-23T00:00:00.000Z',
      title: 'Official source',
      trustTier: 'primary-official',
      url: 'https://egov.kz/example',
      validFrom: '2026-01-01T00:00:00.000Z',
      validUntil: '2026-12-31T23:59:59.000Z',
    },
  ],
  status: 'published',
  verification: {
    nextReviewAt: '2026-09-25T00:00:00.000Z',
    reviewedAt: '2026-08-24T00:00:00.000Z',
    reviewerConfirmed: true,
    status: 'verified',
  },
}

describe('public trust state', () => {
  it('accepts only a current published Scenario with a primary source', () => {
    expect(isScenarioTrusted(trustedScenario, NOW)).toBe(true)
    expect(isScenarioTrusted({ ...trustedScenario, status: 'draft' }, NOW)).toBe(false)
    expect(
      isScenarioTrusted(
        { ...trustedScenario, verification: { ...trustedScenario.verification, status: 'stale' } },
        NOW,
      ),
    ).toBe(false)
    expect(isScenarioTrusted({ ...trustedScenario, calculatorRuleSetCurrent: false }, NOW)).toBe(
      false,
    )
    expect(
      isScenarioTrusted(
        {
          ...trustedScenario,
          verification: { ...trustedScenario.verification, reviewerConfirmed: false },
        },
        NOW,
      ),
    ).toBe(false)
    expect(
      isScenarioTrusted(
        {
          ...trustedScenario,
          sources: [{ ...trustedScenario.sources[0], trustTier: 'secondary' }],
        },
        NOW,
      ),
    ).toBe(false)
  })

  it('expires exactly at nextReviewAt without a database write', () => {
    expect(
      isScenarioTrusted(
        trustedScenario,
        new Date(trustedScenario.verification.nextReviewAt as string),
      ),
    ).toBe(false)
  })

  it('rejects expired, future or non-primary evidence', () => {
    expect(
      isScenarioTrusted(
        {
          ...trustedScenario,
          sources: [
            {
              ...trustedScenario.sources[0],
              validUntil: NOW.toISOString(),
            },
          ],
        },
        NOW,
      ),
    ).toBe(false)
    expect(
      isScenarioTrusted(
        {
          ...trustedScenario,
          sources: [{ ...trustedScenario.sources[0], checkedAt: '2026-08-26T00:00:00.000Z' }],
        },
        NOW,
      ),
    ).toBe(false)
    expect(
      isScenarioTrusted(
        {
          ...trustedScenario,
          sources: [{ ...trustedScenario.sources[0], isPrimary: false }],
        },
        NOW,
      ),
    ).toBe(false)
  })

  it('rejects evidence older than the Source registry revision or newer than the review', () => {
    expect(
      isScenarioTrusted(
        {
          ...trustedScenario,
          sources: [
            {
              ...trustedScenario.sources[0],
              registryUpdatedAt: '2026-08-24T00:00:00.001Z',
            },
          ],
        },
        NOW,
      ),
    ).toBe(false)
    expect(
      isScenarioTrusted(
        {
          ...trustedScenario,
          verification: {
            ...trustedScenario.verification,
            reviewedAt: '2026-08-23T23:59:59.999Z',
          },
        },
        NOW,
      ),
    ).toBe(false)
  })

  it('keeps the demo fixture untrusted', () => {
    expect(isScenarioTrusted(demoScenarios[0], NOW)).toBe(false)
  })
})
