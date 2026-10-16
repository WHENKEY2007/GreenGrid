import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { ConsumptionSource, AlertType } from '@prisma/client';
import { getActiveTariff, calculateCost } from '../utils/calculator';

export class ConsumptionService {
  static async listUserConsumption(
    userId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      deviceId?: string;
      source?: ConsumptionSource;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.deviceId) {
      where.deviceId = filters.deviceId;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const [total, records] = await Promise.all([
      prisma.energyConsumption.count({ where }),
      prisma.energyConsumption.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          device: {
            select: { id: true, name: true, category: true },
          },
        },
      }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getConsumptionById(userId: string, id: string) {
    const record = await prisma.energyConsumption.findFirst({
      where: { id, userId },
      include: {
        device: true,
      },
    });

    if (!record) {
      throw new AppError('Consumption record not found or unauthorized.', 404, 'NOT_FOUND');
    }

    return record;
  }

  static async createConsumption(
    userId: string,
    data: { deviceId?: string | null; date: Date; energyKwh: number; source?: ConsumptionSource }
  ) {
    // If deviceId provided, verify it belongs to this user
    if (data.deviceId) {
      const device = await prisma.device.findFirst({
        where: { id: data.deviceId, userId },
      });
      if (!device) {
        throw new AppError('Specified device does not belong to your account.', 400, 'INVALID_DEVICE');
      }
    }

    // Determine cost via active tariff
    const activeTariff = await getActiveTariff();
    const cost = calculateCost(data.energyKwh, activeTariff.ratePerKwh);

    const record = await prisma.energyConsumption.create({
      data: {
        userId,
        deviceId: data.deviceId || null,
        date: data.date,
        energyKwh: data.energyKwh,
        cost,
        source: data.source || ConsumptionSource.MANUAL,
      },
      include: {
        device: { select: { id: true, name: true, category: true } },
      },
    });

    // Check if daily consumption exceeds user's limit and trigger alert
    const userSettings = await prisma.energySettings.findUnique({ where: { userId } });
    if (userSettings && userSettings.alertEnabled) {
      const startOfDay = new Date(data.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.date);
      endOfDay.setHours(23, 59, 59, 999);

      const dayTotal = await prisma.energyConsumption.aggregate({
        where: {
          userId,
          date: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { energyKwh: true },
      });

      const totalKwh = dayTotal._sum.energyKwh || 0;
      if (totalKwh > userSettings.dailyConsumptionLimit) {
        // Prevent duplicate alerts for the same day
        const existingAlert = await prisma.alert.findFirst({
          where: {
            userId,
            type: AlertType.HIGH_CONSUMPTION,
            createdAt: { gte: startOfDay },
          },
        });

        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              userId,
              type: AlertType.HIGH_CONSUMPTION,
              title: 'Daily Consumption Threshold Breached',
              message: `Your energy consumption for ${data.date.toISOString().split('T')[0]} reached ${totalKwh.toFixed(1)} kWh, exceeding your target of ${userSettings.dailyConsumptionLimit} kWh.`,
              threshold: userSettings.dailyConsumptionLimit,
            },
          });
        }
      }
    }

    return record;
  }

  static async updateConsumption(
    userId: string,
    id: string,
    data: { deviceId?: string | null; date?: Date; energyKwh?: number; source?: ConsumptionSource }
  ) {
    const existing = await prisma.energyConsumption.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Consumption record not found or unauthorized.', 404, 'NOT_FOUND');
    }

    if (data.deviceId) {
      const device = await prisma.device.findFirst({ where: { id: data.deviceId, userId } });
      if (!device) {
        throw new AppError('Specified device does not belong to your account.', 400, 'INVALID_DEVICE');
      }
    }

    let cost = existing.cost;
    if (data.energyKwh !== undefined) {
      const activeTariff = await getActiveTariff();
      cost = calculateCost(data.energyKwh, activeTariff.ratePerKwh);
    }

    const updated = await prisma.energyConsumption.update({
      where: { id },
      data: {
        deviceId: data.deviceId !== undefined ? data.deviceId : existing.deviceId,
        date: data.date || existing.date,
        energyKwh: data.energyKwh !== undefined ? data.energyKwh : existing.energyKwh,
        cost,
        source: data.source || existing.source,
      },
      include: {
        device: { select: { id: true, name: true, category: true } },
      },
    });

    return updated;
  }

  static async deleteConsumption(userId: string, id: string) {
    const existing = await prisma.energyConsumption.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Consumption record not found or unauthorized.', 404, 'NOT_FOUND');
    }

    await prisma.energyConsumption.delete({ where: { id } });
    return { message: 'Consumption record deleted successfully' };
  }
}
