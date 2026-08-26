import type { ScenarioViewModel } from '@/lib/cms/types'
import type { TaskRef } from '@/lib/analytics/events'
import type { CalculatorDefinition } from '@/modules/calculators/types'

import { getCalculatorSearchAliases, getScenarioSearchAliases } from './aliases'

export type ScenarioSearchSource = Pick<
  ScenarioViewModel,
  'category' | 'shortAnswer' | 'slug' | 'status' | 'title'
> & {
  trusted: boolean
}

export type CalculatorSearchSource = Pick<
  CalculatorDefinition,
  'key' | 'shortTitle' | 'slug' | 'status' | 'summary' | 'title'
>

export type SearchTask = {
  description: string
  href: string
  kind: 'calculator' | 'scenario'
  meta: string
  searchAliases: readonly string[]
  task: TaskRef
  title: string
}

export type QueryLengthBucket = '1-20' | '21-50' | '51+'
export type ResultCountBucket = '0' | '1-3' | '4-10' | '11+'

const normalize = (value: string) =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase('kk-KZ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

export const buildTaskSearchIndex = (
  scenarios: readonly ScenarioSearchSource[],
  calculators: readonly CalculatorSearchSource[],
): SearchTask[] => [
  ...scenarios
    .filter((scenario) => scenario.status === 'published' && scenario.trusted)
    .map((scenario) => ({
      description: scenario.shortAnswer,
      href: `/scenario/${scenario.slug}`,
      kind: 'scenario' as const,
      meta: scenario.category,
      searchAliases: getScenarioSearchAliases(scenario.slug),
      task: { key: scenario.slug, type: 'scenario' as const },
      title: scenario.title,
    })),
  ...calculators
    .filter((calculator) => calculator.status === 'available')
    .map((calculator) => ({
      description: calculator.summary,
      href: `/calculator/${calculator.slug}`,
      kind: 'calculator' as const,
      meta: 'Калькулятор',
      searchAliases: getCalculatorSearchAliases(calculator.key),
      task: { key: calculator.key, type: 'calculator' as const },
      title: calculator.title,
    })),
]

export const searchTasks = (tasks: readonly SearchTask[], query: string): SearchTask[] => {
  const normalizedQuery = normalize(query)
  const tokens = normalizedQuery.split(' ').filter(Boolean)
  if (tokens.length === 0) return []

  return tasks
    .map((task, index) => {
      const fields = [task.title, task.meta, task.description, ...task.searchAliases].map(normalize)
      const searchableText = fields.join(' ')
      if (!tokens.every((token) => searchableText.includes(token))) return null

      const score = fields.includes(normalizedQuery)
        ? 3
        : fields.some((field) => field.startsWith(normalizedQuery))
          ? 2
          : normalize(task.title).includes(normalizedQuery)
            ? 1
            : 0

      return { index, score, task }
    })
    .filter((match): match is NonNullable<typeof match> => match != null)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ task }) => task)
}

export const getQueryLengthBucket = (query: string): QueryLengthBucket => {
  const length = query.trim().length
  if (length <= 20) return '1-20'
  if (length <= 50) return '21-50'
  return '51+'
}

export const getResultCountBucket = (count: number): ResultCountBucket => {
  if (count === 0) return '0'
  if (count <= 3) return '1-3'
  if (count <= 10) return '4-10'
  return '11+'
}

export type SearchResultPositionBucket = '1' | '2-3' | '4+'

export const getSearchResultPositionBucket = (position: number): SearchResultPositionBucket => {
  if (position <= 1) return '1'
  if (position <= 3) return '2-3'
  return '4+'
}
