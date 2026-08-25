import type {
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import { APIError } from 'payload'

import { canEditContent, canUpdateEditorialContent } from '@/access/content'
import { adminOnly } from '@/access/roles'
import { MAX_MEDIA_FILE_BYTES, MEDIA_MIME_TYPES } from '@/lib/env/media'

export const MEDIA_ALT_REQUIRED_MESSAGE =
  'Суреттің мазмұнын қазақша түсіндіретін балама мәтін жазыңыз.'

export const validateMediaAlt = (value: unknown) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return MEDIA_ALT_REQUIRED_MESSAGE
  }

  return true
}

export const assertMediaFileSize = (file?: { data?: { byteLength: number }; size?: number }) => {
  const declaredSize =
    typeof file?.size === 'number' && Number.isFinite(file.size) ? Math.max(0, file.size) : 0
  const bufferSize = file?.data?.byteLength ?? 0

  if (Math.max(declaredSize, bufferSize) > MAX_MEDIA_FILE_BYTES) {
    throw new APIError('Сурет көлемі 3 МБ-тан аспауы керек.', 413, null, true)
  }
}

export const validateMediaFileSize: CollectionBeforeOperationHook = ({ operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    assertMediaFileSize(req.file)
  }
}

export const rejectMediaDocumentPrefix: CollectionBeforeValidateHook = ({ data }) => {
  if (data?.prefix != null && data.prefix !== '') {
    throw new APIError('Суреттер үшін қосымша сақтау бумасын көрсетуге болмайды.', 400, null, true)
  }

  return data
}

export const createMediaCollection = (staticDir: string): CollectionConfig => ({
  slug: 'media',
  access: {
    create: canEditContent,
    delete: adminOnly,
    read: () => true,
    update: canUpdateEditorialContent,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
    useAsTitle: 'alt',
  },
  fields: [
    {
      name: 'prefix',
      type: 'text',
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      defaultValue: '',
    },
    {
      name: 'alt',
      type: 'text',
      hooks: {
        beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim() : value)],
      },
      label: 'Балама мәтін',
      localized: true,
      maxLength: 180,
      required: true,
      validate: validateMediaAlt,
    },
  ],
  hooks: {
    beforeOperation: [validateMediaFileSize],
    beforeValidate: [rejectMediaDocumentPrefix],
  },
  labels: {
    plural: 'Суреттер',
    singular: 'Сурет',
  },
  upload: {
    bulkUpload: false,
    crop: false,
    displayPreview: true,
    filesRequiredOnCreate: true,
    focalPoint: false,
    mimeTypes: [...MEDIA_MIME_TYPES],
    pasteURL: false,
    staticDir,
  },
})
