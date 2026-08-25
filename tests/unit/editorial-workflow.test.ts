import { describe, expect, it } from 'vitest'

import {
  captureEditorialOperation,
  createClosedAlphaImportContext,
  isClosedAlphaDraftImport,
} from '@/hooks/editorial'
import { prepareEditorialVerification } from '@/lib/cms/editorial-workflow'

const NOW = new Date('2026-08-25T08:00:00.000Z')
const MATERIAL_FIELDS = ['title', 'steps', 'sourceReferences'] as const

const verifiedDocument = {
  sourceReferences: [{ source: 'source-id' }],
  steps: [{ title: 'Old step' }],
  title: 'Old title',
  verification: {
    nextReviewAt: '2026-09-25T00:00:00.000Z',
    reviewedAt: '2026-08-24T00:00:00.000Z',
    reviewedBy: 'old-reviewer',
    riskLevel: 'medium',
    status: 'verified',
  },
}

describe('closed-alpha import boundary', () => {
  it('uses a process-global non-serializable token across module loaders', () => {
    expect(createClosedAlphaImportContext().qalaiClosedAlphaImport).toBe(
      Symbol.for('qalai.closed-alpha-import.v1'),
    )
  })

  const draftContext = () => {
    const context = createClosedAlphaImportContext()
    captureEditorialOperation({
      args: { data: { _status: 'draft' }, draft: true },
      context,
      operation: 'create',
    } as unknown as Parameters<typeof captureEditorialOperation>[0])
    return context
  }

  it('requires the internal token and high-risk unverified draft state', () => {
    const data = {
      _status: 'draft',
      verification: { notes: 'Internal evidence', riskLevel: 'high', status: 'unverified' },
    }

    expect(isClosedAlphaDraftImport({ context: draftContext(), data, operation: 'create' })).toBe(
      true,
    )
    expect(
      isClosedAlphaDraftImport({
        context: draftContext(),
        data: { ...data, verification: { ...data.verification, status: 'verified' } },
        operation: 'create',
      }),
    ).toBe(false)
    expect(isClosedAlphaDraftImport({ context: draftContext(), data, operation: 'update' })).toBe(
      true,
    )
    expect(
      isClosedAlphaDraftImport({
        context: { qalaiClosedAlphaImport: true, qalaiDraftSave: true },
        data,
        operation: 'create',
      }),
    ).toBe(false)
  })

  it('preserves alpha notes through Payload draft versioning update', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: {
        _status: 'draft',
        verification: {
          nextReviewAt: '2026-09-25T00:00:00.000Z',
          notes: 'ЖАРИЯЛАУҒА БОЛМАЙДЫ',
          riskLevel: 'high',
          status: 'unverified',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: { _status: 'draft', id: 123 },
      reviewerID: null,
      trustedUnverifiedImport: true,
      willBePublished: false,
    })

    expect(result.verification).toEqual({
      nextReviewAt: '2026-09-25T00:00:00.000Z',
      notes: 'ЖАРИЯЛАУҒА БОЛМАЙДЫ',
      riskLevel: 'high',
      status: 'unverified',
    })
  })
})

describe('editorial verification transitions', () => {
  it('forces editor-created content to an unverified high-risk state', () => {
    const result = prepareEditorialVerification({
      canReview: false,
      data: {
        title: 'Draft',
        verification: {
          reviewedBy: 'forged-reviewer',
          status: 'verified',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'create',
      originalDoc: {},
      reviewerID: 'editor-id',
      willBePublished: false,
    })

    expect(result.verification).toEqual({ riskLevel: 'high', status: 'unverified' })
  })

  it('invalidates an old review when an editor changes factual content', () => {
    const result = prepareEditorialVerification({
      canReview: false,
      data: { steps: [{ title: 'New step' }] },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: verifiedDocument,
      reviewerID: 'editor-id',
      willBePublished: false,
    })

    expect(result.verification).toMatchObject({
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    })
  })

  it('does not let an editor forge reviewer metadata on a partial update', () => {
    const result = prepareEditorialVerification({
      canReview: false,
      data: {
        verification: {
          reviewedAt: '2030-01-01T00:00:00.000Z',
          reviewedBy: 'forged-reviewer',
          status: 'verified',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: {
        ...verifiedDocument,
        verification: { riskLevel: 'high', status: 'unverified' },
      },
      reviewerID: 'editor-id',
      willBePublished: false,
    })

    expect(result.verification).toEqual({ riskLevel: 'high', status: 'unverified' })
  })

  it('stamps the authenticated reviewer instead of client-supplied metadata', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: {
        verification: {
          nextReviewAt: '2026-09-25T00:00:00.000Z',
          reviewedAt: '2030-01-01T00:00:00.000Z',
          reviewedBy: 'forged-reviewer',
          riskLevel: 'medium',
          status: 'verified',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: {
        ...verifiedDocument,
        verification: { riskLevel: 'medium', status: 'in-review' },
      },
      reviewerID: 'reviewer-id',
      willBePublished: false,
    })

    expect(result.verification).toMatchObject({
      reviewedAt: NOW.toISOString(),
      reviewedBy: 'reviewer-id',
      status: 'verified',
    })
  })

  it('requires an authenticated reviewer identity for verified publication', () => {
    expect(() =>
      prepareEditorialVerification({
        canReview: true,
        data: { verification: verifiedDocument.verification },
        materialFields: MATERIAL_FIELDS,
        now: NOW,
        operation: 'update',
        originalDoc: {
          ...verifiedDocument,
          verification: { ...verifiedDocument.verification, status: 'in-review' },
        },
        reviewerID: null,
        willBePublished: true,
      }),
    ).toThrow('reviewer/admin')
  })

  it('keeps review valid for a non-material editor update', () => {
    const result = prepareEditorialVerification({
      canReview: false,
      data: { updatedAt: NOW.toISOString() },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: verifiedDocument,
      reviewerID: 'editor-id',
      willBePublished: false,
    })

    expect(result.verification).toEqual(verifiedDocument.verification)
  })

  it('requires a separate review save after a reviewer changes factual content', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: {
        steps: [{ title: 'New step' }],
        verification: {
          ...verifiedDocument.verification,
          reviewedAt: '2030-01-01T00:00:00.000Z',
          reviewedBy: 'forged-reviewer',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: verifiedDocument,
      reviewerID: 'reviewer-id',
      willBePublished: false,
    })

    expect(result.verification).toMatchObject({
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    })
  })

  it('does not accept verified metadata alongside a material change from in-review', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: {
        title: 'New title',
        verification: {
          ...verifiedDocument.verification,
          reviewedAt: '2030-01-01T00:00:00.000Z',
          reviewedBy: 'forged-reviewer',
          status: 'verified',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: {
        ...verifiedDocument,
        verification: { ...verifiedDocument.verification, status: 'in-review' },
      },
      reviewerID: 'reviewer-id',
      willBePublished: false,
    })

    expect(result.verification).toMatchObject({
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    })
  })

  it('preserves reviewer metadata on a non-material published update', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: {
        updatedAt: NOW.toISOString(),
        verification: verifiedDocument.verification,
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: { ...verifiedDocument, _status: 'published' },
      reviewerID: 'different-reviewer',
      willBePublished: true,
    })

    expect(result.verification).toEqual(verifiedDocument.verification)
  })

  it('preserves the factual reviewer when another reviewer publishes an already verified draft', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: { _status: 'published', verification: verifiedDocument.verification },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: { ...verifiedDocument, _status: 'draft' },
      reviewerID: 'publisher-id',
      willBePublished: true,
    })

    expect(result.verification).toEqual(verifiedDocument.verification)
  })

  it('attributes an extended review window to the current reviewer', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: {
        verification: {
          ...verifiedDocument.verification,
          nextReviewAt: '2026-10-25T00:00:00.000Z',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: {
        ...verifiedDocument,
        verification: {
          ...verifiedDocument.verification,
          nextReviewAt: '2026-08-24T00:00:00.000Z',
        },
      },
      reviewerID: 'renewing-reviewer',
      willBePublished: true,
    })

    expect(result.verification).toMatchObject({
      nextReviewAt: '2026-10-25T00:00:00.000Z',
      reviewedAt: NOW.toISOString(),
      reviewedBy: 'renewing-reviewer',
      status: 'verified',
    })
  })

  it('attributes a partial review-window update to the current reviewer', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: {
        verification: {
          nextReviewAt: '2026-10-25T00:00:00.000Z',
        },
      },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'update',
      originalDoc: verifiedDocument,
      reviewerID: 'renewing-reviewer',
      willBePublished: true,
    })

    expect(result.verification).toMatchObject({
      nextReviewAt: '2026-10-25T00:00:00.000Z',
      reviewedAt: NOW.toISOString(),
      reviewedBy: 'renewing-reviewer',
      status: 'verified',
    })
  })

  it('resets review when duplicating a published document as a draft or published copy', () => {
    const result = prepareEditorialVerification({
      canReview: true,
      data: { verification: verifiedDocument.verification },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'create',
      originalDoc: { ...verifiedDocument, _status: 'published' },
      reviewerID: 'new-reviewer',
      willBePublished: true,
    })

    expect(result.verification).toMatchObject({
      nextReviewAt: null,
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    })

    const draftResult = prepareEditorialVerification({
      canReview: true,
      data: { verification: verifiedDocument.verification },
      materialFields: MATERIAL_FIELDS,
      now: NOW,
      operation: 'create',
      originalDoc: { ...verifiedDocument, _status: 'published' },
      reviewerID: 'new-reviewer',
      willBePublished: false,
    })
    expect(draftResult.verification).toMatchObject({
      nextReviewAt: null,
      reviewedAt: null,
      reviewedBy: null,
      status: 'in-review',
    })
  })
})
