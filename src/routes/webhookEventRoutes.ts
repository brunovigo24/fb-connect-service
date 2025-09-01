import { Router } from 'express';
import * as WebhookEventController from '../webhooks/webhookEventController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJwt, WebhookEventController.listEvents);
router.get('/:id', authenticateJwt, WebhookEventController.getEventById);

export default router;

