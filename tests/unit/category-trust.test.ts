import { describe, expect, it, vi } from 'vitest'

import { captureEditorialOperation } from '@/hooks/editorial'
import {
  protectReferencedCategoryChange,
  protectReferencedCategoryDelete,
} from '@/hooks/categories'
import { assertLinkedCategoryIsPublished } from '@/lib/cms/category-trust'

const transactionalRequest = (totalDocs = 0) => ({
  payload: {
    count: vi.fn(async () => ({ totalDocs })),
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
})

describe('Category draft isolation', () => {
  it('accepts only a published Category for a published Scenario', async () => {
    const publishedRequest = {
      payload: {
        findByID: vi.fn(async () => ({ _status: 'published', id: 'category-id' })),
      },
    }
    const draftRequest = {
      payload: {
        findByID: vi.fn(async () => ({ _status: 'draft', id: 'category-id' })),
      },
    }

    await expect(
      assertLinkedCategoryIsPublished('category-id', publishedRequest as never),
    ).resolves.toBeUndefined()
    await expect(
      assertLinkedCategoryIsPublished('category-id', draftRequest as never),
    ).rejects.toThrow('жарияланған санатты')
    expect(publishedRequest.payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'categories', draft: false }),
    )
  })

  it('blocks unpublishing or deleting a Category used by published content', async () => {
    const changeRequest = transactionalRequest(1)
    const deleteRequest = transactionalRequest(1)

    await expect(
      protectReferencedCategoryChange({
        context: {},
        data: { _status: 'draft' },
        operation: 'update',
        originalDoc: { _status: 'published', id: 'category-id' },
        req: changeRequest,
      } as never),
    ).rejects.toThrow('жарияланымнан алып тастауға')
    await expect(
      protectReferencedCategoryDelete({ id: 'category-id', req: deleteRequest } as never),
    ).rejects.toThrow('жарияланымнан алып тастауға')
  })

  it('allows a draft revision without replacing the published Category', async () => {
    const context = {}
    captureEditorialOperation({
      args: { data: { _status: 'draft' }, draft: true },
      context,
      operation: 'update',
    } as never)
    const req = transactionalRequest(1)

    await expect(
      protectReferencedCategoryChange({
        context,
        data: { _status: 'draft', title: 'Жаңа атау' },
        operation: 'update',
        originalDoc: { _status: 'published', id: 'category-id', title: 'Ескі атау' },
        req,
      } as never),
    ).resolves.toMatchObject({ title: 'Жаңа атау' })
    expect(req.payload.count).not.toHaveBeenCalled()
  })
})
