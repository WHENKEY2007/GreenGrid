import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AuthenticatedRequest } from '../types';

export class ReportController {
  static async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const report = await ReportService.getEnergyReport(req.user!.id, startDate, endDate);
      return res.status(200).json({
        success: true,
        message: 'Energy report generated',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const csv = await ReportService.generateCsvReport(req.user!.id, startDate, endDate);

      const filename = `green-grid-report-${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}
