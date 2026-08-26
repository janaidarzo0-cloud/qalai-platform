import { z } from 'zod'

const supportedLeaveDays = [126, 140, 170, 184] as const

export const maternityBenefitInputSchema = z.object({
  contributionMonths: z.number().int().min(1).max(12),
  grossMonthlySalary: z.number().finite().min(1).max(1_000_000_000),
  leaveDays: z
    .number()
    .int()
    .refine((days) => supportedLeaveDays.includes(days as 126), {
      message: 'Unsupported maternity-leave duration',
    }),
})

export type MaternityBenefitInput = z.infer<typeof maternityBenefitInputSchema>
