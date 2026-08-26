import { z } from 'zod'

export const ANALYTICS_SCHEMA_VERSION = 1 as const

export const taskSurfaceSchema = z.enum(['scenario', 'calculator'])
export type TaskSurface = z.infer<typeof taskSurfaceSchema>

export const resolutionMethodSchema = z.enum([
  'calculation',
  'official-transition',
  'helpful-feedback',
])
export type ResolutionMethod = z.infer<typeof resolutionMethodSchema>

const taskKeySchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const taskRefSchema = z
  .object({
    key: taskKeySchema,
    type: taskSurfaceSchema,
  })
  .strict()

export type TaskRef = z.infer<typeof taskRefSchema>

export const safePublicPathSchema = z
  .string()
  .max(180)
  .refine(
    (path) =>
      path === '/' ||
      /^\/scenario\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ||
      /^\/calculator\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path),
    'Only canonical public QALAI paths are allowed.',
  )
  .refine((path) => !path.includes('-demo'), 'Demo routes are not measurable.')

const taskOpenedEventSchema = z
  .object({
    name: z.literal('task_opened'),
    task: taskRefSchema,
  })
  .strict()

const calculatorTaskSchema = taskRefSchema.refine((task) => task.type === 'calculator', {
  message: 'Calculator events require a calculator task.',
})

const scenarioTaskSchema = taskRefSchema.refine((task) => task.type === 'scenario', {
  message: 'Scenario events require a scenario task.',
})

export const clientAnalyticsEventSchema = z.discriminatedUnion('name', [
  z
    .object({
      name: z.literal('page_view'),
      path: safePublicPathSchema,
    })
    .strict(),
  taskOpenedEventSchema,
  z
    .object({
      name: z.literal('calculator_start'),
      task: calculatorTaskSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal('calculator_complete'),
      outcome: z.enum(['success', 'error']),
      task: calculatorTaskSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal('official_link_click'),
      task: scenarioTaskSchema,
    })
    .strict(),
  z
    .object({
      helpful: z.boolean(),
      name: z.literal('feedback_submitted'),
      task: scenarioTaskSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal('search_submitted'),
      queryLengthBucket: z.enum(['1-20', '21-50', '51+']),
      resultCountBucket: z.enum(['0', '1-3', '4-10', '11+']),
    })
    .strict(),
  z
    .object({
      destination: taskRefSchema,
      name: z.literal('internal_task_link_click'),
      task: taskRefSchema,
    })
    .strict(),
])

export type AnalyticsEvent = z.infer<typeof clientAnalyticsEventSchema>

export const analyticsEnvelopeSchema = z
  .object({
    event: clientAnalyticsEventSchema,
    eventId: z.uuid(),
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
  })
  .strict()

export type AnalyticsEnvelope = z.infer<typeof analyticsEnvelopeSchema>

export type ResolvedTaskEvent = {
  name: 'task_resolved'
  resolutionMethod: ResolutionMethod
  task: TaskRef
}

export type ProviderAnalyticsEvent = AnalyticsEvent | ResolvedTaskEvent

export const serializeAnalyticsEvent = (event: unknown): AnalyticsEvent | null => {
  const parsed = clientAnalyticsEventSchema.safeParse(event)
  return parsed.success ? parsed.data : null
}

export const deriveTaskResolution = (event: AnalyticsEvent): ResolvedTaskEvent | null => {
  if (event.name === 'calculator_complete' && event.outcome === 'success') {
    return { name: 'task_resolved', resolutionMethod: 'calculation', task: event.task }
  }

  if (event.name === 'official_link_click') {
    return {
      name: 'task_resolved',
      resolutionMethod: 'official-transition',
      task: event.task,
    }
  }

  if (event.name === 'feedback_submitted' && event.helpful) {
    return {
      name: 'task_resolved',
      resolutionMethod: 'helpful-feedback',
      task: event.task,
    }
  }

  return null
}

export const ANALYTICS_PRIVACY_RULE =
  'Only allowlisted task identifiers and buckets may leave the browser. Never send calculator values or results, names, IIN, contacts, full URLs, referrers, Payload drafts or free-form queries.'
