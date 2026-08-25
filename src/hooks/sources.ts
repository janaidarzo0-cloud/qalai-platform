import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
  type Where,
} from 'payload'

import { hasAnyRole } from '@/access/roles'
import { acquireTransactionLock, TRUST_GRAPH_LOCK_KEY } from '@/lib/cms/advisory-lock'

const countReferences = async (
  sourceID: number | string,
  req: PayloadRequest,
  publishedOnly: boolean,
) => {
  const conditions: Where[] = [{ 'sourceReferences.source': { equals: sourceID } }]
  if (publishedOnly) conditions.unshift({ _status: { equals: 'published' } })
  const where = {
    and: conditions,
  }

  const [scenarioCount, ruleSetCount] = await Promise.all([
    req.payload.count({
      collection: 'scenarios',
      overrideAccess: true,
      req,
      where,
    }),
    req.payload.count({
      collection: 'calculator-rule-sets',
      overrideAccess: true,
      req,
      where,
    }),
  ])

  return scenarioCount.totalDocs + ruleSetCount.totalDocs
}

const countHistoricalReferences = async (sourceID: number | string, req: PayloadRequest) => {
  const where: Where = {
    'version.sourceReferences.source': {
      equals: sourceID,
    },
  }

  const [scenarioCount, ruleSetCount] = await Promise.all([
    req.payload.countVersions({
      collection: 'scenarios',
      overrideAccess: true,
      req,
      where,
    }),
    req.payload.countVersions({
      collection: 'calculator-rule-sets',
      overrideAccess: true,
      req,
      where,
    }),
  ])

  return scenarioCount.totalDocs + ruleSetCount.totalDocs
}

export const protectReferencedSource: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || !originalDoc) return data

  await acquireTransactionLock(
    req,
    TRUST_GRAPH_LOCK_KEY,
    'Дереккөзді тек дерекқор транзакциясында өзгертуге болады.',
  )

  const referencedDocuments = await countReferences(originalDoc.id, req, true)
  if (referencedDocuments > 0) {
    throw new APIError(
      'Жарияланған материал пайдаланатын дереккөзді өзгертуге болмайды. Алдымен материалдарды draft күйіне қайтарыңыз.',
      409,
    )
  }

  return data
}

export const protectReferencedSourceDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!hasAnyRole(req.user, ['admin'])) {
    throw new APIError('Дереккөзді тек әкімші жоя алады.', 403)
  }

  await acquireTransactionLock(
    req,
    TRUST_GRAPH_LOCK_KEY,
    'Дереккөзді тек дерекқор транзакциясында жоюға болады.',
  )
  const [currentReferences, historicalReferences] = await Promise.all([
    countReferences(id, req, false),
    countHistoricalReferences(id, req),
  ])
  const referencedDocuments = currentReferences + historicalReferences
  if (referencedDocuments > 0) {
    throw new APIError(
      'Материал пайдаланатын дереккөзді жоюға болмайды. Алдымен барлық сілтемелерді алып тастаңыз.',
      409,
    )
  }
}
