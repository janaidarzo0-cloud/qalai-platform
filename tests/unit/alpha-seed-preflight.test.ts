import { describe, expect, it, vi } from 'vitest'

import { alphaScenarioDrafts, alphaSources } from '@/content/alpha-scenarios'
import {
  alphaSourcePackMarker,
  assertAlphaSourcePackIsCompatible,
} from '@/lib/cms/alpha-seed-preflight'

type FindArgs = {
  collection: 'scenarios' | 'sources'
  where: {
    slug?: { equals?: string }
    url?: { equals?: string }
  }
}

const sourceDocument = (source: (typeof alphaSources)[number]) => ({
  documentNumber: source.documentNumber ?? null,
  language: source.language,
  publisher: source.publisher,
  sourceType: source.sourceType,
  title: source.title,
  trustTier: source.trustTier,
  url: source.url,
})

const scenarioSourceReferences = (scenario: (typeof alphaScenarioDrafts)[number]) => {
  const sourceKeys = new Set(scenario.evidence.claims.flatMap((claim) => claim.sourceKeys))
  return [...sourceKeys].map((sourceKey) => {
    const source = alphaSources.find((candidate) => candidate.key === sourceKey)
    if (!source) throw new Error(`Missing Source fixture ${sourceKey}`)
    return {
      isPrimary: scenario.evidence.primarySourceKeys.includes(sourceKey),
      source: sourceDocument(source),
      validFrom: source.validFrom,
      validUntil: source.validUntil,
    }
  })
}

describe('alpha source-pack preflight', () => {
  it('fails on existing Source metadata drift instead of preserving a false attribution', async () => {
    const target = alphaSources.find((source) => source.key === 'identity-fees-2026')
    if (!target) throw new Error('identity-fees-2026 fixture is missing')
    const find = vi.fn(async (args: FindArgs) => {
      if (args.collection === 'sources' && args.where.url?.equals === target.url) {
        return { docs: [{ ...sourceDocument(target), publisher: 'Wrong publisher' }] }
      }
      return { docs: [] }
    })

    await expect(assertAlphaSourcePackIsCompatible({ find } as never)).rejects.toThrow(
      'differs from source pack',
    )
  })

  it('fails on an existing Scenario from an older source-pack version', async () => {
    const target = alphaScenarioDrafts[0]
    const find = vi.fn(async (args: FindArgs) => {
      if (args.collection === 'scenarios' && args.where.slug?.equals === target.slug) {
        return { docs: [{ verification: { notes: '[alpha-source-pack:older]' } }] }
      }
      return { docs: [] }
    })

    await expect(assertAlphaSourcePackIsCompatible({ find } as never)).rejects.toThrow(
      'predates source pack',
    )
  })

  it('fails when a current-marker Scenario still references a Source whose URL drifted', async () => {
    const target = alphaScenarioDrafts[0]
    const references = scenarioSourceReferences(target)
    const firstReference = references[0]
    if (!firstReference) throw new Error('Scenario Source fixtures are missing')
    references[0] = {
      ...firstReference,
      source: { ...firstReference.source, url: 'https://example.test/edited-source' },
    }
    const find = vi.fn(async (args: FindArgs) => {
      if (args.collection === 'scenarios' && args.where.slug?.equals === target.slug) {
        return {
          docs: [
            {
              sourceReferences: references,
              verification: { notes: alphaSourcePackMarker },
            },
          ],
        }
      }
      return { docs: [] }
    })

    await expect(assertAlphaSourcePackIsCompatible({ find } as never)).rejects.toThrow(
      'source-reference drift',
    )
  })

  it('accepts matching metadata and the current Scenario marker', async () => {
    const source = alphaSources[0]
    const scenario = alphaScenarioDrafts[0]
    const find = vi.fn(async (args: FindArgs) => {
      if (args.collection === 'sources' && args.where.url?.equals === source.url) {
        return { docs: [sourceDocument(source)] }
      }
      if (args.collection === 'scenarios' && args.where.slug?.equals === scenario.slug) {
        return {
          docs: [
            {
              sourceReferences: scenarioSourceReferences(scenario),
              verification: { notes: alphaSourcePackMarker },
            },
          ],
        }
      }
      return { docs: [] }
    })

    await expect(assertAlphaSourcePackIsCompatible({ find } as never)).resolves.toBeUndefined()
  })
})
