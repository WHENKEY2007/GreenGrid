import { z } from 'zod';
import { RenewableSource } from '@prisma/client';

export const createRenewableSchema = z.object({
  source: z.nativeEnum(RenewableSource).default(RenewableSource.SOLAR),
  generationKwh: z.number().nonnegative('Renewable generation cannot be negative'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).transform((val) => new Date(val)),
  capacityKw: z.number().positive('Capacity must be greater than zero kW'),
});

export const updateRenewableSchema = createRenewableSchema.partial();
