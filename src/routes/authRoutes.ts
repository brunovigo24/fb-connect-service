import { Router } from 'express';
import * as AuthController from '../controllers/authController';

const router = Router();

router.get('/facebook/login', AuthController.facebookLogin);
router.get('/facebook/callback', AuthController.facebookCallback);

export default router;

