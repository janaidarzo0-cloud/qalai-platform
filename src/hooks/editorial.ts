import { APIError, type CollectionBeforeOperationHook, type RequestContext } from 'payload'

const DRAFT_SAVE_CONTEXT_KEY = 'qalaiDraftSave'

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
