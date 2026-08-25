import { describe, expect, it } from 'vitest'

import { alphaScenarioDrafts, alphaSources } from '@/content/alpha-scenarios'

const allowedOfficialHost = (hostname: string) =>
  ['adilet.zan.kz', 'egov.kz', 'enbek.kz', 'gov.kz'].some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  )

describe('closed-alpha Scenario source pack', () => {
  it('contains exactly the five agreed unique tasks', () => {
    expect(alphaScenarioDrafts).toHaveLength(5)
    expect(new Set(alphaScenarioDrafts.map((scenario) => scenario.slug)).size).toBe(5)
    expect(alphaScenarioDrafts.map((scenario) => scenario.slug)).toEqual([
      'turgylikty-zherge-tirkelu',
      'zheke-kualikti-auystyru',
      'bala-tuuy-tolemderi',
      'zhumyssyz-retinde-tirkelu-zhane-tolem',
      'zhk-nemese-ozin-ozi-zhumyspen-kamtu',
    ])
  })

  it('keeps every draft noindex and explicitly blocked on native-language and staging review', () => {
    for (const scenario of alphaScenarioDrafts) {
      expect(scenario.seo.noIndex).toBe(true)
      expect(scenario.editorial.publicationBlockers.join(' ')).toMatch(/Қазақша/)
      expect(scenario.editorial.publicationBlockers.join(' ')).toMatch(/staging/)
      expect(new Date(scenario.editorial.researchCheckedAt).getTime()).toBeLessThan(
        new Date(scenario.editorial.nextReviewAt).getTime(),
      )
    }
  })

  it('maps every evidence claim and conflict to a registered official source', () => {
    const sourceKeys = new Set(alphaSources.map((source) => source.key))
    expect(sourceKeys.size).toBe(alphaSources.length)
    expect(new Set(alphaSources.map((source) => source.url)).size).toBe(alphaSources.length)

    for (const source of alphaSources) {
      const url = new URL(source.url)
      expect(url.protocol).toBe('https:')
      expect(allowedOfficialHost(url.hostname)).toBe(true)
    }

    for (const scenario of alphaScenarioDrafts) {
      const usedSourceKeys = new Set(scenario.evidence.claims.flatMap((claim) => claim.sourceKeys))
      expect(scenario.evidence.claims.some((claim) => claim.disposition === 'included')).toBe(true)

      for (const claim of scenario.evidence.claims) {
        expect(claim.evidence.length).toBeGreaterThan(20)
        expect(claim.sourceKeys.length).toBeGreaterThan(0)
        for (const sourceKey of claim.sourceKeys) expect(sourceKeys.has(sourceKey)).toBe(true)
      }

      for (const sourceKey of scenario.evidence.primarySourceKeys) {
        expect(sourceKeys.has(sourceKey)).toBe(true)
        expect(usedSourceKeys.has(sourceKey)).toBe(true)
      }

      for (const conflict of scenario.editorial.conflicts) {
        expect(conflict.resolution.length).toBeGreaterThan(20)
        for (const sourceKey of conflict.sourceKeys) expect(sourceKeys.has(sourceKey)).toBe(true)
      }

      if (scenario.editorial.conflicts.length > 0) {
        expect(scenario.evidence.claims.some((claim) => claim.disposition === 'excluded')).toBe(
          true,
        )
      }
    }
  })

  it('uses only official destinations and never exposes an unreviewed calculator', () => {
    for (const scenario of alphaScenarioDrafts) {
      expect(scenario.officialLinks.length).toBeGreaterThan(0)
      expect(scenario.steps.length).toBeGreaterThan(0)
      expect(scenario.eligibility.length).toBeGreaterThan(0)

      for (const link of scenario.officialLinks) {
        const url = new URL(link.url)
        expect(url.protocol).toBe('https:')
        expect(allowedOfficialHost(url.hostname)).toBe(true)
      }

      for (const step of scenario.steps) {
        if (!step.actionUrl) continue
        const url = new URL(step.actionUrl)
        expect(url.protocol).toBe('https:')
        expect(allowedOfficialHost(url.hostname)).toBe(true)
      }

      expect(JSON.stringify(scenario)).not.toContain('calculatorRuleSet')
    }
  })
})
