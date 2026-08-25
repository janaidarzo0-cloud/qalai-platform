import type { ScenarioViewModel } from '@/lib/cms/types'
import type { CalculatorDefinition } from '@/modules/calculators/types'

export type ScenarioSearchSource = Pick<
  ScenarioViewModel,
  'category' | 'shortAnswer' | 'slug' | 'status' | 'title'
> & {
  trusted: boolean
}

export type CalculatorSearchSource = Pick<
  CalculatorDefinition,
  'shortTitle' | 'slug' | 'status' | 'summary' | 'title'
>

export type SearchTask = {
  description: string
  href: string
  kind: 'calculator' | 'scenario'
  meta: string
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
      title: scenario.title,
    })),
  ...calculators
    .filter((calculator) => calculator.status === 'available')
    .map((calculator) => ({
      description: calculator.summary,
      href: `/calculator/${calculator.slug}`,
      kind: 'calculator' as const,
      meta: 'Калькулятор',
      title: calculator.title,
    })),
]

export const searchTasks = (tasks: readonly SearchTask[], query: string): SearchTask[] => {
  const tokens = normalize(query).split(' ').filter(Boolean)
  if (tokens.length === 0) return []

  return tasks.filter((task) => {
    const searchableText = normalize(`${task.title} ${task.meta} ${task.description}`)
    return tokens.every((token) => searchableText.includes(token))
  })
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
