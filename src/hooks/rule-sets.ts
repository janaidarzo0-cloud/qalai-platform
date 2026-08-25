import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
} from 'payload'

import { hasAnyRole } from '@/access/roles'
import { isEditorialDraftSave } from '@/hooks/editorial'
import { acquireTransactionLock, TRUST_GRAPH_LOCK_KEY } from '@/lib/cms/advisory-lock'

export const RULE_SET_MATERIAL_FIELDS = [
  'title',
  'slug',
  'calculatorKey',
  'version',
  'effectiveFrom',
  'effectiveUntil',
  'parameters',
  'sourceReferences',
] as const

const countPublishedScenarioReferences = async (id: number | string, req: PayloadRequest) =>
  req.payload.count({
    collection: 'scenarios',
    overrideAccess: true,
    req,
    where: {
      and: [{ _status: { equals: 'published' } }, { calculatorRuleSet: { equals: id } }],
    },
  })

export const protectReferencedRuleSetChange: CollectionBeforeChangeHook = async ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || !originalDoc || isEditorialDraftSave(context)) return data

  await acquireTransactionLock(
    req,
    TRUST_GRAPH_LOCK_KEY,
    'Калькулятор ережесін тек дерекқор транзакциясында өзгертуге болады.',
  )

  const { totalDocs } = await countPublishedScenarioReferences(originalDoc.id, req)
  if (totalDocs > 0) {
    throw new APIError(
      'Жарияланған сценарий пайдаланатын калькулятор ережесін ауыстыруға немесе жарияланымнан алып тастауға болмайды.',
      409,
    )
  }

  return data
}

export const protectReferencedRuleSetDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!hasAnyRole(req.user, ['admin'])) {
    throw new APIError('Калькулятор ережесін тек әкімші жоя алады.', 403)
  }

  await acquireTransactionLock(
    req,
    TRUST_GRAPH_LOCK_KEY,
    'Калькулятор ережесін тек дерекқор транзакциясында жоюға болады.',
  )
  const { totalDocs } = await countPublishedScenarioReferences(id, req)

  if (totalDocs > 0) {
    throw new APIError(
      'Жарияланған сценарий пайдаланатын калькулятор ережесін жоюға болмайды.',
      409,
    )
  }
}
