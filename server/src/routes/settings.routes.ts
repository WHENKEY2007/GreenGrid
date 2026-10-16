import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateSettingsSchema } from '../validators/settings.validator';

const router = Router();

router.use(authenticateToken);

router.get('/', SettingsController.get);
router.put('/', validateBody(updateSettingsSchema), SettingsController.update);

export default router;
