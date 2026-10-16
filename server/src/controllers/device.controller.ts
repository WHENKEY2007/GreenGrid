import { Response, NextFunction } from 'express';
import { DeviceService } from '../services/device.service';
import { AuthenticatedRequest } from '../types';

export class DeviceController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const devices = await DeviceService.listUserDevices(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Devices retrieved successfully',
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const device = await DeviceService.getDeviceById(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Device details retrieved',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const device = await DeviceService.createDevice(req.user!.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Device registered successfully',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const device = await DeviceService.updateDevice(req.user!.id, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Device updated successfully',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DeviceService.deleteDevice(req.user!.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
