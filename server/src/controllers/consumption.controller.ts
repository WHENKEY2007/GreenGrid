import { Response, NextFunction } from 'express';
import { ConsumptionService } from '../services/consumption.service';
import { AuthenticatedRequest } from '../types';

export class ConsumptionController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ConsumptionService.listUserConsumption(req.user!.id, req.query as any);
      return res.status(200).json({
        success: true,
        message: 'Consumption records retrieved',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await ConsumptionService.getConsumptionById(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Consumption record retrieved',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await ConsumptionService.createConsumption(req.user!.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Consumption recorded successfully',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await ConsumptionService.updateConsumption(req.user!.id, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Consumption record updated',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ConsumptionService.deleteConsumption(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
