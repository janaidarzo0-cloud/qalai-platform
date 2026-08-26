import { describe, expect, it } from 'vitest'

import { getRelatedCalculatorKeys, getRelatedCalculators } from '@/lib/related-tasks'

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

  it('removes alpha destinations from public related-task navigation', () => {
    expect(
      getRelatedCalculators({ key: 'auto-loan', type: 'calculator' }, true).map(({ key }) => key),
    ).toEqual([])
    expect(
      getRelatedCalculators({ key: 'vehicle-tax', type: 'calculator' }, true).map(({ key }) => key),
    ).toEqual(['auto-loan'])
    expect(getRelatedCalculators({ key: 'bala-tuuy-tolemderi', type: 'scenario' }, true)).toEqual(
      [],
    )
  })
})
