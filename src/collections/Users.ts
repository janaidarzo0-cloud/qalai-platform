import type { CollectionConfig } from 'payload'

import { adminField, adminOnly, adminOrSelf, adminOrSelfField } from '@/access/roles'
import {
  blockBulkUserMutation,
  enforceFirstAdmin,
  protectLastAdmin,
  protectLastAdminDelete,
} from '@/hooks/users'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['email', 'name', 'roles'],
    useAsTitle: 'email',
  },
  auth: true,
  disableBulkDelete: true,
  disableBulkEdit: true,
  hooks: {
    beforeChange: [enforceFirstAdmin, protectLastAdmin],
    beforeDelete: [protectLastAdminDelete],
    beforeOperation: [blockBulkUserMutation],
  },
  labels: {
    plural: 'Редакторлар',
    singular: 'Редактор',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Аты',
    },
    {
      name: 'roles',
      type: 'select',
      defaultValue: ['editor'],
      hasMany: true,
      access: {
        create: adminField,
        read: adminOrSelfField,
        update: adminField,
      },
      options: [
        { label: 'Әкімші', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
        { label: 'Тексеруші', value: 'reviewer' },
      ],
      required: true,
      saveToJWT: true,
    },
  ],
}
