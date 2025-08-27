import { Router } from 'express';
import * as PostController from '../controllers/postController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.post('/page/:pageId', authenticateJwt, PostController.createPost);
router.post('/page/:pageId/bulk', authenticateJwt, PostController.createBulkPosts);

export default router;

