import { z } from 'zod'

export const autoLoanInputSchema = z
  .object({
    annualRatePercent: z.number().finite().min(0).max(100),
    downPayment: z.number().finite().min(0).max(1_000_000_000),
    price: z.number().finite().min(1).max(1_000_000_000),
    termMonths: z.number().int().min(1).max(120),
  })
  .refine(({ downPayment, price }) => downPayment <= price, {
    message: 'Алғашқы жарна көлік бағасынан жоғары болмауы керек.',
    path: ['downPayment'],
  })

export type AutoLoanInput = z.infer<typeof autoLoanInputSchema>
