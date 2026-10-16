import { z } from 'zod';

export const createTariffSchema = z.object({
  name: z.string().min(2, 'Tariff name is required'),
  ratePerKwh: z.number().positive('Rate per kWh must be greater than zero'),
  fixedCharge: z.number().nonnegative('Fixed charge cannot be negative').default(0),
  effectiveFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).transform((val) => new Date(val)).optional(),
  isActive: z.boolean().default(true),
});
