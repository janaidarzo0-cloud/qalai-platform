import { expect, test } from '@playwright/test'

const hostedAcceptance = process.env.QALAI_E2E_HOSTED === 'true'
const scenarioSlug =
  process.env.QALAI_E2E_SCENARIO_SLUG ??
  (hostedAcceptance ? undefined : 'zheke-kasipkerlik-ashu-demo')
const allowedOfficialHosts = new Set(
  (process.env.QALAI_E2E_ALLOWED_OFFICIAL_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
)
const demandScenarioSlugs = [
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
]

test('closed staging stays out of search indexes', async ({ page, request }) => {
  if (hostedAcceptance) {
    const healthResponse = await request.get('/api/health')
    expect(healthResponse.ok()).toBe(true)
    expect(healthResponse.headers()['cache-control']).toContain('no-store')
    expect(await healthResponse.json()).toEqual({ service: 'qalai-platform', status: 'ok' })
  }

  const robotsResponse = await request.get('/robots.txt')
  expect(robotsResponse.ok()).toBe(true)
  expect(robotsResponse.headers()['x-robots-tag']).toContain('noindex')
  expect(await robotsResponse.text()).toContain('Disallow: /')

  const sitemapResponse = await request.get('/sitemap.xml')
  expect(sitemapResponse.ok()).toBe(true)
  expect(sitemapResponse.headers()['x-robots-tag']).toContain('noindex')
  expect(await sitemapResponse.text()).not.toContain('<url>')

  const pageResponse = await page.goto('/')
  expect(pageResponse?.ok()).toBe(true)
  expect(pageResponse?.headers()['x-robots-tag']).toContain('noindex')
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)

  const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
  expect(canonicalHref).toBeTruthy()
  const canonicalURL = new URL(canonicalHref!)
  const actualURL = new URL(page.url())
  expect(canonicalURL.origin).toBe(
    process.env.QALAI_E2E_EXPECT_CANONICAL_ORIGIN ?? actualURL.origin,
  )
  expect(canonicalURL.pathname).toBe('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk')
})

test('mixed-language search finds a public task without exposing alpha content', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Сұрағыңызды жазыңыз').fill('кредит на машину')
  await page.getByRole('button', { name: 'Нұсқаулықты табу' }).click()

  await expect(page.getByText('1 тексерілген материал табылды.')).toBeVisible()
  const result = page.getByRole('link', { name: /Автонесие калькуляторы/ })
  await expect(result).toHaveAttribute('href', '/calculator/avtonesie-kalkulyatory')
  await expect(page.getByText(/Декреттік төлем калькуляторы/)).toHaveCount(0)

  await result.click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Автонесие калькуляторы' }),
  ).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('auto-loan calculator completes the primary outcome', async ({ page }) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/calculator/avtonesie-kalkulyatory')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Автонесие калькуляторы' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Ай сайынғы төлемді есептеу' }).click()

  await expect(page.getByRole('heading', { name: /253.*934.*₸/ })).toBeVisible()
  await expect(page.getByText(/10\D*000\D*000\s*₸/)).toBeVisible()
  await expect(page.getByText(/15\D*236\D*056\s*₸/)).toBeVisible()
  await expect(page.getByText(/^5\D*236\D*056\s*₸$/)).toBeVisible()
  await expect(page.getByText('formulaVersion: annuity-v1')).toBeVisible()

  await page.getByLabel('Алғашқы жарна').fill('13000000')
  await page.getByRole('button', { name: 'Ай сайынғы төлемді есептеу' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Мәндерді тексеріңіз' })).toBeVisible()
  expect(browserErrors).toEqual([])
})

test('salary calculator estimates 2026 take-home pay without opening global indexing', async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/calculator/zhalaqy-kalkulyatory')
  await expect(page.getByRole('heading', { level: 1, name: 'Жалақы калькуляторы' })).toBeVisible()
  await expect(page.getByText(/ЖАБЫҚ АЛЬФА/)).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  await page.getByRole('button', { name: 'Қолға түсетін соманы есептеу' }).click()
  await expect(page.getByRole('heading', { name: /408.*975.*₸/ })).toBeVisible()
  await expect(page.getByText(/31.*025.*₸/)).toBeVisible()
  await expect(page.getByText('formulaVersion: kz-salary-2026-v2')).toBeVisible()

  await page.getByRole('checkbox', { name: /30 АЕК базалық шегерімді қолданады/ }).uncheck()
  await page.getByRole('button', { name: 'Қолға түсетін соманы есептеу' }).click()
  await expect(page.getByRole('heading', { name: /396.*000.*₸/ })).toBeVisible()

  await page.getByLabel('Есептелген айлық жалақы').fill('5000000')
  await page.getByRole('button', { name: 'Қолға түсетін соманы есептеу' }).click()
  await expect(page.getByText('Орташа қолға түсетін сома')).toBeVisible()
  await expect(page.getByText(/Нақты айлық ұсталымды жұмыс берушінің есеп парағынан/)).toBeVisible()
  expect(browserErrors).toEqual([])
})

test('vehicle-tax alpha calculates the 2026 obligation without becoming indexable', async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/calculator/kolik-salygy-kalkulyatory')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Көлік салығы калькуляторы' }),
  ).toBeVisible()
  await expect(page.getByText(/ЖАБЫҚ АЛЬФА/)).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  await page.getByRole('button', { name: 'Салықты есептеу' }).click()
  await expect(page.getByRole('heading', { name: /16.*461.*₸/ })).toBeVisible()
  await expect(page.getByText('formulaVersion: kz-vehicle-tax-2026-v2')).toBeVisible()

  await page.getByLabel('Шығарылған жылы').fill('2016')
  await page.getByRole('button', { name: 'Салықты есептеу' }).click()
  await expect(page.getByRole('heading', { name: /11.*523.*₸/ })).toBeVisible()
  await expect(page.getByText(/10 жыл · коэффициент 0.7/)).toBeVisible()

  await page.getByLabel('Шығарылған жылы').fill('2005')
  await page.getByRole('button', { name: 'Салықты есептеу' }).click()
  await expect(page.getByRole('heading', { name: /8.*231.*₸/ })).toBeVisible()
  await expect(page.getByText(/коэффициент 0.5/)).toBeVisible()
  expect(browserErrors).toEqual([])
})

test('maternity-benefit alpha matches the 2026 official control examples', async ({ page }) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/calculator/dekrettik-tolem-kalkulyatory')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Декреттік төлем калькуляторы' }),
  ).toBeVisible()
  await expect(page.getByText(/ЖАБЫҚ АЛЬФА/)).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  await page.getByRole('button', { name: 'Төлемді есептеу' }).click()
  await expect(page.getByRole('heading', { name: /612.*360.*₸/ })).toBeVisible()
  await expect(page.getByText('formulaVersion: kz-maternity-benefit-2026-v1')).toBeVisible()

  await page.getByLabel('Есептелген тұрақты айлық жалақы').fill('700000')
  await page.getByRole('button', { name: 'Төлемді есептеу' }).click()
  await expect(page.getByRole('heading', { name: /2.*249.*100.*₸/ })).toBeVisible()
  await expect(page.getByText(/7 ЕТЖ шегімен/)).toBeVisible()
  expect(browserErrors).toEqual([])
})

test('childcare-benefit alpha separates working and non-working payments', async ({ page }) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/calculator/bala-kutimi-tolemi')
  await expect(page.getByRole('heading', { level: 1, name: 'Бала күтімі төлемі' })).toBeVisible()
  await expect(page.getByText(/ЖАБЫҚ АЛЬФА/)).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  await page.getByRole('button', { name: 'Ай сайынғы төлемді есептеу' }).click()
  await expect(page.getByRole('heading', { name: /63.*000.*₸/ })).toBeVisible()
  await expect(page.getByText('formulaVersion: kz-childcare-benefit-2026-v1')).toBeVisible()

  await page.getByLabel('Жұмыс және әлеуметтік аударым мәртебесі').selectOption('non-working')
  await page.getByLabel('Баланың кезегі').selectOption('4')
  await page.getByRole('button', { name: 'Ай сайынғы төлемді есептеу' }).click()
  await expect(page.getByRole('heading', { name: /38.*493.*₸/ })).toBeVisible()
  await expect(page.getByText(/8.9 АЕК/)).toBeVisible()
  expect(browserErrors).toEqual([])
})

test('high-intent content leads to the relevant calculators without opening indexing', async ({
  page,
}) => {
  await page.goto('/scenario/bala-tuuy-tolemderi')
  const related = page.getByRole('heading', { name: 'Сомаңызды бірден есептеңіз' }).locator('..')

  await expect(related.getByRole('link', { name: /Декреттік төлем/ })).toHaveAttribute(
    'href',
    '/calculator/dekrettik-tolem-kalkulyatory',
  )
  await expect(related.getByRole('link', { name: /Бала күтімі/ })).toHaveAttribute(
    'href',
    '/calculator/bala-kutimi-tolemi',
  )

  await related.getByRole('link', { name: /Декреттік төлем/ }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Декреттік төлем калькуляторы' }),
  ).toBeVisible()
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
  await expect(page.getByRole('link', { name: /Бала күтімі/ })).toHaveAttribute(
    'href',
    '/calculator/bala-kutimi-tolemi',
  )
})

test('EDS alpha route uses only official destinations and remains unverified', async ({ page }) => {
  await page.goto('/scenario/etsq-alu')

  await expect(
    page.getByRole('heading', { level: 1, name: 'ЭЦҚ-ны онлайн қалай алуға болады?' }),
  ).toBeVisible()
  await expect(page.getByText(/ЖАБЫҚ АЛЬФА/)).toBeVisible()
  await expect(page.getByText('Редактор тексеруде')).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  const officialLinks = page
    .getByRole('heading', { name: 'Ресми қызметте жалғастыру' })
    .locator('..')
    .getByRole('link')
  await expect(officialLinks).toHaveCount(2)
  await expect(officialLinks.nth(0)).toHaveAttribute(
    'href',
    'https://nca.pki.gov.kz/service/pkiorder/precreate.xhtml?certtemplateAlias=id_card_remote',
  )
  await expect(officialLinks.nth(1)).toHaveAttribute('href', 'https://ncl.pki.gov.kz/')

  await expect(page.getByRole('link', { name: 'NCALayer ресми бетін ашу' })).toHaveAttribute(
    'href',
    'https://ncl.pki.gov.kz/',
  )
  await expect(page.getByRole('link', { name: 'Ресми өтінімге өту' })).toHaveAttribute(
    'href',
    'https://nca.pki.gov.kz/service/pkiorder/precreate.xhtml?certtemplateAlias=id_card_remote',
  )
})

test('remaining core Scenario routes keep exact reviewed official destinations', async ({
  page,
}) => {
  const expectedRoutes = {
    '/scenario/ayypuldardy-tekseru-zhane-toleu': [
      'https://www.gov.kz/services/3867?lang=kk',
      'https://egov.kz/services/P21.01/',
    ],
    '/scenario/zhk-nemese-ozin-ozi-zhumyspen-kamtu': [
      'https://adilet.zan.kz/kaz/docs/P2500000994',
      'https://egov.kz/cms/kk/articles/ip-registration',
    ],
    '/scenario/zhumyssyz-retinde-tirkelu-zhane-tolem': [
      'https://egov.kz/cms/kk/services/pass363_mtszn',
      'https://www.enbek.kz/kk',
    ],
  } as const

  for (const [pathname, expectedLinks] of Object.entries(expectedRoutes)) {
    await page.goto(pathname)
    const links = page
      .getByRole('heading', { name: 'Ресми қызметте жалғастыру' })
      .locator('..')
      .getByRole('link')

    await expect(links).toHaveCount(expectedLinks.length)
    for (let index = 0; index < expectedLinks.length; index += 1) {
      await expect(links.nth(index)).toHaveAttribute('href', expectedLinks[index])
      await expect(links.nth(index)).toHaveAttribute('target', '_blank')
      await expect(links.nth(index)).toHaveAttribute('rel', /noreferrer/)
    }
  }
})

test('publisher trust pages explain ownership, editorial rules and privacy', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('footer')
  await expect(footer.getByRole('link', { name: 'Біз туралы' })).toHaveAttribute('href', '/about')
  await expect(footer.getByRole('link', { name: 'Байланыс' })).toHaveAttribute('href', '/contact')
  await expect(footer.getByRole('link', { name: 'Редакциялық қағида' })).toHaveAttribute(
    'href',
    '/editorial-policy',
  )
  await expect(footer.getByRole('link', { name: 'Құпиялық' })).toHaveAttribute('href', '/privacy')

  for (const [pathname, heading] of [
    ['/about', 'Күрделі рәсімді түсінікті әрекетке айналдырамыз.'],
    ['/contact', 'Сұрақ, ұсыныс немесе қате таптыңыз ба?'],
    ['/editorial-policy', '«QALAI тексерді» белгісі қалай беріледі?'],
    ['/privacy', 'Есептеу мәндерін және жеке деректерді аналитикаға жібермейміз.'],
  ] as const) {
    const response = await page.goto(pathname)
    expect(response?.ok()).toBe(true)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  }
})

test('all ten demand-led routes render sourced noindex alpha content', async ({ page }) => {
  for (const slug of demandScenarioSlugs) {
    const response = await page.goto(`/scenario/${slug}`)
    expect(response?.ok()).toBe(true)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/ЖАБЫҚ АЛЬФА/)).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

    const officialActions = page
      .getByRole('heading', { name: 'Ресми қызметте жалғастыру' })
      .locator('..')
      .getByRole('link')
    expect(await officialActions.count()).toBeGreaterThan(0)

    const sourceLinks = page.locator('.aside-card--sources').getByRole('link')
    expect(await sourceLinks.count()).toBeGreaterThan(0)
  }
})

test('scenario outcome has the correct closed-alpha action state', async ({ page }) => {
  expect(scenarioSlug).toBeTruthy()
  await page.goto(`/scenario/${scenarioSlug}`)

  const nextStep = page.getByRole('heading', { name: 'Ресми қызметте жалғастыру' }).locator('..')

  if (!hostedAcceptance) {
    await expect(nextStep.getByText('Демо-нұсқада әрекет сілтемесі әдейі өшірілген.')).toBeVisible()
    return
  }

  await expect(page.getByText('Qalai тексерді')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Не істеу керек?' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Қандай құжат керек?' })).toBeVisible()
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('HowTo')

  const officialLink = nextStep.getByRole('link').first()
  await expect(officialLink).toBeVisible()
  await expect(officialLink).toHaveAttribute('target', '_blank')
  await expect(officialLink).toHaveAttribute('rel', /noreferrer/)

  const href = await officialLink.getAttribute('href')
  expect(href).toBeTruthy()
  const officialURL = new URL(href!)
  expect(officialURL.protocol).toBe('https:')
  expect(officialURL.origin).not.toBe(new URL(page.url()).origin)
  expect(allowedOfficialHosts.has(officialURL.hostname.toLowerCase())).toBe(true)

  await page.context().route(`${officialURL.origin}/**`, async (route) => {
    await route.fulfill({ body: 'QALAI hosted acceptance stub', contentType: 'text/plain' })
  })
  const popupPromise = page.waitForEvent('popup')
  await officialLink.click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(href!)
  await popup.close()
})

test.describe('mobile viewport', () => {
  test.use({ viewport: { height: 844, width: 390 } })

  test('primary paths render without horizontal overflow', async ({ page }) => {
    expect(scenarioSlug).toBeTruthy()

    for (const pathname of [
      '/',
      '/calculator/avtonesie-kalkulyatory',
      '/calculator/dekrettik-tolem-kalkulyatory',
      '/calculator/bala-kutimi-tolemi',
      '/calculator/zhalaqy-kalkulyatory',
      '/calculator/kolik-salygy-kalkulyatory',
      '/about',
      '/contact',
      '/privacy',
      '/scenario/etsq-alu',
      '/scenario/ayypuldardy-tekseru-zhane-toleu',
      '/scenario/zhk-nemese-ozin-ozi-zhumyspen-kamtu',
      '/scenario/zhumyssyz-retinde-tirkelu-zhane-tolem',
      '/scenario/zhk-zhabu',
      `/scenario/${scenarioSlug}`,
    ]) {
      const response = await page.goto(pathname)
      expect(response?.ok()).toBe(true)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }))
      expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1)
    }
  })
})
