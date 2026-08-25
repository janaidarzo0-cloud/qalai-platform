import type { CalculatorKey } from '@/modules/calculators/types'

export type AnalyticsEvent =
  | { name: 'page_view'; path: string }
  | { name: 'scenario_view'; scenarioSlug: string }
  | { name: 'calculator_start'; calculatorKey: CalculatorKey }
  | { name: 'calculator_complete'; calculatorKey: CalculatorKey; outcome: 'success' | 'error' }
  | { name: 'official_link_click'; scenarioSlug: string; publisher: string }
  | { name: 'task_resolved'; scenarioSlug: string; method: 'official-link' | 'feedback' }
  | { name: 'feedback_submitted'; scenarioSlug: string; helpful: boolean }
  | { name: 'search_submitted'; queryLengthBucket: '1-20' | '21-50' | '51+' }

export const ANALYTICS_PRIVACY_RULE =
  'Never send calculator values, names, IIN, phone numbers, email addresses or free-form queries.'
