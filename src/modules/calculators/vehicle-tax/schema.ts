import { z } from 'zod'

export const vehicleTaxInputSchema = z.object({
  engineVolumeCc: z.number().int().min(1).max(20_000),
  manufactureYear: z.number().int().min(1900).max(2026),
  ownershipMonths: z.number().int().min(1).max(12),
})

export type VehicleTaxInput = z.infer<typeof vehicleTaxInputSchema>
