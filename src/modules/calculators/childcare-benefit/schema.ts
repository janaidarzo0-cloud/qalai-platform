import { z } from 'zod'

export const childOrderSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])

const workingInputSchema = z
  .object({
    childOrder: childOrderSchema,
    earlierMonthlyIncome: z.number().finite().min(0).max(1_000_000_000),
    earlierPaidMonths: z.number().int().min(0).max(12),
    recentMonthlyIncome: z.number().finite().min(0).max(1_000_000_000),
    recentPaidMonths: z.number().int().min(0).max(12),
    status: z.literal('working'),
  })
  .refine((input) => input.earlierPaidMonths + input.recentPaidMonths > 0, {
    message: 'At least one month of social contributions is required',
  })

const nonWorkingInputSchema = z.object({
  childOrder: childOrderSchema,
  status: z.literal('non-working'),
})

export const childcareBenefitInputSchema = z.discriminatedUnion('status', [
  workingInputSchema,
  nonWorkingInputSchema,
])

export type ChildcareBenefitInput = z.infer<typeof childcareBenefitInputSchema>
export type ChildOrder = z.infer<typeof childOrderSchema>
