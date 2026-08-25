import { APIError, type PayloadRequest } from 'payload'

import {
  assertRuleSetCanPublish,
  isVerificationCurrent,
  type RuleSetPublicationCandidate,
} from '@/lib/cms/publication'
import {
  assertPrimarySourceIsOfficial,
  hasCurrentOfficialPrimarySource,
} from '@/lib/cms/source-trust'

const relationshipID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null

  const id = (value as { id?: unknown }).id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

const timestamp = (value: unknown) => {
  if (!(typeof value === 'string' || value instanceof Date)) return null

  const result = new Date(value).getTime()
  return Number.isFinite(result) ? result : null
}

type RuleSetTrustCandidate = RuleSetPublicationCandidate & {
  _status?: unknown
  updatedAt?: unknown
}

const isCoveredByConsumerReview = (updatedAt: unknown, reviewedAt: unknown) => {
  const updatedAtTimestamp = timestamp(updatedAt)
  const reviewedAtTimestamp = timestamp(reviewedAt)

  return (
    updatedAtTimestamp != null &&
    reviewedAtTimestamp != null &&
    updatedAtTimestamp <= reviewedAtTimestamp
  )
}

export const isRuleSetTrusted = (
  candidate: RuleSetTrustCandidate,
  now = new Date(),
  consumerReviewedAt?: unknown,
) => {
  const effectiveFrom = timestamp(candidate.effectiveFrom)
  const effectiveUntil =
    candidate.effectiveUntil == null ? null : timestamp(candidate.effectiveUntil)

  return (
    candidate._status === 'published' &&
    isVerificationCurrent(candidate.verification, now) &&
    relationshipID(candidate.verification?.reviewedBy) != null &&
    effectiveFrom != null &&
    effectiveFrom <= now.getTime() &&
    (candidate.effectiveUntil == null ||
      (effectiveUntil != null && effectiveUntil > now.getTime())) &&
    candidate.parameters != null &&
    typeof candidate.parameters === 'object' &&
    !Array.isArray(candidate.parameters) &&
    hasCurrentOfficialPrimarySource(
      candidate.sourceReferences,
      candidate.verification?.reviewedAt,
      now,
    ) &&
    (consumerReviewedAt === undefined ||
      isCoveredByConsumerReview(candidate.updatedAt, consumerReviewedAt))
  )
}

export const assertLinkedRuleSetIsCurrent = async (
  relationship: unknown,
  req: PayloadRequest,
  consumerReviewedAt: unknown,
  now = new Date(),
) => {
  if (relationship == null) return

  const id = relationshipID(relationship)
  if (id == null) {
    throw new APIError('Калькулятор ережесінің сілтемесі жарамсыз.', 400)
  }

  const ruleSet = await req.payload.findByID({
    collection: 'calculator-rule-sets',
    depth: 1,
    draft: false,
    id,
    overrideAccess: true,
    req,
  })

  if (ruleSet._status !== 'published') {
    throw new APIError('Сценарий тек жарияланған калькулятор ережесін пайдалана алады.', 400)
  }

  if (!isCoveredByConsumerReview(ruleSet.updatedAt, consumerReviewedAt)) {
    throw new APIError(
      'Сценарий калькулятор ережесінің соңғы өзгерісінен кейін қайта тексерілуі керек.',
      400,
    )
  }

  assertRuleSetCanPublish(ruleSet as RuleSetPublicationCandidate, now)

  const effectiveFrom = timestamp(ruleSet.effectiveFrom)
  if (effectiveFrom == null || effectiveFrom > now.getTime()) {
    throw new APIError('Калькулятор ережесі әлі күшіне енген жоқ.', 400)
  }

  await assertPrimarySourceIsOfficial(
    ruleSet.sourceReferences,
    req,
    ruleSet.verification?.reviewedAt,
    now,
  )
}
