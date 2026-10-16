import prisma from '../config/prisma';
import { ENV } from '../config/env';

export const calculateDeviceDailyKwh = (ratedPower: number, quantity: number, usageHoursPerDay: number): number => {
  return Number(((ratedPower * quantity * usageHoursPerDay) / 1000).toFixed(3));
};

export const getActiveTariff = async () => {
  const tariff = await prisma.energyTariff.findFirst({
    where: { isActive: true },
    orderBy: { effectiveFrom: 'desc' },
  });

  if (tariff) {
    return tariff;
  }

  return {
    id: 'default',
    name: 'Default Baseline Tariff',
    ratePerKwh: ENV.DEFAULT_TARIFF_RATE,
    fixedCharge: ENV.DEFAULT_FIXED_CHARGE,
    isActive: true,
  };
};

export const calculateCost = (energyKwh: number, ratePerKwh: number): number => {
  return Number((energyKwh * ratePerKwh).toFixed(2));
};

export const calculateCarbonEmissions = (energyKwh: number, carbonFactor: number = ENV.DEFAULT_CARBON_FACTOR): number => {
  return Number((energyKwh * carbonFactor).toFixed(2));
};
