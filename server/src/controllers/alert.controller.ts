import { Response, NextFunction } from 'express';
import { AlertService } from '../services/alert.service';
import { AuthenticatedRequest } from '../types';

export class AlertController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AlertService.listUserAlerts(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Alerts retrieved',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const alert = await AlertService.markAsRead(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Alert marked as read',
        data: { alert },
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AlertService.markAllAsRead(req.user!.id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AlertService.deleteAlert(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
