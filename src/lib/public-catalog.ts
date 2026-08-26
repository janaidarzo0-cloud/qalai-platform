import { isPublicLaunchTask } from '@/lib/launch/cohort'
import type { CalculatorDefinition } from '@/modules/calculators/types'

export type HomeQuickAction = {
  href: string
  label: string
  mark: string
}

export const getVisibleHomeCalculators = <T extends CalculatorDefinition>(
  calculators: readonly T[],
  publicLaunch: boolean,
): readonly T[] =>
  publicLaunch
    ? calculators.filter(
        (calculator) =>
          calculator.status === 'available' &&
          isPublicLaunchTask({ key: calculator.key, type: 'calculator' }),
      )
    : calculators

export const getVisibleHomeQuickActions = <T extends HomeQuickAction>(
  actions: readonly T[],
  publicTaskHrefs: ReadonlySet<string>,
  publicLaunch: boolean,
): readonly T[] =>
  publicLaunch ? actions.filter((action) => publicTaskHrefs.has(action.href)) : actions
