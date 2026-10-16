import { Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';
import { AuthenticatedRequest } from '../types';

export class SettingsController {
  static async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getUserSettings(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Settings retrieved',
        data: { settings },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.updateSettings(req.user!.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: { settings },
      });
    } catch (error) {
      next(error);
    }
  }
}
