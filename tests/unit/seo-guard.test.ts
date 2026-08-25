import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import nextConfig from '../../next.config'
import { generateMetadata as generateRootMetadata } from '@/app/(frontend)/layout'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { isIndexingAllowed } from '@/lib/site'
import { proxy } from '@/proxy'

const originalAllowIndexing = process.env.QALAI_ALLOW_INDEXING
const originalSiteURL = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (originalAllowIndexing == null) delete process.env.QALAI_ALLOW_INDEXING
  else process.env.QALAI_ALLOW_INDEXING = originalAllowIndexing

  if (originalSiteURL == null) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteURL
})

describe('fail-closed indexing policy', () => {
  it('blocks crawlers, omits the sitemap hint and sets a global response header by default', async () => {
    delete process.env.QALAI_ALLOW_INDEXING

    expect(isIndexingAllowed()).toBe(false)
    expect(generateRootMetadata().robots).toEqual({ follow: false, index: false })
    expect(robots()).toEqual({ rules: { disallow: '/', userAgent: '*' } })
    expect(await sitemap()).toEqual([])

    const headers = (await nextConfig.headers?.()) ?? []
    expect(headers).toContainEqual({
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, nofollow, noarchive',
        },
      ],
      source: '/:path*',
    })

    const response = proxy(new NextRequest('https://staging.qalai.test/scenario/example'))
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow, noarchive')
  })

  it('allows indexing only for the exact explicit true value', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.qalai.test/'
    process.env.QALAI_ALLOW_INDEXING = 'TRUE'
    expect(isIndexingAllowed()).toBe(false)

    process.env.QALAI_ALLOW_INDEXING = 'true'
    expect(isIndexingAllowed()).toBe(true)
    expect(generateRootMetadata().robots).toEqual({ follow: true, index: true })
    expect(robots()).toEqual({
      rules: {
        allow: '/',
        disallow: ['/admin/', '/api/', '/preview/'],
        userAgent: '*',
      },
      sitemap: 'https://staging.qalai.test/sitemap.xml',
    })
    const headers = (await nextConfig.headers?.()) ?? []
    expect(headers.filter((route) => route.source !== '/:path*')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: '/admin/:path*' }),
        expect.objectContaining({ source: '/api/:path*' }),
        expect.objectContaining({ source: '/preview/:path*' }),
      ]),
    )

    const publicResponse = proxy(new NextRequest('https://qalai.test/scenario/example'))
    expect(publicResponse.headers.get('x-robots-tag')).toBeNull()

    for (const pathname of ['/admin', '/api/health', '/preview/example']) {
      const privateResponse = proxy(new NextRequest(`https://qalai.test${pathname}`))
      expect(privateResponse.headers.get('x-robots-tag')).toBe('noindex, nofollow, noarchive')
    }
  })
})
