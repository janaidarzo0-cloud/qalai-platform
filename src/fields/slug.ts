import type { Field } from 'payload'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const slugField = (): Field => ({
  name: 'slug',
  type: 'text',
  admin: {
    description:
      'Тұрақты URL: латын әріптері, сандар және дефис. Жарияланғаннан кейін өзгертпеңіз.',
    position: 'sidebar',
  },
  index: true,
  required: true,
  unique: true,
  validate: (value: unknown) => {
    if (typeof value !== 'string' || !slugPattern.test(value)) {
      return 'Slug тек кіші латын әріптері, сандар және дефистерден тұруы керек.'
    }

    return true
  },
})
