import { z } from 'zod';

export const updateSettingsSchema = z.object({
  dailyConsumptionLimit: z.number().positive('Daily limit must be positive').optional(),
  monthlyConsumptionLimit: z.number().positive('Monthly limit must be positive').optional(),
  monthlyCostLimit: z.number().positive('Cost limit must be positive').optional(),
  carbonFactor: z.number().positive('Carbon factor must be positive').optional(),
  alertEnabled: z.boolean().optional(),
});
