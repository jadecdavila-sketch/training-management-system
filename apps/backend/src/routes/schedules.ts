import { Router } from 'express';
import * as scheduleController from '../controllers/scheduleController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All schedule routes require authentication
router.use(requireAuth);

// Update schedule - only ADMIN and COORDINATOR
router.patch('/:id', requireRole('ADMIN', 'COORDINATOR'), scheduleController.update);

export default router;
