import { describe, expect, it } from 'vitest'

import {
  calculateMaternityBenefit,
  maternityBenefitRule2026,
} from '@/modules/calculators/maternity-benefit/calculate'

describe('calculateMaternityBenefit', () => {
  it('matches the official 180,000 tenge salary and 126-day example', () => {
    expect(
      calculateMaternityBenefit({
        contributionMonths: 12,
        grossMonthlySalary: 180_000,
        leaveDays: 126,
      }),
    ).toMatchObject({
      averageMonthlyIncome: 162_000,
      benefitPensionContribution: 68_040,
      grossBenefit: 680_400,
      netBenefit: 612_360,
      salaryPensionContribution: 18_000,
    })
  })

  it('divides contribution income by twelve even when only eight months have contributions', () => {
    expect(
      calculateMaternityBenefit({
        contributionMonths: 8,
        grossMonthlySalary: 180_000,
        leaveDays: 126,
      }),
    ).toMatchObject({ averageMonthlyIncome: 108_000, grossBenefit: 453_600, netBenefit: 408_240 })
  })

  it('caps monthly income at seven minimum wages', () => {
    expect(
      calculateMaternityBenefit({
        contributionMonths: 12,
        grossMonthlySalary: 700_000,
        leaveDays: 126,
      }),
    ).toMatchObject({
      averageMonthlyIncome: 595_000,
      benefitPensionContribution: 249_900,
      grossBenefit: 2_499_000,
      incomeCapped: true,
      netBenefit: 2_249_100,
    })
  })

  it.each([
    [126, 4.2, 612_360],
    [140, 140 / 30, 680_400],
    [170, 170 / 30, 826_200],
    [184, 184 / 30, 894_240],
  ])('applies the official coefficient for %i leave days', (leaveDays, coefficient, netBenefit) => {
    expect(
      calculateMaternityBenefit({
        contributionMonths: 12,
        grossMonthlySalary: 180_000,
        leaveDays,
      }),
    ).toMatchObject({ leaveCoefficient: coefficient, netBenefit })
  })

  it('keeps the 2026 rule constants explicit and versioned', () => {
    expect(maternityBenefitRule2026).toMatchObject({
      benefitPensionRate: 0.1,
      maximumMonthlyIncomeMzw: 7,
      minimumWage: 85_000,
      version: 'kz-maternity-benefit-2026-v1',
    })
  })

  it('rejects impossible inputs and unsupported leave durations', () => {
    expect(() =>
      calculateMaternityBenefit({
        contributionMonths: 0,
        grossMonthlySalary: 180_000,
        leaveDays: 126,
      }),
    ).toThrow()
    expect(() =>
      calculateMaternityBenefit({ contributionMonths: 12, grossMonthlySalary: 0, leaveDays: 126 }),
    ).toThrow()
    expect(() =>
      calculateMaternityBenefit({
        contributionMonths: 12,
        grossMonthlySalary: 180_000,
        leaveDays: 127,
      }),
    ).toThrow()
  })
})
