import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildMediaPublicURL, getMediaStorageConfig, MEDIA_STORAGE_PREFIX } from '@/lib/env/media'

const projectRoot = path.resolve('qalai-media-test-project')

const completeS3Env = {
  QALAI_MEDIA_PUBLIC_BASE_URL:
    'https://project.supabase.co/storage/v1/object/public/qalai-public-media/',
  QALAI_MEDIA_S3_ACCESS_KEY_ID: 'test-access-key',
  QALAI_MEDIA_S3_BUCKET: 'qalai-public-media',
  QALAI_MEDIA_S3_ENDPOINT: 'https://project.storage.supabase.co/storage/v1/s3/',
  QALAI_MEDIA_S3_REGION: 'eu-central-1',
  QALAI_MEDIA_S3_SECRET_ACCESS_KEY: 'test-secret-key',
  QALAI_MEDIA_STORAGE: 's3',
}

describe('media storage environment', () => {
  it('defaults to an ignored local directory in development', () => {
    expect(getMediaStorageConfig({}, projectRoot)).toEqual({
      mode: 'local',
      staticDir: path.resolve(projectRoot, '.data/media'),
    })
  })

  it.each(['S3', ' s3 ', '', 'filesystem'])('rejects the unsupported exact mode %j', (mode) => {
    expect(() => getMediaStorageConfig({ QALAI_MEDIA_STORAGE: mode }, projectRoot)).toThrow(
      'local or s3',
    )
  })

  it('requires durable storage for every production build and deployment', () => {
    for (const mediaEnv of [
      {},
      { QALAI_MEDIA_STORAGE: 'local' },
      { QALAI_CONTENT_MODE: 'demo', QALAI_MEDIA_STORAGE: 'local' },
      { QALAI_CONTENT_MODE: 'cms', QALAI_MEDIA_STORAGE: 'local' },
    ]) {
      expect(() =>
        getMediaStorageConfig({ ...mediaEnv, NODE_ENV: 'production' }, projectRoot),
      ).toThrow('durable')
    }
  })

  it('keeps the configured local directory inside the project', () => {
    expect(
      getMediaStorageConfig(
        { QALAI_MEDIA_LOCAL_DIR: 'tmp/editorial-media', QALAI_MEDIA_STORAGE: 'local' },
        projectRoot,
      ),
    ).toEqual({
      mode: 'local',
      staticDir: path.resolve(projectRoot, 'tmp/editorial-media'),
    })

    expect(() =>
      getMediaStorageConfig(
        { QALAI_MEDIA_LOCAL_DIR: '../outside', QALAI_MEDIA_STORAGE: 'local' },
        projectRoot,
      ),
    ).toThrow('inside')
  })

  it.each([
    'QALAI_MEDIA_PUBLIC_BASE_URL',
    'QALAI_MEDIA_S3_ACCESS_KEY_ID',
    'QALAI_MEDIA_S3_BUCKET',
    'QALAI_MEDIA_S3_ENDPOINT',
    'QALAI_MEDIA_S3_REGION',
    'QALAI_MEDIA_S3_SECRET_ACCESS_KEY',
  ])('requires %s in S3 mode without exposing secret values', (name) => {
    const env = { ...completeS3Env, [name]: undefined }
    let message = ''

    try {
      getMediaStorageConfig(env, projectRoot)
    } catch (error) {
      message = (error as Error).message
    }

    expect(message).toContain(name)
    expect(message).not.toContain(completeS3Env.QALAI_MEDIA_S3_SECRET_ACCESS_KEY)
  })

  it('parses and normalizes a complete S3 configuration', () => {
    expect(getMediaStorageConfig(completeS3Env, projectRoot)).toEqual({
      accessKeyId: 'test-access-key',
      bucket: 'qalai-public-media',
      endpoint: 'https://project.storage.supabase.co/storage/v1/s3',
      mode: 's3',
      publicBaseURL: 'https://project.supabase.co/storage/v1/object/public/qalai-public-media',
      region: 'eu-central-1',
      secretAccessKey: 'test-secret-key',
    })
  })

  it.each([
    ['QALAI_MEDIA_S3_ENDPOINT', 'http://storage.example.test/s3'],
    ['QALAI_MEDIA_PUBLIC_BASE_URL', 'https://user:password@cdn.example.test/media'],
    ['QALAI_MEDIA_S3_ENDPOINT', 'https://storage.example.test/s3?secret=value'],
    ['QALAI_MEDIA_PUBLIC_BASE_URL', 'https://cdn.example.test/media#fragment'],
  ])('rejects unsafe %s URLs', (name, value) => {
    expect(() => getMediaStorageConfig({ ...completeS3Env, [name]: value }, projectRoot)).toThrow()
  })

  it('allows plain HTTP only for a loopback S3 emulator', () => {
    const config = getMediaStorageConfig(
      {
        ...completeS3Env,
        QALAI_MEDIA_PUBLIC_BASE_URL: 'http://127.0.0.1:9000/qalai-public-media',
        QALAI_MEDIA_S3_ENDPOINT: 'http://localhost:9000',
      },
      projectRoot,
    )

    expect(config.mode).toBe('s3')
  })
})

describe('public media URL generation', () => {
  it('uses the stable prefix and encodes each storage key segment', () => {
    expect(
      buildMediaPublicURL({
        baseURL: 'https://cdn.example.test/qalai/',
        filename: 'құжат #1%.png',
      }),
    ).toBe(
      `https://cdn.example.test/qalai/${MEDIA_STORAGE_PREFIX}/%D2%9B%D2%B1%D0%B6%D0%B0%D1%82%20%231%25.png`,
    )
  })

  it('rejects document-level prefixes so the S3 key and public URL cannot diverge', () => {
    expect(() =>
      buildMediaPublicURL({
        baseURL: 'https://cdn.example.test/qalai',
        filename: 'cover.png',
        prefix: 'scenario%2F2026',
      }),
    ).toThrow('disabled')
  })

  it.each(['', '   ', '../escape.png', 'folder\\escape.png'])(
    'rejects unsafe filename %j',
    (filename) => {
      expect(() =>
        buildMediaPublicURL({ baseURL: 'https://cdn.example.test/qalai', filename }),
      ).toThrow()
    },
  )
})
