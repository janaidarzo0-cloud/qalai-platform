import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access/authenticated'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'order', '_status'],
    useAsTitle: 'title',
  },
  labels: {
    plural: 'Санаттар',
    singular: 'Санат',
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField(),
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'order',
      type: 'number',
      admin: { position: 'sidebar' },
      defaultValue: 100,
      min: 0,
      required: true,
    },
    seoFields,
  ],
  versions: {
    drafts: true,
  },
}
