export const calculatorKeys = [
  'maternity-benefit',
  'childcare-benefit',
  'vehicle-tax',
  'auto-loan',
  'salary',
] as const

export type CalculatorKey = (typeof calculatorKeys)[number]
export type CalculatorStatus = 'available' | 'source-review'

export type CalculatorDefinition = {
  key: CalculatorKey
  slug: string
  title: string
  shortTitle: string
  summary: string
  status: CalculatorStatus
  formulaVersion?: string
}
