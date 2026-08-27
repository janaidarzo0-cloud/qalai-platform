import { describe, expect, it } from 'vitest'

import { calculatorDefinitions } from '@/modules/calculators/registry'

describe('calculator registry', () => {
  it('contains the five Product Definition calculators with stable unique keys and slugs', () => {
    expect(calculatorDefinitions).toHaveLength(5)
    expect(new Set(calculatorDefinitions.map(({ key }) => key)).size).toBe(5)
    expect(new Set(calculatorDefinitions.map(({ slug }) => slug)).size).toBe(5)
  })

  it('has no remaining calculator in source-review after the first rule sets are implemented', () => {
    expect(calculatorDefinitions.map(({ status }) => status)).not.toContain('source-review')
  })

  it('exposes the childcare-benefit module only as a closed-alpha calculation', () => {
    expect(calculatorDefinitions.find(({ key }) => key === 'childcare-benefit')).toMatchObject({
      formulaVersion: 'kz-childcare-benefit-2026-v1',
      status: 'alpha',
    })
  })

  it('exposes the maternity-benefit module only as a closed-alpha calculation', () => {
    expect(calculatorDefinitions.find(({ key }) => key === 'maternity-benefit')).toMatchObject({
      formulaVersion: 'kz-maternity-benefit-2026-v1',
      status: 'alpha',
    })
  })

  it('exposes the officially controlled salary module as available', () => {
    expect(calculatorDefinitions.find(({ key }) => key === 'salary')).toMatchObject({
      formulaVersion: 'kz-salary-2026-v2',
      status: 'available',
    })
  })

  it('exposes the vehicle-tax module only as a closed-alpha calculation', () => {
    expect(calculatorDefinitions.find(({ key }) => key === 'vehicle-tax')).toMatchObject({
      formulaVersion: 'kz-vehicle-tax-2026-v2',
      status: 'alpha',
    })
  })
})
