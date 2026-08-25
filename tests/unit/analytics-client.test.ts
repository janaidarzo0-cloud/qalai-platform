import { afterEach, describe, expect, it, vi } from 'vitest'

const createStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  }
}

const setupWindow = (search = '') => {
  const events = new EventTarget()
  const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/consent')) {
      return { json: async () => ({ tracking: !search.includes('qalai_qa=1') }), ok: true }
    }
    return { ok: true, status: 202 }
  })

  const windowMock = {
    addEventListener: events.addEventListener.bind(events),
    crypto: { randomUUID: () => 'f10bfe30-2f82-4eb2-b697-1f9764617c45' },
    dispatchEvent: events.dispatchEvent.bind(events),
    fetch: fetchMock,
    localStorage: createStorage(),
    location: { search },
    removeEventListener: events.removeEventListener.bind(events),
    sessionStorage: createStorage(),
  }
  vi.stubGlobal('window', windowMock)
  return { fetchMock, windowMock }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('consent-aware browser transport', () => {
  it('makes no request before explicit consent', async () => {
    const { fetchMock } = setupWindow()
    const analytics = await import('@/lib/analytics/client')
    analytics.configureAnalyticsRuntime(true)

    analytics.trackEvent({ name: 'page_view', path: '/' })
    await expect(analytics.establishAnalyticsSession()).resolves.toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts only a strictly serialized event after consent', async () => {
    const { fetchMock, windowMock } = setupWindow()
    windowMock.localStorage.setItem('qalai.analytics.consent.v1', 'granted')
    const analytics = await import('@/lib/analytics/client')
    analytics.configureAnalyticsRuntime(true)

    await expect(analytics.establishAnalyticsSession()).resolves.toBe(true)
    analytics.trackEvent({
      iin: '900101000000',
      name: 'calculator_complete',
      outcome: 'success',
      task: { key: 'auto-loan', type: 'calculator' },
    } as never)
    analytics.trackEvent({
      name: 'calculator_complete',
      outcome: 'success',
      task: { key: 'auto-loan', type: 'calculator' },
    })

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const [, request] = fetchMock.mock.calls[1]
    const body = String((request as RequestInit).body)
    expect(body).toContain('"task":{"key":"auto-loan","type":"calculator"}')
    expect(body).not.toContain('900101000000')
    expect(body).not.toMatch(/amount|email|iin|query|result|salary|telephone|phone/i)
  })

  it('marks QA traffic internally and never opens the event transport', async () => {
    const { fetchMock, windowMock } = setupWindow('?qalai_qa=1&email=private@example.kz')
    windowMock.localStorage.setItem('qalai.analytics.consent.v1', 'granted')
    const analytics = await import('@/lib/analytics/client')
    analytics.configureAnalyticsRuntime(true)

    await expect(analytics.establishAnalyticsSession()).resolves.toBe(false)
    analytics.trackEvent({ name: 'page_view', path: '/' })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/analytics/consent')
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toBe(
      '{"consent":"granted","internalQA":true}',
    )
  })

  it('does not revive a session when consent is revoked during activation', async () => {
    const { fetchMock, windowMock } = setupWindow()
    windowMock.localStorage.setItem('qalai.analytics.consent.v1', 'granted')
    let releaseConsent: (() => void) | undefined
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          releaseConsent = () => resolve({ json: async () => ({ tracking: true }), ok: true })
        }),
    )
    const analytics = await import('@/lib/analytics/client')
    analytics.configureAnalyticsRuntime(true)

    const activation = analytics.establishAnalyticsSession()
    analytics.storeAnalyticsConsent('denied')
    const revocation = analytics.revokeAnalyticsSession()
    releaseConsent?.()

    await expect(activation).resolves.toBe(false)
    await revocation
    analytics.trackEvent({ name: 'page_view', path: '/' })
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/events'))).toHaveLength(0)
  })
})
