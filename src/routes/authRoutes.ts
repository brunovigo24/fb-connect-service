import { Router } from 'express';
import * as AuthController from '../controllers/authController';
import * as ClientAuthController from '../controllers/clientAuthController';

const router = Router();

router.get('/facebook/login', AuthController.facebookLogin);
router.get('/facebook/callback', AuthController.facebookCallback);
router.post('/', ClientAuthController.issueToken);

export default router;

