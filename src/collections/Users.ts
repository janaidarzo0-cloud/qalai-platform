import type { Access, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

const authenticatedOrFirstUser: Access = async ({ req }) => {
  if (req.user) return true

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  return totalDocs === 0
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: authenticatedOrFirstUser,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['email', 'name', 'roles'],
    useAsTitle: 'email',
  },
  auth: true,
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
