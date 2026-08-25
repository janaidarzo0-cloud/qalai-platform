import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access/authenticated'
import { calculatorOptions } from '@/modules/calculators/registry'
import { sourceReferencesField, verificationField } from '@/fields/sourceReferences'
import { slugField } from '@/fields/slug'
import { assertRuleSetCanPublish } from '@/lib/cms/publication'

const protectPublishedRuleSet: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const nextStatus = data._status ?? originalDoc?._status
  if (nextStatus !== 'published') return data

  assertRuleSetCanPublish({
    effectiveFrom: data.effectiveFrom ?? originalDoc?.effectiveFrom,
    parameters: data.parameters ?? originalDoc?.parameters,
    sourceReferences: data.sourceReferences ?? originalDoc?.sourceReferences,
    verification: data.verification ?? originalDoc?.verification,
  })

  return data
}

export const CalculatorRuleSets: CollectionConfig = {
  slug: 'calculator-rule-sets',
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'calculatorKey', 'version', 'effectiveFrom', '_status'],
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [protectPublishedRuleSet],
  },
  labels: {
    plural: 'Калькулятор ережелері',
    singular: 'Калькулятор ережесі',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'calculatorKey',
      type: 'select',
      options: calculatorOptions,
      required: true,
    },
    {
      name: 'version',
      type: 'text',
      admin: { description: 'Мысалы: 2026.1' },
      required: true,
    },
    { name: 'effectiveFrom', type: 'date', required: true },
    { name: 'effectiveUntil', type: 'date' },
    {
      name: 'parameters',
      type: 'json',
      admin: {
        description: 'Кодтағы калькулятор схемасы бұл JSON құрылымын міндетті түрде тексереді.',
      },
      required: true,
    },
    sourceReferencesField(true),
    verificationField,
  ],
  versions: {
    drafts: true,
  },
}
