import { describe, expect, it, vi } from 'vitest'

import { assertRetiredAlphaScenariosAreSafe } from '@/lib/cms/retired-alpha'

describe('retired alpha Scenario guard', () => {
  it('fails closed before importing replacements when the retired route is published', async () => {
    const find = vi.fn().mockResolvedValueOnce({ docs: [{ id: 1 }] })
    const payload = { find, logger: { warn: vi.fn() } }

    await expect(assertRetiredAlphaScenariosAreSafe(payload as never)).rejects.toThrow(
      'retired Scenario zheke-kualikti-auystyru is published',
    )
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('preserves and warns about an unpublished retired draft', async () => {
    const warn = vi.fn()
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: 1 }] })

    await assertRetiredAlphaScenariosAreSafe({ find, logger: { warn } } as never)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Retired draft'))
  })
})
