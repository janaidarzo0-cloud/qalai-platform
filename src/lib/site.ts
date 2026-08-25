export const siteConfig = {
  description:
    'QALAI Қазақстандағы күнделікті, қаржылық және мемлекеттік істерді түсінікті қадамдарға айналдырады.',
  locale: 'kk_KZ',
  name: 'QALAI',
} as const

export const getSiteURL = () => {
  const configuredURL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return configuredURL.endsWith('/') ? configuredURL.slice(0, -1) : configuredURL
}

export const isIndexingAllowed = () => process.env.QALAI_ALLOW_INDEXING === 'true'

export const absoluteURL = (path: string) =>
  `${getSiteURL()}${path.startsWith('/') ? path : `/${path}`}`
