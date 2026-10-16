import { Router } from 'express';
import { RenewableController } from '../controllers/renewable.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createRenewableSchema, updateRenewableSchema } from '../validators/renewable.validator';

const router = Router();

router.use(authenticateToken);

router.get('/', RenewableController.list);
router.post('/', validateBody(createRenewableSchema), RenewableController.create);
router.get('/:id', RenewableController.getById);
router.put('/:id', validateBody(updateRenewableSchema), RenewableController.update);
router.delete('/:id', RenewableController.delete);

export default router;
