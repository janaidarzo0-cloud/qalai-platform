import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'

import { CalculatorRuleSets } from '@/collections/CalculatorRuleSets'
import { Categories } from '@/collections/Categories'
import { Scenarios } from '@/collections/Scenarios'
import { Sources } from '@/collections/Sources'
import { Users } from '@/collections/Users'
import { SiteSettings } from '@/globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseURL = process.env.DATABASE_URL
const payloadSecret = process.env.PAYLOAD_SECRET
const siteURL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

if (!databaseURL) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env before starting QALAI.')
}

if (!payloadSecret || payloadSecret.length < 32) {
  throw new Error('PAYLOAD_SECRET must contain at least 32 characters.')
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: dirname,
    },
    user: Users.slug,
  },
  collections: [Users, Categories, Sources, CalculatorRuleSets, Scenarios],
  cors: [siteURL],
  csrf: [siteURL],
  db: postgresAdapter({
    disableCreateDatabase: true,
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: databaseURL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    },
    push: process.env.NODE_ENV !== 'production',
  }),
  globals: [SiteSettings],
  localization: {
    defaultLocale: 'kk',
    fallback: true,
    locales: [{ code: 'kk', label: 'Қазақша' }],
  },
  secret: payloadSecret,
  serverURL: siteURL,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
