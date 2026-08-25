import { describe, expect, it, vi } from 'vitest'

import { captureEditorialOperation } from '@/hooks/editorial'
import { protectReferencedRuleSetChange, protectReferencedRuleSetDelete } from '@/hooks/rule-sets'
import { assertLinkedRuleSetIsCurrent, isRuleSetTrusted } from '@/lib/cms/rule-set-trust'

const NOW = new Date('2026-08-25T08:00:00.000Z')
const SCENARIO_REVIEWED_AT = '2026-08-24T12:00:00.000Z'

const currentRuleSet = {
  _status: 'published',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  effectiveUntil: '2026-12-31T23:59:59.000Z',
  id: 'rule-set-id',
  parameters: { annualRate: 0.1 },
  sourceReferences: [
    {
      checkedAt: '2026-08-24T00:00:00.000Z',
      isPrimary: true,
      source: {
        id: 'source-id',
        trustTier: 'primary-official',
        updatedAt: '2026-08-23T00:00:00.000Z',
      },
      validUntil: '2026-12-31T23:59:59.000Z',
    },
  ],
  verification: {
    nextReviewAt: '2026-09-25T00:00:00.000Z',
    reviewedAt: '2026-08-24T00:00:00.000Z',
    reviewedBy: 'reviewer-id',
    status: 'verified',
  },
  updatedAt: '2026-08-24T10:00:00.000Z',
}

const requestForRuleSet = (ruleSet = currentRuleSet) =>
  ({
    payload: {
      findByID: vi.fn(async () => ruleSet),
    },
  }) as never

describe('linked calculator RuleSet trust', () => {
  it('accepts a current published and verified RuleSet', async () => {
    expect(isRuleSetTrusted(currentRuleSet, NOW)).toBe(true)
    await expect(
      assertLinkedRuleSetIsCurrent('rule-set-id', requestForRuleSet(), undefined, NOW),
    ).rejects.toThrow()
    await expect(
      assertLinkedRuleSetIsCurrent('rule-set-id', requestForRuleSet(), SCENARIO_REVIEWED_AT, NOW),
    ).resolves.toBeUndefined()
  })

  it('rejects a draft RuleSet', async () => {
    await expect(
      assertLinkedRuleSetIsCurrent(
        'rule-set-id',
        requestForRuleSet({ ...currentRuleSet, _status: 'draft' }),
        SCENARIO_REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('жарияланған')
  })

  it('rejects an expired or not-yet-effective RuleSet', async () => {
    expect(isRuleSetTrusted({ ...currentRuleSet, effectiveUntil: NOW.toISOString() }, NOW)).toBe(
      false,
    )
    await expect(
      assertLinkedRuleSetIsCurrent(
        'rule-set-id',
        requestForRuleSet({
          ...currentRuleSet,
          effectiveUntil: NOW.toISOString(),
        }),
        SCENARIO_REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('аяқталмаған')

    await expect(
      assertLinkedRuleSetIsCurrent(
        'rule-set-id',
        requestForRuleSet({
          ...currentRuleSet,
          effectiveFrom: '2026-09-01T00:00:00.000Z',
        }),
        SCENARIO_REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('күшіне енген жоқ')
  })

  it('requires the Scenario review to cover the linked RuleSet revision', async () => {
    expect(isRuleSetTrusted(currentRuleSet, NOW, '2026-08-24T09:59:59.999Z')).toBe(false)
    await expect(
      assertLinkedRuleSetIsCurrent(
        'rule-set-id',
        requestForRuleSet(),
        '2026-08-24T09:59:59.999Z',
        NOW,
      ),
    ).rejects.toThrow('соңғы өзгерісінен кейін')
  })
})

describe('referenced calculator RuleSet deletion', () => {
  it('blocks deletion while a published Scenario references the RuleSet', async () => {
    const req = {
      payload: {
        count: vi.fn(async () => ({ totalDocs: 1 })),
        db: {
          sessions: {
            'test-transaction': {
              db: { execute: vi.fn(async () => undefined) },
            },
          },
        },
      },
      transactionID: 'test-transaction',
      user: { id: 'admin', roles: ['admin'] },
    }

    await expect(
      protectReferencedRuleSetDelete({ id: 'rule-set-id', req } as never),
    ).rejects.toThrow('жоюға болмайды')
  })

  it('blocks unpublishing or replacing a RuleSet used by a published Scenario', async () => {
    const req = {
      payload: {
        count: vi.fn(async () => ({ totalDocs: 1 })),
        db: {
          sessions: {
            'test-transaction': {
              db: { execute: vi.fn(async () => undefined) },
            },
          },
        },
      },
      transactionID: 'test-transaction',
      user: { id: 'admin', roles: ['admin'] },
    }

    await expect(
      protectReferencedRuleSetChange({
        context: {},
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published', id: 'rule-set-id', version: '2026.1' },
        req,
      } as never),
    ).rejects.toThrow('ауыстыруға')

    await expect(
      protectReferencedRuleSetChange({
        context: {},
        data: { _status: 'published' },
        operation: 'update',
        originalDoc: { _status: 'draft', id: 'rule-set-id', version: '2026.2' },
        req,
      } as never),
    ).rejects.toThrow('ауыстыруға')
  })

  it('does not let draft:true bypass a referenced RuleSet publication guard', async () => {
    const context = {}
    captureEditorialOperation({
      args: { data: { _status: 'published' }, draft: true },
      context,
      operation: 'update',
    } as never)
    const req = {
      payload: {
        count: vi.fn(async () => ({ totalDocs: 1 })),
        db: {
          sessions: {
            'test-transaction': {
              db: { execute: vi.fn(async () => undefined) },
            },
          },
        },
      },
      transactionID: 'test-transaction',
      user: { id: 'reviewer', roles: ['reviewer'] },
    }

    await expect(
      protectReferencedRuleSetChange({
        context,
        data: { _status: 'published', version: '2026.2' },
        operation: 'update',
        originalDoc: { _status: 'draft', id: 'rule-set-id', version: '2026.2' },
        req,
      } as never),
    ).rejects.toThrow('ауыстыруға')
    expect(req.payload.count).toHaveBeenCalledTimes(1)
  })

  it('allows preparing a draft revision without replacing the referenced published snapshot', async () => {
    const context = {}
    captureEditorialOperation({
      args: { draft: true },
      context,
      operation: 'update',
    } as never)
    const req = {
      payload: {
        count: vi.fn(async () => ({ totalDocs: 1 })),
        db: {
          sessions: {
            'test-transaction': {
              db: { execute: vi.fn(async () => undefined) },
            },
          },
        },
      },
      transactionID: 'test-transaction',
      user: { id: 'editor', roles: ['editor'] },
    }

    await expect(
      protectReferencedRuleSetChange({
        context,
        data: { _status: 'draft', version: '2026.2' },
        operation: 'update',
        originalDoc: { _status: 'published', id: 'rule-set-id', version: '2026.1' },
        req,
      } as never),
    ).resolves.toMatchObject({ version: '2026.2' })
    expect(req.payload.count).not.toHaveBeenCalled()
  })
})
