import { childcareBenefitInputSchema, type ChildcareBenefitInput, type ChildOrder } from './schema'

export const childcareBenefitRule2026 = {
  benefitPensionRate: 0.1,
  incomeReplacementRate: 0.4,
  maximumMonthlyIncomeMzw: 7,
  minimumWage: 85_000,
  mrp: 4_325,
  nonWorkingRatesMrp: {
    1: 5.76,
    2: 6.81,
    3: 7.85,
    4: 8.9,
  },
  periodMonths: 24,
  version: 'kz-childcare-benefit-2026-v1',
} as const

type SharedResult = {
  childOrder: ChildOrder
  formulaVersion: typeof childcareBenefitRule2026.version
  monthlyBankPayment: number
  status: ChildcareBenefitInput['status']
}

export type WorkingChildcareBenefitResult = SharedResult & {
  averageMonthlyIncome: number
  benefitPensionContribution: number
  calculatedGrossPayment: number
  earlierPaidMonths: number
  grossSocialPayment: number
  incomeCapped: boolean
  maximumApplied: boolean
  maximumGrossPayment: number
  minimumApplied: boolean
  minimumBankPayment: number
  recentPaidMonths: number
  status: 'working'
}

export type NonWorkingChildcareBenefitResult = SharedResult & {
  rateMrp: number
  status: 'non-working'
}

export type ChildcareBenefitResult =
  WorkingChildcareBenefitResult | NonWorkingChildcareBenefitResult

const getNonWorkingBenefit = (childOrder: ChildOrder) =>
  Math.ceil(childcareBenefitRule2026.nonWorkingRatesMrp[childOrder] * childcareBenefitRule2026.mrp)

export const calculateChildcareBenefit = (
  rawInput: ChildcareBenefitInput,
): ChildcareBenefitResult => {
  const input = childcareBenefitInputSchema.parse(rawInput)
  const minimumBankPayment = getNonWorkingBenefit(input.childOrder)

  if (input.status === 'non-working') {
    return {
      childOrder: input.childOrder,
      formulaVersion: childcareBenefitRule2026.version,
      monthlyBankPayment: minimumBankPayment,
      rateMrp: childcareBenefitRule2026.nonWorkingRatesMrp[input.childOrder],
      status: input.status,
    }
  }

  const maximumMonthlyIncome =
    childcareBenefitRule2026.maximumMonthlyIncomeMzw * childcareBenefitRule2026.minimumWage
  const earlierIncomeUsed = Math.min(input.earlierMonthlyIncome, maximumMonthlyIncome)
  const recentIncomeUsed = Math.min(input.recentMonthlyIncome, maximumMonthlyIncome)
  const totalIncome =
    earlierIncomeUsed * input.earlierPaidMonths + recentIncomeUsed * input.recentPaidMonths
  const averageMonthlyIncomeRaw = totalIncome / childcareBenefitRule2026.periodMonths
  const calculatedGrossPaymentRaw =
    averageMonthlyIncomeRaw * childcareBenefitRule2026.incomeReplacementRate
  const maximumGrossPayment = maximumMonthlyIncome * childcareBenefitRule2026.incomeReplacementRate
  const minimumGrossPayment = minimumBankPayment / (1 - childcareBenefitRule2026.benefitPensionRate)
  const grossSocialPaymentRaw = Math.min(
    maximumGrossPayment,
    Math.max(calculatedGrossPaymentRaw, minimumGrossPayment),
  )
  const grossSocialPayment = Math.round(grossSocialPaymentRaw)
  const monthlyBankPayment = Math.round(
    grossSocialPaymentRaw * (1 - childcareBenefitRule2026.benefitPensionRate),
  )

  return {
    averageMonthlyIncome: Math.round(averageMonthlyIncomeRaw),
    benefitPensionContribution: grossSocialPayment - monthlyBankPayment,
    calculatedGrossPayment: Math.round(calculatedGrossPaymentRaw),
    childOrder: input.childOrder,
    earlierPaidMonths: input.earlierPaidMonths,
    formulaVersion: childcareBenefitRule2026.version,
    grossSocialPayment,
    incomeCapped:
      input.earlierMonthlyIncome > maximumMonthlyIncome ||
      input.recentMonthlyIncome > maximumMonthlyIncome,
    maximumApplied: calculatedGrossPaymentRaw >= maximumGrossPayment,
    maximumGrossPayment,
    minimumApplied: calculatedGrossPaymentRaw < minimumGrossPayment,
    minimumBankPayment,
    monthlyBankPayment,
    recentPaidMonths: input.recentPaidMonths,
    status: input.status,
  }
}
