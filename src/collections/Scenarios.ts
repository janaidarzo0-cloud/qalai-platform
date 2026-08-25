import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { adminCanDeleteDraft, canEditContent, canUpdateEditorialContent } from '@/access/content'
import { getUserID, hasAnyRole } from '@/access/roles'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { sourceReferencesField, verificationField } from '@/fields/sourceReferences'
import { validateHTTPSURL } from '@/fields/url'
import {
  assertEditorialStatusTransition,
  captureEditorialOperation,
  isClosedAlphaDraftImport,
} from '@/hooks/editorial'
import { acquireTransactionLock, TRUST_GRAPH_LOCK_KEY } from '@/lib/cms/advisory-lock'
import { assertLinkedCategoryIsPublished } from '@/lib/cms/category-trust'
import { hasMaterialChange, prepareEditorialVerification } from '@/lib/cms/editorial-workflow'
import { assertScenarioCanPublish, type ScenarioPublicationCandidate } from '@/lib/cms/publication'
import { assertLinkedRuleSetIsCurrent } from '@/lib/cms/rule-set-trust'
import { assertPrimarySourceIsOfficial } from '@/lib/cms/source-trust'

const MATERIAL_FIELDS = [
  'title',
  'slug',
  'category',
  'shortAnswer',
  'whoIsItFor',
  'eligibility',
  'requirements',
  'documents',
  'cost',
  'processingTime',
  'steps',
  'officialLinks',
  'calculatorRuleSet',
  'faq',
  'relatedScenarios',
  'sourceReferences',
  'seo',
] as const

export const protectPublishedScenario: CollectionBeforeChangeHook = async ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  const nextStatus = data._status ?? originalDoc?._status
  const canReview = hasAnyRole(req.user, ['admin', 'reviewer'])
  const canImportClosedAlphaMetadata = isClosedAlphaDraftImport({ context, data, operation })
  const now = new Date()
  const nextSlug = data.slug ?? originalDoc?.slug
  let publishedSlug =
    operation === 'update' && typeof originalDoc?.publishedSlug === 'string'
      ? originalDoc.publishedSlug
      : null

  if (process.env.QALAI_ALLOW_ALPHA_SEED === 'true') {
    const incomingVerification =
      data.verification && typeof data.verification === 'object'
        ? (data.verification as Record<string, unknown>)
        : {}
    const originalVerification =
      originalDoc?.verification && typeof originalDoc.verification === 'object'
        ? (originalDoc.verification as Record<string, unknown>)
        : {}
    req.payload.logger.info(
      {
        canImportClosedAlphaMetadata,
        contextImportType: typeof context.qalaiClosedAlphaImport,
        draftSave: context.qalaiDraftSave === true,
        incomingRisk: incomingVerification.riskLevel,
        incomingStatus: incomingVerification.status,
        nextStatus,
        operation,
        originalStatus: originalVerification.status,
        slug: data.slug ?? originalDoc?.slug,
      },
      '[alpha-import-debug]',
    )
  }

  assertEditorialStatusTransition({
    canReview,
    context,
    entityLabel: 'Сценарийді',
    nextStatus,
  })

  const changesSourceReferences =
    (operation === 'create' && data.sourceReferences != null) ||
    (operation === 'update' && hasMaterialChange(data, originalDoc, ['sourceReferences']))

  if (nextStatus === 'published' || changesSourceReferences) {
    await acquireTransactionLock(
      req,
      TRUST_GRAPH_LOCK_KEY,
      'Сценарийдің дереккөздерін тек дерекқор транзакциясында өзгертуге болады.',
    )
  }

  if (operation === 'update' && originalDoc?.id != null && publishedSlug == null) {
    const publishedVersions = await req.payload.findVersions({
      collection: 'scenarios',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [
          { parent: { equals: originalDoc.id } },
          { 'version._status': { equals: 'published' } },
        ],
      },
    })
    const historicalSlug = publishedVersions.docs[0]?.version?.slug
    if (typeof historicalSlug === 'string') publishedSlug = historicalSlug
  }

  if (publishedSlug != null && nextSlug !== publishedSlug) {
    throw new APIError('Жарияланған slug-ты redirect жоспарынсыз өзгертуге болмайды.', 400)
  }

  const nextData = prepareEditorialVerification({
    canReview: canReview || canImportClosedAlphaMetadata,
    data,
    materialFields: MATERIAL_FIELDS,
    now,
    operation,
    originalDoc,
    reviewerID: getUserID(req.user),
    trustedUnverifiedImport: canImportClosedAlphaMetadata,
    willBePublished: nextStatus === 'published',
  })

  if (publishedSlug != null) nextData.publishedSlug = publishedSlug
  if (publishedSlug == null && nextStatus === 'published' && typeof nextSlug === 'string') {
    nextData.publishedSlug = nextSlug
  }

  if (nextStatus !== 'published') return nextData

  const sourceReferences = nextData.sourceReferences ?? originalDoc?.sourceReferences
  const verification = nextData.verification ?? originalDoc?.verification
  const steps = nextData.steps ?? originalDoc?.steps
  const officialLinks = nextData.officialLinks ?? originalDoc?.officialLinks

  assertScenarioCanPublish(
    { officialLinks, sourceReferences, steps, verification } as ScenarioPublicationCandidate,
    now,
  )
  await assertLinkedCategoryIsPublished(nextData.category ?? originalDoc?.category, req)
  await assertPrimarySourceIsOfficial(
    sourceReferences as ScenarioPublicationCandidate['sourceReferences'],
    req,
    verification?.reviewedAt,
    now,
  )
  await assertLinkedRuleSetIsCurrent(
    nextData.calculatorRuleSet ?? originalDoc?.calculatorRuleSet,
    req,
    verification?.reviewedAt,
    now,
  )

  return nextData
}

export const Scenarios: CollectionConfig = {
  slug: 'scenarios',
  access: {
    create: canEditContent,
    delete: adminCanDeleteDraft,
    read: authenticated,
    update: canUpdateEditorialContent,
  },
  admin: {
    defaultColumns: ['title', 'category', 'verification.status', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [protectPublishedScenario],
    beforeOperation: [captureEditorialOperation],
  },
  labels: {
    plural: 'Сценарийлер',
    singular: 'Сценарий',
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField(),
    {
      name: 'publishedSlug',
      type: 'text',
      access: {
        create: () => false,
        update: () => false,
      },
      admin: { hidden: true },
    },
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
