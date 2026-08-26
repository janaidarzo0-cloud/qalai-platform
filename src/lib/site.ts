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

export type IndexingBlocker =
  | 'canonical-host-mismatch'
  | 'canonical-url-invalid'
  | 'cms-content-required'
  | 'explicit-approval-required'
  | 'explicit-opt-in-required'
  | 'indexable-host-required'
  | 'preview-environment'

export const getIndexingBlockers = (): IndexingBlocker[] => {
  const blockers: IndexingBlocker[] = []

  if (process.env.QALAI_ALLOW_INDEXING !== 'true') blockers.push('explicit-opt-in-required')
  if (process.env.QALAI_PUBLIC_LAUNCH_APPROVED !== 'true') {
    blockers.push('explicit-approval-required')
  }
  if (process.env.QALAI_CONTENT_MODE !== 'cms') blockers.push('cms-content-required')

  const indexableHost = process.env.QALAI_INDEXABLE_HOST?.trim().toLocaleLowerCase('en-US')
  if (!indexableHost || !/^[a-z0-9.-]+$/.test(indexableHost)) {
    blockers.push('indexable-host-required')
  }

  try {
    const canonicalURL = new URL(getSiteURL())
    const isPlainHTTPSOrigin =
      canonicalURL.protocol === 'https:' &&
      canonicalURL.username === '' &&
      canonicalURL.password === '' &&
      canonicalURL.port === '' &&
      canonicalURL.pathname === '/' &&
      canonicalURL.search === '' &&
      canonicalURL.hash === ''

    if (!isPlainHTTPSOrigin) blockers.push('canonical-url-invalid')
    if (indexableHost && canonicalURL.hostname.toLocaleLowerCase('en-US') !== indexableHost) {
      blockers.push('canonical-host-mismatch')
    }
  } catch {
    blockers.push('canonical-url-invalid')
  }

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    blockers.push('preview-environment')
  }

  return [...new Set(blockers)]
}

export const isIndexingAllowed = () => getIndexingBlockers().length === 0

export const absoluteURL = (path: string) =>
  `${getSiteURL()}${path.startsWith('/') ? path : `/${path}`}`
