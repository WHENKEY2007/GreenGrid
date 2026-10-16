import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { RenewableSource } from '@prisma/client';

export class RenewableService {
  static async listUserRenewables(userId: string) {
    return prisma.renewableGeneration.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  static async getRenewableById(userId: string, id: string) {
    const record = await prisma.renewableGeneration.findFirst({
      where: { id, userId },
    });

    if (!record) {
      throw new AppError('Renewable generation record not found or unauthorized.', 404, 'NOT_FOUND');
    }

    return record;
  }

  static async createRenewable(
    userId: string,
    data: { source: RenewableSource; generationKwh: number; date: Date; capacityKw: number }
  ) {
    return prisma.renewableGeneration.create({
      data: {
        userId,
        source: data.source,
        generationKwh: data.generationKwh,
        date: data.date,
        capacityKw: data.capacityKw,
      },
    });
  }

  static async updateRenewable(
    userId: string,
    id: string,
    data: { source?: RenewableSource; generationKwh?: number; date?: Date; capacityKw?: number }
  ) {
    const existing = await prisma.renewableGeneration.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Renewable record not found or unauthorized.', 404, 'NOT_FOUND');
    }

    return prisma.renewableGeneration.update({
      where: { id },
      data,
    });
  }

  static async deleteRenewable(userId: string, id: string) {
    const existing = await prisma.renewableGeneration.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Renewable record not found or unauthorized.', 404, 'NOT_FOUND');
    }

    await prisma.renewableGeneration.delete({ where: { id } });
    return { message: 'Renewable generation record deleted successfully' };
  }
}
