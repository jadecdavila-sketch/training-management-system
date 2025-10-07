import { Router } from 'express';
import * as cohortEnrollmentController from '../controllers/cohortEnrollmentController.js';

const router = Router();

router.post('/move', cohortEnrollmentController.moveParticipant);
router.post('/remove', cohortEnrollmentController.removeParticipant);

export default router;
