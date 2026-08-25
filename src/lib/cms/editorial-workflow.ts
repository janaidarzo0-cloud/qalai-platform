import { APIError } from 'payload'

type DocumentData = Record<string, unknown>

type VerificationData = {
  nextReviewAt?: unknown
  reviewedAt?: unknown
  reviewedBy?: unknown
  riskLevel?: unknown
  status?: unknown
  [key: string]: unknown
}

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key)

const valuesDiffer = (left: unknown, right: unknown) =>
  JSON.stringify(left) !== JSON.stringify(right)

export const hasMaterialChange = (
  data: DocumentData,
  originalDoc: DocumentData | null | undefined,
  materialFields: readonly string[],
) =>
  Boolean(
    originalDoc &&
    materialFields.some(
      (field) => hasOwn(data, field) && valuesDiffer(data[field], originalDoc[field]),
    ),
  )

export const prepareEditorialVerification = ({
  canReview,
  data,
  materialFields,
  now,
  operation,
  originalDoc,
  reviewerID,
  trustedUnverifiedImport = false,
  willBePublished,
}: {
  canReview: boolean
  data: DocumentData
  materialFields: readonly string[]
  now: Date
  operation: 'create' | 'update'
  originalDoc?: DocumentData | null
  reviewerID: number | string | null
  trustedUnverifiedImport?: boolean
  willBePublished: boolean
}): DocumentData => {
  const originalVerification = (originalDoc?.verification ?? {}) as VerificationData
  const incomingVerification = (data.verification ?? {}) as VerificationData
  const isDuplicate =
    !trustedUnverifiedImport &&
    operation === 'create' &&
    originalDoc != null &&
    Object.keys(originalDoc).length > 0
  const materialChanged =
    operation === 'update' && hasMaterialChange(data, originalDoc, materialFields)

  let verification: VerificationData

  if (operation === 'create' && !canReview) {
    verification = {
      riskLevel: 'high',
      status: 'unverified',
    }
  } else if (!canReview) {
    verification = { ...originalVerification }
  } else {
    verification = {
      ...originalVerification,
      ...incomingVerification,
    }
  }

  if (isDuplicate) {
    verification = {
      ...verification,
      nextReviewAt: null,
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    }
  }

  if (materialChanged) {
    verification = {
      ...verification,
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    }
  }

  const explicitlyVerified =
    canReview &&
    !isDuplicate &&
    !materialChanged &&
    incomingVerification.status === 'verified' &&
    originalVerification.status !== 'verified'
  if (explicitlyVerified) verification.status = 'verified'

  const reviewWindowChanged =
    canReview &&
    !isDuplicate &&
    !materialChanged &&
    originalVerification.status === 'verified' &&
    verification.status === 'verified' &&
    hasOwn(incomingVerification, 'nextReviewAt') &&
    valuesDiffer(incomingVerification.nextReviewAt, originalVerification.nextReviewAt)
  const isPublishedCreate = willBePublished && operation === 'create' && !isDuplicate

  if (
    verification.status === 'verified' &&
    (explicitlyVerified || reviewWindowChanged || isPublishedCreate)
  ) {
    if (reviewerID == null) {
      throw new APIError('Тексерілген материал үшін reviewer/admin пайдаланушысы керек.', 403)
    }

    verification.reviewedAt = now.toISOString()
    verification.reviewedBy = reviewerID
  }

  return {
    ...data,
    verification,
  }
}
