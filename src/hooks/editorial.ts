import { APIError, type CollectionBeforeOperationHook, type RequestContext } from 'payload'

const DRAFT_SAVE_CONTEXT_KEY = 'qalaiDraftSave'
const CLOSED_ALPHA_IMPORT_CONTEXT_KEY = 'qalaiClosedAlphaImport'
const CLOSED_ALPHA_IMPORT_TOKEN = Symbol('qalaiClosedAlphaImport')

export const createClosedAlphaImportContext = (): RequestContext => ({
  [CLOSED_ALPHA_IMPORT_CONTEXT_KEY]: CLOSED_ALPHA_IMPORT_TOKEN,
})

export const captureEditorialOperation: CollectionBeforeOperationHook = ({
  args,
  context,
  operation,
}) => {
  context[DRAFT_SAVE_CONTEXT_KEY] = false

  if (operation === 'create' || operation === 'update') {
    const status =
      'data' in args && args.data && typeof args.data === 'object'
        ? (args.data as { _status?: unknown })._status
        : undefined

    context[DRAFT_SAVE_CONTEXT_KEY] = Boolean(
      'draft' in args && args.draft === true && status !== 'published',
    )
  }

  return args
}

export const isEditorialDraftSave = (context: RequestContext) =>
  context?.[DRAFT_SAVE_CONTEXT_KEY] === true

export const isClosedAlphaDraftImport = ({
  context,
  data,
  operation,
}: {
  context: RequestContext
  data: Record<string, unknown>
  operation: 'create' | 'update'
}) => {
  const verification = data.verification

  return Boolean(
    (operation === 'create' || operation === 'update') &&
    isEditorialDraftSave(context) &&
    context?.[CLOSED_ALPHA_IMPORT_CONTEXT_KEY] === CLOSED_ALPHA_IMPORT_TOKEN &&
    data._status === 'draft' &&
    verification &&
    typeof verification === 'object' &&
    (verification as Record<string, unknown>).status === 'unverified' &&
    (verification as Record<string, unknown>).riskLevel === 'high' &&
    !Object.prototype.hasOwnProperty.call(verification, 'reviewedAt') &&
    !Object.prototype.hasOwnProperty.call(verification, 'reviewedBy'),
  )
}

export const assertEditorialStatusTransition = ({
  canReview,
  context,
  entityLabel,
  nextStatus,
}: {
  canReview: boolean
  context: RequestContext
  entityLabel: string
  nextStatus: unknown
}) => {
  if (nextStatus === 'published' && !canReview) {
    throw new APIError(`${entityLabel} тек reviewer немесе admin жариялай алады.`, 403)
  }

  if (!canReview && !isEditorialDraftSave(context)) {
    throw new APIError(
      `${entityLabel} editor тек draft:true режимінде сақтай алады; жариялау мен жарияланымнан алып тастау reviewer/admin рөліне тиесілі.`,
      403,
    )
  }
}
