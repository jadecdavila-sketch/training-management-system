import { Router } from 'express';
import * as programController from '../controllers/programController.js';

const router = Router();

router.get('/', programController.getAll);
router.get('/:id', programController.getById);
router.post('/', programController.create);
router.put('/:id', programController.update);
router.patch('/:id/archive', programController.archive);
router.delete('/:id', programController.remove);

export default router;
