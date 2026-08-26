import { describe, expect, it } from 'vitest'

import { toGA4Event } from '@/lib/analytics/providers/ga4'

const eventID = 'f10bfe30-2f82-4eb2-b697-1f9764617c45'

describe('GA4 provider allowlist', () => {
  it('builds page views from a canonical server URL without query or referrer', () => {
    const result = toGA4Event(
      { name: 'page_view', path: '/scenario/zhk-ashu' },
      eventID,
      'staging',
      'https://staging.qalai.kz/base?secret=ignored',
    )

    expect(result).toEqual({
      name: 'page_view',
      params: {
        app_environment: 'staging',
        event_id: eventID,
        page_location: 'https://staging.qalai.kz/scenario/zhk-ashu',
        page_path: '/scenario/zhk-ashu',
        page_referrer: '',
        schema_version: 1,
      },
    })
  })

  it('maps only fixed task fields and never calculator values or content', () => {
    const result = toGA4Event(
      {
        name: 'task_resolved',
        resolutionMethod: 'calculation',
        task: { key: 'auto-loan', type: 'calculator' },
      },
      eventID,
      'staging',
      'https://staging.qalai.kz',
    )
    const serialized = JSON.stringify(result)

    expect(result?.params).toEqual({
      app_environment: 'staging',
      event_id: eventID,
      resolution_method: 'calculation',
      schema_version: 1,
      task_key: 'auto-loan',
      task_type: 'calculator',
    })
    expect(serialized).not.toMatch(/amount|email|iin|query|result|salary|telephone|phone/i)
  })

  it('maps internal task links without sending page text or financial values', () => {
    const result = toGA4Event(
      {
        destination: { key: 'childcare-benefit', type: 'calculator' },
        name: 'internal_task_link_click',
        task: { key: 'bala-tuuy-tolemderi', type: 'scenario' },
      },
      eventID,
      'staging',
      'https://staging.qalai.kz',
    )

    expect(result).toEqual({
      name: 'internal_task_link_click',
      params: {
        app_environment: 'staging',
        destination_key: 'childcare-benefit',
        destination_type: 'calculator',
        event_id: eventID,
        schema_version: 1,
        task_key: 'bala-tuuy-tolemderi',
        task_type: 'scenario',
      },
    })
  })

  it('maps search-result clicks without sending the query', () => {
    const result = toGA4Event(
      {
        name: 'search_result_click',
        positionBucket: '1',
        queryLengthBucket: '1-20',
        resultCountBucket: '1-3',
        task: { key: 'auto-loan', type: 'calculator' },
      },
      eventID,
      'staging',
      'https://staging.qalai.kz',
    )

    expect(result).toEqual({
      name: 'search_result_click',
      params: {
        app_environment: 'staging',
        event_id: eventID,
        position_bucket: '1',
        query_length_bucket: '1-20',
        result_count_bucket: '1-3',
        schema_version: 1,
        task_key: 'auto-loan',
        task_type: 'calculator',
      },
    })
    expect(JSON.stringify(result)).not.toContain('кредит на машину')
  })
})
