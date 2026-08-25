import type { MetadataRoute } from 'next'

import { listPublishedScenarios } from '@/lib/cms/scenarios'
import { getSiteURL, isIndexingAllowed } from '@/lib/site'
import { calculatorDefinitions } from '@/modules/calculators/registry'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingAllowed()) return []

  const baseURL = getSiteURL()
  const scenarios = await listPublishedScenarios()

  return [
    { changeFrequency: 'weekly', priority: 1, url: baseURL },
    ...scenarios
      .filter((scenario) => scenario.status === 'published' && !scenario.seo.noIndex)
      .map((scenario) => ({
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        url: `${baseURL}/scenario/${scenario.slug}`,
      })),
    ...calculatorDefinitions
      .filter((calculator) => calculator.status === 'available')
      .map((calculator) => ({
        changeFrequency: 'monthly' as const,
        priority: 0.9,
        url: `${baseURL}/calculator/${calculator.slug}`,
      })),
  ]
}
