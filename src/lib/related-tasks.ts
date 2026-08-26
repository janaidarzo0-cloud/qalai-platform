import type { TaskRef } from '@/lib/analytics/events'
import { isPublicLaunchTask } from '@/lib/launch/cohort'
import { getCalculatorByKey } from '@/modules/calculators/registry'
import type { CalculatorKey } from '@/modules/calculators/types'

const scenarioToCalculators: Readonly<Record<string, readonly CalculatorKey[]>> = {
  'bala-tuuy-tolemderi': ['maternity-benefit', 'childcare-benefit'],
}

const calculatorToCalculators: Readonly<Partial<Record<CalculatorKey, readonly CalculatorKey[]>>> =
  {
    'auto-loan': ['vehicle-tax'],
    'childcare-benefit': ['maternity-benefit'],
    'maternity-benefit': ['childcare-benefit'],
    'vehicle-tax': ['auto-loan'],
  }

export const getRelatedCalculatorKeys = (source: TaskRef): readonly CalculatorKey[] =>
  source.type === 'scenario'
    ? (scenarioToCalculators[source.key] ?? [])
    : (calculatorToCalculators[source.key as CalculatorKey] ?? [])

export const getRelatedCalculators = (source: TaskRef, publicOnly = false) =>
  getRelatedCalculatorKeys(source).flatMap((key) => {
    const calculator = getCalculatorByKey(key)
    return calculator &&
      (!publicOnly ||
        (calculator.status === 'available' &&
          isPublicLaunchTask({ key: calculator.key, type: 'calculator' })))
      ? [calculator]
      : []
  })
