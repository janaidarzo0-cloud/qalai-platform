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
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
  expect(canonicalHref).toBeTruthy()
  const canonicalURL = new URL(canonicalHref!)
  const actualURL = new URL(page.url())
  expect(canonicalURL.origin).toBe(actualURL.origin)
  expect(canonicalURL.pathname).toBe('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk')
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
