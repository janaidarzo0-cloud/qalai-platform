import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: authenticated,
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
      admin: { description: 'Ішкі байланыс. Ашық бетте автоматты түрде көрсетілмейді.' },
    },
  ],
}
