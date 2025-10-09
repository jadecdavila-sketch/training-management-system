import { Router } from 'express';
import * as programController from '../controllers/programController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All program routes require authentication
router.use(requireAuth);

// Read operations - all authenticated users
router.get('/', programController.getAll);
router.get('/:id', programController.getById);

// Write operations - only ADMIN and COORDINATOR
router.post('/', requireRole('ADMIN', 'COORDINATOR'), programController.create);
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), programController.update);
router.patch('/:id/archive', requireRole('ADMIN', 'COORDINATOR'), programController.archive);
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), programController.remove);

export default router;
