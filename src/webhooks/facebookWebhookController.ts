import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';
import { AppDataSource } from '../shared/database/dataSource';
import { Page } from '../pages/entities/Page';

dotenv.config();

const APP_SECRET = process.env.FACEBOOK_APP_SECRET as string;
const VERIFY_TOKEN = process.env.FB_WEBHOOK_VERIFY_TOKEN as string;

export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge as any);
    return;
  }
  res.sendStatus(403);
}

function verifySignature(req: Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  if (!signature || !APP_SECRET) return false;
  const [method, sig] = signature.split('=');
  if (method !== 'sha256' || !sig) return false;
  const hmac = crypto.createHmac('sha256', APP_SECRET);
  // req.rawBody é anexado no app.ts quando o parser raw é montado
  const raw = (req as any).rawBody as Buffer | undefined;
  if (!raw) return false;
  hmac.update(raw);
  const expected = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function receiveWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!verifySignature(req)) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const body = req.body as any;
    // O Facebook normalmente envia { object: 'page', entry: [...] }
    if (body.object !== 'page' || !Array.isArray(body.entry)) {
      res.sendStatus(200);
      return;
    }

    const pageRepo = AppDataSource.getRepository(Page);
    // Processar entradas e encaminhar por ID de página
    for (const entry of body.entry) {
      const pageId = entry.id as string | undefined;
      if (!pageId) continue;
      const page = await pageRepo.findOne({ where: { pageId }, relations: { client: true } });
      const callbackUrl = page?.client?.webhookCallbackUrl;
      if (!callbackUrl) continue;
      // Encaminhar evento para retorno de chamada do cliente
      await axios.post(callbackUrl, entry, { timeout: 5000 }).catch(() => undefined);
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}


