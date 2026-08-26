import { describe, expect, it } from 'vitest'

import { getRelatedCalculatorKeys } from '@/lib/related-tasks'

describe('related task journeys', () => {
  it('connects the birth-payment scenario to both benefit calculators', () => {
    expect(getRelatedCalculatorKeys({ key: 'bala-tuuy-tolemderi', type: 'scenario' })).toEqual([
      'maternity-benefit',
      'childcare-benefit',
    ])
  })

  it('connects adjacent calculator journeys without inventing unrelated recommendations', () => {
    expect(getRelatedCalculatorKeys({ key: 'maternity-benefit', type: 'calculator' })).toEqual([
      'childcare-benefit',
    ])
    expect(getRelatedCalculatorKeys({ key: 'auto-loan', type: 'calculator' })).toEqual([
      'vehicle-tax',
    ])
    expect(getRelatedCalculatorKeys({ key: 'salary', type: 'calculator' })).toEqual([])
  })
})
