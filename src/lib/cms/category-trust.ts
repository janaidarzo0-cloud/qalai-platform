import { APIError, type PayloadRequest } from 'payload'

const relationshipID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null

  const id = (value as { id?: unknown }).id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

export const assertLinkedCategoryIsPublished = async (
  relationship: unknown,
  req: PayloadRequest,
) => {
  const id = relationshipID(relationship)
  if (id == null) throw new APIError('Сценарий үшін жарамды санат керек.', 400)

  const category = await req.payload.findByID({
    collection: 'categories',
    depth: 0,
    draft: false,
    id,
    overrideAccess: true,
    req,
  })

  if (category._status !== 'published') {
    throw new APIError('Сценарий тек жарияланған санатты пайдалана алады.', 400)
  }
}
