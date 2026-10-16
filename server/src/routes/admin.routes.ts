import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createTariffSchema } from '../validators/tariff.validator';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', AdminController.dashboard);
router.get('/users', AdminController.users);
router.get('/users/:id', AdminController.userDetails);
router.put('/users/:id/status', AdminController.updateUserStatus);
router.get('/analytics', AdminController.analytics);
router.get('/alerts', AdminController.alerts);
router.get('/tariffs', AdminController.tariffs);
router.post('/tariffs', validateBody(createTariffSchema), AdminController.createTariff);

export default router;
