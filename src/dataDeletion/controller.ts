import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AppDataSource } from '../shared/database/dataSource';
import { User } from '../users/entities/User';
import { DataDeletionRequest } from './entities/DataDeletionRequest';

function decodeSignedRequest(signedRequest: string, appSecret: string): any | null {
  const [encodedSig, payload] = signedRequest.split('.');
  const sig = base64UrlToBuffer(encodedSig);
  const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  const expectedSig = crypto.createHmac('sha256', appSecret).update(payload).digest();
  if (!crypto.timingSafeEqual(sig, expectedSig)) return null;
  return data;
}

function base64UrlToBuffer(base64url: string): Buffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64');
}

export async function instructions(_req: Request, res: Response): Promise<void> {
  res.json({
    instructions: 'Para solicitar exclusão de dados, envie um POST para /facebook/data_deletion com signed_request ou utilize DELETE /user/:id',
    contact: 'suporte@scordon.com.br'
  });
}

export async function dataDeletionCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { signed_request } = req.body as { signed_request?: string };
    const appSecret = process.env.FACEBOOK_APP_SECRET as string;
    if (!signed_request || !appSecret) {
      res.status(400).json({ error: 'signed_request required' });
      return;
    }
    const data = decodeSignedRequest(signed_request, appSecret);
    if (!data) {
      res.status(400).json({ error: 'invalid signed_request' });
      return;
    }
    const userId = data?.user_id as string | undefined;
    const deletionRepo = AppDataSource.getRepository(DataDeletionRequest);
    await deletionRepo.save(deletionRepo.create({ userIdentifier: userId || 'unknown', details: data }));

    if (userId) {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: [{ facebookId: userId }, { id: userId }] });
      if (user) {
        await userRepo.remove(user);
      }
    }

    const url = `${req.protocol}://${req.get('host')}/facebook/data_deletion_status?id=${encodeURIComponent(userId || '')}`;
    res.json({ url, confirmation_code: userId || 'unknown' });
  } catch (err) {
    next(err);
  }
}

export async function dataDeletionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.query as { id?: string };
    const deletionRepo = AppDataSource.getRepository(DataDeletionRequest);
    const record = id ? await deletionRepo.findOne({ where: { userIdentifier: id } }) : null;
    res.json({ status: record ? 'processed' : 'unknown' });
  } catch (err) {
    next(err);
  }
}






