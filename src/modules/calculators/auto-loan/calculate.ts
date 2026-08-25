import { autoLoanInputSchema, type AutoLoanInput } from './schema'

export type AutoLoanResult = {
  formulaVersion: 'annuity-v1'
  monthlyPayment: number
  overpayment: number
  principal: number
  totalRepayment: number
}

/**
 * Standard annuity calculation. It intentionally excludes bank fees, insurance,
 * commissions and promotional conditions; those are offer-specific, not formula inputs.
 */
export const calculateAutoLoan = (rawInput: AutoLoanInput): AutoLoanResult => {
  const input = autoLoanInputSchema.parse(rawInput)
  const principal = input.price - input.downPayment

  if (principal === 0) {
    return {
      formulaVersion: 'annuity-v1',
      monthlyPayment: 0,
      overpayment: 0,
      principal: 0,
      totalRepayment: 0,
    }
  }

  const monthlyRate = input.annualRatePercent / 100 / 12
  const rawMonthlyPayment =
    monthlyRate === 0
      ? principal / input.termMonths
      : (principal * monthlyRate * (1 + monthlyRate) ** input.termMonths) /
        ((1 + monthlyRate) ** input.termMonths - 1)

  const monthlyPayment = Math.round(rawMonthlyPayment)
  const totalRepayment = Math.round(rawMonthlyPayment * input.termMonths)

  return {
    formulaVersion: 'annuity-v1',
    monthlyPayment,
    overpayment: Math.max(0, totalRepayment - principal),
    principal,
    totalRepayment,
  }
}
