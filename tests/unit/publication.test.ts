import { describe, expect, it } from 'vitest'

import { assertRuleSetCanPublish, assertScenarioCanPublish } from '@/lib/cms/publication'

const completeCandidate = {
  officialLinks: [{ url: 'https://example.gov.kz' }],
  sourceReferences: [{ source: 'source-id' }],
  steps: [{ title: 'Қадам' }],
  verification: { status: 'verified' },
}

describe('Scenario publication guard', () => {
  it('accepts a verified, sourced and actionable Scenario', () => {
    expect(() => assertScenarioCanPublish(completeCandidate)).not.toThrow()
  })

  it.each([
    ['sources', { ...completeCandidate, sourceReferences: [] }],
    ['verification', { ...completeCandidate, verification: { status: 'in-review' } }],
    ['steps', { ...completeCandidate, steps: [] }],
    ['official action', { ...completeCandidate, officialLinks: [] }],
  ])('rejects a Scenario missing %s', (_label, candidate) => {
    expect(() => assertScenarioCanPublish(candidate)).toThrow()
  })
})

describe('Calculator rule-set publication guard', () => {
  const completeRuleSet = {
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    parameters: { coefficient: 1 },
    sourceReferences: [{ source: 'source-id' }],
    verification: { status: 'verified' },
  }

  it('accepts a sourced, effective and verified rule set', () => {
    expect(() => assertRuleSetCanPublish(completeRuleSet)).not.toThrow()
  })

  it.each([
    ['sources', { ...completeRuleSet, sourceReferences: [] }],
    ['verification', { ...completeRuleSet, verification: { status: 'stale' } }],
    ['effective date', { ...completeRuleSet, effectiveFrom: null }],
    ['object parameters', { ...completeRuleSet, parameters: [] }],
  ])('rejects a rule set missing %s', (_label, ruleSet) => {
    expect(() => assertRuleSetCanPublish(ruleSet)).toThrow()
  })
})
