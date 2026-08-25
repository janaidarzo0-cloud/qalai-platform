import type { CollectionConfig } from 'payload'

import { canEditContent, canUpdateSource } from '@/access/content'
import { adminOnly, reviewerOrAdminField } from '@/access/roles'
import { validateHTTPSURL } from '@/fields/url'
import { protectReferencedSource, protectReferencedSourceDelete } from '@/hooks/sources'

export const Sources: CollectionConfig = {
  slug: 'sources',
  access: {
    create: canEditContent,
    delete: adminOnly,
    read: () => true,
    update: canUpdateSource,
  },
  admin: {
    defaultColumns: ['title', 'publisher', 'sourceType', 'trustTier'],
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [protectReferencedSource],
    beforeDelete: [protectReferencedSourceDelete],
  },
  labels: {
    plural: 'Дереккөздер',
    singular: 'Дереккөз',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'publisher', type: 'text', required: true },
    {
      name: 'url',
      type: 'text',
      index: true,
      required: true,
      unique: true,
      validate: (value: unknown) => validateHTTPSURL(value, true),
    },
    {
      name: 'sourceType',
      type: 'select',
      options: [
        { label: 'Мемлекеттік ресурс', value: 'government' },
        { label: 'Нормативтік акт', value: 'legal-act' },
        { label: 'Ресми қызмет көрсетуші', value: 'official-provider' },
        { label: 'Анықтамалық материал', value: 'reference' },
      ],
      required: true,
    },
    {
      name: 'trustTier',
      type: 'select',
      access: {
        create: reviewerOrAdminField,
        update: reviewerOrAdminField,
      },
      defaultValue: 'secondary',
      options: [
        { label: 'Бастапқы ресми', value: 'primary-official' },
        { label: 'Ресми қызмет көрсетуші', value: 'official-provider' },
        { label: 'Қосалқы', value: 'secondary' },
      ],
      required: true,
    },
    { name: 'documentNumber', type: 'text' },
    { name: 'publisherUpdatedAt', type: 'date' },
    {
      name: 'language',
      type: 'select',
      defaultValue: 'kk',
      options: [
        { label: 'Қазақша', value: 'kk' },
        { label: 'Орысша', value: 'ru' },
        { label: 'Ағылшынша', value: 'en' },
      ],
      required: true,
    },
  ],
}
