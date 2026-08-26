import { describe, expect, it } from 'vitest'

import { demoScenarios } from '@/content/demo-scenarios'

const allowedOfficialHost = (hostname: string) =>
  [
    'adilet.zan.kz',
    'efinance.gov.kz',
    'egov.kz',
    'enbek.kz',
    'gov.kz',
    'nca.pki.gov.kz',
    'ncl.pki.gov.kz',
  ].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))

describe('demo content safety', () => {
  it('never represents a demo or alpha Scenario as verified or indexable', () => {
    for (const scenario of demoScenarios) {
      expect(scenario.status).toBe('draft')
      expect(scenario.seo.noIndex).toBe(true)
      expect(scenario.verification.status).not.toBe('verified')
      expect(scenario.verification.reviewerConfirmed).toBe(false)
      for (const link of scenario.officialLinks) {
        const hostname = new URL(link.url).hostname
        expect(allowedOfficialHost(hostname)).toBe(true)
      }
    }
  })

  it('exposes EDS plus exactly ten demand-led content routes in the prototype', () => {
    const visibleSlugs = demoScenarios
      .filter((scenario) => scenario.slug !== 'zheke-kasipkerlik-ashu-demo')
      .map((scenario) => scenario.slug)

    expect(visibleSlugs).toEqual([
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
    ])
  })

  it('does not present conditional EDS document moderation as the normal service time', () => {
    const eds = demoScenarios.find((scenario) => scenario.slug === 'etsq-alu')

    expect(eds?.processingTime).toContain('модерацияға жіберілсе')
    expect(eds?.processingTimeExplanation).toContain('Қалыпты онлайн өтінімге')
  })
})
