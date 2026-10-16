import prisma from '../config/prisma';
import { ENV } from '../config/env';

export class SettingsService {
  static async getUserSettings(userId: string) {
    let settings = await prisma.energySettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.energySettings.create({
        data: {
          userId,
          dailyConsumptionLimit: 20.0,
          monthlyConsumptionLimit: 500.0,
          monthlyCostLimit: 5000.0,
          carbonFactor: ENV.DEFAULT_CARBON_FACTOR,
          alertEnabled: true,
        },
      });
    }
    return settings;
  }

  static async updateSettings(
    userId: string,
    data: {
      dailyConsumptionLimit?: number;
      monthlyConsumptionLimit?: number;
      monthlyCostLimit?: number;
      carbonFactor?: number;
      alertEnabled?: boolean;
    }
  ) {
    const settings = await prisma.energySettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        dailyConsumptionLimit: data.dailyConsumptionLimit ?? 20.0,
        monthlyConsumptionLimit: data.monthlyConsumptionLimit ?? 500.0,
        monthlyCostLimit: data.monthlyCostLimit ?? 5000.0,
        carbonFactor: data.carbonFactor ?? ENV.DEFAULT_CARBON_FACTOR,
        alertEnabled: data.alertEnabled ?? true,
      },
    });

    return settings;
  }
}
