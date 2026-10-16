import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/summary', AnalyticsController.summary);
router.get('/daily', AnalyticsController.daily);
router.get('/weekly', AnalyticsController.summary); // Covered in summary metrics
router.get('/monthly', AnalyticsController.summary); // Covered in summary metrics
router.get('/devices', AnalyticsController.devices);
router.get('/renewable', AnalyticsController.daily); // Daily timeline includes renewable breakdown
router.get('/carbon', AnalyticsController.carbon);

export default router;
