import type { Field } from 'payload'

import { authenticatedField, reviewerOrAdminField } from '@/access/roles'

const serverManagedField = () => false

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
      access: {
        create: authenticatedField,
        read: authenticatedField,
        update: authenticatedField,
      },
      label: 'Редакциялық дәлелдеме',
    },
    {
      name: 'checkedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
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
      access: {
        create: reviewerOrAdminField,
        update: reviewerOrAdminField,
      },
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
      access: {
        create: reviewerOrAdminField,
        update: reviewerOrAdminField,
      },
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
      access: {
        create: serverManagedField,
        update: serverManagedField,
      },
      admin: { date: { pickerAppearance: 'dayAndTime' } },
      label: 'Соңғы тексеру',
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      access: {
        create: serverManagedField,
        read: reviewerOrAdminField,
        update: serverManagedField,
      },
      relationTo: 'users',
      label: 'Тексерген редактор',
    },
    {
      name: 'nextReviewAt',
      type: 'date',
      access: {
        create: reviewerOrAdminField,
        update: reviewerOrAdminField,
      },
      admin: { date: { pickerAppearance: 'dayOnly' } },
      label: 'Келесі тексеру',
    },
    {
      name: 'notes',
      type: 'textarea',
      access: {
        create: reviewerOrAdminField,
        read: reviewerOrAdminField,
        update: reviewerOrAdminField,
      },
      label: 'Ішкі ескертпе',
    },
  ],
}
