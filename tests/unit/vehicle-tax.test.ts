import { describe, expect, it } from 'vitest'

import {
  calculateVehicleTax,
  vehicleTaxRule2026,
} from '@/modules/calculators/vehicle-tax/calculate'

describe('calculateVehicleTax', () => {
  it.each([
    [1_100, 1, 4_325],
    [1_500, 2, 8_650],
    [1_998, 3, 16_461],
    [2_499, 6, 29_443],
    [3_000, 9, 42_425],
    [4_000, 15, 71_875],
    [4_001, 117, 506_032],
  ])('applies the 2026 passenger-car bracket at %i cc', (engineVolumeCc, mrp, taxAmount) => {
    expect(
      calculateVehicleTax({ engineVolumeCc, manufactureYear: 2026, ownershipMonths: 12 }),
    ).toMatchObject({ baseRateMrp: mrp, taxAmount })
  })

  it('applies the 0.7 coefficient when the car is over ten years old', () => {
    expect(
      calculateVehicleTax({ engineVolumeCc: 1_998, manufactureYear: 2015, ownershipMonths: 12 }),
    ).toMatchObject({ ageCoefficient: 0.7, ageYears: 11, taxAmount: 11_523 })
  })

  it('applies the 0.5 coefficient when the car is over twenty years old', () => {
    expect(
      calculateVehicleTax({ engineVolumeCc: 1_998, manufactureYear: 2005, ownershipMonths: 12 }),
    ).toMatchObject({ ageCoefficient: 0.5, ageYears: 21, taxAmount: 8_231 })
  })

  it('prorates the annual amount by months of ownership', () => {
    expect(
      calculateVehicleTax({ engineVolumeCc: 1_998, manufactureYear: 2020, ownershipMonths: 6 }),
    ).toMatchObject({ fullYearTax: 16_461, taxAmount: 8_231 })
  })

  it('keeps the official 2026 constants explicit and versioned', () => {
    expect(vehicleTaxRule2026).toMatchObject({
      excessRatePerCc: 7,
      mrp: 4_325,
      taxYear: 2026,
      version: 'kz-vehicle-tax-2026-v1',
    })
  })

  it('rejects impossible vehicle data', () => {
    expect(() =>
      calculateVehicleTax({ engineVolumeCc: 0, manufactureYear: 2020, ownershipMonths: 12 }),
    ).toThrow()
    expect(() =>
      calculateVehicleTax({ engineVolumeCc: 1_998, manufactureYear: 2027, ownershipMonths: 12 }),
    ).toThrow()
    expect(() =>
      calculateVehicleTax({ engineVolumeCc: 1_998, manufactureYear: 2020, ownershipMonths: 0 }),
    ).toThrow()
  })
})
