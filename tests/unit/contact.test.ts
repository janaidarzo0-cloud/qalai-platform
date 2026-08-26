import { afterEach, describe, expect, it } from 'vitest'

import { getPublicContactEmail } from '@/lib/site'

const originalContactEmail = process.env.QALAI_PUBLIC_CONTACT_EMAIL

afterEach(() => {
  if (originalContactEmail == null) delete process.env.QALAI_PUBLIC_CONTACT_EMAIL
  else process.env.QALAI_PUBLIC_CONTACT_EMAIL = originalContactEmail
})

describe('public contact configuration', () => {
  it('normalizes a bounded public email address', () => {
    process.env.QALAI_PUBLIC_CONTACT_EMAIL = ' Contact@QALAIHELP.KZ '
    expect(getPublicContactEmail()).toBe('contact@qalaihelp.kz')
  })

  it('fails closed for missing or malformed contact values', () => {
    delete process.env.QALAI_PUBLIC_CONTACT_EMAIL
    expect(getPublicContactEmail()).toBeNull()

    for (const value of ['owner', 'owner@localhost', 'https://qalai.kz', 'a'.repeat(255)]) {
      process.env.QALAI_PUBLIC_CONTACT_EMAIL = value
      expect(getPublicContactEmail()).toBeNull()
    }
  })
})
