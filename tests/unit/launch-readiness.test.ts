import { describe, expect, it } from 'vitest'

import { demoScenarios } from '@/content/demo-scenarios'
import { isPublicLaunchTask, publicLaunchCohort } from '@/lib/launch/cohort'
import { assessPublicLaunchReadiness } from '@/lib/launch/readiness'
import { calculatorDefinitions } from '@/modules/calculators/registry'

describe('public launch cohort', () => {
  it('freezes the demand-led core and excludes lower-priority tasks', () => {
    expect(
      publicLaunchCohort
        .filter(({ tier }) => tier === 'core')
        .map(({ demandScore }) => demandScore),
    ).toEqual([95, 94, 90, 87, 86])
    expect(isPublicLaunchTask({ key: 'auto-loan', type: 'calculator' })).toBe(true)
    expect(isPublicLaunchTask({ key: 'vehicle-tax', type: 'calculator' })).toBe(false)
    expect(isPublicLaunchTask({ key: 'zheke-kualik-merzimi-ayaktaldy', type: 'scenario' })).toBe(
      false,
    )
  })

  it('reports the actual closed-alpha blockers without approving content', () => {
    const report = assessPublicLaunchReadiness({
      calculators: calculatorDefinitions,
      configurationBlockers: ['explicit-approval-required'],
      scenarios: demoScenarios,
    })

    expect(report.ready).toBe(false)
    expect(report.configurationBlockers).toEqual(['explicit-approval-required'])
    expect(report.candidates.find(({ task }) => task.key === 'auto-loan')?.ready).toBe(true)
    expect(report.candidates.find(({ task }) => task.key === 'salary')?.blockers).toContain(
      'calculator-not-available',
    )
    expect(report.candidates.find(({ task }) => task.key === 'etsq-alu')?.blockers).toEqual(
      expect.arrayContaining([
        'scenario-not-published',
        'scenario-not-trusted',
        'scenario-noindex',
      ]),
    )
  })

  it('becomes ready only when configuration and every cohort task pass', () => {
    const cohortScenarioKeys = new Set<string>(
      publicLaunchCohort.filter(({ task }) => task.type === 'scenario').map(({ task }) => task.key),
    )
    const scenarios = demoScenarios
      .filter(({ slug }) => cohortScenarioKeys.has(slug))
      .map((scenario) => ({
        ...scenario,
        seo: { ...scenario.seo, noIndex: false },
        status: 'published' as const,
      }))
    const calculators = calculatorDefinitions.map((calculator) => ({
      ...calculator,
      status: 'available' as const,
    }))

    const report = assessPublicLaunchReadiness({
      calculators,
      configurationBlockers: [],
      isTrusted: () => true,
      scenarios,
    })

    expect(report.ready).toBe(true)
    expect(report.candidates.every(({ ready }) => ready)).toBe(true)
  })
})
