import { APIError, type PayloadRequest } from 'payload'

import {
  isPrimaryReferenceCurrent,
  isReferenceCoveredByReview,
  type SourceReferenceCandidate,
} from '@/lib/cms/publication'

const OFFICIAL_TRUST_TIERS = new Set(['primary-official', 'official-provider'])

export const isOfficialSourceTrustTier = (value: unknown) =>
  typeof value === 'string' && OFFICIAL_TRUST_TIERS.has(value)

const relationshipID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null

  const id = (value as { id?: unknown }).id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

const relationshipTrustTier = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null

  const trustTier = (value as { trustTier?: unknown }).trustTier
  return typeof trustTier === 'string' ? trustTier : null
}

const relationshipUpdatedAt = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return null

  return (value as { updatedAt?: unknown }).updatedAt
}

const toTimestamp = (value: unknown): number | null => {
  if (!(typeof value === 'string' || value instanceof Date)) return null

  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

const sourceSnapshotIsCovered = (
  reference: SourceReferenceCandidate,
  source: unknown,
  reviewedAt: unknown,
  now: Date,
) => {
  const checkedAt = toTimestamp(reference.checkedAt)
  const sourceUpdatedAt = toTimestamp(relationshipUpdatedAt(source))

  return (
    isPrimaryReferenceCurrent(reference, now) &&
    isReferenceCoveredByReview(reference, reviewedAt) &&
    isOfficialSourceTrustTier(relationshipTrustTier(source)) &&
    checkedAt != null &&
    sourceUpdatedAt != null &&
    sourceUpdatedAt <= checkedAt
  )
}

export const hasCurrentOfficialPrimarySource = (
  sourceReferences: SourceReferenceCandidate[] | null | undefined,
  reviewedAt: unknown,
  now = new Date(),
) =>
  (sourceReferences ?? []).some((reference) =>
    sourceSnapshotIsCovered(reference, reference.source, reviewedAt, now),
  )

export const assertPrimarySourceIsOfficial = async (
  sourceReferences: SourceReferenceCandidate[] | null | undefined,
  req: PayloadRequest,
  reviewedAt: unknown,
  now = new Date(),
) => {
  const primaryReferences = (sourceReferences ?? []).filter((reference) =>
    isPrimaryReferenceCurrent(reference, now),
  )

  for (const reference of primaryReferences) {
    if (sourceSnapshotIsCovered(reference, reference.source, reviewedAt, now)) return

    const sourceID = relationshipID(reference.source)
    if (sourceID == null) continue

    const source = await req.payload.findByID({
      collection: 'sources',
      depth: 0,
      id: sourceID,
      overrideAccess: true,
      req,
    })

    if (sourceSnapshotIsCovered(reference, source, reviewedAt, now)) return
  }

  throw new APIError(
    'Негізгі дереккөздің сенім деңгейі ресми болуы және ол соңғы өзгерісінен кейін, фактологиялық тексеруге дейін қайта тексерілуі керек.',
    400,
  )
}
