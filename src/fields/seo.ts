import type { Field } from 'payload'

export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Ұсыныс: 30–60 таңба. Бос болса, бет атауы қолданылады.',
      },
      localized: true,
      maxLength: 70,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Ұсыныс: 120–160 таңба.',
      },
      localized: true,
      maxLength: 180,
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      admin: {
        description: 'Іздеу жүйелеріне бұл бетті индекстеуге тыйым салу.',
      },
      defaultValue: false,
    },
  ],
}
