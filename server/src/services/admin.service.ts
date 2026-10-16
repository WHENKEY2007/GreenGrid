import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { ENV } from '../config/env';

export class AdminService {
  static async getDashboardOverview() {
    const [
      totalUsers,
      activeUsers,
      totalConsumption,
      totalRenewable,
      recentUsers,
      recentAlerts,
      tariffs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.energyConsumption.aggregate({ _sum: { energyKwh: true, cost: true } }),
      prisma.renewableGeneration.aggregate({ _sum: { generationKwh: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      }),
      prisma.alert.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.energyTariff.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    const systemKwh = Number((totalConsumption._sum.energyKwh || 0).toFixed(2));
    const systemCost = Number((totalConsumption._sum.cost || 0).toFixed(2));
    const systemRenewableKwh = Number((totalRenewable._sum.generationKwh || 0).toFixed(2));

    const renewablePercentage = systemKwh > 0
      ? Number(Math.min(100, (systemRenewableKwh / systemKwh) * 100).toFixed(1))
      : 0;

    const carbonImpactKg = Number((systemRenewableKwh * ENV.DEFAULT_CARBON_FACTOR).toFixed(2));

    return {
      stats: {
        totalUsers,
        activeUsers,
        systemKwh,
        systemCost,
        systemRenewableKwh,
        renewablePercentage,
        carbonImpactKg,
      },
      recentUsers,
      recentAlerts,
      activeTariff: tariffs.find((t) => t.isActive) || null,
    };
  }

  static async listUsers(search?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              devices: true,
              consumptions: true,
              renewableGenerations: true,
            },
          },
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
        devices: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    const [consumptionAgg, renewableAgg] = await Promise.all([
      prisma.energyConsumption.aggregate({
        where: { userId },
        _sum: { energyKwh: true, cost: true },
        _count: { id: true },
      }),
      prisma.renewableGeneration.aggregate({
        where: { userId },
        _sum: { generationKwh: true },
        _count: { id: true },
      }),
    ]);

    return {
      ...user,
      totals: {
        consumptionKwh: Number((consumptionAgg._sum.energyKwh || 0).toFixed(2)),
        cost: Number((consumptionAgg._sum.cost || 0).toFixed(2)),
        recordsCount: consumptionAgg._count.id,
        renewableKwh: Number((renewableAgg._sum.generationKwh || 0).toFixed(2)),
        renewableCount: renewableAgg._count.id,
      },
    };
  }

  static async updateUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return updated;
  }

  static async getMacroAnalytics() {
    // 30-day system-wide timeline
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const [consumptions, renewables] = await Promise.all([
      prisma.energyConsumption.findMany({
        where: { date: { gte: startDate } },
        select: { date: true, energyKwh: true, cost: true },
      }),
      prisma.renewableGeneration.findMany({
        where: { date: { gte: startDate } },
        select: { date: true, generationKwh: true },
      }),
    ]);

    const map = new Map<string, { date: string; consumptionKwh: number; renewableKwh: number }>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, { date: key, consumptionKwh: 0, renewableKwh: 0 });
    }

    consumptions.forEach((c) => {
      const key = c.date.toISOString().split('T')[0];
      const entry = map.get(key) || { date: key, consumptionKwh: 0, renewableKwh: 0 };
      entry.consumptionKwh = Number((entry.consumptionKwh + c.energyKwh).toFixed(2));
      map.set(key, entry);
    });

    renewables.forEach((r) => {
      const key = r.date.toISOString().split('T')[0];
      const entry = map.get(key) || { date: key, consumptionKwh: 0, renewableKwh: 0 };
      entry.renewableKwh = Number((entry.renewableKwh + r.generationKwh).toFixed(2));
      map.set(key, entry);
    });

    return Array.from(map.values());
  }

  static async listAllAlerts(limit = 20) {
    return prisma.alert.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async listTariffs() {
    return prisma.energyTariff.findMany({
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  static async createTariff(data: { name: string; ratePerKwh: number; fixedCharge?: number; isActive?: boolean }) {
    if (data.isActive) {
      // Deactivate other tariffs
      await prisma.energyTariff.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return prisma.energyTariff.create({
      data: {
        name: data.name,
        ratePerKwh: data.ratePerKwh,
        fixedCharge: data.fixedCharge || 0.0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }
}
