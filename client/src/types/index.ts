export type Role = 'USER' | 'ADMIN';
export type ConsumptionSource = 'MANUAL' | 'SMART_METER' | 'ESTIMATED';
export type RenewableSource = 'SOLAR' | 'WIND' | 'OTHER';
export type AlertType = 'HIGH_CONSUMPTION' | 'HIGH_COST' | 'DEVICE_OVERUSE' | 'LOW_RENEWABLE_RATIO' | 'GENERAL';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  settings?: EnergySettings;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  category: string;
  ratedPower: number;
  quantity: number;
  usageHoursPerDay: number;
  dailyConsumptionKwh: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnergyConsumption {
  id: string;
  userId: string;
  deviceId?: string | null;
  date: string;
  energyKwh: number;
  cost: number;
  source: ConsumptionSource;
  createdAt: string;
  device?: {
    id: string;
    name: string;
    category: string;
  } | null;
}

export interface RenewableGeneration {
  id: string;
  userId: string;
  source: RenewableSource;
  generationKwh: number;
  date: string;
  capacityKw: number;
  createdAt: string;
}

export interface EnergyTariff {
  id: string;
  name: string;
  ratePerKwh: number;
  fixedCharge: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  threshold?: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface EnergySettings {
  id: string;
  userId: string;
  dailyConsumptionLimit: number;
  monthlyConsumptionLimit: number;
  monthlyCostLimit: number;
  carbonFactor: number;
  alertEnabled: boolean;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  category: 'HVAC' | 'LIGHTING' | 'RENEWABLE' | 'GENERAL' | 'APPLIANCE';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  potentialSavings: string;
}

export interface AnalyticsSummary {
  today: {
    consumptionKwh: number;
    cost: number;
    renewableKwh: number;
  };
  weekly: {
    consumptionKwh: number;
    cost: number;
  };
  monthly: {
    consumptionKwh: number;
    cost: number;
    renewableKwh: number;
    renewablePercentage: number;
    carbonEmissions: number;
    carbonReduction: number;
  };
  allTime: {
    totalConsumptionKwh: number;
    totalCost: number;
    totalRenewableKwh: number;
  };
  highestConsumingDevice: {
    id: string;
    name: string;
    category: string;
    totalKwh: number;
  } | null;
  activeAlertsCount: number;
  settings: {
    dailyConsumptionLimit: number;
    monthlyConsumptionLimit: number;
    monthlyCostLimit: number;
    carbonFactor: number;
  };
}

export interface DailyTimelinePoint {
  date: string;
  consumptionKwh: number;
  cost: number;
  renewableKwh: number;
}

export interface DeviceBreakdownItem {
  deviceId: string;
  name: string;
  category: string;
  consumptionKwh: number;
  cost: number;
  percentage: number;
}

export interface CarbonAnalyticsPoint {
  date: string;
  gridEmissionsKg: number;
  avoidedEmissionsKg: number;
  netEmissionsKg: number;
}
