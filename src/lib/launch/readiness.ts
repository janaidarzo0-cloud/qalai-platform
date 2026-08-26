import type { ScenarioViewModel } from '@/lib/cms/types'
import { isScenarioTrusted } from '@/lib/cms/trust'
import { getIndexingBlockers, type IndexingBlocker } from '@/lib/site'
import type { CalculatorDefinition } from '@/modules/calculators/types'

import { publicLaunchCohort, type PublicLaunchCandidate } from './cohort'

export type LaunchCandidateBlocker =
  | 'calculator-not-available'
  | 'formula-version-missing'
  | 'scenario-missing'
  | 'scenario-noindex'
  | 'scenario-not-published'
  | 'scenario-not-trusted'
  | 'scenario-sources-missing'

export type LaunchCandidateReadiness = PublicLaunchCandidate & {
  blockers: LaunchCandidateBlocker[]
  ready: boolean
}

export type PublicLaunchReadiness = {
  candidates: LaunchCandidateReadiness[]
  configurationBlockers: IndexingBlocker[]
  ready: boolean
}

export const assessPublicLaunchReadiness = ({
  calculators,
  configurationBlockers = getIndexingBlockers(),
  isTrusted = (scenario: ScenarioViewModel) => isScenarioTrusted(scenario),
  scenarios,
}: {
  calculators: readonly CalculatorDefinition[]
  configurationBlockers?: IndexingBlocker[]
  isTrusted?: (scenario: ScenarioViewModel) => boolean
  scenarios: readonly ScenarioViewModel[]
}): PublicLaunchReadiness => {
  const candidates = publicLaunchCohort.map((candidate): LaunchCandidateReadiness => {
    const blockers: LaunchCandidateBlocker[] = []

    if (candidate.task.type === 'calculator') {
      const calculator = calculators.find(({ key }) => key === candidate.task.key)
      if (!calculator || calculator.status !== 'available') {
        blockers.push('calculator-not-available')
      }
      if (!calculator?.formulaVersion) blockers.push('formula-version-missing')
    } else {
      const scenario = scenarios.find(({ slug }) => slug === candidate.task.key)
      if (!scenario) {
        blockers.push('scenario-missing')
      } else {
        if (scenario.status !== 'published') blockers.push('scenario-not-published')
        if (!isTrusted(scenario)) blockers.push('scenario-not-trusted')
        if (scenario.seo.noIndex) blockers.push('scenario-noindex')
        if (scenario.sources.length === 0) blockers.push('scenario-sources-missing')
      }
    }

    return { ...candidate, blockers, ready: blockers.length === 0 }
  })

  return {
    candidates,
    configurationBlockers,
    ready: configurationBlockers.length === 0 && candidates.every(({ ready }) => ready),
  }
}
