import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// Read operations - all authenticated users
router.get('/', userController.getAll);
router.get('/facilitators/list', userController.getFacilitators);
router.get('/:id', userController.getById);

// Write operations - only ADMIN and HR
router.post('/', requireRole('ADMIN', 'HR'), userController.create);
router.put('/:id', requireRole('ADMIN', 'HR'), userController.update);
router.delete('/:id', requireRole('ADMIN'), userController.remove);

export default router;