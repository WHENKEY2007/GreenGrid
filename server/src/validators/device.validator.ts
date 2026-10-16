import { z } from 'zod';

export const createDeviceSchema = z.object({
  name: z.string().min(2, 'Device name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  ratedPower: z.number().positive('Rated power must be greater than zero Watts'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
  usageHoursPerDay: z.number().min(0.1, 'Hours must be greater than 0').max(24, 'Usage cannot exceed 24 hours per day'),
});

export const updateDeviceSchema = createDeviceSchema.partial().extend({
  isActive: z.boolean().optional(),
});
