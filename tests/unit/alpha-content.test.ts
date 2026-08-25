import { describe, expect, it } from 'vitest'

import {
  alphaScenarioDrafts,
  alphaSources,
  retiredAlphaScenarioSlugs,
} from '@/content/alpha-scenarios'
import { assertScenarioCanPublish } from '@/lib/cms/publication'

const allowedOfficialHost = (hostname: string) =>
  ['adilet.zan.kz', 'egov.kz', 'enbek.kz', 'gov.kz'].some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  )

describe('closed-alpha Scenario source pack', () => {
  it('contains six unique drafts for the five agreed tasks', () => {
    expect(alphaScenarioDrafts).toHaveLength(6)
    expect(new Set(alphaScenarioDrafts.map((scenario) => scenario.slug)).size).toBe(6)
    expect(alphaScenarioDrafts.map((scenario) => scenario.slug)).toEqual([
      'turgylikty-zherge-tirkelu',
      'zheke-kualik-merzimi-ayaktaldy',
      'zheke-kualik-zhogaldy-nemese-urlandy',
      'bala-tuuy-tolemderi',
      'zhumyssyz-retinde-tirkelu-zhane-tolem',
      'zhk-nemese-ozin-ozi-zhumyspen-kamtu',
    ])
    expect(alphaScenarioDrafts.map((scenario) => scenario.slug)).not.toContain(
      retiredAlphaScenarioSlugs[0],
    )
  })

  it('keeps expiry and loss routes separate', () => {
    const expiry = alphaScenarioDrafts.find(
      (scenario) => scenario.slug === 'zheke-kualik-merzimi-ayaktaldy',
    )
    const loss = alphaScenarioDrafts.find(
      (scenario) => scenario.slug === 'zheke-kualik-zhogaldy-nemese-urlandy',
    )
    const expiryJSON = JSON.stringify(expiry)
    const lossJSON = JSON.stringify(loss)

    expect(expiry?.cost.kind).toBe('free')
    expect(expiry?.steps.map((step) => step.actionUrl).filter(Boolean)).toContain(
      'https://egov.kz/services/P40.06/',
    )
    expect(expiryJSON).toContain('10 күнтізбелік күннен аспаса')
    expect(expiryJSON).not.toContain('10 күн толмаса')
    expect(JSON.stringify(expiry?.documents)).not.toContain('талон-хабарламасы')
    expect(expiry?.officialLinks.map((link) => link.url)).toContain(
      'https://www.gov.kz/services/3134?lang=kk',
    )

    expect(loss?.cost.kind).toBe('varies')
    expect(loss?.steps.map((step) => step.actionUrl).filter(Boolean)).not.toContain(
      'https://egov.kz/services/P40.06/',
    )
    expect(lossJSON).toContain('талон-хабарламасы')
    expect(lossJSON).toContain('Әкімшілік іс бойынша қаулы')
    expect(lossJSON).toContain('Әкімшілік хаттама және айыппұл төленгені туралы түбіртек')
    expect(lossJSON).toContain('865 ₸')
    expect(lossJSON).toContain('30 275 ₸')

    const identityJSON = JSON.stringify([expiry, loss])
    expect(identityJSON).not.toContain('https://egov.kz/services/SR.06/')
    expect(identityJSON).not.toContain('https://egov.kz/services/P20.45/')
    expect(expiry?.steps.map((step) => step.actionLabel).filter(Boolean)).not.toContain(
      'ХҚКО кезегін брондау',
    )
    expect(loss?.steps.map((step) => step.actionLabel).filter(Boolean)).not.toContain(
      'ХҚКО кезегін брондау',
    )
    expect(identityJSON).toContain('ХҚКО кезегі туралы ресми ақпарат')
    expect(expiry?.evidence.primarySourceKeys).toContain('administrative-code')
    expect(loss?.evidence.primarySourceKeys).toContain('administrative-code')

    const expiryFeeConflict = expiry?.editorial.conflicts.find((conflict) =>
      conflict.issue.includes('0,2 АЕК'),
    )
    expect(expiryFeeConflict?.sourceKeys).toEqual(
      expect.arrayContaining(['identity-service', 'identity-online-2026', 'tax-code-2026']),
    )
    expect(
      loss?.editorial.conflicts.some((conflict) => conflict.issue.includes('3 айға дейін')),
    ).toBe(true)
  })

  it('bounds every 2026 snapshot at Kazakhstan midnight and attributes identity sources', () => {
    const identityFees = alphaSources.find((source) => source.key === 'identity-fees-2026')
    expect(identityFees?.publisher).toBe('Қорғалжын ауданының әкімдігі')
    expect(
      alphaSources.find((source) => source.key === 'identity-multiple-loss-2026')?.publisher,
    ).toBe('Шымкент қаласының Полиция департаменті')

    for (const sourceKey of [
      'identity-online-2026',
      'identity-fees-2026',
      'identity-multiple-loss-2026',
      'mci-2026',
      'budget-2026',
      'child-allowances-egov',
      'unemployment-payment-2026',
      'self-employed-kgd-2026',
    ]) {
      const source = alphaSources.find((item) => item.key === sourceKey)
      expect(source?.validFrom).toBeDefined()
      expect(source?.validFrom).toBe('2025-12-31T19:00:00.000Z')
      expect(source?.validUntil).toBe('2026-12-31T19:00:00.000Z')
      expect(new Date(source?.validFrom ?? 0).getTime()).toBeLessThan(
        new Date(source?.validUntil ?? 0).getTime(),
      )
    }

    expect(alphaSources.find((source) => source.key === 'tax-code-2026')?.validFrom).toBe(
      '2025-12-31T19:00:00.000Z',
    )
    expect(alphaSources.find((source) => source.key === 'identity-rules')?.validFrom).toBe(
      '2025-12-31T19:00:00.000Z',
    )
    expect(
      alphaSources.find((source) => source.key === 'self-employed-activities')?.validFrom,
    ).toBe('2025-12-31T19:00:00.000Z')
  })

  it('closes every non-identity annual Scenario exactly at Kazakhstan 2027', () => {
    for (const slug of [
      'bala-tuuy-tolemderi',
      'zhumyssyz-retinde-tirkelu-zhane-tolem',
      'zhk-nemese-ozin-ozi-zhumyspen-kamtu',
    ]) {
      const scenario = alphaScenarioDrafts.find((candidate) => candidate.slug === slug)
      if (!scenario) throw new Error(`Missing annual Scenario fixture ${slug}`)

      const sourceReferences = scenario.evidence.primarySourceKeys.map((sourceKey) => {
        const source = alphaSources.find((candidate) => candidate.key === sourceKey)
        if (!source) throw new Error(`Missing Source fixture ${sourceKey}`)
        return {
          checkedAt: scenario.editorial.researchCheckedAt,
          isPrimary: true,
          source: source.key,
          validFrom: source.validFrom,
          validUntil: source.validUntil,
        }
      })
      const candidate = {
        officialLinks: scenario.officialLinks,
        sourceReferences,
        steps: scenario.steps,
        verification: {
          nextReviewAt: '2027-02-01T00:00:00.000Z',
          reviewedAt: '2026-08-25T01:00:00.000Z',
          reviewedBy: 'annual-boundary-reviewer',
          status: 'verified',
        },
      }

      expect(() =>
        assertScenarioCanPublish(candidate, new Date('2026-12-31T18:59:59.999Z')),
      ).not.toThrow()
      expect(() =>
        assertScenarioCanPublish(candidate, new Date('2026-12-31T19:00:00.000Z')),
      ).toThrow('барлық негізгі ресми дереккөздің')
    }
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

      const boundedIncludedSourceKeys = new Set(
        scenario.evidence.claims
          .filter((claim) => claim.disposition === 'included')
          .flatMap((claim) => claim.sourceKeys)
          .filter((sourceKey) =>
            alphaSources.some(
              (source) => source.key === sourceKey && source.validUntil !== undefined,
            ),
          ),
      )
      for (const sourceKey of boundedIncludedSourceKeys) {
        expect(scenario.evidence.primarySourceKeys).toContain(sourceKey)
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
