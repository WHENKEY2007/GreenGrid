import prisma from '../config/prisma';
import { ENV } from '../config/env';

export class AnalyticsService {
  static async getSummary(userId: string) {
    const settings = await prisma.energySettings.findUnique({ where: { userId } });
    const carbonFactor = settings?.carbonFactor || ENV.DEFAULT_CARBON_FACTOR;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run parallel aggregations
    const [
      todayConsumption,
      todayRenewable,
      weeklyConsumption,
      monthlyConsumption,
      monthlyRenewable,
      allTimeConsumption,
      allTimeRenewable,
      deviceAggregates,
      activeAlertsCount,
    ] = await Promise.all([
      // Today
      prisma.energyConsumption.aggregate({
        where: { userId, date: { gte: startOfToday, lte: endOfToday } },
        _sum: { energyKwh: true, cost: true },
      }),
      prisma.renewableGeneration.aggregate({
        where: { userId, date: { gte: startOfToday, lte: endOfToday } },
        _sum: { generationKwh: true },
      }),
      // Last 7 days
      prisma.energyConsumption.aggregate({
        where: { userId, date: { gte: sevenDaysAgo } },
        _sum: { energyKwh: true, cost: true },
      }),
      // Current Month
      prisma.energyConsumption.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { energyKwh: true, cost: true },
      }),
      prisma.renewableGeneration.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { generationKwh: true },
      }),
      // All time
      prisma.energyConsumption.aggregate({
        where: { userId },
        _sum: { energyKwh: true, cost: true },
      }),
      prisma.renewableGeneration.aggregate({
        where: { userId },
        _sum: { generationKwh: true },
      }),
      // Top Device
      prisma.energyConsumption.groupBy({
        by: ['deviceId'],
        where: { userId, deviceId: { not: null } },
        _sum: { energyKwh: true },
        orderBy: { _sum: { energyKwh: 'desc' } },
        take: 1,
      }),
      prisma.alert.count({ where: { userId, isRead: false } }),
    ]);

    // Highest consuming device name lookup
    let highestConsumingDevice = null;
    if (deviceAggregates.length > 0 && deviceAggregates[0].deviceId) {
      const topDevice = await prisma.device.findUnique({
        where: { id: deviceAggregates[0].deviceId },
      });
      if (topDevice) {
        highestConsumingDevice = {
          id: topDevice.id,
          name: topDevice.name,
          category: topDevice.category,
          totalKwh: Number((deviceAggregates[0]._sum.energyKwh || 0).toFixed(2)),
        };
      }
    }

    const todayKwh = Number((todayConsumption._sum.energyKwh || 0).toFixed(2));
    const todayCost = Number((todayConsumption._sum.cost || 0).toFixed(2));
    const todayRenewableKwh = Number((todayRenewable._sum.generationKwh || 0).toFixed(2));

    const monthlyKwh = Number((monthlyConsumption._sum.energyKwh || 0).toFixed(2));
    const monthlyCost = Number((monthlyConsumption._sum.cost || 0).toFixed(2));
    const monthlyRenewableKwh = Number((monthlyRenewable._sum.generationKwh || 0).toFixed(2));

    const totalKwh = Number((allTimeConsumption._sum.energyKwh || 0).toFixed(2));
    const totalRenewableKwh = Number((allTimeRenewable._sum.generationKwh || 0).toFixed(2));

    const renewablePercentage = monthlyKwh > 0
      ? Number(Math.min(100, (monthlyRenewableKwh / monthlyKwh) * 100).toFixed(1))
      : 0;

    const carbonEmissions = Number((monthlyKwh * carbonFactor).toFixed(2));
    const carbonReduction = Number((monthlyRenewableKwh * carbonFactor).toFixed(2));

    return {
      today: {
        consumptionKwh: todayKwh,
        cost: todayCost,
        renewableKwh: todayRenewableKwh,
      },
      weekly: {
        consumptionKwh: Number((weeklyConsumption._sum.energyKwh || 0).toFixed(2)),
        cost: Number((weeklyConsumption._sum.cost || 0).toFixed(2)),
      },
      monthly: {
        consumptionKwh: monthlyKwh,
        cost: monthlyCost,
        renewableKwh: monthlyRenewableKwh,
        renewablePercentage,
        carbonEmissions,
        carbonReduction,
      },
      allTime: {
        totalConsumptionKwh: totalKwh,
        totalCost: Number((allTimeConsumption._sum.cost || 0).toFixed(2)),
        totalRenewableKwh,
      },
      highestConsumingDevice,
      activeAlertsCount,
      settings: settings || {
        dailyConsumptionLimit: 20,
        monthlyConsumptionLimit: 500,
        monthlyCostLimit: 5000,
        carbonFactor,
      },
    };
  }

  static async getDailyTimeline(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const [consumptions, renewables] = await Promise.all([
      prisma.energyConsumption.findMany({
        where: { userId, date: { gte: startDate } },
        orderBy: { date: 'asc' },
      }),
      prisma.renewableGeneration.findMany({
        where: { userId, date: { gte: startDate } },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Group by YYYY-MM-DD
    const map = new Map<string, { date: string; consumptionKwh: number; cost: number; renewableKwh: number }>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, { date: key, consumptionKwh: 0, cost: 0, renewableKwh: 0 });
    }

    consumptions.forEach((c) => {
      const key = c.date.toISOString().split('T')[0];
      const entry = map.get(key);
      if (entry) {
        entry.consumptionKwh = Number((entry.consumptionKwh + c.energyKwh).toFixed(2));
        entry.cost = Number((entry.cost + c.cost).toFixed(2));
      }
    });

    renewables.forEach((r) => {
      const key = r.date.toISOString().split('T')[0];
      const entry = map.get(key);
      if (entry) {
        entry.renewableKwh = Number((entry.renewableKwh + r.generationKwh).toFixed(2));
      }
    });

    return Array.from(map.values());
  }

  static async getDeviceBreakdown(userId: string) {
    const records = await prisma.energyConsumption.groupBy({
      by: ['deviceId'],
      where: { userId },
      _sum: { energyKwh: true, cost: true },
    });

    const devices = await prisma.device.findMany({ where: { userId } });
    const deviceMap = new Map(devices.map((d) => [d.id, d]));

    let totalKwh = 0;
    const breakdown = records.map((r) => {
      const device = r.deviceId ? deviceMap.get(r.deviceId) : null;
      const kwh = Number((r._sum.energyKwh || 0).toFixed(2));
      totalKwh += kwh;
      return {
        deviceId: r.deviceId || 'other',
        name: device ? device.name : 'General & Unassigned Appliances',
        category: device ? device.category : 'General',
        consumptionKwh: kwh,
        cost: Number((r._sum.cost || 0).toFixed(2)),
      };
    });

    return breakdown.map((b) => ({
      ...b,
      percentage: totalKwh > 0 ? Number(((b.consumptionKwh / totalKwh) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.consumptionKwh - a.consumptionKwh);
  }

  static async getCarbonAnalytics(userId: string) {
    const settings = await prisma.energySettings.findUnique({ where: { userId } });
    const carbonFactor = settings?.carbonFactor || ENV.DEFAULT_CARBON_FACTOR;

    const timeline = await this.getDailyTimeline(userId, 30);

    return timeline.map((t) => ({
      date: t.date,
      gridEmissionsKg: Number((t.consumptionKwh * carbonFactor).toFixed(2)),
      avoidedEmissionsKg: Number((t.renewableKwh * carbonFactor).toFixed(2)),
      netEmissionsKg: Number((Math.max(0, t.consumptionKwh - t.renewableKwh) * carbonFactor).toFixed(2)),
    }));
  }
}
