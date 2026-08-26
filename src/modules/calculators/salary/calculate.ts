import { salaryInputSchema, type SalaryInput } from './schema'

export const salaryRule2026 = {
  basicDeductionMrp: 30,
  employeeHealthInsuranceBaseMzw: 20,
  employeeHealthInsuranceRate: 0.02,
  ipnAnnualThresholdMrp: 8_500,
  ipnBaseRate: 0.1,
  ipnHigherRate: 0.15,
  minimumWage: 85_000,
  mrp: 4_325,
  pensionBaseMzw: 50,
  pensionRate: 0.1,
  version: 'kz-salary-2026-v2',
} as const

export type SalaryResult = {
  assumptions: {
    applyBasicDeduction: boolean
    regularMonthlySalary: true
  }
  annualIndividualIncomeTax: number
  annualTaxThreshold: number
  annualTaxableIncome: number
  basicDeduction: number
  employeeHealthInsurance: number
  formulaVersion: typeof salaryRule2026.version
  grossSalary: number
  individualIncomeTax: number
  netSalary: number
  pensionContribution: number
  progressiveRateApplied: boolean
  taxableIncome: number
  totalWithheld: number
}

const calculateProgressiveAnnualTax = (annualTaxableIncome: number) => {
  const threshold = salaryRule2026.ipnAnnualThresholdMrp * salaryRule2026.mrp
  const basePart = Math.min(annualTaxableIncome, threshold) * salaryRule2026.ipnBaseRate
  const higherPart = Math.max(0, annualTaxableIncome - threshold) * salaryRule2026.ipnHigherRate

  return basePart + higherPart
}

/**
 * Estimates take-home pay for a resident employee with the same gross salary in each month.
 * Employer-paid contributions and special social deductions are outside this first rule set.
 */
export const calculateSalary = (rawInput: SalaryInput): SalaryResult => {
  const input = salaryInputSchema.parse(rawInput)
  const pensionContribution = Math.round(
    Math.min(input.grossSalary, salaryRule2026.pensionBaseMzw * salaryRule2026.minimumWage) *
      salaryRule2026.pensionRate,
  )
  const employeeHealthInsurance = Math.round(
    Math.min(
      input.grossSalary,
      salaryRule2026.employeeHealthInsuranceBaseMzw * salaryRule2026.minimumWage,
    ) * salaryRule2026.employeeHealthInsuranceRate,
  )
  const basicDeductionLimit = salaryRule2026.basicDeductionMrp * salaryRule2026.mrp
  const incomeAvailableForBasicDeduction = Math.max(
    0,
    input.grossSalary - pensionContribution - employeeHealthInsurance,
  )
  const basicDeduction = input.applyBasicDeduction
    ? Math.min(basicDeductionLimit, incomeAvailableForBasicDeduction)
    : 0
  const taxableIncome = Math.max(
    0,
    input.grossSalary - pensionContribution - employeeHealthInsurance - basicDeduction,
  )
  const annualTaxableIncome = taxableIncome * 12
  const annualTaxThreshold = salaryRule2026.ipnAnnualThresholdMrp * salaryRule2026.mrp
  const annualIndividualIncomeTax = Math.round(calculateProgressiveAnnualTax(annualTaxableIncome))
  const individualIncomeTax = Math.round(annualIndividualIncomeTax / 12)
  const totalWithheld = pensionContribution + employeeHealthInsurance + individualIncomeTax

  return {
    assumptions: {
      applyBasicDeduction: input.applyBasicDeduction,
      regularMonthlySalary: true,
    },
    annualIndividualIncomeTax,
    annualTaxThreshold,
    annualTaxableIncome,
    basicDeduction,
    employeeHealthInsurance,
    formulaVersion: salaryRule2026.version,
    grossSalary: input.grossSalary,
    individualIncomeTax,
    netSalary: input.grossSalary - totalWithheld,
    pensionContribution,
    progressiveRateApplied: annualTaxableIncome > annualTaxThreshold,
    taxableIncome,
    totalWithheld,
  }
}
