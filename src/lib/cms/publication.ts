import { APIError } from 'payload'

export type SourceReferenceCandidate = {
  checkedAt?: unknown
  isPrimary?: unknown
  source?: unknown
  validFrom?: unknown
  validUntil?: unknown
}

export type VerificationCandidate = {
  nextReviewAt?: unknown
  reviewedAt?: unknown
  reviewedBy?: unknown
  status?: string | null
}

export type ScenarioPublicationCandidate = {
  officialLinks?: unknown[] | null
  sourceReferences?: SourceReferenceCandidate[] | null
  steps?: unknown[] | null
  verification?: VerificationCandidate | null
}

export type RuleSetPublicationCandidate = {
  effectiveFrom?: unknown
  effectiveUntil?: unknown
  parameters?: unknown
  sourceReferences?: SourceReferenceCandidate[] | null
  verification?: VerificationCandidate | null
}

const toTimestamp = (value: unknown): number | null => {
  if (!(typeof value === 'string' || value instanceof Date)) return null

  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

export const isReferenceCoveredByReview = (
  reference: SourceReferenceCandidate,
  reviewedAt: unknown,
) => {
  const checkedAt = toTimestamp(reference.checkedAt)
  const reviewedAtTimestamp = toTimestamp(reviewedAt)

  return checkedAt != null && reviewedAtTimestamp != null && checkedAt <= reviewedAtTimestamp
}

const hasRelationshipValue = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string') return value.length > 0
  if (!value || typeof value !== 'object') return false

  const id = (value as { id?: unknown }).id
  return (typeof id === 'string' && id.length > 0) || typeof id === 'number'
}

export const isVerificationCurrent = (
  verification: VerificationCandidate | null | undefined,
  now = new Date(),
) => {
  const nowTimestamp = now.getTime()
  const reviewedAt = toTimestamp(verification?.reviewedAt)
  const nextReviewAt = toTimestamp(verification?.nextReviewAt)

  return (
    verification?.status === 'verified' &&
    reviewedAt != null &&
    reviewedAt <= nowTimestamp &&
    nextReviewAt != null &&
    nextReviewAt > nowTimestamp
  )
}

export const isPrimaryReferenceCurrent = (
  reference: SourceReferenceCandidate,
  now = new Date(),
) => {
  if (reference.isPrimary !== true || !hasRelationshipValue(reference.source)) return false

  const nowTimestamp = now.getTime()
  const checkedAt = toTimestamp(reference.checkedAt)
  const validFrom = reference.validFrom == null ? null : toTimestamp(reference.validFrom)
  const validUntil = reference.validUntil == null ? null : toTimestamp(reference.validUntil)

  if (checkedAt == null || checkedAt > nowTimestamp) return false
  if (reference.validFrom != null && (validFrom == null || validFrom > nowTimestamp)) return false
  if (reference.validUntil != null && (validUntil == null || validUntil <= nowTimestamp))
    return false

  return true
}

const assertEvidenceCanPublish = (
  sourceReferences: SourceReferenceCandidate[] | null | undefined,
  verification: VerificationCandidate | null | undefined,
  now: Date,
) => {
  if (!Array.isArray(sourceReferences) || sourceReferences.length === 0) {
    throw new APIError('Жариялау үшін кемінде бір ресми дереккөз керек.', 400)
  }

  const primaryReferences = sourceReferences.filter((reference) => reference.isPrimary === true)

  if (
    primaryReferences.length === 0 ||
    !primaryReferences.every((reference) => isPrimaryReferenceCurrent(reference, now))
  ) {
    throw new APIError(
      'Жариялау үшін барлық негізгі ресми дереккөздің тексерілген күні болып, мерзімі өтпеуі керек.',
      400,
    )
  }

  if (verification?.status !== 'verified') {
    throw new APIError('Жариялау алдында фактологиялық статус «Тексерілді» болуы керек.', 400)
  }

  if (!hasRelationshipValue(verification.reviewedBy)) {
    throw new APIError('Жариялау алдында тексеруші редактор көрсетілуі керек.', 400)
  }

  if (!isVerificationCurrent(verification, now)) {
    throw new APIError(
      'Тексеру күні және болашақтағы келесі тексеру мерзімі көрсетілуі керек.',
      400,
    )
  }

  if (
    !primaryReferences.every((reference) =>
      isReferenceCoveredByReview(reference, verification?.reviewedAt),
    )
  ) {
    throw new APIError(
      'Барлық негізгі дереккөз фактологиялық тексеруден бұрын тексерілген болуы керек.',
      400,
    )
  }
}

export const assertScenarioCanPublish = (
  candidate: ScenarioPublicationCandidate,
  now = new Date(),
) => {
  assertEvidenceCanPublish(candidate.sourceReferences, candidate.verification, now)

  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) {
    throw new APIError('Жариялау үшін кемінде бір әрекет қадамы керек.', 400)
  }

  if (!Array.isArray(candidate.officialLinks) || candidate.officialLinks.length === 0) {
    throw new APIError('Жариялау үшін ресми әрекет сілтемесі керек.', 400)
  }
}

export const assertRuleSetCanPublish = (
  candidate: RuleSetPublicationCandidate,
  now = new Date(),
) => {
  assertEvidenceCanPublish(candidate.sourceReferences, candidate.verification, now)

  const effectiveFrom = toTimestamp(candidate.effectiveFrom)
  if (effectiveFrom == null) {
    throw new APIError('Ереже жинағының қолданыс басталатын күні керек.', 400)
  }

  if (candidate.effectiveUntil != null) {
    const effectiveUntil = toTimestamp(candidate.effectiveUntil)

    if (
      effectiveUntil == null ||
      effectiveUntil <= effectiveFrom ||
      effectiveUntil <= now.getTime()
    ) {
      throw new APIError(
        'Ереже жинағының қолданыс мерзімі дұрыс және аяқталмаған болуы керек.',
        400,
      )
    }
  }

  if (
    candidate.parameters == null ||
    typeof candidate.parameters !== 'object' ||
    Array.isArray(candidate.parameters)
  ) {
    throw new APIError('Ереже параметрлері JSON object болуы керек.', 400)
  }
}
