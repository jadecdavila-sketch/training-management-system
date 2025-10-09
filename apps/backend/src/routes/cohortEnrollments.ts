import { Router } from 'express';
import * as cohortEnrollmentController from '../controllers/cohortEnrollmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All cohort enrollment routes require authentication and elevated permissions
router.use(requireAuth);
router.use(requireRole('ADMIN', 'COORDINATOR'));

router.post('/move', cohortEnrollmentController.moveParticipant);
router.post('/remove', cohortEnrollmentController.removeParticipant);

export default router;
