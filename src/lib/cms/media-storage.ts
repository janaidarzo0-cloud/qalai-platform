import type { S3StorageOptions } from '@payloadcms/storage-s3'

import { buildMediaPublicURL, type MediaStorageConfig, MEDIA_STORAGE_PREFIX } from '@/lib/env/media'

export const createMediaStoragePluginOptions = (
  mediaStorage: MediaStorageConfig,
): S3StorageOptions => ({
  alwaysInsertFields: true,
  bucket: mediaStorage.mode === 's3' ? mediaStorage.bucket : 'qalai-local-placeholder',
  clientUploads: false,
  collections: {
    media: {
      disableLocalStorage: true,
      disablePayloadAccessControl: true,
      generateFileURL:
        mediaStorage.mode === 's3'
          ? ({ filename, prefix }: { filename: string; prefix?: string }) =>
              buildMediaPublicURL({
                baseURL: mediaStorage.publicBaseURL,
                filename,
                prefix,
              })
          : undefined,
      prefix: MEDIA_STORAGE_PREFIX,
      signedDownloads: false,
    },
  },
  config:
    mediaStorage.mode === 's3'
      ? {
          credentials: {
            accessKeyId: mediaStorage.accessKeyId,
            secretAccessKey: mediaStorage.secretAccessKey,
          },
          endpoint: mediaStorage.endpoint,
          forcePathStyle: true,
          region: mediaStorage.region,
        }
      : { region: 'us-east-1' },
  enabled: mediaStorage.mode === 's3',
  signedDownloads: false,
  useCompositePrefixes: true,
})
