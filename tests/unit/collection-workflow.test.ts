import { describe, expect, it, vi } from 'vitest'

import { protectPublishedRuleSet } from '@/collections/CalculatorRuleSets'
import { protectCategoryPublication } from '@/collections/Categories'
import { protectPublishedScenario } from '@/collections/Scenarios'
import { captureEditorialOperation } from '@/hooks/editorial'

const requestFor = (
  roles: string[],
  id = 'user-id',
  publishedScenario?: { id: string; slug: string },
) =>
  ({
    payload: {
      db: {
        sessions: {
          'test-transaction': {
            db: { execute: vi.fn(async () => undefined) },
          },
        },
      },
      findVersions: vi.fn(async () => ({
        docs: publishedScenario
          ? [
              {
                parent: publishedScenario.id,
                version: { ...publishedScenario, _status: 'published' },
              },
            ]
          : [],
      })),
      findByID: vi.fn(async ({ collection }: { collection: string }) =>
        collection === 'categories'
          ? { _status: 'published', id: 'category-id', title: 'Мемлекет' }
          : {
              id: 'source-id',
              trustTier: 'primary-official',
              updatedAt: '2025-12-31T00:00:00.000Z',
            },
      ),
    },
    transactionID: 'test-transaction',
    user: { id, roles },
  }) as never

const validEvidence = {
  sourceReferences: [
    {
      checkedAt: '2026-01-01T00:00:00.000Z',
      isPrimary: true,
      source: 'source-id',
      validUntil: '2099-01-01T00:00:00.000Z',
    },
  ],
  verification: {
    nextReviewAt: '2099-01-01T00:00:00.000Z',
    reviewedAt: '2026-01-01T00:00:00.000Z',
    reviewedBy: 'forged-reviewer',
    riskLevel: 'medium',
    status: 'verified',
  },
}

describe('Scenario collection workflow', () => {
  it('blocks an editor from publishing a draft', async () => {
    await expect(
      protectPublishedScenario({
        data: { _status: 'published' },
        operation: 'update',
        originalDoc: { _status: 'draft', slug: 'draft' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).rejects.toThrow('reviewer немесе admin')
  })

  it('does not treat draft:true with a published status as a draft save', async () => {
    const context = {}
    captureEditorialOperation({
      args: { data: { _status: 'published' }, draft: true },
      context,
      operation: 'update',
    } as never)

    await expect(
      protectPublishedScenario({
        context,
        data: { _status: 'published' },
        operation: 'update',
        originalDoc: { _status: 'draft', slug: 'draft' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).rejects.toThrow('reviewer немесе admin')
  })

  it('stamps the publishing reviewer and validates official Source trust', async () => {
    const originalDoc = {
      _status: 'draft',
      category: 'category-id',
      officialLinks: [{ url: 'https://egov.kz/service' }],
      slug: 'scenario',
      steps: [{ title: 'Қадам' }],
      ...validEvidence,
      verification: {
        ...validEvidence.verification,
        reviewedAt: null,
        reviewedBy: null,
        status: 'in-review',
      },
    }
    const result = await protectPublishedScenario({
      data: {
        ...originalDoc,
        _status: 'published',
        verification: validEvidence.verification,
      },
      operation: 'update',
      originalDoc,
      req: requestFor(['reviewer'], 'real-reviewer'),
    } as never)

    expect(result.verification).toMatchObject({
      reviewedBy: 'real-reviewer',
      status: 'verified',
    })
    expect(result.verification.reviewedAt).not.toBe(validEvidence.verification.reviewedAt)
  })

  it('invalidates old verification when an editor changes a verified draft', async () => {
    const context = {}
    captureEditorialOperation({
      args: { draft: true },
      context,
      operation: 'update',
    } as never)
    const result = await protectPublishedScenario({
      context,
      data: { title: 'Жаңа атау' },
      operation: 'update',
      originalDoc: {
        _status: 'draft',
        slug: 'scenario',
        title: 'Ескі атау',
        ...validEvidence,
      },
      req: requestFor(['editor'], 'editor-id'),
    } as never)

    expect(result.verification).toMatchObject({
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    })
  })

  it('keeps a published slug immutable', async () => {
    await expect(
      protectPublishedScenario({
        data: { slug: 'new-slug' },
        operation: 'update',
        originalDoc: { _status: 'published', id: 'scenario-id', slug: 'old-slug' },
        req: requestFor(['admin'], 'admin-id', {
          id: 'scenario-id',
          slug: 'old-slug',
        }),
      } as never),
    ).rejects.toThrow('slug')
  })

  it('keeps the live slug immutable across draft revisions and publication', async () => {
    const req = requestFor(['editor'], 'editor-id', {
      id: 'scenario-id',
      slug: 'live-slug',
    })
    const context = {}
    captureEditorialOperation({
      args: { draft: true },
      context,
      operation: 'update',
    } as never)

    await expect(
      protectPublishedScenario({
        context,
        data: { _status: 'draft', slug: 'changed-in-draft' },
        operation: 'update',
        originalDoc: { _status: 'draft', id: 'scenario-id', slug: 'live-slug' },
        req,
      } as never),
    ).rejects.toThrow('slug')

    const publicationReq = requestFor(['reviewer'], 'reviewer-id', {
      id: 'scenario-id',
      slug: 'live-slug',
    }) as {
      payload: {
        db: { sessions: Record<string, { db: { execute: ReturnType<typeof vi.fn> } }> }
        findVersions: ReturnType<typeof vi.fn>
      }
    }

    await expect(
      protectPublishedScenario({
        context: {},
        data: { _status: 'published', slug: 'changed-in-draft' },
        operation: 'update',
        originalDoc: { _status: 'draft', id: 'scenario-id', slug: 'changed-in-draft' },
        req: publicationReq,
      } as never),
    ).rejects.toThrow('slug')
    expect(
      publicationReq.payload.db.sessions['test-transaction'].db.execute.mock.invocationCallOrder[0],
    ).toBeLessThan(publicationReq.payload.findVersions.mock.invocationCallOrder[0] as number)
  })

  it('keeps the slug immutable after unpublish and stores a permanent marker', async () => {
    await expect(
      protectPublishedScenario({
        context: {},
        data: { _status: 'draft', slug: 'renamed-after-unpublish' },
        operation: 'update',
        originalDoc: {
          _status: 'draft',
          id: 'scenario-id',
          publishedSlug: 'original-public-slug',
          slug: 'original-public-slug',
        },
        req: requestFor(['reviewer'], 'reviewer-id'),
      } as never),
    ).rejects.toThrow('slug')

    const originalDoc = {
      _status: 'draft',
      category: 'category-id',
      officialLinks: [{ url: 'https://egov.kz/service' }],
      slug: 'first-public-slug',
      steps: [{ title: 'Қадам' }],
      ...validEvidence,
    }
    const result = await protectPublishedScenario({
      context: {},
      data: { ...originalDoc, _status: 'published' },
      operation: 'update',
      originalDoc,
      req: requestFor(['reviewer'], 'reviewer-id'),
    } as never)

    expect(result.publishedSlug).toBe('first-public-slug')
  })

  it('allows a draft revision but blocks an editor from unpublishing the live Scenario', async () => {
    await expect(
      protectPublishedScenario({
        context: {},
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published', slug: 'scenario' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).rejects.toThrow('draft:true')

    const context = {}
    captureEditorialOperation({
      args: { draft: true },
      context,
      operation: 'update',
    } as never)

    await expect(
      protectPublishedScenario({
        context,
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published', slug: 'scenario' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).resolves.toMatchObject({ _status: 'draft' })

    await expect(
      protectPublishedScenario({
        context: {},
        data: { title: 'Ordinary PATCH over latest draft' },
        operation: 'update',
        originalDoc: { _status: 'draft', slug: 'scenario' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).rejects.toThrow('draft:true')
  })
})

describe('Calculator rule-set workflow', () => {
  it('blocks an editor from publishing regulated rules', async () => {
    await expect(
      protectPublishedRuleSet({
        data: { _status: 'published' },
        operation: 'update',
        originalDoc: { _status: 'draft' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).rejects.toThrow('reviewer немесе admin')
  })

  it('locks a draft save that changes Source relationships', async () => {
    const context = {}
    captureEditorialOperation({
      args: { data: { _status: 'draft' }, draft: true },
      context,
      operation: 'update',
    } as never)
    const req = requestFor(['editor'], 'editor-id') as {
      payload: { db: { sessions: Record<string, { db: { execute: ReturnType<typeof vi.fn> } }> } }
    }

    await expect(
      protectPublishedRuleSet({
        context,
        data: { sourceReferences: [{ source: 'new-source' }] },
        operation: 'update',
        originalDoc: {
          _status: 'draft',
          sourceReferences: [{ source: 'old-source' }],
        },
        req,
      } as never),
    ).resolves.toMatchObject({
      sourceReferences: [{ source: 'new-source' }],
    })
    expect(req.payload.db.sessions['test-transaction'].db.execute).toHaveBeenCalledTimes(1)
  })

  it('allows an editor draft revision but blocks an ordinary unpublish write', async () => {
    await expect(
      protectPublishedRuleSet({
        context: {},
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).rejects.toThrow('draft:true')

    const context = {}
    captureEditorialOperation({
      args: { draft: true },
      context,
      operation: 'update',
    } as never)
    await expect(
      protectPublishedRuleSet({
        context,
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).resolves.toMatchObject({ _status: 'draft' })
  })
})

describe('Category workflow', () => {
  it('lets an editor create a draft but not publish it', async () => {
    const context = {}
    captureEditorialOperation({
      args: { draft: true },
      context,
      operation: 'create',
    } as never)

    expect(
      protectCategoryPublication({
        context,
        data: { _status: 'draft', title: 'Draft category' },
        operation: 'create',
        originalDoc: {},
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).toMatchObject({ _status: 'draft' })

    expect(() =>
      protectCategoryPublication({
        context: {},
        data: { _status: 'published' },
        operation: 'update',
        originalDoc: { _status: 'draft' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).toThrow('reviewer немесе admin')
  })

  it('allows only an explicit editor draft save over a published Category', () => {
    expect(() =>
      protectCategoryPublication({
        context: {},
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).toThrow('draft:true')

    const context = {}
    captureEditorialOperation({
      args: { draft: true },
      context,
      operation: 'update',
    } as never)
    expect(
      protectCategoryPublication({
        context,
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published' },
        req: requestFor(['editor'], 'editor-id'),
      } as never),
    ).toMatchObject({ _status: 'draft' })
  })
})
