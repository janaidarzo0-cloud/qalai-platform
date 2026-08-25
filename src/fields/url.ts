import type { Field } from 'payload'

export const validateHTTPSURL = (value: unknown, required = false) => {
  if (value == null || value === '') return required ? 'HTTPS сілтемесі міндетті.' : true
  if (typeof value !== 'string') return 'Сілтеме мәтін болуы керек.'

  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? true : 'Тек HTTPS сілтемесін пайдаланыңыз.'
  } catch {
    return 'Дұрыс HTTPS сілтемесін енгізіңіз.'
  }
}

export const httpsURLField = ({
  name = 'url',
  required = false,
}: {
  name?: string
  required?: boolean
} = {}): Field => ({
  name,
  type: 'text',
  required,
  validate: (value: unknown) => validateHTTPSURL(value, required),
})
