import { describe, expect, it } from 'vitest'

import { calculateAutoLoan } from '@/modules/calculators/auto-loan/calculate'
import { formatKzt } from '@/modules/calculators/format'

describe('calculateAutoLoan', () => {
  it('calculates a standard annuity loan in integer tenge', () => {
    expect(
      calculateAutoLoan({
        annualRatePercent: 18,
        downPayment: 2_000_000,
        price: 12_000_000,
        termMonths: 60,
      }),
    ).toEqual({
      formulaVersion: 'annuity-v1',
      monthlyPayment: 253_934,
      overpayment: 5_236_056,
      principal: 10_000_000,
      totalRepayment: 15_236_056,
    })
  })

  it('handles a zero-rate loan without division by zero', () => {
    const result = calculateAutoLoan({
      annualRatePercent: 0,
      downPayment: 0,
      price: 1_200_000,
      termMonths: 12,
    })

    expect(result.monthlyPayment).toBe(100_000)
    expect(result.overpayment).toBe(0)
  })

  it('returns zero loan payments when the price is fully prepaid', () => {
    expect(
      calculateAutoLoan({
        annualRatePercent: 25,
        downPayment: 8_000_000,
        price: 8_000_000,
        termMonths: 36,
      }),
    ).toMatchObject({ monthlyPayment: 0, overpayment: 0, principal: 0, totalRepayment: 0 })
  })

  it('rejects an invalid down payment and term', () => {
    expect(() =>
      calculateAutoLoan({
        annualRatePercent: 18,
        downPayment: 3_000_000,
        price: 2_000_000,
        termMonths: 0,
      }),
    ).toThrow()
  })

  it('uses the tenge symbol instead of an environment-dependent currency code', () => {
    expect(formatKzt(253_934)).toContain('₸')
    expect(formatKzt(253_934)).not.toContain('KZT')
  })
})
