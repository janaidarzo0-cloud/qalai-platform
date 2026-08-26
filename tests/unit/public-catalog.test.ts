import { describe, expect, it } from 'vitest'

import { getVisibleHomeCalculators, getVisibleHomeQuickActions } from '@/lib/public-catalog'
import { calculatorDefinitions } from '@/modules/calculators/registry'

const actions = [
  { href: '/scenario/etsq-alu', label: 'ЭЦҚ алу', mark: '01' },
  { href: '/calculator/avtonesie-kalkulyatory', label: 'Автонесие', mark: '02' },
]

describe('public home catalogue', () => {
  it('keeps the full review catalogue visible in closed staging', () => {
    expect(getVisibleHomeCalculators(calculatorDefinitions, false)).toHaveLength(5)
    expect(getVisibleHomeQuickActions(actions, new Set(), false)).toEqual(actions)
  })

  it('exposes only available and trusted task destinations after launch', () => {
    const availableCalculators = calculatorDefinitions.map((calculator) => ({
      ...calculator,
      status: 'available' as const,
    }))
    expect(getVisibleHomeCalculators(availableCalculators, true).map(({ key }) => key)).toEqual([
      'auto-loan',
      'salary',
    ])
    expect(
      getVisibleHomeQuickActions(actions, new Set(['/calculator/avtonesie-kalkulyatory']), true),
    ).toEqual([actions[1]])
  })
})
