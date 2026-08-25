import { describe, expect, it } from 'vitest'

import { calculatorDefinitions } from '@/modules/calculators/registry'

describe('calculator registry', () => {
  it('contains the five Product Definition calculators with stable unique keys and slugs', () => {
    expect(calculatorDefinitions).toHaveLength(5)
    expect(new Set(calculatorDefinitions.map(({ key }) => key)).size).toBe(5)
    expect(new Set(calculatorDefinitions.map(({ slug }) => slug)).size).toBe(5)
  })

  it('keeps regulated calculators unavailable until source review', () => {
    const sourceReviewKeys = calculatorDefinitions
      .filter(({ status }) => status === 'source-review')
      .map(({ key }) => key)

    expect(sourceReviewKeys).toEqual([
      'maternity-benefit',
      'childcare-benefit',
      'vehicle-tax',
      'salary',
    ])
  })
})
