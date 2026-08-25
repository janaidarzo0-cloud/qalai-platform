import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
} from 'payload'

import { hasAnyRole } from '@/access/roles'
import { isEditorialDraftSave } from '@/hooks/editorial'
import { acquireTransactionLock, TRUST_GRAPH_LOCK_KEY } from '@/lib/cms/advisory-lock'

const countPublishedScenarioReferences = async (id: number | string, req: PayloadRequest) =>
  req.payload.count({
    collection: 'scenarios',
    overrideAccess: true,
    req,
    where: {
      and: [{ _status: { equals: 'published' } }, { category: { equals: id } }],
    },
  })

const assertCategoryIsNotReferenced = async (id: number | string, req: PayloadRequest) => {
  const { totalDocs } = await countPublishedScenarioReferences(id, req)

  if (totalDocs > 0) {
    throw new APIError(
      'Жарияланған сценарий пайдаланатын санатты жарияланымнан алып тастауға немесе жоюға болмайды.',
      409,
    )
  }
}

export const protectReferencedCategoryChange: CollectionBeforeChangeHook = async ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (
    operation !== 'update' ||
    !originalDoc ||
    data._status === 'published' ||
    (data._status == null && originalDoc._status === 'published') ||
    isEditorialDraftSave(context)
  ) {
    return data
  }

  await acquireTransactionLock(
    req,
    TRUST_GRAPH_LOCK_KEY,
    'Санатты тек дерекқор транзакциясында жарияланымнан алып тастауға болады.',
  )
  await assertCategoryIsNotReferenced(originalDoc.id, req)

  return data
}

export const protectReferencedCategoryDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!hasAnyRole(req.user, ['admin'])) {
    throw new APIError('Санатты тек әкімші жоя алады.', 403)
  }

  await acquireTransactionLock(
    req,
    TRUST_GRAPH_LOCK_KEY,
    'Санатты тек дерекқор транзакциясында жоюға болады.',
  )
  await assertCategoryIsNotReferenced(id, req)
}
