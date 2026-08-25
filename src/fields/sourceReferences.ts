import type { Field } from 'payload'

export const sourceReferencesField = (required = false): Field => ({
  name: 'sourceReferences',
  type: 'array',
  admin: {
    description: 'Осы материалдағы нақты тұжырымдарды растайтын дереккөздер.',
  },
  label: 'Дереккөз сілтемелері',
  minRows: required ? 1 : undefined,
  required,
  fields: [
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'sources',
      required: true,
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
      label: 'Негізгі ресми дереккөз',
    },
    {
      name: 'claimsSupported',
      type: 'textarea',
      label: 'Қандай тұжырымдарды растайды',
      required: true,
    },
    {
      name: 'evidenceSummary',
      type: 'textarea',
      label: 'Редакциялық дәлелдеме',
    },
    {
      name: 'checkedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
      label: 'Тексерілген күні',
      required: true,
    },
    {
      name: 'validFrom',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
      label: 'Қолданыс басталатын күн',
    },
    {
      name: 'validUntil',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
      label: 'Қолданыс аяқталатын күн',
    },
  ],
})

export const verificationField: Field = {
  name: 'verification',
  type: 'group',
  label: 'Фактологиялық тексеру',
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'unverified',
      options: [
        { label: 'Тексерілмеген', value: 'unverified' },
        { label: 'Тексеріліп жатыр', value: 'in-review' },
        { label: 'Тексерілді', value: 'verified' },
        { label: 'Ескірген', value: 'stale' },
      ],
      required: true,
    },
    {
      name: 'riskLevel',
      type: 'select',
      defaultValue: 'high',
      options: [
        { label: 'Жоғары: мемлекеттік/қаржылық ереже', value: 'high' },
        { label: 'Орташа', value: 'medium' },
        { label: 'Төмен', value: 'low' },
      ],
      required: true,
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
      label: 'Соңғы тексеру',
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Тексерген редактор',
    },
    {
      name: 'nextReviewAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
      label: 'Келесі тексеру',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Ішкі ескертпе',
    },
  ],
}
