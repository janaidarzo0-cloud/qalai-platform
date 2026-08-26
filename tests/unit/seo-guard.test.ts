import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import nextConfig from '../../next.config'
import { generateMetadata as generateRootMetadata } from '@/app/(frontend)/layout'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { getIndexingBlockers, isIndexingAllowed } from '@/lib/site'
import { proxy } from '@/proxy'

const managedEnvironmentKeys = [
  'NEXT_PUBLIC_SITE_URL',
  'QALAI_ALLOW_INDEXING',
  'QALAI_CONTENT_MODE',
  'QALAI_INDEXABLE_HOST',
  'QALAI_PUBLIC_CONTACT_EMAIL',
  'QALAI_PUBLIC_LAUNCH_APPROVED',
  'VERCEL_ENV',
] as const
const originalEnvironment = new Map(
  managedEnvironmentKeys.map((key) => [key, process.env[key]] as const),
)

afterEach(() => {
  for (const key of managedEnvironmentKeys) {
    const originalValue = originalEnvironment.get(key)
    if (originalValue == null) delete process.env[key]
    else process.env[key] = originalValue
  }
})

const enablePublicIndexing = () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://public.qalai.test'
  process.env.QALAI_ALLOW_INDEXING = 'true'
  process.env.QALAI_CONTENT_MODE = 'cms'
  process.env.QALAI_INDEXABLE_HOST = 'public.qalai.test'
  process.env.QALAI_PUBLIC_CONTACT_EMAIL = 'contact@public.qalai.test'
  process.env.QALAI_PUBLIC_LAUNCH_APPROVED = 'true'
  process.env.VERCEL_ENV = 'production'
}

describe('fail-closed indexing policy', () => {
  it('blocks crawlers, omits the sitemap hint and sets a global response header by default', async () => {
    for (const key of managedEnvironmentKeys) delete process.env[key]

    expect(isIndexingAllowed()).toBe(false)
    expect(getIndexingBlockers()).toEqual(
      expect.arrayContaining([
        'explicit-opt-in-required',
        'explicit-approval-required',
        'cms-content-required',
        'indexable-host-required',
        'canonical-url-invalid',
        'public-contact-required',
      ]),
    )
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

  it('allows indexing only when every public-launch lock matches', async () => {
    enablePublicIndexing()
    expect(isIndexingAllowed()).toBe(true)
    expect(getIndexingBlockers()).toEqual([])
    expect(generateRootMetadata().robots).toEqual({ follow: true, index: true })
    expect(robots()).toEqual({
      rules: {
        allow: '/',
        disallow: ['/admin/', '/api/', '/preview/'],
        userAgent: '*',
      },
      sitemap: 'https://public.qalai.test/sitemap.xml',
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

  it('fails closed for demo content, host drift, insecure origins and Vercel previews', () => {
    enablePublicIndexing()

    process.env.QALAI_CONTENT_MODE = 'demo'
    expect(getIndexingBlockers()).toContain('cms-content-required')

    process.env.QALAI_CONTENT_MODE = 'cms'
    process.env.QALAI_PUBLIC_LAUNCH_APPROVED = 'false'
    expect(getIndexingBlockers()).toContain('explicit-approval-required')

    process.env.QALAI_PUBLIC_LAUNCH_APPROVED = 'true'
    process.env.QALAI_INDEXABLE_HOST = 'other.qalai.test'
    expect(getIndexingBlockers()).toContain('canonical-host-mismatch')

    process.env.QALAI_INDEXABLE_HOST = 'public.qalai.test'
    process.env.NEXT_PUBLIC_SITE_URL = 'http://public.qalai.test'
    expect(getIndexingBlockers()).toContain('canonical-url-invalid')

    process.env.NEXT_PUBLIC_SITE_URL = 'https://public.qalai.test'
    process.env.VERCEL_ENV = 'preview'
    expect(getIndexingBlockers()).toContain('preview-environment')
    expect(isIndexingAllowed()).toBe(false)
  })
})
