import type { Access, FieldAccess } from 'payload'

export const USER_ROLES = ['admin', 'editor', 'reviewer'] as const

export type UserRole = (typeof USER_ROLES)[number]

type UserLike = {
  id?: number | string | null
  roles?: unknown
}

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole)

export const getUserRoles = (user: unknown): UserRole[] => {
  if (!user || typeof user !== 'object') return []

  const roles = (user as UserLike).roles
  if (!Array.isArray(roles)) return []

  return roles.filter(isUserRole)
}

export const getUserID = (user: unknown): number | string | null => {
  if (!user || typeof user !== 'object') return null

  const id = (user as UserLike).id
  return typeof id === 'string' || typeof id === 'number' ? id : null
}

export const hasAnyRole = (user: unknown, allowedRoles: readonly UserRole[]) =>
  getUserRoles(user).some((role) => allowedRoles.includes(role))

export const adminOnly: Access = ({ req }) => hasAnyRole(req.user, ['admin'])

export const reviewerOrAdmin: Access = ({ req }) => hasAnyRole(req.user, ['admin', 'reviewer'])

export const adminOrSelf: Access = ({ req }) => {
  if (hasAnyRole(req.user, ['admin'])) return true

  const userID = getUserID(req.user)
  if (userID == null) return false

  return {
    id: {
      equals: userID,
    },
  }
}

export const authenticatedField: FieldAccess = ({ req }) => Boolean(req.user)

export const adminField: FieldAccess = ({ req }) => hasAnyRole(req.user, ['admin'])

export const adminOrSelfField: FieldAccess = ({ doc, id, req }) => {
  if (hasAnyRole(req.user, ['admin'])) return true

  const userID = getUserID(req.user)
  const documentID = id ?? getUserID(doc)
  return userID != null && documentID != null && String(userID) === String(documentID)
}

export const reviewerOrAdminField: FieldAccess = ({ req }) =>
  hasAnyRole(req.user, ['admin', 'reviewer'])
