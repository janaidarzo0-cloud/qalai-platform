import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { validateHTTPSURL } from '@/fields/url'

export const Sources: CollectionConfig = {
  slug: 'sources',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'publisher', 'sourceType', 'trustTier'],
    useAsTitle: 'title',
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
      defaultValue: 'primary-official',
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
