import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'

import { CalculatorRuleSets } from '@/collections/CalculatorRuleSets'
import { Categories } from '@/collections/Categories'
import { createMediaCollection } from '@/collections/Media'
import { ResolvedTasks } from '@/collections/ResolvedTasks'
import { Scenarios } from '@/collections/Scenarios'
import { Sources } from '@/collections/Sources'
import { Users } from '@/collections/Users'
import { SiteSettings } from '@/globals/SiteSettings'
import { createMediaStoragePluginOptions } from '@/lib/cms/media-storage'
import { getDatabaseConnectionOptions, isPayloadDBPushEnabled } from '@/lib/env/database'
import { getMediaStorageConfig, MAX_MEDIA_FILE_BYTES } from '@/lib/env/media'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseURL = process.env.DATABASE_URL
const payloadSecret = process.env.PAYLOAD_SECRET
const siteURL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const databasePushEnabled = isPayloadDBPushEnabled()
const mediaStorage = getMediaStorageConfig(process.env, path.resolve(dirname, '..'))
const mediaCollection = createMediaCollection(
  mediaStorage.mode === 'local'
    ? mediaStorage.staticDir
    : path.resolve(dirname, '..', '.data/media'),
)

if (!databaseURL) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env before starting QALAI.')
}

if (!payloadSecret || payloadSecret.length < 32) {
  throw new Error('PAYLOAD_SECRET must contain at least 32 characters.')
}

const databaseConnection = getDatabaseConnectionOptions(databaseURL)

if (databasePushEnabled && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_DB_PUSH must remain false in production. Apply committed migrations.')
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: dirname,
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Categories,
    Sources,
    CalculatorRuleSets,
    Scenarios,
    mediaCollection,
    ResolvedTasks,
  ],
  cors: [siteURL],
  csrf: [siteURL],
  db: postgresAdapter({
    disableCreateDatabase: true,
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionTimeoutMillis: 3_000,
      ...databaseConnection,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    },
    push: databasePushEnabled,
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
  plugins: [s3Storage(createMediaStoragePluginOptions(mediaStorage))],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    abortOnLimit: true,
    limits: {
      fileSize: MAX_MEDIA_FILE_BYTES,
      files: 1,
    },
    responseOnLimit: 'Сурет көлемі 3 МБ-тан аспауы керек.',
    uploadTimeout: 30_000,
  },
})
