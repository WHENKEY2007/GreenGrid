import prisma from '../config/prisma';

export interface Recommendation {
  id: string;
  category: 'HVAC' | 'LIGHTING' | 'RENEWABLE' | 'GENERAL' | 'APPLIANCE';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  potentialSavings: string;
}

export class RecommendationService {
  static async generateRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 1. Analyze devices and consumptions
    const [devices, consumptions, renewables, settings] = await Promise.all([
      prisma.device.findMany({ where: { userId } }),
      prisma.energyConsumption.findMany({
        where: { userId },
        include: { device: true },
        take: 100,
        orderBy: { date: 'desc' },
      }),
      prisma.renewableGeneration.findMany({
        where: { userId },
        take: 30,
        orderBy: { date: 'desc' },
      }),
      prisma.energySettings.findUnique({ where: { userId } }),
    ]);

    // Check AC consumption
    const acDevices = devices.filter((d) => d.category.toLowerCase().includes('ac') || d.name.toLowerCase().includes('air'));
    const totalAcKwh = consumptions
      .filter((c) => c.device && (c.device.category.toLowerCase().includes('ac') || c.device.name.toLowerCase().includes('air')))
      .reduce((sum, c) => sum + c.energyKwh, 0);

    const totalKwh = consumptions.reduce((sum, c) => sum + c.energyKwh, 0);

    if (acDevices.length > 0 && totalAcKwh > 0 && totalAcKwh / totalKwh > 0.3) {
      recommendations.push({
        id: 'rec-ac-optimization',
        category: 'HVAC',
        impact: 'HIGH',
        title: 'Optimize Air Conditioning Setpoint',
        description: `Your air conditioner accounts for ${( (totalAcKwh / totalKwh) * 100 ).toFixed(1)}% of total energy. Increasing the thermostat by just 2°C (e.g. to 24°C) can reduce cooling power draw by up to 18%.`,
        potentialSavings: '15% – 20% on monthly cooling bill',
      });
    }

    // Check lighting
    const lightingDevices = devices.filter((d) => d.category.toLowerCase().includes('light'));
    const totalLightingHours = lightingDevices.reduce((sum, d) => sum + d.usageHoursPerDay * d.quantity, 0);
    if (totalLightingHours > 20) {
      recommendations.push({
        id: 'rec-led-lighting',
        category: 'LIGHTING',
        impact: 'MEDIUM',
        title: 'Upgrade to High-Efficiency Smart LEDs',
        description: 'You have high aggregate lighting usage hours. Switching non-LED fixtures to smart LED luminaires with occupancy automation avoids phantom lighting loss.',
        potentialSavings: 'Up to ₹1,200–₹2,000 monthly',
      });
    }

    // Check renewable energy ratio
    const totalRenewableKwh = renewables.reduce((sum, r) => sum + r.generationKwh, 0);
    if (renewables.length === 0) {
      recommendations.push({
        id: 'rec-install-solar',
        category: 'RENEWABLE',
        impact: 'HIGH',
        title: 'Adopt Rooftop Solar PV Generation',
        description: 'You currently have zero renewable energy generation records. Installing a 3 kW to 5 kW solar array could offset over 60% of your grid consumption and mitigate peak-hour utility charges.',
        potentialSavings: 'Up to 50% – 70% reduction in grid costs',
      });
    } else if (totalKwh > 0 && totalRenewableKwh / totalKwh < 0.35) {
      recommendations.push({
        id: 'rec-solar-coverage',
        category: 'RENEWABLE',
        impact: 'MEDIUM',
        title: 'Maximize Daytime Solar Self-Consumption',
        description: `Your renewable generation covers only ${( (totalRenewableKwh / totalKwh) * 100 ).toFixed(1)}% of consumed load. Schedule high-energy tasks (washing machine, water pump, EV charging) between 11 AM and 3 PM to directly consume generated solar energy.`,
        potentialSavings: 'Avoid grid export degradation fees',
      });
    }

    // Water heater check
    const heater = devices.find((d) => d.category.toLowerCase().includes('heater') || d.name.toLowerCase().includes('heater'));
    if (heater && heater.ratedPower >= 1500) {
      recommendations.push({
        id: 'rec-water-heater-timer',
        category: 'APPLIANCE',
        impact: 'MEDIUM',
        title: 'Install Water Heater Smart Timer',
        description: `Your ${heater.name} is rated at ${heater.ratedPower}W. Running it continuously causes standby reheat cycles. Using a digital timer to heat water 30 minutes before usage prevents standby thermal loss.`,
        potentialSavings: '8% – 12% reduction in water heating cost',
      });
    }

    // Overall threshold check
    if (settings && consumptions.length > 0) {
      const avgDaily = totalKwh / Math.max(1, consumptions.length);
      if (avgDaily > settings.dailyConsumptionLimit) {
        recommendations.push({
          id: 'rec-threshold-reduction',
          category: 'GENERAL',
          impact: 'HIGH',
          title: 'Daily Consumption Above Target Limit',
          description: `Your average daily consumption of ${avgDaily.toFixed(1)} kWh exceeds your configured target of ${settings.dailyConsumptionLimit} kWh. Audit active devices and consider eliminating standby vampire loads.`,
          potentialSavings: 'Bring monthly spend within target budget',
        });
      }
    }

    // Baseline fallback if household is already hyper-efficient
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-maintenance',
        category: 'GENERAL',
        impact: 'LOW',
        title: 'Maintain Seasonal Appliance Tuning',
        description: 'Your energy profile is currently balanced and efficient. Regularly clean refrigerator condenser coils and AC filters every 3 months to preserve peak COP efficiency.',
        potentialSavings: 'Preserves 5% baseline efficiency',
      });
    }

    return recommendations;
  }
}
