import type { GlobalConfig } from 'payload'

import { adminOnly, authenticatedField } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: adminOnly,
  },
  label: 'Сайт баптаулары',
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'QALAI', required: true },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'Қазақстандағы күнделікті істерді түсінікті тілмен шешіңіз.',
      localized: true,
      required: true,
    },
    { name: 'defaultSeoDescription', type: 'textarea', localized: true },
    {
      name: 'editorialContact',
      type: 'text',
      access: {
        read: authenticatedField,
      },
      admin: { description: 'Ішкі байланыс. Ашық бетте автоматты түрде көрсетілмейді.' },
    },
  ],
}
