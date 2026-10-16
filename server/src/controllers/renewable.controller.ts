import { Response, NextFunction } from 'express';
import { RenewableService } from '../services/renewable.service';
import { AuthenticatedRequest } from '../types';

export class RenewableController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const records = await RenewableService.listUserRenewables(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Renewable generation records retrieved',
        data: { records },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await RenewableService.getRenewableById(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Renewable record retrieved',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await RenewableService.createRenewable(req.user!.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Renewable generation recorded',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await RenewableService.updateRenewable(req.user!.id, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Renewable record updated',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await RenewableService.deleteRenewable(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
