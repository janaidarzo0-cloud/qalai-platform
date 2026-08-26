import { describe, expect, it } from 'vitest'

import {
  analyticsEnvelopeSchema,
  deriveTaskResolution,
  serializeAnalyticsEvent,
} from '@/lib/analytics/events'

describe('analytics event privacy contract', () => {
  it('accepts only canonical public paths without query, hash or demo content', () => {
    expect(serializeAnalyticsEvent({ name: 'page_view', path: '/' })).toEqual({
      name: 'page_view',
      path: '/',
    })
    expect(
      serializeAnalyticsEvent({ name: 'page_view', path: '/scenario/zhk-ashu' }),
    ).not.toBeNull()
    expect(serializeAnalyticsEvent({ name: 'page_view', path: '/?iin=secret' })).toBeNull()
    expect(serializeAnalyticsEvent({ name: 'page_view', path: '/scenario/zhk#docs' })).toBeNull()
    expect(
      serializeAnalyticsEvent({ name: 'page_view', path: '/scenario/zhk-ashu-demo' }),
    ).toBeNull()
    expect(serializeAnalyticsEvent({ name: 'page_view', path: '/admin' })).toBeNull()
  })

  it('rejects unknown runtime properties instead of forwarding sensitive values', () => {
    expect(
      serializeAnalyticsEvent({
        calculatorResult: 12_345,
        iin: '900101000000',
        name: 'calculator_complete',
        outcome: 'success',
        task: { key: 'auto-loan', type: 'calculator' },
      }),
    ).toBeNull()

    expect(
      analyticsEnvelopeSchema.safeParse({
        event: {
          name: 'search_submitted',
          query: 'my@email.example',
          queryLengthBucket: '1-20',
          resultCountBucket: '0',
        },
        eventId: 'f10bfe30-2f82-4eb2-b697-1f9764617c45',
        schemaVersion: 1,
      }).success,
    ).toBe(false)
  })

  it('allows only fixed source and destination task identifiers for internal links', () => {
    expect(
      serializeAnalyticsEvent({
        destination: { key: 'maternity-benefit', type: 'calculator' },
        name: 'internal_task_link_click',
        task: { key: 'bala-tuuy-tolemderi', type: 'scenario' },
      }),
    ).toEqual({
      destination: { key: 'maternity-benefit', type: 'calculator' },
      name: 'internal_task_link_click',
      task: { key: 'bala-tuuy-tolemderi', type: 'scenario' },
    })
    expect(
      serializeAnalyticsEvent({
        amount: 612_360,
        destination: { key: 'maternity-benefit', type: 'calculator' },
        name: 'internal_task_link_click',
        task: { key: 'bala-tuuy-tolemderi', type: 'scenario' },
      }),
    ).toBeNull()
  })

  it('allows search-result clicks only as fixed buckets and task identifiers', () => {
    expect(
      serializeAnalyticsEvent({
        name: 'search_result_click',
        positionBucket: '1',
        queryLengthBucket: '1-20',
        resultCountBucket: '1-3',
        task: { key: 'auto-loan', type: 'calculator' },
      }),
    ).toEqual({
      name: 'search_result_click',
      positionBucket: '1',
      queryLengthBucket: '1-20',
      resultCountBucket: '1-3',
      task: { key: 'auto-loan', type: 'calculator' },
    })
    expect(
      serializeAnalyticsEvent({
        name: 'search_result_click',
        positionBucket: '1',
        query: 'кредит на машину',
        queryLengthBucket: '1-20',
        resultCountBucket: '1-3',
        task: { key: 'auto-loan', type: 'calculator' },
      }),
    ).toBeNull()
  })

  it('derives a resolved task only from the three explicit success signals', () => {
    const calculator = { key: 'auto-loan', type: 'calculator' } as const
    const scenario = { key: 'zheke-kasipkerlik-ashu', type: 'scenario' } as const

    expect(
      deriveTaskResolution({ name: 'calculator_complete', outcome: 'success', task: calculator }),
    ).toEqual({ name: 'task_resolved', resolutionMethod: 'calculation', task: calculator })
    expect(deriveTaskResolution({ name: 'official_link_click', task: scenario })).toEqual({
      name: 'task_resolved',
      resolutionMethod: 'official-transition',
      task: scenario,
    })
    expect(
      deriveTaskResolution({ helpful: true, name: 'feedback_submitted', task: scenario }),
    ).toEqual({
      name: 'task_resolved',
      resolutionMethod: 'helpful-feedback',
      task: scenario,
    })

    expect(
      deriveTaskResolution({ name: 'calculator_complete', outcome: 'error', task: calculator }),
    ).toBeNull()
    expect(
      deriveTaskResolution({ helpful: false, name: 'feedback_submitted', task: scenario }),
    ).toBeNull()
    expect(deriveTaskResolution({ name: 'task_opened', task: scenario })).toBeNull()
  })
})
