import { describe, expect, it, vi } from 'vitest'

import { assertPrimarySourceIsOfficial } from '@/lib/cms/source-trust'
import { protectReferencedSource, protectReferencedSourceDelete } from '@/hooks/sources'

const NOW = new Date('2026-08-25T08:00:00.000Z')
const REVIEWED_AT = '2026-08-24T12:00:00.000Z'
const currentReference = (source: unknown, isPrimary = true) => ({
  checkedAt: '2026-08-24T00:00:00.000Z',
  isPrimary,
  source,
  validUntil: '2026-12-31T23:59:59.000Z',
})

const requestWithTier = (trustTier: string, updatedAt = '2026-08-23T00:00:00.000Z') =>
  ({
    payload: {
      findByID: vi.fn(async () => ({ id: 'source-id', trustTier, updatedAt })),
    },
  }) as never

describe('primary Source trust', () => {
  it.each(['primary-official', 'official-provider'])(
    'accepts the %s trust tier',
    async (trustTier) => {
      await expect(
        assertPrimarySourceIsOfficial(
          [currentReference('source-id')],
          requestWithTier(trustTier),
          REVIEWED_AT,
          NOW,
        ),
      ).resolves.toBeUndefined()
    },
  )

  it('rejects a secondary Source even when the reference claims it is primary', async () => {
    await expect(
      assertPrimarySourceIsOfficial(
        [currentReference('source-id')],
        requestWithTier('secondary'),
        REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('сенім деңгейі')
  })

  it('does not accept an official Source unless the Scenario marks it primary', async () => {
    await expect(
      assertPrimarySourceIsOfficial(
        [currentReference('source-id', false)],
        requestWithTier('primary-official'),
        REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('сенім деңгейі')
  })

  it('uses a populated relationship without an extra query', async () => {
    const req = requestWithTier('secondary') as {
      payload: { findByID: ReturnType<typeof vi.fn> }
    }

    await expect(
      assertPrimarySourceIsOfficial(
        [
          currentReference({
            id: 'source-id',
            trustTier: 'primary-official',
            updatedAt: '2026-08-23T00:00:00.000Z',
          }),
        ],
        req as never,
        REVIEWED_AT,
        NOW,
      ),
    ).resolves.toBeUndefined()
    expect(req.payload.findByID).not.toHaveBeenCalled()
  })

  it('rejects when any marked-primary Source is expired', async () => {
    const officialSource = {
      id: 'source-id',
      trustTier: 'primary-official',
      updatedAt: '2026-08-23T00:00:00.000Z',
    }

    await expect(
      assertPrimarySourceIsOfficial(
        [
          currentReference(officialSource),
          {
            ...currentReference({ ...officialSource, id: 'expired' }),
            validUntil: NOW.toISOString(),
          },
        ],
        requestWithTier('primary-official'),
        REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('Барлық негізгі дереккөздің мерзімі')
  })

  it('rejects a current secondary reference paired with an expired official one', async () => {
    await expect(
      assertPrimarySourceIsOfficial(
        [
          currentReference({ id: 'secondary', trustTier: 'secondary' }),
          {
            checkedAt: '2026-01-01T00:00:00.000Z',
            isPrimary: true,
            source: {
              id: 'official',
              trustTier: 'primary-official',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
            validUntil: '2026-08-25T08:00:00.000Z',
          },
        ],
        requestWithTier('secondary'),
        REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('сенім деңгейі')
  })

  it('rejects an official Source changed after the evidence was checked', async () => {
    await expect(
      assertPrimarySourceIsOfficial(
        [currentReference('source-id')],
        requestWithTier('primary-official', '2026-08-24T00:00:00.001Z'),
        REVIEWED_AT,
        NOW,
      ),
    ).rejects.toThrow('соңғы өзгерісінен кейін')
  })

  it('rejects evidence checked after the factual review', async () => {
    await expect(
      assertPrimarySourceIsOfficial(
        [currentReference('source-id')],
        requestWithTier('primary-official'),
        '2026-08-23T23:59:59.999Z',
        NOW,
      ),
    ).rejects.toThrow('фактологиялық тексеруге дейін')
  })
})

describe('published Source immutability', () => {
  const requestWithReferenceCount = (totalDocs: number) =>
    ({
      payload: {
        count: vi.fn(async () => ({ totalDocs })),
        countVersions: vi.fn(async () => ({ totalDocs })),
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
    }) as never

  it('blocks changing an official Source used by published content', async () => {
    await expect(
      protectReferencedSource({
        data: { url: 'https://egov.kz/new' },
        operation: 'update',
        originalDoc: {
          id: 'source-id',
          trustTier: 'primary-official',
          url: 'https://egov.kz/old',
        },
        req: requestWithReferenceCount(1),
      } as never),
    ).rejects.toThrow('Жарияланған материал')
  })

  it('allows updating an official Source after its consumers are unpublished', async () => {
    await expect(
      protectReferencedSource({
        data: { url: 'https://egov.kz/new' },
        operation: 'update',
        originalDoc: {
          id: 'source-id',
          trustTier: 'primary-official',
          url: 'https://egov.kz/old',
        },
        req: requestWithReferenceCount(0),
      } as never),
    ).resolves.toMatchObject({ url: 'https://egov.kz/new' })
  })

  it('also blocks changing a secondary Source used by published content', async () => {
    await expect(
      protectReferencedSource({
        data: { title: 'Changed evidence' },
        operation: 'update',
        originalDoc: {
          id: 'source-id',
          title: 'Original evidence',
          trustTier: 'secondary',
        },
        req: requestWithReferenceCount(1),
      } as never),
    ).rejects.toThrow('Жарияланған материал')
  })

  it('blocks deleting any Source used by published content', async () => {
    await expect(
      protectReferencedSourceDelete({
        id: 'source-id',
        req: requestWithReferenceCount(1),
      } as never),
    ).rejects.toThrow('жоюға болмайды')
  })

  it('blocks deletion when only a historical draft version references the Source', async () => {
    const req = {
      payload: {
        count: vi.fn(async () => ({ totalDocs: 0 })),
        countVersions: vi.fn(async () => ({ totalDocs: 1 })),
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

    await expect(protectReferencedSourceDelete({ id: 'source-id', req } as never)).rejects.toThrow(
      'жоюға болмайды',
    )
    expect(req.payload.countVersions).toHaveBeenCalledTimes(2)
    expect(req.payload.countVersions).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'scenarios',
        where: {
          'version.sourceReferences.source': { equals: 'source-id' },
        },
      }),
    )
    expect(req.payload.countVersions).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'calculator-rule-sets',
        where: {
          'version.sourceReferences.source': { equals: 'source-id' },
        },
      }),
    )
  })
})
