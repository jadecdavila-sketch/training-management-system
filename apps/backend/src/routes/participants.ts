import { Router } from 'express';
import * as participantController from '../controllers/participantController.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createParticipantSchema,
  updateParticipantSchema,
  bulkImportParticipantsSchema,
  paginationSchema,
  searchSchema
} from '../validation/schemas.js';

const router = Router();

// All participant routes require authentication
router.use(requireAuth);

// GET /api/participants?page=1&pageSize=20&search=john - all authenticated users
router.get(
  '/',
  validateQuery(paginationSchema.merge(searchSchema)),
  participantController.getAll
);

// GET /api/participants/:id - all authenticated users
router.get('/:id', participantController.getById);

// POST /api/participants - only ADMIN, COORDINATOR, and HR
router.post(
  '/',
  requireRole('ADMIN', 'COORDINATOR', 'HR'),
  validateBody(createParticipantSchema),
  participantController.create
);

// PUT /api/participants/:id - only ADMIN, COORDINATOR, and HR
router.put(
  '/:id',
  requireRole('ADMIN', 'COORDINATOR', 'HR'),
  validateBody(updateParticipantSchema),
  participantController.update
);

// DELETE /api/participants/:id - only ADMIN
router.delete('/:id', requireRole('ADMIN'), participantController.remove);

// POST /api/participants/import - only ADMIN and HR
router.post(
  '/import',
  requireRole('ADMIN', 'HR'),
  validateBody(bulkImportParticipantsSchema),
  participantController.importParticipants
);

export default router;