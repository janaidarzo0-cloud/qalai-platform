import { describe, expect, it } from 'vitest'

import { calculateSalary, salaryRule2026 } from '@/modules/calculators/salary/calculate'

describe('calculateSalary', () => {
  it('calculates 2026 employee deductions with the basic deduction', () => {
    expect(calculateSalary({ applyBasicDeduction: true, grossSalary: 500_000 })).toEqual({
      assumptions: { applyBasicDeduction: true, regularMonthlySalary: true },
      annualIndividualIncomeTax: 372_300,
      annualTaxThreshold: 36_762_500,
      annualTaxableIncome: 3_723_000,
      basicDeduction: 129_750,
      employeeHealthInsurance: 10_000,
      formulaVersion: 'kz-salary-2026-v2',
      grossSalary: 500_000,
      individualIncomeTax: 31_025,
      netSalary: 408_975,
      pensionContribution: 50_000,
      progressiveRateApplied: false,
      taxableIncome: 310_250,
      totalWithheld: 91_025,
    })
  })

  it('does not apply the basic deduction when the employee uses it elsewhere', () => {
    expect(calculateSalary({ applyBasicDeduction: false, grossSalary: 500_000 })).toMatchObject({
      basicDeduction: 0,
      individualIncomeTax: 44_000,
      netSalary: 396_000,
    })
  })

  it('respects the 2026 pension and health-insurance income caps', () => {
    expect(calculateSalary({ applyBasicDeduction: true, grossSalary: 5_000_000 })).toMatchObject({
      annualIndividualIncomeTax: 6_102_125,
      employeeHealthInsurance: 34_000,
      individualIncomeTax: 508_510,
      netSalary: 4_032_490,
      pensionContribution: 425_000,
      progressiveRateApplied: true,
    })
  })

  it('applies only the usable part of the monthly deduction and never carries its excess', () => {
    expect(calculateSalary({ applyBasicDeduction: true, grossSalary: 100_000 })).toMatchObject({
      basicDeduction: 88_000,
      employeeHealthInsurance: 2_000,
      individualIncomeTax: 0,
      netSalary: 88_000,
      pensionContribution: 10_000,
      taxableIncome: 0,
    })
  })

  it('switches to the progressive annual rate only above 8,500 MRP', () => {
    expect(
      calculateSalary({ applyBasicDeduction: true, grossSalary: 3_585_879 }).progressiveRateApplied,
    ).toBe(false)
    expect(
      calculateSalary({ applyBasicDeduction: true, grossSalary: 3_585_880 }).progressiveRateApplied,
    ).toBe(true)
  })

  it('keeps the 2026 official constants explicit and versioned', () => {
    expect(salaryRule2026).toMatchObject({
      basicDeductionMrp: 30,
      employeeHealthInsuranceBaseMzw: 20,
      minimumWage: 85_000,
      mrp: 4_325,
      pensionBaseMzw: 50,
    })
  })

  it('rejects empty and negative salaries', () => {
    expect(() => calculateSalary({ applyBasicDeduction: true, grossSalary: 0 })).toThrow()
    expect(() => calculateSalary({ applyBasicDeduction: true, grossSalary: -1 })).toThrow()
  })
})
