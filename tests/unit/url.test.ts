import { describe, expect, it } from 'vitest'

import { validateHTTPSURL } from '@/fields/url'

describe('official URL validation', () => {
  it('accepts an HTTPS URL', () => {
    expect(validateHTTPSURL('https://egov.kz/', true)).toBe(true)
  })

  it('rejects HTTP, javascript and malformed values', () => {
    expect(validateHTTPSURL('http://example.com', true)).not.toBe(true)
    expect(validateHTTPSURL('javascript:alert(1)', true)).not.toBe(true)
    expect(validateHTTPSURL('not a url', true)).not.toBe(true)
  })

  it('allows an empty optional action URL', () => {
    expect(validateHTTPSURL(undefined)).toBe(true)
  })
})
