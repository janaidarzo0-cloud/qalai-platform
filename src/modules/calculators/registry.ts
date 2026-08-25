import type { CalculatorDefinition, CalculatorKey } from './types'

export const calculatorDefinitions = [
  {
    key: 'maternity-benefit',
    slug: 'dekrettik-tolem-kalkulyatory',
    title: 'Декреттік төлем калькуляторы',
    shortTitle: 'Декреттік төлем',
    summary: 'Төлем мөлшерін есептеп, формула мен келесі қадамдарды түсіндіреді.',
    status: 'source-review',
  },
  {
    key: 'childcare-benefit',
    slug: 'bala-kutimi-tolemi',
    title: 'Бала күтімі төлемі',
    shortTitle: 'Бала күтімі',
    summary: 'Ай сайынғы төлемді ресми ережелер бойынша есептеуге арналған модуль.',
    status: 'source-review',
  },
  {
    key: 'vehicle-tax',
    slug: 'kolik-salygy-kalkulyatory',
    title: 'Көлік салығы калькуляторы',
    shortTitle: 'Көлік салығы',
    summary: 'Көлік параметрлері мен жыл бойынша салықты түсінікті түрде есептейді.',
    status: 'source-review',
  },
  {
    key: 'auto-loan',
    slug: 'avtonesie-kalkulyatory',
    title: 'Автонесие калькуляторы',
    shortTitle: 'Автонесие',
    summary: 'Ай сайынғы төлемді, жалпы төлемді және артық төлемді есептеңіз.',
    status: 'available',
    formulaVersion: 'annuity-v1',
  },
  {
    key: 'salary',
    slug: 'zhalaqy-kalkulyatory',
    title: 'Жалақы калькуляторы',
    shortTitle: 'Жалақы',
    summary: 'Жалақыдан ұсталымдар мен қолға түсетін соманы есептеуге арналған модуль.',
    status: 'source-review',
  },
] as const satisfies readonly CalculatorDefinition[]

export const calculatorOptions = calculatorDefinitions.map(({ key, title }) => ({
  label: title,
  value: key,
}))

export const getCalculatorBySlug = (slug: string) =>
  calculatorDefinitions.find((calculator) => calculator.slug === slug)

export const getCalculatorByKey = (key: CalculatorKey) =>
  calculatorDefinitions.find((calculator) => calculator.key === key)
