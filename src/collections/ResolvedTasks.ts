import type { CollectionConfig } from 'payload'

const denyAccess = () => false

export const ResolvedTasks: CollectionConfig = {
  slug: 'resolved-tasks',
  access: {
    create: denyAccess,
    delete: denyAccess,
    read: denyAccess,
    update: denyAccess,
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'dedupeKey',
      type: 'text',
      admin: { hidden: true },
      required: true,
      unique: true,
    },
    {
      name: 'sessionHash',
      type: 'text',
      admin: { hidden: true },
      index: true,
      required: true,
    },
    {
      name: 'taskType',
      type: 'select',
      options: [
        { label: 'Scenario', value: 'scenario' },
        { label: 'Calculator', value: 'calculator' },
      ],
      required: true,
    },
    {
      name: 'taskKey',
      type: 'text',
      required: true,
    },
    {
      name: 'resolutionMethod',
      type: 'select',
      options: [
        { label: 'Calculation', value: 'calculation' },
        { label: 'Official transition', value: 'official-transition' },
        { label: 'Helpful feedback', value: 'helpful-feedback' },
      ],
      required: true,
    },
    {
      name: 'resolvedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'schemaVersion',
      type: 'number',
      defaultValue: 1,
      min: 1,
      required: true,
    },
  ],
  lockDocuments: false,
}
