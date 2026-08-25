import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { createMediaStoragePluginOptions } from '@/lib/cms/media-storage'
import { MEDIA_STORAGE_PREFIX } from '@/lib/env/media'

describe('Media storage adapter options', () => {
  it('keeps the S3 schema fields while local storage is active', () => {
    const options = createMediaStoragePluginOptions({
      mode: 'local',
      staticDir: path.resolve('.data/media'),
    })

    expect(options).toMatchObject({
      alwaysInsertFields: true,
      bucket: 'qalai-local-placeholder',
      clientUploads: false,
      enabled: false,
      signedDownloads: false,
      useCompositePrefixes: true,
    })
    expect(options.collections.media).toMatchObject({
      disableLocalStorage: true,
      disablePayloadAccessControl: true,
      prefix: MEDIA_STORAGE_PREFIX,
      signedDownloads: false,
    })
    expect(
      typeof options.collections.media === 'object'
        ? options.collections.media.generateFileURL
        : undefined,
    ).toBeUndefined()
  })

  it('builds the safe Supabase-ready S3 configuration without ACLs or client uploads', async () => {
    const options = createMediaStoragePluginOptions({
      accessKeyId: 'access-key',
      bucket: 'qalai-public-media',
      endpoint: 'https://project.storage.supabase.co/storage/v1/s3',
      mode: 's3',
      publicBaseURL: 'https://project.supabase.co/storage/v1/object/public/qalai-public-media',
      region: 'eu-central-1',
      secretAccessKey: 'secret-key',
    })

    expect(options.enabled).toBe(true)
    expect(options.acl).toBeUndefined()
    expect(options.clientUploads).toBe(false)
    expect(options.config).toMatchObject({
      credentials: {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      },
      endpoint: 'https://project.storage.supabase.co/storage/v1/s3',
      forcePathStyle: true,
      region: 'eu-central-1',
    })

    const collectionOptions = options.collections.media
    expect(typeof collectionOptions).toBe('object')
    if (!collectionOptions || collectionOptions === true || !collectionOptions.generateFileURL) {
      throw new Error('Expected the Media public URL generator in S3 mode.')
    }

    expect(
      await collectionOptions.generateFileURL({
        collection: { fields: [], slug: 'media' },
        filename: 'cover image.png',
        prefix: '',
      }),
    ).toBe(
      'https://project.supabase.co/storage/v1/object/public/qalai-public-media/qalai/media/cover%20image.png',
    )
  })
})
