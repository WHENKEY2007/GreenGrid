import { z } from 'zod';
import { ConsumptionSource } from '@prisma/client';

export const createConsumptionSchema = z.object({
  deviceId: z.string().optional().nullable(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).transform((val) => new Date(val)),
  energyKwh: z.number().nonnegative('Energy consumption cannot be negative'),
  source: z.nativeEnum(ConsumptionSource).default(ConsumptionSource.MANUAL),
});

export const updateConsumptionSchema = createConsumptionSchema.partial();

export const queryConsumptionSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  deviceId: z.string().optional(),
  source: z.nativeEnum(ConsumptionSource).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
});
