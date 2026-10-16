import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthenticatedRequest } from '../types';

export class AnalyticsController {
  static async summary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = await AnalyticsService.getSummary(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Analytics summary retrieved',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async daily(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const timeline = await AnalyticsService.getDailyTimeline(req.user!.id, days);
      return res.status(200).json({
        success: true,
        message: 'Daily consumption timeline retrieved',
        data: { timeline },
      });
    } catch (error) {
      next(error);
    }
  }

  static async devices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const devices = await AnalyticsService.getDeviceBreakdown(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Device consumption breakdown retrieved',
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  }

  static async carbon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const carbon = await AnalyticsService.getCarbonAnalytics(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Carbon footprint analytics retrieved',
        data: { carbon },
      });
    } catch (error) {
      next(error);
    }
  }
}
