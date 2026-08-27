import type { ScenarioViewModel } from '@/lib/cms/types'

import { alphaScenarioDrafts, alphaSources } from './alpha-scenarios'

export const demandScenarioOrder = [
  'etsq-alu',
  'zhk-nemese-ozin-ozi-zhumyspen-kamtu',
  'ayypuldardy-tekseru-zhane-toleu',
  'zhumyssyz-retinde-tirkelu-zhane-tolem',
  'zhk-ashu',
  'zhk-zhabu',
  'bala-tuuy-tolemderi',
  'balabaksha-kezege-turu',
  'turgylikty-zherge-tirkelu',
  'zheke-kualik-merzimi-ayaktaldy',
  'zheke-kualik-zhogaldy-nemese-urlandy',
] as const

const draftsBySlug = new Map(alphaScenarioDrafts.map((scenario) => [scenario.slug, scenario]))
const sourcesByKey = new Map(alphaSources.map((source) => [source.key, source]))

export const alphaScenarioViewModels: ScenarioViewModel[] = demandScenarioOrder.map((slug) => {
  const scenario = draftsBySlug.get(slug)
  if (!scenario) throw new Error(`Missing closed-alpha Scenario ${slug}.`)

  const usedSourceKeys = [...new Set(scenario.evidence.claims.flatMap((claim) => claim.sourceKeys))]

  return {
    calculatorRuleSetCurrent: true,
    category: scenario.category.title,
    cost: scenario.cost.explanation,
    costAsOf: scenario.cost.asOf,
    documents: scenario.documents.map((document) => ({
      name: document.name,
      note: document.note,
      optional: Boolean(document.optional),
    })),
    eligibility: scenario.eligibility,
    factsCheckedAt: scenario.editorial.researchCheckedAt,
    faq: scenario.faq,
    officialLinks: scenario.officialLinks,
    processingTime: scenario.processingTime.value,
    processingTimeExplanation: scenario.processingTime.explanation,
    requirements: scenario.requirements,
    seo: scenario.seo,
    shortAnswer: scenario.shortAnswer,
    slug: scenario.slug,
    sources: usedSourceKeys.map((sourceKey) => {
      const source = sourcesByKey.get(sourceKey)
      if (!source) throw new Error(`Missing closed-alpha Source ${sourceKey}.`)

      return {
        checkedAt: scenario.editorial.researchCheckedAt,
        isPrimary: scenario.evidence.primarySourceKeys.includes(sourceKey),
        publisher: source.publisher,
        title: source.title,
        trustTier: source.trustTier,
        url: source.url,
        validFrom: source.validFrom,
        validUntil: source.validUntil,
      }
    }),
    status: 'draft',
    steps: scenario.steps,
    title: scenario.title,
    verification: {
      nextReviewAt: scenario.editorial.nextReviewAt,
      reviewerConfirmed: false,
      status: 'in-review',
    },
    whoIsItFor: scenario.whoIsItFor,
  }
})
