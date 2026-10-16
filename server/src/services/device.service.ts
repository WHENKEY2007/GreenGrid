import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { calculateDeviceDailyKwh } from '../utils/calculator';

export class DeviceService {
  static async listUserDevices(userId: string) {
    const devices = await prisma.device.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { consumptions: true },
        },
      },
    });

    return devices.map((d) => ({
      ...d,
      dailyConsumptionKwh: calculateDeviceDailyKwh(d.ratedPower, d.quantity, d.usageHoursPerDay),
    }));
  }

  static async getDeviceById(userId: string, deviceId: string) {
    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId },
      include: {
        consumptions: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!device) {
      throw new AppError('Device not found or unauthorized access.', 404, 'NOT_FOUND');
    }

    return {
      ...device,
      dailyConsumptionKwh: calculateDeviceDailyKwh(device.ratedPower, device.quantity, device.usageHoursPerDay),
    };
  }

  static async createDevice(
    userId: string,
    data: { name: string; category: string; ratedPower: number; quantity: number; usageHoursPerDay: number }
  ) {
    const device = await prisma.device.create({
      data: {
        userId,
        name: data.name,
        category: data.category,
        ratedPower: data.ratedPower,
        quantity: data.quantity,
        usageHoursPerDay: data.usageHoursPerDay,
      },
    });

    return {
      ...device,
      dailyConsumptionKwh: calculateDeviceDailyKwh(device.ratedPower, device.quantity, device.usageHoursPerDay),
    };
  }

  static async updateDevice(
    userId: string,
    deviceId: string,
    data: { name?: string; category?: string; ratedPower?: number; quantity?: number; usageHoursPerDay?: number; isActive?: boolean }
  ) {
    const existing = await prisma.device.findFirst({ where: { id: deviceId, userId } });
    if (!existing) {
      throw new AppError('Device not found or unauthorized.', 404, 'NOT_FOUND');
    }

    const updated = await prisma.device.update({
      where: { id: deviceId },
      data,
    });

    return {
      ...updated,
      dailyConsumptionKwh: calculateDeviceDailyKwh(updated.ratedPower, updated.quantity, updated.usageHoursPerDay),
    };
  }

  static async deleteDevice(userId: string, deviceId: string) {
    const existing = await prisma.device.findFirst({ where: { id: deviceId, userId } });
    if (!existing) {
      throw new AppError('Device not found or unauthorized.', 404, 'NOT_FOUND');
    }

    await prisma.device.delete({ where: { id: deviceId } });
    return { message: 'Device deleted successfully' };
  }
}
