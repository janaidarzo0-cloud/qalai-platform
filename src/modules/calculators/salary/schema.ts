import { z } from 'zod'

export const salaryInputSchema = z.object({
  applyBasicDeduction: z.boolean(),
  grossSalary: z.number().finite().min(1).max(1_000_000_000),
})

export type SalaryInput = z.infer<typeof salaryInputSchema>
