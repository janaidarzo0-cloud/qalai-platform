import type { TaskRef } from '@/lib/analytics/events'

export type PublicLaunchCandidate = {
  demandScore: number
  label: string
  task: TaskRef
  tier: 'core' | 'supporting'
}

export const publicLaunchCohort = [
  {
    demandScore: 95,
    label: 'ЭЦҚ алу',
    task: { key: 'etsq-alu', type: 'scenario' },
    tier: 'core',
  },
  {
    demandScore: 94,
    label: 'Жалақы калькуляторы',
    task: { key: 'salary', type: 'calculator' },
    tier: 'core',
  },
  {
    demandScore: 90,
    label: 'ЖК, өзін-өзі жұмыспен қамту және 2026 салық режимі',
    task: { key: 'zhk-nemese-ozin-ozi-zhumyspen-kamtu', type: 'scenario' },
    tier: 'core',
  },
  {
    demandScore: 87,
    label: 'Айыппұлды тексеру және төлеу',
    task: { key: 'ayypuldardy-tekseru-zhane-toleu', type: 'scenario' },
    tier: 'core',
  },
  {
    demandScore: 86,
    label: 'Жұмыссыз ретінде тіркелу және төлем алу',
    task: { key: 'zhumyssyz-retinde-tirkelu-zhane-tolem', type: 'scenario' },
    tier: 'core',
  },
  {
    demandScore: 63,
    label: 'Автонесие калькуляторы',
    task: { key: 'auto-loan', type: 'calculator' },
    tier: 'supporting',
  },
] as const satisfies readonly PublicLaunchCandidate[]

const publicLaunchTaskIDs = new Set(
  publicLaunchCohort.map(({ task }) => `${task.type}:${task.key}`),
)

export const isPublicLaunchTask = (task: TaskRef): boolean =>
  publicLaunchTaskIDs.has(`${task.type}:${task.key}`)

export const getPublicLaunchCandidate = (task: TaskRef): PublicLaunchCandidate | undefined =>
  publicLaunchCohort.find(
    (candidate) => candidate.task.type === task.type && candidate.task.key === task.key,
  )
