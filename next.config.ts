import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { isIndexingAllowed } from './src/lib/site'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const noindexHeaders = [
  {
    key: 'X-Robots-Tag',
    value: 'noindex, nofollow, noarchive',
  },
]
const privateIndexingRoutes = ['/admin/:path*', '/api/:path*', '/preview/:path*']

const nextConfig: NextConfig = {
  headers: async () => {
    if (!isIndexingAllowed()) {
      return [{ headers: noindexHeaders, source: '/:path*' }]
    }

    return privateIndexingRoutes.map((source) => ({ headers: noindexHeaders, source }))
  },
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
