import prisma from '../config/prisma';
import { RecommendationService } from './recommendation.service';
import { AnalyticsService } from './analytics.service';
import { ENV } from '../config/env';

export class ReportService {
  static async getEnergyReport(userId: string, startDate?: string, endDate?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [consumptions, renewables, settings, devices, recommendations] = await Promise.all([
      prisma.energyConsumption.findMany({
        where: { userId, date: { gte: start, lte: end } },
        include: { device: true },
        orderBy: { date: 'asc' },
      }),
      prisma.renewableGeneration.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      }),
      prisma.energySettings.findUnique({ where: { userId } }),
      AnalyticsService.getDeviceBreakdown(userId),
      RecommendationService.generateRecommendations(userId),
    ]);

    const totalConsumptionKwh = Number(consumptions.reduce((sum, c) => sum + c.energyKwh, 0).toFixed(2));
    const totalCost = Number(consumptions.reduce((sum, c) => sum + c.cost, 0).toFixed(2));
    const totalRenewableKwh = Number(renewables.reduce((sum, r) => sum + r.generationKwh, 0).toFixed(2));
    const carbonFactor = settings?.carbonFactor || ENV.DEFAULT_CARBON_FACTOR;

    const renewablePercentage = totalConsumptionKwh > 0
      ? Number(Math.min(100, (totalRenewableKwh / totalConsumptionKwh) * 100).toFixed(1))
      : 0;

    const carbonEmissions = Number((totalConsumptionKwh * carbonFactor).toFixed(2));
    const carbonReduction = Number((totalRenewableKwh * carbonFactor).toFixed(2));
    const netGridKwh = Number(Math.max(0, totalConsumptionKwh - totalRenewableKwh).toFixed(2));

    return {
      user: {
        name: user?.name,
        email: user?.email,
      },
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        daysCount: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      },
      metrics: {
        totalConsumptionKwh,
        totalCost,
        totalRenewableKwh,
        netGridKwh,
        renewablePercentage,
        carbonEmissionsKg: carbonEmissions,
        carbonReductionKg: carbonReduction,
        carbonFactor,
      },
      highestConsumingDevices: devices.slice(0, 5),
      recommendations,
      consumptionLogsCount: consumptions.length,
      renewableLogsCount: renewables.length,
    };
  }

  static async generateCsvReport(userId: string, startDate?: string, endDate?: string): Promise<string> {
    const report = await this.getEnergyReport(userId, startDate, endDate);

    const lines: string[] = [];
    lines.push('GREEN GRID — ENERGY & SUSTAINABILITY REPORT');
    lines.push(`Generated On,"${new Date().toISOString()}"`);
    lines.push(`Account Name,"${report.user.name}"`);
    lines.push(`Account Email,"${report.user.email}"`);
    lines.push(`Report Window,"${report.period.startDate} to ${report.period.endDate} (${report.period.daysCount} days)"`);
    lines.push('');
    lines.push('EXECUTIVE METRICS');
    lines.push('Metric,Value,Unit');
    lines.push(`Total Electricity Consumption,${report.metrics.totalConsumptionKwh},kWh`);
    lines.push(`Total Energy Cost,₹${report.metrics.totalCost},INR`);
    lines.push(`Renewable Energy Generated,${report.metrics.totalRenewableKwh},kWh`);
    lines.push(`Net Grid Import,${report.metrics.netGridKwh},kWh`);
    lines.push(`Renewable Coverage Percentage,${report.metrics.renewablePercentage},%`);
    lines.push(`Estimated Carbon Footprint,${report.metrics.carbonEmissionsKg},kg CO2`);
    lines.push(`Avoided Carbon Emissions,${report.metrics.carbonReductionKg},kg CO2`);
    lines.push(`Carbon Intensity Factor,${report.metrics.carbonFactor},kg CO2/kWh`);
    lines.push('');
    lines.push('TOP CONSUMING DEVICES');
    lines.push('Device Name,Category,Consumption (kWh),Share (%)');
    report.highestConsumingDevices.forEach((d) => {
      lines.push(`"${d.name}","${d.category}",${d.consumptionKwh},${d.percentage}%`);
    });
    lines.push('');
    lines.push('ENERGY SAVING RECOMMENDATIONS');
    lines.push('Category,Priority,Title,Description,Estimated Savings');
    report.recommendations.forEach((r) => {
      lines.push(`"${r.category}","${r.impact}","${r.title}","${r.description}","${r.potentialSavings}"`);
    });

    return lines.join('\n');
  }
}
