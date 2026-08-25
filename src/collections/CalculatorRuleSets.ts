import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { adminCanDeleteDraft, canEditContent, canUpdateEditorialContent } from '@/access/content'
import { getUserID, hasAnyRole } from '@/access/roles'
import { calculatorOptions } from '@/modules/calculators/registry'
import { sourceReferencesField, verificationField } from '@/fields/sourceReferences'
import { slugField } from '@/fields/slug'
import { assertEditorialStatusTransition, captureEditorialOperation } from '@/hooks/editorial'
import {
  protectReferencedRuleSetChange,
  protectReferencedRuleSetDelete,
  RULE_SET_MATERIAL_FIELDS,
} from '@/hooks/rule-sets'
import { acquireTransactionLock, TRUST_GRAPH_LOCK_KEY } from '@/lib/cms/advisory-lock'
import { hasMaterialChange, prepareEditorialVerification } from '@/lib/cms/editorial-workflow'
import { assertRuleSetCanPublish, type RuleSetPublicationCandidate } from '@/lib/cms/publication'
import { assertPrimarySourceIsOfficial } from '@/lib/cms/source-trust'

export const protectPublishedRuleSet: CollectionBeforeChangeHook = async ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  const nextStatus = data._status ?? originalDoc?._status
  const canReview = hasAnyRole(req.user, ['admin', 'reviewer'])
  const now = new Date()

  assertEditorialStatusTransition({
    canReview,
    context,
    entityLabel: 'Калькулятор ережесін',
    nextStatus,
  })

  const changesSourceReferences =
    (operation === 'create' && data.sourceReferences != null) ||
    (operation === 'update' && hasMaterialChange(data, originalDoc, ['sourceReferences']))

  if (nextStatus === 'published' || changesSourceReferences) {
    await acquireTransactionLock(
      req,
      TRUST_GRAPH_LOCK_KEY,
      'Калькулятор ережесінің дереккөздерін тек дерекқор транзакциясында өзгертуге болады.',
    )
  }

  const nextData = prepareEditorialVerification({
    canReview,
    data,
    materialFields: RULE_SET_MATERIAL_FIELDS,
    now,
    operation,
    originalDoc,
    reviewerID: getUserID(req.user),
    willBePublished: nextStatus === 'published',
  })

  if (nextStatus !== 'published') return nextData

  const sourceReferences = nextData.sourceReferences ?? originalDoc?.sourceReferences
  const verification = nextData.verification ?? originalDoc?.verification

  assertRuleSetCanPublish(
    {
      effectiveFrom: nextData.effectiveFrom ?? originalDoc?.effectiveFrom,
      effectiveUntil: nextData.effectiveUntil ?? originalDoc?.effectiveUntil,
      parameters: nextData.parameters ?? originalDoc?.parameters,
      sourceReferences,
      verification,
    } as RuleSetPublicationCandidate,
    now,
  )
  await assertPrimarySourceIsOfficial(
    sourceReferences as RuleSetPublicationCandidate['sourceReferences'],
    req,
    verification?.reviewedAt,
    now,
  )

  return nextData
}

export const CalculatorRuleSets: CollectionConfig = {
  slug: 'calculator-rule-sets',
  access: {
    create: canEditContent,
    delete: adminCanDeleteDraft,
    read: authenticated,
    update: canUpdateEditorialContent,
  },
  admin: {
    defaultColumns: ['title', 'calculatorKey', 'version', 'effectiveFrom', '_status'],
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [protectReferencedRuleSetChange, protectPublishedRuleSet],
    beforeDelete: [protectReferencedRuleSetDelete],
    beforeOperation: [captureEditorialOperation],
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
