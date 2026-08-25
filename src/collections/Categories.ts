import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '@/access/authenticated'
import { adminCanDeleteDraft, canEditContent, canUpdateEditorialContent } from '@/access/content'
import { hasAnyRole } from '@/access/roles'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { assertEditorialStatusTransition, captureEditorialOperation } from '@/hooks/editorial'
import {
  protectReferencedCategoryChange,
  protectReferencedCategoryDelete,
} from '@/hooks/categories'

export const protectCategoryPublication: CollectionBeforeChangeHook = ({
  context,
  data,
  originalDoc,
  req,
}) => {
  const nextStatus = data._status ?? originalDoc?._status

  assertEditorialStatusTransition({
    canReview: hasAnyRole(req.user, ['admin', 'reviewer']),
    context,
    entityLabel: 'Санатты',
    nextStatus,
  })

  return data
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: canEditContent,
    delete: adminCanDeleteDraft,
    read: publishedOrAuthenticated,
    update: canUpdateEditorialContent,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'order', '_status'],
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [protectCategoryPublication, protectReferencedCategoryChange],
    beforeDelete: [protectReferencedCategoryDelete],
    beforeOperation: [captureEditorialOperation],
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
