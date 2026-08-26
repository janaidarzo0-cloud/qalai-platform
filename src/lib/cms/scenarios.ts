import { getPayload } from 'payload'

import { demoScenarios } from '@/content/demo-scenarios'
import type { Scenario } from '@/payload-types'
import { isRuleSetTrusted } from './rule-set-trust'
import { isScenarioTrusted } from './trust'
import type { ScenarioViewModel } from './types'

const isDemoContentMode = () => process.env.QALAI_CONTENT_MODE !== 'cms'

const getCMSPayload = async () => {
  const { default: config } = await import('@payload-config')
  return getPayload({ config })
}

const mapScenario = (doc: Scenario, now: Date): ScenarioViewModel | null => {
  if (typeof doc.category !== 'object' || doc.category._status !== 'published') return null

  const category = doc.category.title
  const calculatorRuleSetCurrent =
    doc.calculatorRuleSet == null ||
    (typeof doc.calculatorRuleSet === 'object' &&
      isRuleSetTrusted(doc.calculatorRuleSet, now, doc.verification.reviewedAt))
  const sources: ScenarioViewModel['sources'] = doc.sourceReferences.flatMap((reference) => {
    if (!reference.source || typeof reference.source !== 'object') return []
    return [
      {
        checkedAt: reference.checkedAt,
        isPrimary: Boolean(reference.isPrimary),
        publisher: reference.source.publisher,
        registryID: reference.source.id,
        registryUpdatedAt: reference.source.updatedAt,
        title: reference.source.title,
        trustTier: reference.source.trustTier,
        url: reference.source.url,
        validFrom: reference.validFrom ?? undefined,
        validUntil: reference.validUntil ?? undefined,
      },
    ]
  })
  const factsCheckedAt = sources
    .flatMap((source) => (source.checkedAt ? [source.checkedAt] : []))
    .sort((left, right) => left.localeCompare(right))[0]

  return {
    calculatorRuleSetCurrent,
    category,
    cost: doc.cost.explanation ?? (doc.cost.kind === 'free' ? 'Тегін' : 'Нақтылаңыз'),
    costAsOf: doc.cost.asOf ?? undefined,
    documents: (doc.documents ?? []).map((item) => ({
      name: item.name,
      note: item.note ?? undefined,
      optional: Boolean(item.optional),
    })),
    eligibility: (doc.eligibility ?? []).map((item) => ({
      condition: item.condition,
      explanation: item.explanation ?? undefined,
    })),
    faq: (doc.faq ?? []).map((item) => ({
      answer: item.answer,
      question: item.question,
    })),
    factsCheckedAt,
    officialLinks: doc.officialLinks.map((item) => ({
      label: item.label,
      publisher: item.publisher,
      url: item.url,
    })),
    processingTime: doc.processingTime?.value ?? 'Нақтылаңыз',
    processingTimeExplanation: doc.processingTime?.explanation ?? undefined,
    requirements: (doc.requirements ?? []).map((item) => item.item),
    seo: {
      description: doc.seo?.description ?? undefined,
      noIndex: Boolean(doc.seo?.noIndex),
      title: doc.seo?.title ?? undefined,
    },
    shortAnswer: doc.shortAnswer,
    slug: doc.slug,
    sources,
    status: doc._status === 'published' ? 'published' : 'draft',
    steps: doc.steps.map((item) => ({
      actionLabel: item.actionLabel ?? undefined,
      actionUrl: item.actionUrl ?? undefined,
      description: item.description,
      title: item.title,
    })),
    title: doc.title,
    verification: {
      nextReviewAt: doc.verification.nextReviewAt ?? undefined,
      reviewedAt: doc.verification.reviewedAt ?? undefined,
      reviewerConfirmed: Boolean(doc.verification.reviewedBy),
      status: doc.verification.status,
    },
    whoIsItFor: doc.whoIsItFor,
  }
}

export const listPublishedScenarios = async (): Promise<ScenarioViewModel[]> => {
  if (isDemoContentMode()) {
    return demoScenarios.filter((scenario) => scenario.slug !== 'zheke-kasipkerlik-ashu-demo')
  }

  const payload = await getCMSPayload()
  const result = await payload.find({
    collection: 'scenarios',
    depth: 2,
    limit: 100,
    locale: 'kk',
    overrideAccess: true,
    sort: 'title',
    where: { _status: { equals: 'published' } },
  })

  const now = new Date()
  return result.docs
    .map((doc) => mapScenario(doc, now))
    .filter(
      (scenario): scenario is ScenarioViewModel =>
        scenario != null && isScenarioTrusted(scenario, now),
    )
}

export const getScenarioBySlug = async (slug: string): Promise<ScenarioViewModel | null> => {
  if (isDemoContentMode()) return demoScenarios.find((scenario) => scenario.slug === slug) ?? null

  const payload = await getCMSPayload()
  const result = await payload.find({
    collection: 'scenarios',
    depth: 2,
    limit: 1,
    locale: 'kk',
    overrideAccess: true,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  if (!result.docs[0]) return null

  const now = new Date()
  const scenario = mapScenario(result.docs[0], now)
  return scenario != null && isScenarioTrusted(scenario, now) ? scenario : null
}
