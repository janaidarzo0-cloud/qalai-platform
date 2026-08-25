import type { Access } from 'payload'

import { hasAnyRole } from '@/access/roles'

export const canEditContent: Access = ({ req }) =>
  hasAnyRole(req.user, ['admin', 'editor', 'reviewer'])

export const canUpdateEditorialContent: Access = ({ req }) => {
  return hasAnyRole(req.user, ['admin', 'editor', 'reviewer'])
}

export const adminCanDeleteDraft: Access = ({ req }) => {
  if (!hasAnyRole(req.user, ['admin'])) return false

  return {
    _status: {
      equals: 'draft',
    },
  }
}

export const canUpdateSource: Access = ({ req }) => {
  if (hasAnyRole(req.user, ['admin', 'reviewer'])) return true
  if (!hasAnyRole(req.user, ['editor'])) return false

  return {
    trustTier: {
      equals: 'secondary',
    },
  }
}
