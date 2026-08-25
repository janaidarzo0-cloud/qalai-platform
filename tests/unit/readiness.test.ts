import { describe, expect, it, vi } from 'vitest'

import { checkReadiness } from '@/lib/health/readiness'

describe('readiness health', () => {
  it('returns 200 only after the database probe succeeds', async () => {
    const probe = vi.fn(async () => undefined)

    await expect(checkReadiness(probe)).resolves.toEqual({
      body: { service: 'qalai-platform', status: 'ok' },
      status: 200,
    })
    expect(probe).toHaveBeenCalledOnce()
  })

  it('returns a non-diagnostic 503 when the database probe fails', async () => {
    await expect(
      checkReadiness(async () => {
        throw new Error('password=must-not-leak')
      }),
    ).resolves.toEqual({
      body: { service: 'qalai-platform', status: 'unavailable' },
      status: 503,
    })
  })
})
