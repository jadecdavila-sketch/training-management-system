import { Router } from 'express';
import * as locationController from '../controllers/locationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All location routes require authentication
router.use(requireAuth);

// Read operations - all authenticated users
router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);

// Write operations - only ADMIN and COORDINATOR
router.post('/', requireRole('ADMIN', 'COORDINATOR'), locationController.create);
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), locationController.update);
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), locationController.remove);

export default router;