import { describe, expect, it } from 'vitest'

import {
  buildTaskSearchIndex,
  getQueryLengthBucket,
  getResultCountBucket,
  getSearchResultPositionBucket,
  searchTasks,
  type ScenarioSearchSource,
} from '@/lib/search/tasks'
import { calculatorDefinitions } from '@/modules/calculators/registry'

const scenario = (overrides: Partial<ScenarioSearchSource> = {}): ScenarioSearchSource => ({
  category: 'Мемлекет',
  shortAnswer: 'Жеке кәсіпкерлікті онлайн тіркеуге арналған қадамдар.',
  slug: 'zhk-ashu',
  status: 'published',
  title: 'ЖК қалай ашуға болады?',
  trusted: true,
  ...overrides,
})

describe('task search', () => {
  it('indexes only trusted published scenarios and available calculators', () => {
    const index = buildTaskSearchIndex(
      [
        scenario(),
        scenario({ slug: 'draft', status: 'draft', title: 'Черновик' }),
        scenario({ slug: 'untrusted', title: 'Тексерілмеген', trusted: false }),
      ],
      calculatorDefinitions,
    )

    expect(index.map(({ href }) => href)).toEqual([
      '/scenario/zhk-ashu',
      '/calculator/avtonesie-kalkulyatory',
      '/calculator/zhalaqy-kalkulyatory',
    ])
  })

  it('matches every normalized query token across safe public task fields', () => {
    const index = buildTaskSearchIndex([scenario()], calculatorDefinitions)

    expect(searchTasks(index, '  КӘСІПКЕРЛІК, қадамдар!  ').map(({ href }) => href)).toEqual([
      '/scenario/zhk-ashu',
    ])
    expect(searchTasks(index, 'автонесие төлемді').map(({ href }) => href)).toEqual([
      '/calculator/avtonesie-kalkulyatory',
    ])
    expect(searchTasks(index, '   ')).toEqual([])
  })

  it('finds tasks by measured mixed-language demand aliases', () => {
    const availableCalculators = calculatorDefinitions.map((calculator) => ({
      ...calculator,
      status: 'available' as const,
    }))
    const index = buildTaskSearchIndex([scenario()], availableCalculators)

    expect(searchTasks(index, 'открыть ИП').map(({ href }) => href)).toEqual(['/scenario/zhk-ashu'])
    expect(searchTasks(index, 'кредит на машину').map(({ href }) => href)).toEqual([
      '/calculator/avtonesie-kalkulyatory',
    ])
    expect(searchTasks(index, 'декретные').map(({ href }) => href)).toEqual([
      '/calculator/dekrettik-tolem-kalkulyatory',
    ])
    expect(searchTasks(index, 'зарплата на руки').map(({ href }) => href)).toEqual([
      '/calculator/zhalaqy-kalkulyatory',
    ])
  })

  it('reports only bounded analytics buckets', () => {
    expect(getQueryLengthBucket('x'.repeat(20))).toBe('1-20')
    expect(getQueryLengthBucket('x'.repeat(21))).toBe('21-50')
    expect(getQueryLengthBucket('x'.repeat(50))).toBe('21-50')
    expect(getQueryLengthBucket('x'.repeat(51))).toBe('51+')

    expect([0, 1, 3, 4, 10, 11].map(getResultCountBucket)).toEqual([
      '0',
      '1-3',
      '1-3',
      '4-10',
      '4-10',
      '11+',
    ])
    expect([1, 2, 3, 4, 20].map(getSearchResultPositionBucket)).toEqual([
      '1',
      '2-3',
      '2-3',
      '4+',
      '4+',
    ])
  })
})
