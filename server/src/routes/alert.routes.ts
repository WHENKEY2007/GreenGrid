import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', AlertController.list);
router.put('/read-all', AlertController.markAllAsRead);
router.put('/:id/read', AlertController.markAsRead);
router.delete('/:id', AlertController.delete);

export default router;
