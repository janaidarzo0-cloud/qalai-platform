import { describe, expect, it } from 'vitest'

import { ALPHA_SEED_CONFIRMATION, isAllowedAlphaSeedRequest } from '@/lib/cms/alpha-seed-request'

const validRequest = {
  confirmation: ALPHA_SEED_CONFIRMATION,
  origin: 'https://qalai.example.kz',
  secFetchSite: 'same-origin',
  siteURL: 'https://qalai.example.kz',
}

describe('closed-alpha seed request gate', () => {
  it('allows the exact same-origin confirmation', () => {
    expect(isAllowedAlphaSeedRequest(validRequest)).toBe(true)
  })

  it('rejects cross-site, missing and malformed requests', () => {
    expect(isAllowedAlphaSeedRequest({ ...validRequest, origin: 'https://attacker.test' })).toBe(
      false,
    )
    expect(isAllowedAlphaSeedRequest({ ...validRequest, secFetchSite: 'cross-site' })).toBe(false)
    expect(isAllowedAlphaSeedRequest({ ...validRequest, confirmation: 'IMPORT' })).toBe(false)
    expect(isAllowedAlphaSeedRequest({ ...validRequest, siteURL: 'not a URL' })).toBe(false)
  })
})
