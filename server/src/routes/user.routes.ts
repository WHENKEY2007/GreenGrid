import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticateToken);

router.get('/me', UserController.getProfile);
router.put('/me', validateBody(updateProfileSchema), UserController.updateProfile);
router.put('/me/password', validateBody(changePasswordSchema), UserController.changePassword);

export default router;
