import type { MetadataRoute } from 'next'

import { getSiteURL, isIndexingAllowed } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingAllowed()) {
    return {
      rules: { disallow: '/', userAgent: '*' },
    }
  }

  return {
    rules: {
      allow: '/',
      disallow: ['/admin/', '/api/', '/preview/'],
      userAgent: '*',
    },
    sitemap: `${getSiteURL()}/sitemap.xml`,
  }
}
