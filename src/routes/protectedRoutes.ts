import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { postToFacebookExample } from '../controllers/protectedController';

const router = Router();

router.post('/post-to-facebook', authenticateJwt, postToFacebookExample);

export default router;

