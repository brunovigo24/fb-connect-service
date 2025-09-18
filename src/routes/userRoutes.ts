import { Router } from 'express';
import * as UserController from '../controllers/userController';

const router = Router();

// Public endpoint for data deletion (Facebook Data Deletion Callback)
router.delete('/:id', UserController.deleteUser);

export default router;


