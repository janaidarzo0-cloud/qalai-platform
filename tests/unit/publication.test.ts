import { describe, expect, it } from 'vitest'

import {
  assertRuleSetCanPublish,
  assertScenarioCanPublish,
  isPrimaryReferenceCurrent,
  isVerificationCurrent,
} from '@/lib/cms/publication'

const NOW = new Date('2026-08-25T08:00:00.000Z')

const completeVerification = {
  nextReviewAt: '2026-09-25T00:00:00.000Z',
  reviewedAt: '2026-08-24T10:00:00.000Z',
  reviewedBy: 'reviewer-id',
  status: 'verified',
}

const completeReference = {
  checkedAt: '2026-08-24T00:00:00.000Z',
  isPrimary: true,
  source: 'source-id',
  validFrom: '2026-01-01T00:00:00.000Z',
  validUntil: '2026-12-31T23:59:59.000Z',
}

const completeCandidate = {
  officialLinks: [{ url: 'https://example.gov.kz' }],
  sourceReferences: [completeReference],
  steps: [{ title: 'Қадам' }],
  verification: completeVerification,
}

describe('Scenario publication guard', () => {
  it('accepts a current, reviewed, primary-sourced and actionable Scenario', () => {
    expect(() => assertScenarioCanPublish(completeCandidate, NOW)).not.toThrow()
  })

  it('expires at the annual boundary even when another primary Source has no end date', () => {
    const candidate = {
      ...completeCandidate,
      sourceReferences: [
        { ...completeReference, source: 'timeless-source', validUntil: undefined },
        {
          ...completeReference,
          source: 'annual-source',
          validUntil: '2026-12-31T19:00:00.000Z',
        },
      ],
      verification: {
        ...completeVerification,
        nextReviewAt: '2027-02-01T00:00:00.000Z',
      },
    }

    expect(() =>
      assertScenarioCanPublish(candidate, new Date('2026-12-31T18:59:59.999Z')),
    ).not.toThrow()
    expect(() => assertScenarioCanPublish(candidate, new Date('2026-12-31T19:00:00.000Z'))).toThrow(
      'барлық негізгі ресми дереккөздің',
    )
  })

  it.each([
    ['sources', { ...completeCandidate, sourceReferences: [] }],
    [
      'a primary source',
      { ...completeCandidate, sourceReferences: [{ ...completeReference, isPrimary: false }] },
    ],
    [
      'a source check date',
      { ...completeCandidate, sourceReferences: [{ ...completeReference, checkedAt: null }] },
    ],
    [
      'a current source',
      {
        ...completeCandidate,
        sourceReferences: [{ ...completeReference, validUntil: '2026-08-25T08:00:00.000Z' }],
      },
    ],
    [
      'verification',
      { ...completeCandidate, verification: { ...completeVerification, status: 'stale' } },
    ],
    [
      'a review timestamp',
      { ...completeCandidate, verification: { ...completeVerification, reviewedAt: null } },
    ],
    [
      'a reviewer',
      { ...completeCandidate, verification: { ...completeVerification, reviewedBy: null } },
    ],
    [
      'a future review deadline',
      {
        ...completeCandidate,
        verification: { ...completeVerification, nextReviewAt: '2026-08-25T08:00:00.000Z' },
      },
    ],
    [
      'a review after the evidence check',
      {
        ...completeCandidate,
        verification: { ...completeVerification, reviewedAt: '2026-08-23T23:59:59.999Z' },
      },
    ],
    ['steps', { ...completeCandidate, steps: [] }],
    ['official action', { ...completeCandidate, officialLinks: [] }],
  ])('rejects a Scenario missing %s', (_label, candidate) => {
    expect(() => assertScenarioCanPublish(candidate, NOW)).toThrow()
  })
})

describe('Calculator rule-set publication guard', () => {
  const completeRuleSet = {
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: '2026-12-31T23:59:59.000Z',
    parameters: { coefficient: 1 },
    sourceReferences: [completeReference],
    verification: completeVerification,
  }

  it('accepts a sourced, effective and reviewed rule set', () => {
    expect(() => assertRuleSetCanPublish(completeRuleSet, NOW)).not.toThrow()
  })

  it.each([
    ['sources', { ...completeRuleSet, sourceReferences: [] }],
    [
      'verification',
      { ...completeRuleSet, verification: { ...completeVerification, status: 'stale' } },
    ],
    ['effective date', { ...completeRuleSet, effectiveFrom: null }],
    [
      'an unexpired effective period',
      { ...completeRuleSet, effectiveUntil: '2026-08-25T08:00:00.000Z' },
    ],
    [
      'a review after the evidence check',
      {
        ...completeRuleSet,
        verification: { ...completeVerification, reviewedAt: '2026-08-23T23:59:59.999Z' },
      },
    ],
    ['object parameters', { ...completeRuleSet, parameters: [] }],
  ])('rejects a rule set missing %s', (_label, ruleSet) => {
    expect(() => assertRuleSetCanPublish(ruleSet, NOW)).toThrow()
  })
})

describe('Trust date helpers', () => {
  it('expires verification exactly at nextReviewAt', () => {
    expect(isVerificationCurrent(completeVerification, new Date('2026-09-24T23:59:59.999Z'))).toBe(
      true,
    )
    expect(
      isVerificationCurrent(completeVerification, new Date(completeVerification.nextReviewAt)),
    ).toBe(false)
  })

  it('rejects future checkedAt and invalid validity dates', () => {
    expect(
      isPrimaryReferenceCurrent(
        { ...completeReference, checkedAt: '2026-08-26T00:00:00.000Z' },
        NOW,
      ),
    ).toBe(false)
    expect(isPrimaryReferenceCurrent({ ...completeReference, validUntil: 'not-a-date' }, NOW)).toBe(
      false,
    )
  })
})
