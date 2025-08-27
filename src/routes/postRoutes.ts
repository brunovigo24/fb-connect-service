import { Router } from 'express';
import * as PostController from '../controllers/postController';

const router = Router();

router.post('/page/:pageId', PostController.createPost);
router.post('/page/:pageId/bulk', PostController.createBulkPosts);

export default router;

