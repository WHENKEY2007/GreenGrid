import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardOverview();
      return res.status(200).json({
        success: true,
        message: 'Admin dashboard metrics retrieved',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async users(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const data = await AdminService.listUsers(search, page, limit);
      return res.status(200).json({
        success: true,
        message: 'Users list retrieved',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async userDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.getUserDetails(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'User details retrieved',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const user = await AdminService.updateUserStatus(req.params.id, Boolean(isActive));
      return res.status(200).json({
        success: true,
        message: `User account ${isActive ? 'enabled' : 'disabled'} successfully`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async analytics(req: Request, res: Response, next: NextFunction) {
    try {
      const timeline = await AdminService.getMacroAnalytics();
      return res.status(200).json({
        success: true,
        message: 'Macro system analytics retrieved',
        data: { timeline },
      });
    } catch (error) {
      next(error);
    }
  }

  static async alerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await AdminService.listAllAlerts();
      return res.status(200).json({
        success: true,
        message: 'System alerts retrieved',
        data: { alerts },
      });
    } catch (error) {
      next(error);
    }
  }

  static async tariffs(req: Request, res: Response, next: NextFunction) {
    try {
      const tariffs = await AdminService.listTariffs();
      return res.status(200).json({
        success: true,
        message: 'Tariffs retrieved',
        data: { tariffs },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTariff(req: Request, res: Response, next: NextFunction) {
    try {
      const tariff = await AdminService.createTariff(req.body);
      return res.status(201).json({
        success: true,
        message: 'New energy tariff created and activated',
        data: { tariff },
      });
    } catch (error) {
      next(error);
    }
  }
}
