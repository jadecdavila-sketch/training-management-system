import { Router } from 'express';
import * as participantController from '../controllers/participantController.js';

const router = Router();

router.get('/', participantController.getAll);
router.get('/:id', participantController.getById);
router.post('/', participantController.create);
router.put('/:id', participantController.update);
router.delete('/:id', participantController.remove);
router.post('/import', participantController.importParticipants);

export default router;