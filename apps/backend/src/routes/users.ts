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

// GDPR compliance endpoints - only ADMIN
router.get('/:id/export', requireRole('ADMIN'), userController.exportUserData);
router.delete('/:id/gdpr-delete', requireRole('ADMIN'), userController.gdprDelete);

export default router;