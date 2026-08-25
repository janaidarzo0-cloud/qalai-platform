import type { Payload } from 'payload'

import {
  ALPHA_SOURCE_PACK_VERSION,
  alphaScenarioDrafts,
  alphaSources,
  type AlphaSource,
} from '@/content/alpha-scenarios'

export const alphaSourcePackMarker = `[alpha-source-pack:${ALPHA_SOURCE_PACK_VERSION}]`

const sameOptionalValue = (actual: unknown, expected: unknown) =>
  (actual ?? null) === (expected ?? null)

type SourceMetadataCandidate = {
  documentNumber?: unknown
  language?: unknown
  publisher?: unknown
  sourceType?: unknown
  title?: unknown
  trustTier?: unknown
  url?: unknown
}

const sourceMetadataMismatches = (actual: SourceMetadataCandidate, expected: AlphaSource) =>
  [
    ['documentNumber', actual.documentNumber, expected.documentNumber],
    ['language', actual.language, expected.language],
    ['publisher', actual.publisher, expected.publisher],
    ['sourceType', actual.sourceType, expected.sourceType],
    ['title', actual.title, expected.title],
    ['trustTier', actual.trustTier, expected.trustTier],
  ]
    .filter(([, actualValue, expectedValue]) => !sameOptionalValue(actualValue, expectedValue))
    .map(([field]) => field)

const asSourceMetadata = (value: unknown): SourceMetadataCandidate | null =>
  typeof value === 'object' && value !== null ? (value as SourceMetadataCandidate) : null

const referencedSourceDefinitions = (scenario: (typeof alphaScenarioDrafts)[number]) => {
  const keys = new Set(scenario.evidence.claims.flatMap((claim) => claim.sourceKeys))
  return [...keys].map((key) => {
    const source = alphaSources.find((candidate) => candidate.key === key)
    if (!source)
      throw new Error(`[alpha-seed] Scenario ${scenario.slug} uses unknown Source ${key}.`)
    return source
  })
}

export const assertAlphaSourcePackIsCompatible = async (payload: Payload) => {
  for (const definition of alphaSources) {
    const result = await payload.find({
      collection: 'sources',
      limit: 1,
      overrideAccess: true,
      where: { url: { equals: definition.url } },
    })
    const existing = result.docs[0]
    if (!existing) continue

    const mismatches = sourceMetadataMismatches(existing, definition)

    if (mismatches.length > 0) {
      throw new Error(
        `[alpha-seed] Existing Source ${definition.key} differs from source pack ${ALPHA_SOURCE_PACK_VERSION} in: ${mismatches.join(', ')}. Reconcile it through editorial review before rerunning the seed.`,
      )
    }
  }

  for (const definition of alphaScenarioDrafts) {
    const result = await payload.find({
      collection: 'scenarios',
      depth: 1,
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: definition.slug } },
    })
    const existing = result.docs[0]
    if (!existing) continue

    if (!existing.verification?.notes?.includes(alphaSourcePackMarker)) {
      throw new Error(
        `[alpha-seed] Existing Scenario ${definition.slug} predates source pack ${ALPHA_SOURCE_PACK_VERSION}. The seed will not overwrite editorial content; recreate a disposable review database or reconcile the draft manually.`,
      )
    }

    const expectedSources = referencedSourceDefinitions(definition)
    const expectedByURL = new Map(expectedSources.map((source) => [source.url, source]))
    const seenURLs = new Set<string>()

    for (const reference of existing.sourceReferences ?? []) {
      const populatedSource = asSourceMetadata(reference.source)
      const actualURL = populatedSource?.url
      if (!populatedSource || typeof actualURL !== 'string') {
        throw new Error(
          `[alpha-seed] Existing Scenario ${definition.slug} has an uninspectable Source reference. Reconcile its source links before rerunning the seed.`,
        )
      }

      const expectedSource = expectedByURL.get(actualURL)
      if (!expectedSource || seenURLs.has(actualURL)) {
        throw new Error(
          `[alpha-seed] Existing Scenario ${definition.slug} has source-reference drift from pack ${ALPHA_SOURCE_PACK_VERSION}. Reconcile its source links before rerunning the seed.`,
        )
      }
      seenURLs.add(actualURL)

      const mismatches = sourceMetadataMismatches(populatedSource, expectedSource)
      const expectedPrimary = definition.evidence.primarySourceKeys.includes(expectedSource.key)
      if (!sameOptionalValue(reference.isPrimary, expectedPrimary)) mismatches.push('isPrimary')
      if (!sameOptionalValue(reference.validFrom, expectedSource.validFrom)) {
        mismatches.push('validFrom')
      }
      if (!sameOptionalValue(reference.validUntil, expectedSource.validUntil)) {
        mismatches.push('validUntil')
      }

      if (mismatches.length > 0) {
        throw new Error(
          `[alpha-seed] Existing Scenario ${definition.slug} has source-reference drift from pack ${ALPHA_SOURCE_PACK_VERSION} in ${expectedSource.key}: ${mismatches.join(', ')}. Reconcile it through editorial review before rerunning the seed.`,
        )
      }
    }

    const missingSources = expectedSources.filter((source) => !seenURLs.has(source.url))
    if (missingSources.length > 0) {
      throw new Error(
        `[alpha-seed] Existing Scenario ${definition.slug} is missing source references from pack ${ALPHA_SOURCE_PACK_VERSION}: ${missingSources.map((source) => source.key).join(', ')}. Reconcile its source links before rerunning the seed.`,
      )
    }
  }
}
