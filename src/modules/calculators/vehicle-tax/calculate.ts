import { vehicleTaxInputSchema, type VehicleTaxInput } from './schema'

export const vehicleTaxRule2026 = {
  ageCoefficients: {
    over10Years: 0.7,
    over20Years: 0.5,
  },
  excessRatePerCc: 7,
  mrp: 4_325,
  passengerCarRates: [
    { maxCc: 1_100, minCcExclusive: 0, mrp: 1 },
    { maxCc: 1_500, minCcExclusive: 1_100, mrp: 2 },
    { maxCc: 2_000, minCcExclusive: 1_500, mrp: 3 },
    { maxCc: 2_500, minCcExclusive: 2_000, mrp: 6 },
    { maxCc: 3_000, minCcExclusive: 2_500, mrp: 9 },
    { maxCc: 4_000, minCcExclusive: 3_000, mrp: 15 },
    { maxCc: Number.POSITIVE_INFINITY, minCcExclusive: 4_000, mrp: 117 },
  ],
  taxYear: 2026,
  version: 'kz-vehicle-tax-2026-v2',
} as const

export type VehicleTaxResult = {
  ageCoefficient: number
  ageYears: number
  annualTaxBeforeAgeCoefficient: number
  baseRateMrp: number
  baseTax: number
  engineVolumeCc: number
  excessCc: number
  excessTax: number
  formulaVersion: typeof vehicleTaxRule2026.version
  fullYearTax: number
  manufactureYear: number
  ownershipMonths: number
  taxAmount: number
  taxYear: typeof vehicleTaxRule2026.taxYear
}

const getAgeCoefficient = (ageYears: number) => {
  if (ageYears > 20) return vehicleTaxRule2026.ageCoefficients.over20Years
  if (ageYears >= 10) return vehicleTaxRule2026.ageCoefficients.over10Years
  return 1
}

/**
 * Estimates the 2026 tax obligation for a category-B passenger car owned by an individual.
 * Exemptions and other vehicle categories are deliberately outside this first rule set.
 */
export const calculateVehicleTax = (rawInput: VehicleTaxInput): VehicleTaxResult => {
  const input = vehicleTaxInputSchema.parse(rawInput)
  const rate = vehicleTaxRule2026.passengerCarRates.find(
    ({ maxCc }) => input.engineVolumeCc <= maxCc,
  )

  if (!rate) throw new Error('Vehicle tax rate not found')

  const baseTax = rate.mrp * vehicleTaxRule2026.mrp
  const excessCc = input.engineVolumeCc > 1_500 ? input.engineVolumeCc - rate.minCcExclusive : 0
  const excessTax = excessCc * vehicleTaxRule2026.excessRatePerCc
  const annualTaxBeforeAgeCoefficient = baseTax + excessTax
  const ageYears = vehicleTaxRule2026.taxYear - input.manufactureYear
  const ageCoefficient = getAgeCoefficient(ageYears)
  const fullYearTax = Math.round(annualTaxBeforeAgeCoefficient * ageCoefficient)
  const taxAmount = Math.round(
    (annualTaxBeforeAgeCoefficient * ageCoefficient * input.ownershipMonths) / 12,
  )

  return {
    ageCoefficient,
    ageYears,
    annualTaxBeforeAgeCoefficient,
    baseRateMrp: rate.mrp,
    baseTax,
    engineVolumeCc: input.engineVolumeCc,
    excessCc,
    excessTax,
    formulaVersion: vehicleTaxRule2026.version,
    fullYearTax,
    manufactureYear: input.manufactureYear,
    ownershipMonths: input.ownershipMonths,
    taxAmount,
    taxYear: vehicleTaxRule2026.taxYear,
  }
}
