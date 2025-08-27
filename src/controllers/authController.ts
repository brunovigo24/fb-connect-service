import { Request, Response, NextFunction } from 'express';
import { buildFacebookAuthURL, handleFacebookCallback } from '../services/facebookAuthService';

export function facebookLogin(req: Request, res: Response, next: NextFunction): void {
  try {
    const authUrl = buildFacebookAuthURL();
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
}

export async function facebookCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = req.query as { code?: string };
    if (!code) {
      res.status(400).json({ error: 'Missing code' });
      return;
    }
    const result = await handleFacebookCallback(code);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

