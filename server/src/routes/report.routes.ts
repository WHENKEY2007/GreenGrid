import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/energy', ReportController.getReport);
router.get('/energy/export', ReportController.exportCsv);

export default router;
