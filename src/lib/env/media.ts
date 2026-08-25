import path from 'node:path'

export const MAX_MEDIA_FILE_BYTES = 3_000_000
export const MEDIA_MIME_TYPES = ['image/avif', 'image/jpeg', 'image/png', 'image/webp'] as const
export const MEDIA_STORAGE_PREFIX = 'qalai/media'

type Environment = Record<string, string | undefined>

export type LocalMediaStorageConfig = {
  mode: 'local'
  staticDir: string
}

export type S3MediaStorageConfig = {
  accessKeyId: string
  bucket: string
  endpoint: string
  mode: 's3'
  publicBaseURL: string
  region: string
  secretAccessKey: string
}

export type MediaStorageConfig = LocalMediaStorageConfig | S3MediaStorageConfig

const required = (env: Environment, name: string) => {
  const value = env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required when QALAI_MEDIA_STORAGE=s3.`)
  }

  return value
}

const parseStorageURL = (rawValue: string, name: string) => {
  let url: URL

  try {
    url = new URL(rawValue)
  } catch {
    throw new Error(`${name} must be a complete HTTP(S) URL.`)
  }

  const isLoopback = ['127.0.0.1', '::1', 'localhost'].includes(url.hostname)

  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) {
    throw new Error(`${name} must use HTTPS unless it points to localhost.`)
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must not contain credentials, a query, or a fragment.`)
  }

  return url.toString().replace(/\/$/, '')
}

const resolveLocalMediaDir = (projectRoot: string, configuredDir?: string) => {
  const absoluteProjectRoot = path.resolve(projectRoot)
  const staticDir = path.resolve(absoluteProjectRoot, configuredDir?.trim() || '.data/media')
  const relativePath = path.relative(absoluteProjectRoot, staticDir)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('QALAI_MEDIA_LOCAL_DIR must stay inside the QALAI project directory.')
  }

  return staticDir
}

export const getMediaStorageConfig = (
  env: Environment = process.env,
  projectRoot = process.cwd(),
): MediaStorageConfig => {
  const mode = env.QALAI_MEDIA_STORAGE ?? 'local'

  if (mode !== 'local' && mode !== 's3') {
    throw new Error('QALAI_MEDIA_STORAGE must be either local or s3.')
  }

  if (mode === 'local') {
    if (env.NODE_ENV === 'production') {
      throw new Error(
        'QALAI_MEDIA_STORAGE=s3 is required for production builds and deployments. Local media is not durable.',
      )
    }

    return {
      mode,
      staticDir: resolveLocalMediaDir(projectRoot, env.QALAI_MEDIA_LOCAL_DIR),
    }
  }

  return {
    accessKeyId: required(env, 'QALAI_MEDIA_S3_ACCESS_KEY_ID'),
    bucket: required(env, 'QALAI_MEDIA_S3_BUCKET'),
    endpoint: parseStorageURL(required(env, 'QALAI_MEDIA_S3_ENDPOINT'), 'QALAI_MEDIA_S3_ENDPOINT'),
    mode,
    publicBaseURL: parseStorageURL(
      required(env, 'QALAI_MEDIA_PUBLIC_BASE_URL'),
      'QALAI_MEDIA_PUBLIC_BASE_URL',
    ),
    region: required(env, 'QALAI_MEDIA_S3_REGION'),
    secretAccessKey: required(env, 'QALAI_MEDIA_S3_SECRET_ACCESS_KEY'),
  }
}

const encodeStoragePath = (value: string) =>
  value
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment === '.' || segment === '..' || segment.includes('\\')) {
        throw new Error('Media storage paths must not contain traversal segments.')
      }

      return encodeURIComponent(segment)
    })
    .join('/')

export const buildMediaPublicURL = ({
  baseURL,
  filename,
  prefix,
}: {
  baseURL: string
  filename: string
  prefix?: string
}) => {
  if (!filename.trim()) {
    throw new Error('A media filename is required to build its public URL.')
  }

  if (prefix) {
    throw new Error('Document-level Media storage prefixes are disabled.')
  }

  const storagePath = encodeStoragePath(`${MEDIA_STORAGE_PREFIX}/${filename}`)

  return `${baseURL.replace(/\/$/, '')}/${storagePath}`
}
