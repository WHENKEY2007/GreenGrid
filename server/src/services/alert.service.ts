import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export class AlertService {
  static async listUserAlerts(userId: string) {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = alerts.filter((a) => !a.isRead).length;

    return {
      alerts,
      unreadCount,
    };
  }

  static async markAsRead(userId: string, alertId: string) {
    const alert = await prisma.alert.findFirst({ where: { id: alertId, userId } });
    if (!alert) {
      throw new AppError('Alert not found or unauthorized.', 404, 'NOT_FOUND');
    }

    return prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  }

  static async deleteAlert(userId: string, alertId: string) {
    const alert = await prisma.alert.findFirst({ where: { id: alertId, userId } });
    if (!alert) {
      throw new AppError('Alert not found or unauthorized.', 404, 'NOT_FOUND');
    }

    await prisma.alert.delete({ where: { id: alertId } });
    return { message: 'Alert dismissed successfully' };
  }

  static async markAllAsRead(userId: string) {
    await prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All alerts marked as read' };
  }
}
