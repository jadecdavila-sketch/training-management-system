import { Router } from 'express';
import * as locationController from '../controllers/locationController.js';

const router = Router();

router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);
router.post('/', locationController.create);
router.put('/:id', locationController.update);
router.delete('/:id', locationController.remove);

export default router;