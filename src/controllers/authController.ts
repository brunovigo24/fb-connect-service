import { Request, Response, NextFunction } from 'express';
import { buildFacebookAuthURL, handleFacebookCallback } from '../services/facebookAuthService';

export function facebookLogin(req: Request, res: Response, next: NextFunction): void {
  try {
    const { state } = req.query as { state?: string };
    const authUrl = buildFacebookAuthURL(state);
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
}

export async function facebookCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code) {
      res.status(400).json({ error: 'Missing code' });
      return;
    }
    await handleFacebookCallback(code);
    // Prefer redirect to state URL if present; otherwise, close window
    const redirectUrl = state && typeof state === 'string' && state.startsWith('http') ? state : null;
    if (redirectUrl) {
      res.redirect(redirectUrl);
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!doctype html><html><head><meta charset="utf-8" /><title>OK</title></head><body><script>window.close && window.close();</script><p>Conexão realizada. Esta janela pode ser fechada.</p></body></html>');
  } catch (err) {
    next(err);
  }
}

