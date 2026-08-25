import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getPayload: vi.fn(),
  query: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: mocks.getPayload }))

import { GET } from '@/app/api/health/route'

describe('/api/health readiness route', () => {
  beforeEach(() => {
    mocks.query.mockReset()
    mocks.getPayload.mockReset()
    mocks.getPayload.mockResolvedValue({ db: { pool: { query: mocks.query } } })
  })

  it('returns 200 only after the schema probe succeeds', async () => {
    mocks.query.mockResolvedValue({ rows: [{ '?column?': 1 }] })

    const response = await GET()

    expect(mocks.query).toHaveBeenCalledWith({
      query_timeout: 2_000,
      text: 'SELECT 1 FROM "users" LIMIT 1',
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      service: 'qalai-platform',
      status: 'ok',
    })
  })

  it('returns a non-diagnostic 503 when PostgreSQL is unavailable', async () => {
    mocks.query.mockRejectedValue(
      new Error('postgresql://admin:must-not-leak@db.example.test/qalai'),
    )

    const response = await GET()
    const body = await response.text()

    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(JSON.parse(body)).toEqual({
      service: 'qalai-platform',
      status: 'unavailable',
    })
    expect(body).not.toContain('must-not-leak')
    expect(body).not.toContain('postgresql://')
  })
})
