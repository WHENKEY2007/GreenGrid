import { Router } from 'express';
import { ConsumptionController } from '../controllers/consumption.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createConsumptionSchema,
  updateConsumptionSchema,
  queryConsumptionSchema,
} from '../validators/consumption.validator';

const router = Router();

router.use(authenticateToken);

router.get('/', validateQuery(queryConsumptionSchema), ConsumptionController.list);
router.post('/', validateBody(createConsumptionSchema), ConsumptionController.create);
router.get('/:id', ConsumptionController.getById);
router.put('/:id', validateBody(updateConsumptionSchema), ConsumptionController.update);
router.delete('/:id', ConsumptionController.delete);

export default router;
