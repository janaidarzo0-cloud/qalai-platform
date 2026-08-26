import { maternityBenefitInputSchema, type MaternityBenefitInput } from './schema'

export const maternityBenefitRule2026 = {
  benefitPensionRate: 0.1,
  daysDivisor: 30,
  maximumMonthlyIncomeMzw: 7,
  minimumWage: 85_000,
  pensionBaseMzw: 50,
  pensionRate: 0.1,
  version: 'kz-maternity-benefit-2026-v1',
} as const

export type MaternityBenefitResult = {
  averageMonthlyIncome: number
  benefitPensionContribution: number
  contributionMonths: number
  formulaVersion: typeof maternityBenefitRule2026.version
  grossBenefit: number
  grossMonthlySalary: number
  incomeCapped: boolean
  leaveCoefficient: number
  leaveDays: number
  maximumMonthlyIncome: number
  monthlyIncomeAfterPension: number
  monthlyIncomeUsed: number
  netBenefit: number
  salaryPensionContribution: number
}

/**
 * Estimates the one-off maternity social payment for an employee with one stable monthly salary.
 * It assumes social contributions reached the Fund in each selected month and zero income in gaps.
 */
export const calculateMaternityBenefit = (
  rawInput: MaternityBenefitInput,
): MaternityBenefitResult => {
  const input = maternityBenefitInputSchema.parse(rawInput)
  const salaryPensionContribution = Math.round(
    Math.min(
      input.grossMonthlySalary,
      maternityBenefitRule2026.pensionBaseMzw * maternityBenefitRule2026.minimumWage,
    ) * maternityBenefitRule2026.pensionRate,
  )
  const monthlyIncomeAfterPension = Math.max(
    0,
    input.grossMonthlySalary - salaryPensionContribution,
  )
  const maximumMonthlyIncome =
    maternityBenefitRule2026.maximumMonthlyIncomeMzw * maternityBenefitRule2026.minimumWage
  const monthlyIncomeUsed = Math.min(monthlyIncomeAfterPension, maximumMonthlyIncome)
  const averageMonthlyIncome = (monthlyIncomeUsed * input.contributionMonths) / 12
  const leaveCoefficient = input.leaveDays / maternityBenefitRule2026.daysDivisor
  const grossBenefitRaw = averageMonthlyIncome * leaveCoefficient
  const grossBenefit = Math.round(grossBenefitRaw)
  const netBenefit = Math.round(grossBenefitRaw * (1 - maternityBenefitRule2026.benefitPensionRate))

  return {
    averageMonthlyIncome: Math.round(averageMonthlyIncome),
    benefitPensionContribution: grossBenefit - netBenefit,
    contributionMonths: input.contributionMonths,
    formulaVersion: maternityBenefitRule2026.version,
    grossBenefit,
    grossMonthlySalary: input.grossMonthlySalary,
    incomeCapped: monthlyIncomeAfterPension > maximumMonthlyIncome,
    leaveCoefficient,
    leaveDays: input.leaveDays,
    maximumMonthlyIncome,
    monthlyIncomeAfterPension,
    monthlyIncomeUsed,
    netBenefit,
    salaryPensionContribution,
  }
}
