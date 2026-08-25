import { isVerificationCurrent } from '@/lib/cms/publication'
import { hasCurrentOfficialPrimarySource } from '@/lib/cms/source-trust'
import type { ScenarioViewModel } from '@/lib/cms/types'

export const isScenarioTrusted = (scenario: ScenarioViewModel, now = new Date()) =>
  scenario.status === 'published' &&
  scenario.calculatorRuleSetCurrent &&
  scenario.verification.reviewerConfirmed &&
  isVerificationCurrent(scenario.verification, now) &&
  hasCurrentOfficialPrimarySource(
    scenario.sources.map((source) => ({
      checkedAt: source.checkedAt,
      isPrimary: source.isPrimary,
      source: {
        id: source.registryID,
        trustTier: source.trustTier,
        updatedAt: source.registryUpdatedAt,
      },
      validFrom: source.validFrom,
      validUntil: source.validUntil,
    })),
    scenario.verification.reviewedAt,
    now,
  )
