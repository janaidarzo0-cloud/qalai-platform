import { describe, expect, it } from 'vitest'

import {
  calculateChildcareBenefit,
  childcareBenefitRule2026,
} from '@/modules/calculators/childcare-benefit/calculate'

describe('calculateChildcareBenefit', () => {
  it('matches the official two-year working-parent example', () => {
    expect(
      calculateChildcareBenefit({
        childOrder: 1,
        earlierMonthlyIncome: 150_000,
        earlierPaidMonths: 12,
        recentMonthlyIncome: 200_000,
        recentPaidMonths: 12,
        status: 'working',
      }),
    ).toMatchObject({
      averageMonthlyIncome: 175_000,
      benefitPensionContribution: 7_000,
      grossSocialPayment: 70_000,
      maximumApplied: false,
      minimumApplied: false,
      monthlyBankPayment: 63_000,
    })
  })

  it('caps the assigned working-parent payment at 238,000 tenge before pension withholding', () => {
    expect(
      calculateChildcareBenefit({
        childOrder: 1,
        earlierMonthlyIncome: 700_000,
        earlierPaidMonths: 12,
        recentMonthlyIncome: 700_000,
        recentPaidMonths: 12,
        status: 'working',
      }),
    ).toMatchObject({
      benefitPensionContribution: 23_800,
      grossSocialPayment: 238_000,
      incomeCapped: true,
      maximumGrossPayment: 238_000,
      monthlyBankPayment: 214_200,
    })
  })

  it('raises a low working-parent result to the state-benefit floor after withholding', () => {
    expect(
      calculateChildcareBenefit({
        childOrder: 2,
        earlierMonthlyIncome: 0,
        earlierPaidMonths: 0,
        recentMonthlyIncome: 85_000,
        recentPaidMonths: 1,
        status: 'working',
      }),
    ).toMatchObject({
      minimumApplied: true,
      minimumBankPayment: 29_454,
      monthlyBankPayment: 29_454,
    })
  })

  it.each([
    [1, 5.76, 24_912],
    [2, 6.81, 29_454],
    [3, 7.85, 33_952],
    [4, 8.9, 38_493],
  ] as const)(
    'returns the 2026 non-working benefit for child order %i',
    (childOrder, rateMrp, amount) => {
      expect(calculateChildcareBenefit({ childOrder, status: 'non-working' })).toMatchObject({
        monthlyBankPayment: amount,
        rateMrp,
        status: 'non-working',
      })
    },
  )

  it('keeps the official 2026 rule constants explicit and versioned', () => {
    expect(childcareBenefitRule2026).toMatchObject({
      incomeReplacementRate: 0.4,
      maximumMonthlyIncomeMzw: 7,
      minimumWage: 85_000,
      mrp: 4_325,
      periodMonths: 24,
      version: 'kz-childcare-benefit-2026-v1',
    })
  })

  it('rejects a working path without any month of social contributions', () => {
    expect(() =>
      calculateChildcareBenefit({
        childOrder: 1,
        earlierMonthlyIncome: 0,
        earlierPaidMonths: 0,
        recentMonthlyIncome: 0,
        recentPaidMonths: 0,
        status: 'working',
      }),
    ).toThrow()
  })
})
