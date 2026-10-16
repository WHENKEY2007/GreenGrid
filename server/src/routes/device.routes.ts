import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createDeviceSchema, updateDeviceSchema } from '../validators/device.validator';

const router = Router();

router.use(authenticateToken);

router.get('/', DeviceController.list);
router.post('/', validateBody(createDeviceSchema), DeviceController.create);
router.get('/:id', DeviceController.getById);
router.put('/:id', validateBody(updateDeviceSchema), DeviceController.update);
router.delete('/:id', DeviceController.delete);

export default router;
