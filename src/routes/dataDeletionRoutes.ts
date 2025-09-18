import { Router } from 'express';
import * as C from '../dataDeletion/controller';

const router = Router();

// Facebook requires instructions URL
router.get('/instructions', C.instructions);
// Facebook data deletion callback
router.post('/', C.dataDeletionCallback);
// Status URL
router.get('/status', C.dataDeletionStatus);

export default router;





