import { Router } from 'express';
import * as scheduleController from '../controllers/scheduleController.js';

const router = Router();

router.patch('/:id', scheduleController.update);

export default router;
