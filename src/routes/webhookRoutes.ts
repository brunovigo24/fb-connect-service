import { Router } from 'express';
import * as WebhookController from '../webhooks/facebookWebhookController';

const router = Router();

// GET verification (hub.challenge)
router.get('/facebook', WebhookController.verifyWebhook);

// POST events (o body para validação da signature é tratado no mount do app.ts)
router.post('/facebook', WebhookController.receiveWebhook);

export default router;

