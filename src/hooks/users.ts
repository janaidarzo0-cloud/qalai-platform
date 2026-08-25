import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeOperationHook,
} from 'payload'

import { getUserRoles, hasAnyRole } from '@/access/roles'
import { acquireTransactionLock, ADMIN_SET_LOCK_KEY } from '@/lib/cms/advisory-lock'

const acquireAdminSetLock = async (req: Parameters<CollectionBeforeChangeHook>[0]['req']) => {
  await acquireTransactionLock(
    req,
    ADMIN_SET_LOCK_KEY,
    'Әкімші рөлдерін тек дерекқор транзакциясында өзгертуге болады.',
  )
}

export const blockBulkUserMutation: CollectionBeforeOperationHook = ({ args, operation }) => {
  if ((operation === 'update' || operation === 'delete') && 'where' in args && args.where != null) {
    throw new APIError(
      'Әкімші рөлдерінің тұтастығын сақтау үшін пайдаланушыларды жаппай өзгертуге немесе жоюға болмайды.',
      403,
    )
  }

  return args
}

export const enforceFirstAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || req.user) return data

  await acquireAdminSetLock(req)

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  })

  if (totalDocs !== 0) {
    throw new APIError('Алғашқы әкімші бұрыннан құрылған. Жүйеге кіріңіз.', 403)
  }

  return {
    ...data,
    roles: ['admin'],
  }
}

export const protectLastAdmin: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || !originalDoc) return data
  if (!Object.prototype.hasOwnProperty.call(data, 'roles')) return data

  await acquireAdminSetLock(req)

  const currentUser = await req.payload.findByID({
    collection: 'users',
    depth: 0,
    id: originalDoc.id,
    overrideAccess: true,
    req,
  })

  if (!getUserRoles(currentUser).includes('admin')) return data
  if (getUserRoles(data).includes('admin')) return data

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    where: {
      roles: {
        contains: 'admin',
      },
    },
  })

  if (totalDocs <= 1) {
    throw new APIError('Соңғы әкімшінің admin рөлін алып тастауға болмайды.', 409)
  }

  return data
}

export const protectLastAdminDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!hasAnyRole(req.user, ['admin'])) {
    throw new APIError('Пайдаланушыны тек әкімші жоя алады.', 403)
  }

  await acquireAdminSetLock(req)

  const user = await req.payload.findByID({
    collection: 'users',
    depth: 0,
    id,
    overrideAccess: true,
    req,
  })

  if (!getUserRoles(user).includes('admin')) return

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    where: {
      roles: {
        contains: 'admin',
      },
    },
  })

  if (totalDocs <= 1) {
    throw new APIError('Соңғы әкімшіні жоюға болмайды.', 409)
  }
}
