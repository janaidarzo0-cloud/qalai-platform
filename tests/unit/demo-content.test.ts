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

  it('keeps the citizenship gate in the 2026 self-employed regime guidance', () => {
    const selfEmployed = demoScenarios.find(
      (scenario) => scenario.slug === 'zhk-nemese-ozin-ozi-zhumyspen-kamtu',
    )

    expect(selfEmployed?.shortAnswer).toContain('ҚР азаматы немесе қандас')
    expect(selfEmployed?.eligibility.some((item) => item.condition.includes('қандас'))).toBe(true)
  })

  it('keeps the official 2026 opening and simplified-closing time gates for an IP', () => {
    const openIp = demoScenarios.find((scenario) => scenario.slug === 'zhk-ashu')
    const closeIp = demoScenarios.find((scenario) => scenario.slug === 'zhk-zhabu')
    const closeConditions = closeIp?.eligibility.map((item) => item.condition).join(' ') ?? ''

    expect(openIp?.processingTime).toContain('1 жұмыс күні')
    expect(closeIp?.processingTime).toContain('берілген күні')
    expect(closeIp?.processingTime).toContain('келесі күннен кешіктірмей')
    expect(closeConditions).toContain('ҚҚС')
    expect(closeConditions).toContain('Бірлескен кәсіпкерлік')
    expect(closeConditions).toContain('104-бабындағы жекелеген қызмет')
    expect(closeConditions).toContain('берешегі жоқ')
    expect(closeConditions).toContain('Алдыңғы салық кезеңінің міндеттемелері')
    expect(closeConditions).toContain('Орындалмаған хабарламалар')
    expect(closeConditions).toContain('Ашық банк шоттары')
  })

  it('keeps child-payment residence eligibility and routes kindergarten through the region router', () => {
    const childPayments = demoScenarios.find((scenario) => scenario.slug === 'bala-tuuy-tolemderi')
    const kindergarten = demoScenarios.find(
      (scenario) => scenario.slug === 'balabaksha-kezege-turu',
    )

    expect(childPayments?.shortAnswer).toContain('164 350')
    expect(childPayments?.shortAnswer).toContain('272 475')
    expect(
      childPayments?.eligibility.some((item) =>
        item.condition.includes('тұрақты тұратын шетелдік'),
      ),
    ).toBe(true)
    expect(kindergarten?.shortAnswer).toContain('өңіріңізге арналған кезек жүйесін')
    expect(kindergarten?.shortAnswer).toContain('төрт ұйымды белгілеу')
    expect(kindergarten?.officialLinks[0]?.url).toBe('https://www.gov.kz/services/3042?lang=kk')
    expect(kindergarten?.steps.some((step) => step.actionUrl?.includes('/services/S001'))).toBe(
      false,
    )
  })

  it('shows the reviewed online residence route in the prototype', () => {
    const residence = demoScenarios.find(
      (scenario) => scenario.slug === 'turgylikty-zherge-tirkelu',
    )

    expect(residence?.shortAnswer).toContain('14 жастан бастап')
    expect(residence?.shortAnswer).toContain('онлайн қолжетімді')
    expect(residence?.processingTime).toBe('Портал арқылы 15 минут ішінде')
    expect(residence?.processingTimeExplanation).toContain('1 сағат ішінде')
  })
})
