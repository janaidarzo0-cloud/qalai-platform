import config from '@payload-config'
import { createHmac } from 'node:crypto'
import { getPayload } from 'payload'

import { getScenarioBySlug } from '@/lib/cms/scenarios'
import { calculatorDefinitions } from '@/modules/calculators/registry'

import { getServerAnalyticsConfig } from './config'
import {
  deriveTaskResolution,
  type AnalyticsEnvelope,
  type ProviderAnalyticsEvent,
  type ResolutionMethod,
  type TaskRef,
} from './events'
import { getAnalyticsProvider } from './providers'

export const ANALYTICS_SESSION_COOKIE = 'qalai_asid'
export const ANALYTICS_CONSENT_COOKIE = 'qalai_analytics_consent'
export const ANALYTICS_INTERNAL_COOKIE = 'qalai_internal_qa'
export const ANALYTICS_SESSION_SECONDS = 30 * 60
export const ANALYTICS_CONSENT_SECONDS = 365 * 24 * 60 * 60

export const hashAnalyticsIdentifier = (secret: string, value: string) =>
  createHmac('sha256', secret).update(value).digest('hex')

export const isDuplicateDatabaseError = (error: unknown): boolean => {
  let candidate: unknown = error
  for (let depth = 0; depth < 5 && candidate && typeof candidate === 'object'; depth += 1) {
    if ('code' in candidate && candidate.code === '23505') return true
    candidate = 'cause' in candidate ? candidate.cause : null
  }
  return false
}

export const isTaskEligibleForAnalytics = async (task: TaskRef): Promise<boolean> => {
  if (task.type === 'calculator') {
    return calculatorDefinitions.some(
      (calculator) => calculator.key === task.key && calculator.status === 'available',
    )
  }

  return (await getScenarioBySlug(task.key)) != null
}

type ResolutionRecord = {
  dedupeKey: string
  resolutionMethod: ResolutionMethod
  resolvedAt: string
  schemaVersion: number
  sessionHash: string
  taskKey: string
  taskType: TaskRef['type']
}

export const createResolutionRecord = ({
  resolutionMethod,
  sessionID,
  task,
}: {
  resolutionMethod: ResolutionMethod
  sessionID: string
  task: TaskRef
}): ResolutionRecord => {
  const { hashSecret } = getServerAnalyticsConfig()
  if (!hashSecret) throw new Error('ANALYTICS_HASH_SECRET is required for Resolved Tasks.')

  return {
    dedupeKey: hashAnalyticsIdentifier(hashSecret, `${sessionID}|${task.type}|${task.key}`),
    resolutionMethod,
    resolvedAt: new Date().toISOString(),
    schemaVersion: 1,
    sessionHash: hashAnalyticsIdentifier(hashSecret, sessionID),
    taskKey: task.key,
    taskType: task.type,
  }
}

const persistResolution = async (record: ResolutionRecord): Promise<boolean> => {
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'resolved-tasks',
    limit: 1,
    overrideAccess: true,
    where: { dedupeKey: { equals: record.dedupeKey } },
  })
  if (existing.totalDocs > 0) return false

  try {
    await payload.create({
      collection: 'resolved-tasks',
      data: record,
      overrideAccess: true,
    })
    return true
  } catch (error) {
    if (isDuplicateDatabaseError(error)) return false
    throw error
  }
}

const sendBestEffort = async (
  envelope: AnalyticsEnvelope,
  sessionHash: string,
  event: ProviderAnalyticsEvent = envelope.event,
) => {
  const analyticsConfig = getServerAnalyticsConfig()
  if (!analyticsConfig.environment) return

  try {
    await getAnalyticsProvider().send({
      environment: analyticsConfig.environment,
      event,
      eventId: envelope.eventId,
      sessionHash,
    })
  } catch {
    console.error('Analytics provider delivery failed.')
  }
}

export type IngestResult = 'accepted' | 'duplicate' | 'ineligible'

export const ingestAnalyticsEnvelope = async ({
  envelope,
  sessionID,
}: {
  envelope: AnalyticsEnvelope
  sessionID: string
}): Promise<IngestResult> => {
  const task = 'task' in envelope.event ? envelope.event.task : null
  if (task && !(await isTaskEligibleForAnalytics(task))) return 'ineligible'
  if (
    envelope.event.name === 'internal_task_link_click' &&
    !(await isTaskEligibleForAnalytics(envelope.event.destination))
  ) {
    return 'ineligible'
  }

  const config = getServerAnalyticsConfig()
  if (!config.hashSecret) return 'ineligible'
  const sessionHash = hashAnalyticsIdentifier(config.hashSecret, sessionID)
  const resolution = deriveTaskResolution(envelope.event)

  if (!resolution) {
    await sendBestEffort(envelope, sessionHash)
    return 'accepted'
  }

  const created = await persistResolution(
    createResolutionRecord({
      resolutionMethod: resolution.resolutionMethod,
      sessionID,
      task: resolution.task,
    }),
  )

  await sendBestEffort(envelope, sessionHash)
  if (!created) return 'duplicate'

  await sendBestEffort(envelope, sessionHash, resolution)
  return 'accepted'
}
