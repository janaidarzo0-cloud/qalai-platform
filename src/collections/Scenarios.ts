import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access/authenticated'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { sourceReferencesField, verificationField } from '@/fields/sourceReferences'
import { validateHTTPSURL } from '@/fields/url'
import { assertScenarioCanPublish } from '@/lib/cms/publication'

const protectPublishedScenario: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const nextStatus = data._status ?? originalDoc?._status

  if (
    originalDoc?._status === 'published' &&
    typeof data.slug === 'string' &&
    data.slug !== originalDoc.slug
  ) {
    throw new Error('Жарияланған slug-ты redirect жоспарынсыз өзгертуге болмайды.')
  }

  if (nextStatus !== 'published') return data

  const sourceReferences = data.sourceReferences ?? originalDoc?.sourceReferences
  const verification = data.verification ?? originalDoc?.verification
  const steps = data.steps ?? originalDoc?.steps
  const officialLinks = data.officialLinks ?? originalDoc?.officialLinks

  assertScenarioCanPublish({ officialLinks, sourceReferences, steps, verification })

  return data
}

export const Scenarios: CollectionConfig = {
  slug: 'scenarios',
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'category', 'verification.status', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [protectPublishedScenario],
  },
  labels: {
    plural: 'Сценарийлер',
    singular: 'Сценарий',
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField(),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'shortAnswer',
      type: 'textarea',
      admin: { description: 'Пайдаланушы бірінші экранда көретін қысқа жауап.' },
      localized: true,
      maxLength: 600,
      required: true,
    },
    { name: 'whoIsItFor', type: 'textarea', localized: true, required: true },
    {
      name: 'eligibility',
      type: 'array',
      fields: [
        { name: 'condition', type: 'text', localized: true, required: true },
        { name: 'explanation', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'requirements',
      type: 'array',
      fields: [{ name: 'item', type: 'text', localized: true, required: true }],
    },
    {
      name: 'documents',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', localized: true, required: true },
        { name: 'note', type: 'textarea', localized: true },
        { name: 'optional', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'cost',
      type: 'group',
      fields: [
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'varies',
          options: [
            { label: 'Тегін', value: 'free' },
            { label: 'Нақты сома', value: 'fixed' },
            { label: 'Аралық', value: 'range' },
            { label: 'Есептеледі', value: 'calculated' },
            { label: 'Жағдайға байланысты', value: 'varies' },
          ],
          required: true,
        },
        { name: 'amount', type: 'number', min: 0 },
        { name: 'minAmount', type: 'number', min: 0 },
        { name: 'maxAmount', type: 'number', min: 0 },
        { name: 'explanation', type: 'textarea', localized: true },
        { name: 'asOf', type: 'date' },
      ],
    },
    {
      name: 'processingTime',
      type: 'group',
      fields: [
        { name: 'value', type: 'text', localized: true },
        { name: 'explanation', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'description', type: 'textarea', localized: true, required: true },
        { name: 'actionLabel', type: 'text', localized: true },
        {
          name: 'actionUrl',
          type: 'text',
          validate: (value: unknown) => validateHTTPSURL(value),
        },
      ],
    },
    {
      name: 'officialLinks',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (value: unknown) => validateHTTPSURL(value, true),
        },
        { name: 'publisher', type: 'text', required: true },
      ],
    },
    {
      name: 'calculatorRuleSet',
      type: 'relationship',
      relationTo: 'calculator-rule-sets',
    },
    {
      name: 'faq',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', localized: true, required: true },
        { name: 'answer', type: 'textarea', localized: true, required: true },
      ],
    },
    {
      name: 'relatedScenarios',
      type: 'relationship',
      hasMany: true,
      relationTo: 'scenarios',
    },
    sourceReferencesField(true),
    verificationField,
    seoFields,
  ],
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
}
