import path from 'node:path'

import { APIError } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  assertMediaFileSize,
  createMediaCollection,
  rejectMediaDocumentPrefix,
  validateMediaAlt,
} from '@/collections/Media'
import { MAX_MEDIA_FILE_BYTES, MEDIA_MIME_TYPES } from '@/lib/env/media'

const staticDir = path.resolve('.data/media')
const Media = createMediaCollection(staticDir)
const accessArgs = (roles?: string[]) =>
  ({
    req: {
      user: roles ? { id: 'user-1', roles } : null,
    },
  }) as never

describe('Media collection access', () => {
  it.each([
    [undefined, true, false, false, false],
    [['editor'], true, true, true, false],
    [['reviewer'], true, true, true, false],
    [['admin'], true, true, true, true],
  ])('applies the role matrix for %j', (roles, mayRead, mayCreate, mayUpdate, mayDelete) => {
    expect(Media.access?.read?.(accessArgs(roles))).toBe(mayRead)
    expect(Media.access?.create?.(accessArgs(roles))).toBe(mayCreate)
    expect(Media.access?.update?.(accessArgs(roles))).toBe(mayUpdate)
    expect(Media.access?.delete?.(accessArgs(roles))).toBe(mayDelete)
  })
})

describe('Media editorial schema', () => {
  const altField = Media.fields.find((field) => 'name' in field && field.name === 'alt')
  const prefixField = Media.fields.find((field) => 'name' in field && field.name === 'prefix')
  const upload = typeof Media.upload === 'object' ? Media.upload : undefined

  it('requires concise localized alternative text', () => {
    expect(altField).toMatchObject({
      localized: true,
      maxLength: 180,
      required: true,
      type: 'text',
    })
    expect(validateMediaAlt('')).toBeTypeOf('string')
    expect(validateMediaAlt('   ')).toBeTypeOf('string')
    expect(validateMediaAlt('ХҚКО ғимаратының кіреберісі')).toBe(true)
  })

  it('accepts only the four raster formats used by QALAI', () => {
    expect(upload?.mimeTypes).toEqual(['image/avif', 'image/jpeg', 'image/png', 'image/webp'])
    expect(MEDIA_MIME_TYPES).toHaveLength(4)
    expect(upload?.mimeTypes).not.toContain('image/svg+xml')
    expect(upload?.mimeTypes).not.toContain('image/gif')
    expect(upload?.mimeTypes).not.toContain('application/pdf')
  })

  it('disables risky or unnecessary upload conveniences', () => {
    expect(upload).toMatchObject({
      bulkUpload: false,
      crop: false,
      filesRequiredOnCreate: true,
      focalPoint: false,
      pasteURL: false,
      staticDir,
    })
    expect(upload?.imageSizes).toBeUndefined()
  })

  it('enforces the 3 MB boundary for Local API uploads', () => {
    expect(MAX_MEDIA_FILE_BYTES).toBe(3_000_000)
    expect(() => assertMediaFileSize({ size: MAX_MEDIA_FILE_BYTES })).not.toThrow()

    try {
      assertMediaFileSize({ size: MAX_MEDIA_FILE_BYTES + 1 })
      throw new Error('Expected the oversized upload to be rejected.')
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(413)
    }
  })

  it('uses the real Local API buffer size and rejects document-level storage prefixes', () => {
    expect(() =>
      assertMediaFileSize({ data: Buffer.alloc(MAX_MEDIA_FILE_BYTES + 1), size: 1 }),
    ).toThrow('3 МБ')

    expect(() =>
      rejectMediaDocumentPrefix({ data: { prefix: 'scenario%2F2026' } } as never),
    ).toThrow('бумасын')
    expect(rejectMediaDocumentPrefix({ data: { prefix: '' } } as never)).toEqual({ prefix: '' })
    expect(prefixField).toMatchObject({
      access: { create: expect.any(Function), update: expect.any(Function) },
      admin: { hidden: true, readOnly: true },
      defaultValue: '',
    })

    if (!prefixField || !('access' in prefixField)) {
      throw new Error('Expected the locked Media prefix field.')
    }
    expect(prefixField.access?.create?.(accessArgs(['admin']))).toBe(false)
    expect(prefixField.access?.update?.(accessArgs(['admin']))).toBe(false)
  })
})
