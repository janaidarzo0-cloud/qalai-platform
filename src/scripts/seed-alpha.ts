import config from '@payload-config'
import { pathToFileURL } from 'node:url'
import { getPayload, type Payload } from 'payload'

import {
  ALPHA_SOURCE_PACK_VERSION,
  alphaScenarioDrafts,
  alphaSources,
  type AlphaEvidenceClaim,
} from '@/content/alpha-scenarios'
import { createClosedAlphaImportContext } from '@/hooks/editorial'
import {
  alphaSourcePackMarker,
  assertAlphaSourcePackIsCompatible,
} from '@/lib/cms/alpha-seed-preflight'
import { assertRetiredAlphaScenariosAreSafe } from '@/lib/cms/retired-alpha'

const ALPHA_SEED_OPT_IN = 'true'

const unique = <T>(values: T[]) => [...new Set(values)]

const asPostgresID = (value: unknown, label: string): number => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`${label} did not return a numeric PostgreSQL ID.`)
  }
  return value
}

const formatClaims = (
  claims: AlphaEvidenceClaim[],
  disposition: AlphaEvidenceClaim['disposition'],
) =>
  claims
    .filter((claim) => claim.disposition === disposition)
    .map((claim) => `${claim.id}: ${claim.statement}`)
    .join('\n')

export const seedClosedAlpha = async (payload: Payload) => {
  await assertRetiredAlphaScenariosAreSafe(payload)
  await assertAlphaSourcePackIsCompatible(payload)

  const sourceIDs = new Map<string, number>()

  for (const source of alphaSources) {
    const existing = await payload.find({
      collection: 'sources',
      limit: 1,
      overrideAccess: true,
      where: { url: { equals: source.url } },
    })
    const document =
      existing.docs[0] ??
      (await payload.create({
        collection: 'sources',
        data: {
          documentNumber: source.documentNumber,
          language: source.language,
          publisher: source.publisher,
          sourceType: source.sourceType,
          title: source.title,
          trustTier: source.trustTier,
          url: source.url,
        },
        overrideAccess: true,
      }))
    sourceIDs.set(source.key, asPostgresID(document.id, `Source ${source.key}`))
  }
  payload.logger.info(`[alpha-seed] ${sourceIDs.size} official Sources ready.`)

  const categoryIDs = new Map<string, number>()
  for (const category of unique(alphaScenarioDrafts.map((scenario) => scenario.category.slug))) {
    const definition = alphaScenarioDrafts.find(
      (scenario) => scenario.category.slug === category,
    )?.category
    if (!definition) throw new Error(`Missing Category definition for ${category}.`)

    const existing = await payload.find({
      collection: 'categories',
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: definition.slug } },
    })
    const document =
      existing.docs[0] ??
      (await payload.create({
        collection: 'categories',
        data: {
          _status: 'draft',
          description: definition.description,
          order: definition.order,
          seo: { noIndex: true },
          slug: definition.slug,
          title: definition.title,
        },
        draft: true,
        overrideAccess: true,
      }))
    categoryIDs.set(definition.slug, asPostgresID(document.id, `Category ${definition.slug}`))
  }
  payload.logger.info(`[alpha-seed] ${categoryIDs.size} draft Categories ready.`)

  let created = 0
  let skipped = 0
  for (const scenario of alphaScenarioDrafts) {
    const existing = await payload.find({
      collection: 'scenarios',
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: scenario.slug } },
    })
    if (existing.docs[0]) {
      skipped += 1
      continue
    }

    const referencedSourceKeys = unique(
      scenario.evidence.claims.flatMap((claim) => claim.sourceKeys),
    )
    const sourceReferences = referencedSourceKeys.map((sourceKey) => {
      const sourceID = sourceIDs.get(sourceKey)
      const sourceDefinition = alphaSources.find((source) => source.key === sourceKey)
      if (sourceID == null || !sourceDefinition) throw new Error(`Unknown Source key ${sourceKey}.`)

      const claims = scenario.evidence.claims.filter((claim) =>
        claim.sourceKeys.includes(sourceKey),
      )
      const included = formatClaims(claims, 'included')
      const excluded = formatClaims(claims, 'excluded')
      const claimsSupported = [
        included ? `Жарияланымға енгізілген:\n${included}` : undefined,
        excluded ? `Қайшылыққа байланысты алып тасталған:\n${excluded}` : undefined,
      ]
        .filter(Boolean)
        .join('\n\n')

      return {
        checkedAt: scenario.editorial.researchCheckedAt,
        claimsSupported,
        evidenceSummary: claims.map((claim) => `${claim.id}: ${claim.evidence}`).join('\n'),
        isPrimary: scenario.evidence.primarySourceKeys.includes(sourceKey),
        source: sourceID,
        validFrom: sourceDefinition.validFrom,
        validUntil: sourceDefinition.validUntil,
      }
    })

    const categoryID = categoryIDs.get(scenario.category.slug)
    if (categoryID == null) throw new Error(`Unknown Category ${scenario.category.slug}.`)

    await payload.create({
      collection: 'scenarios',
      context: createClosedAlphaImportContext(),
      data: {
        _status: 'draft',
        category: categoryID,
        cost: scenario.cost,
        documents: scenario.documents,
        eligibility: scenario.eligibility,
        faq: scenario.faq,
        officialLinks: scenario.officialLinks,
        processingTime: scenario.processingTime,
        requirements: scenario.requirements.map((item) => ({ item })),
        seo: scenario.seo,
        shortAnswer: scenario.shortAnswer,
        slug: scenario.slug,
        sourceReferences,
        steps: scenario.steps,
        title: scenario.title,
        verification: {
          nextReviewAt: scenario.editorial.nextReviewAt,
          notes: [
            'ЖАРИЯЛАУҒА БОЛМАЙДЫ. Альфа зерттеу пакеті.',
            alphaSourcePackMarker,
            `Дереккөз пакеті: ${ALPHA_SOURCE_PACK_VERSION}.`,
            ...scenario.editorial.publicationBlockers.map((item) => `Блокер: ${item}`),
            ...scenario.editorial.conflicts.map(
              (conflict) => `Қайшылық: ${conflict.issue}\nШешім: ${conflict.resolution}`,
            ),
          ].join('\n\n'),
          riskLevel: 'high',
          status: 'unverified',
        },
        whoIsItFor: scenario.whoIsItFor,
      },
      draft: true,
      overrideAccess: true,
    })
    created += 1
  }

  payload.logger.info(
    `[alpha-seed] ${created} draft Scenarios created; ${skipped} existing Scenarios preserved. Nothing was published.`,
  )

  return {
    categories: categoryIDs.size,
    created,
    skipped,
    sources: sourceIDs.size,
  }
}

const main = async () => {
  if (process.env.QALAI_ALLOW_ALPHA_SEED !== ALPHA_SEED_OPT_IN) {
    throw new Error(
      'Alpha seed is opt-in. Set QALAI_ALLOW_ALPHA_SEED=true; it creates drafts and never publishes.',
    )
  }

  const watchdog = setTimeout(() => {
    console.error('[alpha-seed] Timed out after 120 seconds.')
    process.exit(1)
  }, 120_000)

  const payload = await getPayload({ config })
  try {
    await seedClosedAlpha(payload)
  } finally {
    clearTimeout(watchdog)
  }
}

const isDirectExecution =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectExecution) {
  main()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error)
      process.exit(1)
    })
}
